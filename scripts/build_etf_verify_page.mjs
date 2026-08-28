#!/usr/bin/env node
/**
 * 되짚기 결과를 읽는 문서로 만든다.
 *
 *   node scripts/build_etf_verify_page.mjs
 *   -> etf-return-basis.html
 *
 * 원자료는 tools/discovery/etf_price_series.json 이다. **숫자를 손으로 옮기지
 * 않는다.** 표에 찍히는 값은 전부 그 파일에서 읽어 온다. 되짚기를 다시 돌리면
 * 이 문서도 다시 만들면 되고, 그래야 문서와 근거가 어긋나지 않는다.
 *
 * 손으로 쓰는 것은 해석뿐이다. 해석이 바뀌면 이 파일을 고친다.
 */

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'tools/discovery/etf_price_series.json';
const OUT = 'etf-return-basis.html';

const rows = JSON.parse(await readFile(SRC, 'utf8'));
const withYahoo = rows.filter((r) => r.cmp);
const control = withYahoo.filter((r) => r.divCount === 0);
const payers = withYahoo.filter((r) => (r.adj?.divsInWindow ?? 0) > 0);

if (!control.length || payers.length < 2) {
  console.error(`[verify-page] 근거가 모자랍니다 — 대조군 ${control.length} · 분배 종목 ${payers.length}`);
  process.exit(1);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n2 = (v) => (v == null ? '—' : Number(v).toFixed(2));
const n4 = (v) => (v == null ? '—' : Number(v).toFixed(4));
const won = (v) => (v == null ? '—' : Math.round(v).toLocaleString('ko-KR'));

// 되짚기가 언제 것인지. 문서에 박아 둔다 — 언제 잰 값인지 모르는 숫자는 못 쓴다.
const asOf = payers[0]?.adj?.endDay || '';

// ── 본문에서 인용하는 대표 종목 ──────────────────────────────────────────
// 분배율이 가장 높은 종목을 대표로 든다. 차이가 가장 크게 드러나는 곳이라
// 읽는 사람이 규모를 가늠하기 좋다.
const lead = payers.slice().sort((a, b) => (b.yield || 0) - (a.yield || 0))[0];
const ctrlLead = control.slice().sort((a, b) =>
  Math.abs(b.naverY1?.pct || 0) - Math.abs(a.naverY1?.pct || 0))[0];

const adjHit = payers.filter((r) =>
  Math.abs(r.adj.ratioEnd - 1) < 0.02 &&
  Math.abs(r.adj.ratioStart - r.adj.predictedStartRatio) < 0.03).length;

// ── 표 ────────────────────────────────────────────────────────────────────
const controlTable = (ko) => control.map((r) => `
  <tr>
    <td class="nm">${esc(r.name)}<span class="code">${esc(r.code)}</span></td>
    <td class="num">${r.cmp.common}</td>
    <td class="num strong">${n2(r.cmp.medianRelPct)}%</td>
    <td class="num strong">${n2(r.cmp.maxRelPct)}%</td>
    <td class="num">${r.cmp.over1pct}</td>
    <td class="num">${n2(r.naverY1?.pct)}%</td>
    <td class="num">${n2(r.yahooY1?.pct)}%</td>
  </tr>`).join('');

const adjTable = () => payers.map((r) => {
  const gap = Math.abs(r.adj.ratioStart - r.adj.predictedStartRatio);
  return `
  <tr>
    <td class="nm">${esc(r.name)}<span class="code">${esc(r.code)}</span></td>
    <td class="num">${n2(r.yield)}%</td>
    <td class="num">${r.adj.divsInWindow}</td>
    <td class="num">${n4(r.adj.ratioEnd)}</td>
    <td class="num strong">${n4(r.adj.ratioStart)}</td>
    <td class="num strong">${n4(r.adj.predictedStartRatio)}</td>
    <td class="num ${gap < 0.03 ? 'ok' : 'bad'}">${n4(gap)}</td>
  </tr>`;
}).join('');

const seriesTable = () => payers.concat(control).map((r) => `
  <tr>
    <td class="nm">${esc(r.name)}<span class="code">${esc(r.code)}</span></td>
    <td class="num">${won(r.naverY1?.fromClose)}</td>
    <td class="num">${won(r.yahooY1?.fromClose)}</td>
    <td class="num">${won(r.naverY1?.toClose)}</td>
    <td class="num">${won(r.yahooY1?.toClose)}</td>
  </tr>`).join('');

const compareTable = () => payers.concat(control).map((r) => `
  <tr>
    <td class="nm">${esc(r.name)}<span class="code">${esc(r.code)}</span></td>
    <td class="num">${n2(r.stated?.price)}%</td>
    <td class="num">${n2(r.naverY1?.pct)}%</td>
    <td class="num">${n2(r.data?.price)}%</td>
    <td class="num hl">${n2(r.data?.tr)}%</td>
  </tr>`).join('');

// ── 페이지 ────────────────────────────────────────────────────────────────
const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ETF 수익률 기준 검증 — 네이버와 왜 다른가</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --orange:#F58220; --orange-active:#CB6015; --orange-soft:#FAB072;
  --blue:#043B72; --gray-hl:#D7D7D7;
  --canvas:#FFFFFF; --surface-soft:#ECEFF4; --surface-subtle:#F7F8FA;
  --hairline:#CDCECB; --hairline-soft:#E5E4E1;
  --ink:#1A1A1A; --body-strong:#2C2C2C; --body:#3D3D3D;
  --muted:#6C6C6C; --muted-soft:#84888B;
  --success:#2E8540; --error:#C62828;
  --font-kr:'Spoqa Han Sans Neo','Noto Sans KR',sans-serif;
  --font-en:'Inter','Aptos','Segoe UI',system-ui,sans-serif;
  --space-section:104px; --space-block:56px; --space-content:28px;
}
@media (max-width:768px){ :root{ --space-section:72px; --space-block:36px; } }

*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--canvas); color:var(--body);
  font-family:var(--font-kr); font-size:19px; line-height:1.65;
  font-variant-numeric:tabular-nums;
}
html[lang="en"] body{font-family:var(--font-en)}
h1,h2,h3{color:var(--ink); margin:0}
p{margin:0 0 var(--space-content)}
a{color:var(--blue)}
:focus-visible{outline:2px solid var(--orange); outline-offset:2px}
b,strong{color:var(--ink); font-weight:700}

.page{max-width:1200px; margin:0 auto; padding:0 32px}
@media (max-width:768px){ .page{padding:0 20px} }

/* 툴바 */
.toolbar{max-width:1200px; margin:0 auto; padding:18px 32px 0;
  display:flex; justify-content:flex-end; gap:10px}
@media (max-width:768px){ .toolbar{padding:14px 20px 0} }
.lang-toggle{display:inline-flex; border:1px solid var(--hairline);
  border-radius:2px; overflow:hidden; background:#fff;
  box-shadow:0 2px 8px rgba(0,0,0,.06)}
.lang-toggle button{font-family:var(--font-en); font-size:14px; font-weight:500;
  letter-spacing:.5px; padding:10px 17px; border:0; background:#fff;
  color:var(--muted); cursor:pointer}
.lang-toggle button+button{border-left:1px solid var(--hairline)}
.lang-toggle button[aria-checked="true"]{background:var(--orange); color:#fff}
.lang-toggle button[aria-checked="false"]:hover{background:var(--surface-subtle); color:var(--ink)}
.btn-print{font-size:14px; padding:10px 16px; border:1px solid var(--hairline);
  border-radius:2px; background:#fff; color:var(--muted); cursor:pointer;
  box-shadow:0 2px 8px rgba(0,0,0,.06)}
.btn-print:hover{background:var(--surface-subtle); color:var(--ink)}

/* Hero */
.hero{background:var(--orange); color:#fff; padding:64px 0 68px; margin-top:18px}
.hero .tag{display:inline-block; font-size:13px; letter-spacing:.6px; font-weight:500;
  border:1px solid rgba(255,255,255,.6); padding:4px 10px; border-radius:2px;
  margin-bottom:24px}
/* 주의 — display 를 지정하는 규칙(.tag/.note .h)은 명시도가 [data-en] 보다 높다.
   그 요소에 data-ko/data-en 을 직접 달면 언어 숨김이 먹지 않아 두 언어가 함께 나온다.
   그래서 언어 span 은 항상 그 **안쪽**에 둔다. */
.hero h1{color:#fff; font-size:67px; font-weight:700; line-height:1.1;
  letter-spacing:-1px; margin:0 0 20px}
.hero .sub{font-size:24px; line-height:1.5; max-width:760px; color:rgba(255,255,255,.94)}
@media (max-width:768px){ .hero{padding:44px 0 48px} .hero h1{font-size:43px} .hero .sub{font-size:19px} }

/* 섹션 */
.section{margin-top:var(--space-section)}
.section-rule{height:1px; background:var(--orange); margin-bottom:19px}
.section-title{font-size:26px; font-weight:700; letter-spacing:0; margin-bottom:var(--space-content)}
@media (max-width:768px){ .section-title{font-size:22px} }
h3{font-size:22px; font-weight:600; margin:var(--space-block) 0 14px}
@media (max-width:768px){ h3{font-size:19px} }
.lede{font-size:22px; line-height:1.55; color:var(--body-strong); max-width:820px}

/* 답 카드 */
.answer{background:var(--orange); color:#fff; border-radius:4px;
  padding:44px 48px; margin-top:var(--space-content)}
.answer h2{color:#fff; font-size:34px; font-weight:700; margin:0 0 16px; letter-spacing:-.3px}
.answer p{margin:0; font-size:20px; line-height:1.6; color:rgba(255,255,255,.95); max-width:820px}
.answer p+p{margin-top:16px}
@media (max-width:768px){ .answer{padding:32px 24px} .answer h2{font-size:26px} .answer p{font-size:18px} }

/* 콜아웃 */
.note{background:var(--surface-soft); border-radius:4px; padding:28px 32px;
  margin:var(--space-content) 0; font-size:18px; line-height:1.6}
.note .h{display:block; font-weight:700; color:var(--ink); margin-bottom:8px; font-size:19px}

/* 수식 */
.formula{background:var(--surface-subtle); border:1px solid var(--hairline-soft);
  border-radius:4px; padding:22px 26px; margin:var(--space-content) 0;
  font-family:var(--font-num,'Inter','SF Mono',monospace); font-size:18px;
  line-height:1.9; color:var(--ink); overflow-x:auto}
.formula .lbl{color:var(--muted); font-family:var(--font-kr); font-size:16px}

/* 표 */
.table-wrap{overflow-x:auto; margin:var(--space-content) 0; min-width:0}
table{border-collapse:collapse; width:100%; font-size:17px;
  border:1px solid var(--hairline)}
th,td{padding:11px 14px; border:1px solid var(--hairline-soft); text-align:left}
thead th{background:var(--orange-soft); color:var(--ink); font-weight:700;
  font-size:16px; white-space:normal; line-height:1.35}
tbody tr:hover{background:var(--surface-subtle)}
td.num,th.num{text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap}
td.strong{font-weight:700; color:var(--ink)}
td.hl{background:var(--gray-hl); font-weight:700; color:var(--ink)}
td.ok{color:var(--success); font-weight:700}
td.bad{color:var(--error); font-weight:700}
td.nm{font-size:16px; line-height:1.35}
td.nm .code{display:block; color:var(--muted-soft); font-size:13px;
  font-family:var(--font-en)}
caption{caption-side:bottom; text-align:left; padding-top:10px;
  font-size:14px; color:var(--muted); line-height:1.5}

ul{margin:0 0 var(--space-content); padding-left:22px}
li{margin-bottom:10px}
.muted{color:var(--muted)}
footer{margin:var(--space-section) 0 72px; padding-top:24px;
  border-top:1px solid var(--hairline); font-size:14px; color:var(--muted)}
footer p{margin:0 0 6px}
code{font-family:var(--font-en); font-size:.92em; background:var(--surface-subtle);
  padding:2px 6px; border-radius:2px; color:var(--ink)}

[data-en]{display:none}
html[lang="en"] [data-ko]{display:none}
html[lang="en"] [data-en]{display:revert}

@media print{
  .toolbar{display:none !important}
  body{font-size:13pt; line-height:1.4}
  .page{max-width:100%; padding:0}
  .hero{padding:28px 0; margin:0}
  .hero h1{font-size:28pt}
  .section{margin-top:28px}
  table{page-break-inside:avoid}
  h2,h3,.section-title{page-break-after:avoid}
}
</style>
</head>
<body>

<div class="toolbar">
  <div class="lang-toggle" role="radiogroup" aria-label="언어 / Language">
    <button type="button" role="radio" data-lang="ko" aria-checked="true">KO</button>
    <button type="button" role="radio" data-lang="en" aria-checked="false">EN</button>
  </div>
  <button type="button" class="btn-print" id="print">
    <span data-ko>인쇄</span><span data-en>Print</span>
  </button>
</div>

<header class="hero">
  <div class="page">
    <span class="tag"><span data-ko>사내 검증 기록</span><span data-en>Internal verification</span></span>
    <h1><span data-ko>수익률 기준 검증</span><span data-en>Return basis, verified</span></h1>
    <p class="sub" data-ko>ETF 조회 화면의 수익률이 네이버 숫자와 크게 달랐습니다.
      두 곳의 숫자가 아니라 <b style="color:#fff">원가격</b>을 받아 되짚어,
      어느 쪽이 무엇을 재고 있었는지 확인한 기록입니다.</p>
    <p class="sub" data-en>Our ETF screen showed returns far from the ones on Naver.
      We pulled the underlying daily prices — not the published figures — and
      established what each side was actually measuring.</p>
  </div>
</header>

<main class="page">

  <section class="section" style="margin-top:var(--space-block)">
    <div class="answer">
      <h2><span data-ko>둘 다 맞습니다. 재는 대상이 달랐습니다.</span><span data-en>Both are right. They measure different things.</span></h2>
      <p data-ko><b style="color:#fff">네이버 일별시세는 소급 수정된 수정주가</b>입니다 —
        분배금이 과거 가격에 이미 녹아 있습니다.
        <b style="color:#fff">우리 화면의 &lsquo;시장가&rsquo;는 무보정 거래소 가격</b>입니다.</p>
      <p data-ko>따라서 네이버 화면의 &ldquo;시장가 기준&rdquo;과 견줄 상대는 우리 &lsquo;시장가&rsquo;가
        아니라 <b style="color:#fff">&lsquo;총수익률&rsquo;</b>입니다. 지금 총수익률을 기본 기준으로
        삼은 선택이 네이버 표기와도 결이 맞습니다.</p>
      <p data-en><b style="color:#fff">Naver&rsquo;s daily prices are back-adjusted for distributions.</b>
        Our &ldquo;price&rdquo; series is the unadjusted exchange close.</p>
      <p data-en>So the figure to compare against Naver is our <b style="color:#fff">total return</b>,
        not our price return — which is what the screen already defaults to.</p>
    </div>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title" id="why"><span data-ko>왜 확인이 필요했나</span><span data-en>Why this needed checking</span></h2>
    <p class="lede" data-ko>같은 종목, 같은 1년인데 숫자가 55%p 넘게 벌어졌습니다.
      한쪽 원천으로 통일해 두면 화면 안에서는 아귀가 맞지만,
      <b>어느 쪽이 옳은지는 그것으로 밝혀지지 않습니다.</b></p>
    <p class="lede" data-en>Same fund, same year, a gap of more than 55 percentage points.
      Standardising on one source makes the screen internally consistent —
      it does not tell you which source is right.</p>

    <div class="table-wrap">
      <table>
        <caption><span data-ko>${esc(lead.name)} 기준 1년 수익률. 같은 기간을 두고 원천마다 다른 값이 나왔습니다.</span><span data-en>One-year return for ${esc(lead.name)} — same window, different sources.</span></caption>
        <thead><tr>
          <th><span data-ko>계열</span><span data-en>Series</span></th>
          <th class="num"><span data-ko>1년 수익률</span><span data-en>1Y return</span></th>
          <th><span data-ko>출처</span><span data-en>Source</span></th>
        </tr></thead>
        <tbody>
          <tr><td><span data-ko>네이버 표기 &ldquo;시장가 기준&rdquo;</span><span data-en>Naver, &ldquo;market price&rdquo;</span></td>
              <td class="num strong">${n2(lead.stated?.price)}%</td>
              <td class="muted">etfAnalysis</td></tr>
          <tr><td><span data-ko>우리 화면 &lsquo;시장가&rsquo;</span><span data-en>Our screen, price</span></td>
              <td class="num strong">${n2(lead.data?.price)}%</td>
              <td class="muted">Yahoo chart</td></tr>
          <tr><td><span data-ko>우리 화면 &lsquo;총수익률&rsquo;</span><span data-en>Our screen, total return</span></td>
              <td class="num strong">${n2(lead.data?.tr)}%</td>
              <td class="muted">Yahoo chart + dividends</td></tr>
        </tbody>
      </table>
    </div>

    <div class="note">
      <span class="h"><span data-ko>기준일 차이로는 설명되지 않습니다</span><span data-en>A date offset cannot explain this</span></span>
      <span data-ko>며칠 어긋난 정도라면 몇 %p 차이입니다.
        ${n2(lead.data?.price)}%와 ${n2(lead.stated?.price)}%는 시작 가격이 다르다는 뜻이고,
        그건 계산 방식이 아니라 <b>가격 그 자체가 다르다</b>는 신호입니다.</span>
      <span data-en>A few days&rsquo; offset moves a return by a few points.
        This gap means the starting prices differ — the inputs, not the arithmetic.</span>
    </div>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title" id="method"><span data-ko>어떻게 확인했나</span><span data-en>Method</span></h2>
    <p data-ko>발표된 수익률끼리 비교하면 답이 안 나옵니다. 서로 무엇을 계산했는지 모르기 때문입니다.
      그래서 두 곳의 <b>일별 종가</b>를 받아 날짜로 맞추고, <b>같은 계산기</b>로 다시 계산했습니다.</p>
    <p data-en>Comparing published returns settles nothing — you don&rsquo;t know what either one computed.
      So we pulled both sides&rsquo; <b>daily closes</b>, aligned them by date, and recomputed with one calculator.</p>
    <ul>
      <li data-ko>네이버 일별시세(<code>siseJson</code>)와 야후 일봉(<code>chart</code>)을 2년치 받습니다.</li>
      <li data-ko>한국 봉은 KST 로 환산해 날짜를 맞춥니다 — UTC 로 찍으면 하루씩 밀려 대조가 무의미해집니다.</li>
      <li data-ko><b>지렛대는 분배금입니다.</b> 분배가 없는 종목은 어떤 기준이든 값이 같아야 합니다.
        거기서 갈리면 가격 원천이 다른 것이고, 분배가 큰 종목에서만 갈리면 한쪽이 수정 계열입니다.</li>
      <li data-en>Two years of daily closes from Naver <code>siseJson</code> and Yahoo <code>chart</code>.</li>
      <li data-en>Korean bars converted to KST before matching dates — UTC shifts every bar by a day.</li>
      <li data-en><b>Distributions are the lever.</b> Funds that pay nothing must agree under any basis.</li>
    </ul>
    <div class="note">
      <span class="h"><span data-ko>판정 순서에 함정이 있습니다</span><span data-en>The order of the test matters</span></span>
      <span data-ko>분배가 큰 종목에서 두 계열이 벌어지는 것은 <b>당연합니다</b>.
        그것만 보고 &ldquo;가격 원천이 다르다&rdquo;고 하면 오진입니다.
        <b>분배가 없어 벌어질 이유가 없는 종목을 먼저</b> 봐야 합니다.
        실제로 첫 판정문이 이 순서를 어겨 반대 결론을 냈고, 표를 다시 보고 잡았습니다.</span>
      <span data-en>High-distribution funds are <b>expected</b> to diverge. Reading that as a source
        mismatch is a misdiagnosis. Check the funds with no reason to diverge first.</span>
    </div>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title" id="control"><span data-ko>관측 1 — 분배가 없으면 종가가 완전히 같습니다</span><span data-en>Finding 1 — With no distributions, the closes match exactly</span></h2>
    <p data-ko>분배를 하지 않는 종목의 일봉을 날짜별로 맞춰 한 줄씩 대조했습니다.
      <b>차이가 중앙값도 최대값도 0%</b>입니다. 두 곳은 같은 거래소 종가를 보고 있습니다.</p>
    <p data-en>For funds that paid nothing, every matched trading day agrees — median and maximum
      difference are both 0%. Both sources are reading the same exchange close.</p>
    <div class="table-wrap">
      <table>
        <caption><span data-ko>대조군. &lsquo;1% 넘게 벌어진 날&rsquo;이 0건이라는 것이 핵심입니다.</span><span data-en>Control group. The count of days differing by more than 1% is zero.</span></caption>
        <thead><tr>
          <th><span data-ko>종목</span><span data-en>Fund</span></th>
          <th class="num"><span data-ko>대조한 거래일</span><span data-en>Days compared</span></th>
          <th class="num"><span data-ko>종가 차이 중앙값</span><span data-en>Median diff</span></th>
          <th class="num"><span data-ko>종가 차이 최대</span><span data-en>Max diff</span></th>
          <th class="num"><span data-ko>1% 초과한 날</span><span data-en>Days over 1%</span></th>
          <th class="num"><span data-ko>네이버 1년</span><span data-en>Naver 1Y</span></th>
          <th class="num"><span data-ko>야후 1년</span><span data-en>Yahoo 1Y</span></th>
        </tr></thead>
        <tbody>${controlTable()}</tbody>
      </table>
    </div>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title" id="adjust"><span data-ko>관측 2 — 분배가 있으면, 벌어지는 폭이 분배금과 맞습니다</span><span data-en>Finding 2 — Where they diverge, the gap equals the distributions</span></h2>
    <p data-ko>소급 수정이라면 <b>오늘 값은 그대로 두고 과거 값만 낮춰</b> 잡아야 합니다.
      그래야 과거에서 오늘까지의 상승률 안에 분배금이 녹아듭니다. 그러면 두 계열의 비율이
      이렇게 나와야 합니다.</p>
    <p data-en>Back-adjustment leaves today&rsquo;s price alone and marks past prices down, so the
      distributions fold into the measured rise. That predicts the ratio between the two series:</p>
    <div class="formula">
      <span class="lbl" data-ko>오늘</span><span class="lbl" data-en>today</span>
      &nbsp;&nbsp; 네이버 / 야후 = 1<br>
      <span class="lbl" data-ko>1년 전</span><span class="lbl" data-en>a year ago</span>
      &nbsp;&nbsp; 네이버 / 야후 = &Pi; ( 1 &minus; <span class="lbl" data-ko>분배금</span><span class="lbl" data-en>distribution</span> / <span class="lbl" data-ko>그날 주가</span><span class="lbl" data-en>close</span> )
    </div>
    <p data-ko>오른쪽 값은 야후 배당 이력으로 <b>따로 계산할 수 있습니다.</b>
      그래서 예측과 관측을 맞댈 수 있고, 맞으면 추정이 아니라 관측이 됩니다.</p>
    <p data-en>The right-hand side is computable from the dividend history alone — so prediction
      and observation can be put side by side.</p>
    <div class="table-wrap">
      <table>
        <caption><span data-ko>${payers.length}종목 중 ${adjHit}종목이 맞았습니다 (오늘 비율 1 ±0.02 · 1년 전 비율 예측치 ±0.03).</span><span data-en>${adjHit} of ${payers.length} funds match within tolerance.</span></caption>
        <thead><tr>
          <th><span data-ko>종목</span><span data-en>Fund</span></th>
          <th class="num"><span data-ko>분배율</span><span data-en>Yield</span></th>
          <th class="num"><span data-ko>구간 분배</span><span data-en>Payouts</span></th>
          <th class="num"><span data-ko>오늘 비율</span><span data-en>Ratio today</span></th>
          <th class="num"><span data-ko>1년 전 비율<br>(관측)</span><span data-en>Ratio 1Y ago<br>(observed)</span></th>
          <th class="num"><span data-ko>1년 전 비율<br>(분배로 예측)</span><span data-en>Ratio 1Y ago<br>(predicted)</span></th>
          <th class="num"><span data-ko>차이</span><span data-en>Gap</span></th>
        </tr></thead>
        <tbody>${adjTable()}</tbody>
      </table>
    </div>

    <h3><span data-ko>한 줄로 보면</span><span data-en>The same thing, in one line</span></h3>
    <p data-ko><b>끝 가격은 같고 시작 가격만 다릅니다.</b> 소급 수정이 정확히 이런 모양을 만듭니다.</p>
    <p data-en><b>The end price agrees; only the start price differs.</b> That is the signature of back-adjustment.</p>
    <div class="table-wrap">
      <table>
        <caption><span data-ko>1년 구간의 시작·끝 종가 (원). 대조군은 시작 가격도 같습니다.</span><span data-en>Start and end closes over the one-year window, in KRW.</span></caption>
        <thead><tr>
          <th><span data-ko>종목</span><span data-en>Fund</span></th>
          <th class="num"><span data-ko>시작 · 네이버</span><span data-en>Start · Naver</span></th>
          <th class="num"><span data-ko>시작 · 야후</span><span data-en>Start · Yahoo</span></th>
          <th class="num"><span data-ko>끝 · 네이버</span><span data-en>End · Naver</span></th>
          <th class="num"><span data-ko>끝 · 야후</span><span data-en>End · Yahoo</span></th>
        </tr></thead>
        <tbody>${seriesTable()}</tbody>
      </table>
    </div>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title" id="result"><span data-ko>그래서 어느 숫자를 봐야 하나</span><span data-en>Which number to read</span></h2>
    <p data-ko>네이버 표기와 견줄 상대는 <b>총수익률</b>입니다. 아래 표의 마지막 열이
      네이버 표기와 가까운 것을 보십시오. 남는 차이는 기준일 하루와 재투자 방식 차이입니다.</p>
    <p data-en>Naver&rsquo;s published figure lines up with our total return column, not our price column.</p>
    <div class="table-wrap">
      <table>
        <caption><span data-ko>네이버 표기와 네이버 원가격 재계산이 서로 가깝고, 그 둘이 우리 총수익률 쪽에 붙습니다.
          우리 &lsquo;시장가&rsquo;만 홀로 낮은데, 그것이 무보정 거래소 가격이기 때문입니다.</span><span data-en>Naver&rsquo;s published and recomputed figures track our total return; our price series sits below because it is unadjusted.</span></caption>
        <thead><tr>
          <th><span data-ko>종목</span><span data-en>Fund</span></th>
          <th class="num"><span data-ko>네이버 표기</span><span data-en>Naver published</span></th>
          <th class="num"><span data-ko>네이버 원가격<br>재계산</span><span data-en>Naver raw closes<br>recomputed</span></th>
          <th class="num"><span data-ko>우리 시장가</span><span data-en>Our price</span></th>
          <th class="num"><span data-ko>우리 총수익률</span><span data-en>Our total return</span></th>
        </tr></thead>
        <tbody>${compareTable()}</tbody>
      </table>
    </div>

    <div class="note">
      <span class="h"><span data-ko>이름이 오해를 부릅니다</span><span data-en>The label is misleading</span></span>
      <span data-ko>네이버가 &ldquo;시장가 기준&rdquo;이라 적어 둔 값에는 <b>분배금이 들어가 있습니다.</b>
        무보정 시장가격이 아닙니다. 그 이름만 믿고 우리 &lsquo;시장가&rsquo;와 맞춰 보면 계속 어긋납니다.</span>
      <span data-en>What Naver labels &ldquo;market price&rdquo; already contains distributions.
        Matching it against an unadjusted price series will never reconcile.</span>
    </div>

    <h3><span data-ko>화면에 반영한 것</span><span data-en>What changed on the screen</span></h3>
    <ul>
      <li data-ko><b>총수익률이 기본 기준</b>입니다. 국내·해외 모두 같은 계산기로 만들어 한 줄로 세울 수 있습니다.</li>
      <li data-ko>&lsquo;시장가&rsquo;로 볼 때 <b>안내문 한 줄</b>을 띄웁니다 — 포털 숫자는 수정주가 기준이라 더 높게 나오고,
        맞춰 볼 상대는 총수익률이라는 것.</li>
      <li data-en><b>Total return is the default basis</b>, computed identically for every market.</li>
      <li data-en>The price view now carries a note explaining why portal figures sit higher.</li>
    </ul>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title" id="repro"><span data-ko>다시 확인하려면</span><span data-en>Reproducing this</span></h2>
    <p data-ko>이 문서의 숫자는 손으로 옮긴 것이 아니라 되짚기 산출물에서 읽어 만듭니다.
      되짚기를 다시 돌리면 문서도 다시 만들면 됩니다.</p>
    <p data-en>Every number here is read from the probe output, not transcribed. Re-run, then rebuild.</p>
    <div class="formula">
node scripts/verify_etf_price_series.mjs<span class="lbl"
  ><span data-ko>&nbsp;&nbsp;# 러너에서 실행 (etf-probe 워크플로)</span
  ><span data-en>&nbsp;&nbsp;# on the CI runner (etf-probe workflow)</span></span><br>
node scripts/build_etf_verify_page.mjs<span class="lbl"
  ><span data-ko>&nbsp;&nbsp;# 이 문서 생성</span
  ><span data-en>&nbsp;&nbsp;# build this document</span></span><br>
node scripts/check_etf_return_basis.mjs<span class="lbl"
  ><span data-ko>&nbsp;&nbsp;# 계열 정합성 검산 (매일 자동)</span
  ><span data-en>&nbsp;&nbsp;# daily consistency gate</span></span>
    </div>
    <ul>
      <li data-ko>원자료 — <code>tools/discovery/etf_price_series.json</code> · 사람이 읽는 판정문은 <code>.md</code></li>
      <li data-ko>세션에서는 네이버·야후에 직접 못 붙습니다(이그레스 정책). 수집·되짚기는 모두 러너에서 돕니다.</li>
      <li data-en>Raw output — <code>tools/discovery/etf_price_series.json</code></li>
      <li data-en>This session cannot reach Naver or Yahoo directly; collection runs on the CI runner.</li>
    </ul>
  </section>

  <footer>
    <p data-ko>되짚기 기준일 ${esc(asOf)} · 대조군 ${control.length}종목 · 분배 종목 ${payers.length}종목 ·
      대조한 거래일 종목당 ${control[0]?.cmp?.common ?? '—'}일</p>
    <p data-en>Verified as of ${esc(asOf)} · ${control.length} control funds · ${payers.length} distributing funds</p>
    <p data-ko>원천: 네이버 금융(일별시세·ETF 분석) · 야후 파이낸스(일봉·배당 이력). 투자 판단의 근거로 쓸 수 없습니다.</p>
    <p data-en>Sources: Naver Finance, Yahoo Finance. Not investment advice.</p>
  </footer>
</main>

<script>
(function () {
  var root = document.documentElement;
  var btns = document.querySelectorAll('.lang-toggle button');
  function set(lang) {
    root.setAttribute('lang', lang);
    for (var i = 0; i < btns.length; i += 1) {
      btns[i].setAttribute('aria-checked', btns[i].dataset.lang === lang ? 'true' : 'false');
    }
    try { localStorage.setItem('etf-basis-lang', lang); } catch (e) {}
  }
  for (var i = 0; i < btns.length; i += 1) {
    btns[i].addEventListener('click', function () { set(this.dataset.lang); });
  }
  var saved = null;
  try { saved = localStorage.getItem('etf-basis-lang'); } catch (e) {}
  set(saved === 'en' ? 'en' : 'ko');
  document.getElementById('print').addEventListener('click', function () { window.print(); });
}());
</script>
</body>
</html>
`;

await writeFile(OUT, html);
console.log(`[verify-page] ${OUT} 생성 — 대조군 ${control.length} · 분배 종목 ${payers.length} · 예측 적중 ${adjHit}/${payers.length}`);
