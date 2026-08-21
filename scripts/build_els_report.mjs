#!/usr/bin/env node
/**
 * data/els.js -> els-report.html (ELS 회차 비교분석 리포트)
 *
 * 수집된 회차 조건과 기초자산 종가로 직접 계산한다. 손으로 옮겨적는 수치가 없어야
 * 데이터가 갱신될 때 리포트도 같이 맞는다. 계산 규칙은 els.html 의 과거 시뮬레이션과
 * 동일하다 — 종가 기준 워스트 퍼포머, 낙인은 기간 중 종가가 한 번이라도 아래로 내려가면 터치.
 */
import { readFile, writeFile } from 'node:fs/promises';

const DATA = 'data/els.js';
const OUT = 'els-report.html';

const src = await readFile(DATA, 'utf8');
const w = {};
new Function('window', src)(w);
const D = w.ELS_DATA;
const H = D.history;

const INDEX = new Set(['KOSPI200', 'S&P500', 'Nikkei225', 'EuroStoxx50', 'HSCEI']);
const totalRate = (p) => p.rateBasis === 'total' ? p.couponRate : p.couponRate * p.maturityMonths / 12;
const annual = (p) => totalRate(p) * 12 / p.maturityMonths;
const kindOf = (p) => p.underlyings.every((u) => INDEX.has(u)) ? '지수형'
  : p.underlyings.some((u) => INDEX.has(u)) ? '혼합형' : '종목형';
const fmt = (v, d = 1) => v == null ? '–' : v.toFixed(d);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── 기초자산 현재 위치 ────────────────────────────────────────────────
const market = Object.entries(H.series).map(([name, s]) => {
  let peak = -Infinity, peakAt = 0;
  s.forEach((v, i) => { if (v > peak) { peak = v; peakAt = i; } });
  let run = -Infinity, mdd = 0;
  s.forEach((v) => { if (v > run) run = v; const dd = (v / run - 1) * 100; if (dd < mdd) mdd = dd; });
  const last = s[s.length - 1];
  const back = (n) => s[Math.max(0, s.length - 1 - n)];
  return {
    name,
    kind: INDEX.has(name) ? '지수' : '종목',
    fromPeak: (last / peak - 1) * 100,
    peakAt: H.dates[peakAt],
    y1: (last / back(252) - 1) * 100,
    m3: (last / back(63) - 1) * 100,
    mdd,
  };
}).sort((a, b) => a.fromPeak - b.fromPeak);

// ── 회차별 계산 ──────────────────────────────────────────────────────
// 아래 두 함수는 els.html 의 runBacktest 와 같은 규칙으로 돈다. 평가일을 거래일 수로
// 근사하지 않고 실제 달력 월로 잡고, 기초자산에 값이 다 있는 날부터 발행한다.
// (팔란티어처럼 상장이 늦은 종목이 섞이면 근사값과 결과가 크게 벌어진다.)
const addMonths = (ymd, m) => {
  const x = new Date(Date.UTC(Math.floor(ymd / 10000), Math.floor(ymd / 100) % 100 - 1 + m, ymd % 100));
  return x.getUTCFullYear() * 10000 + (x.getUTCMonth() + 1) * 100 + x.getUTCDate();
};
const idxOnOrAfter = (dates, ymd, from = 0) => {
  let lo = from, hi = dates.length - 1, ans = -1;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (dates[mid] >= ymd) { ans = mid; hi = mid - 1; } else lo = mid + 1; }
  return ans;
};

/** 발행 가능한 첫 인덱스 — 모든 기초자산에 값이 있는 날 */
function startIndex(ser, N) {
  let start = 0;
  for (const arr of ser) { let i = 0; while (i < N && arr[i] == null) i++; if (i > start) start = i; }
  return start;
}

/** 발행일마다 만기까지 워스트 퍼포머가 어디까지 내려갔는지 */
function drawdown(p) {
  const ser = p.underlyings.map((u) => H.series[u]);
  if (ser.some((s) => !s)) return null;
  const dates = H.dates, N = dates.length;
  const mins = [];
  for (let i = startIndex(ser, N); i < N; i++) {
    const end = idxOnOrAfter(dates, addMonths(dates[i], p.maturityMonths), i);
    if (end < 0 || addMonths(dates[i], p.maturityMonths) > dates[N - 1]) break;
    const base = ser.map((s) => s[i]);
    if (base.some((v) => v == null || !(v > 0))) continue;
    let lo = Infinity;
    for (let k = i + 1; k <= end; k++) {
      for (let a = 0; a < ser.length; a++) {
        const v = ser[a][k];
        if (v != null) { const r = v / base[a] * 100; if (r < lo) lo = r; }
      }
    }
    if (lo < Infinity) mins.push(lo);
  }
  if (!mins.length) return null;
  mins.sort((a, b) => a - b);
  return { min: mins[0], p1: mins[Math.floor(mins.length * 0.01)], n: mins.length };
}

/** els.html 의 runBacktest 와 같은 판정 */
function backtest(p) {
  const ser = p.underlyings.map((u) => H.series[u]);
  if (ser.some((s) => !s)) return null;
  const sch = p.schedule || [];
  if (!sch.length) return null;
  const dates = H.dates, N = dates.length, mat = p.maturityMonths, full = totalRate(p);
  let runs = 0, first = 0, loss = 0, annSum = 0, worst = Infinity;

  for (let i = startIndex(ser, N); i < N; i++) {
    if (addMonths(dates[i], mat) > dates[N - 1]) break;
    const base = ser.map((s) => s[i]);
    if (base.some((v) => v == null || !(v > 0))) continue;

    let scan = i, kiHit = false, done = null;
    for (let k = 0; k < sch.length && !done; k++) {
      const j = idxOnOrAfter(dates, addMonths(dates[i], sch[k].months), scan);
      if (j < 0) break;
      if (p.knockIn != null && !kiHit) {
        for (let x = scan; x <= j && !kiHit; x++) {
          for (let a = 0; a < ser.length; a++) {
            const v = ser[a][x];
            if (v != null && (v / base[a]) * 100 < p.knockIn) { kiHit = true; break; }
          }
        }
      }
      scan = j;

      let wp = Infinity;
      for (let a = 0; a < ser.length; a++) {
        const v = ser[a][j];
        if (v == null) { wp = null; break; }
        wp = Math.min(wp, (v / base[a]) * 100);
      }
      if (wp == null) break;

      const last = k === sch.length - 1;
      if (wp >= sch[k].barrier) {
        done = { months: sch[k].months, ret: full * (sch[k].months / mat), firstHit: k === 0 };
      } else if (sch[k].lizard != null && wp >= sch[k].lizard) {
        const lr = sch[k].lizardRate != null ? sch[k].lizardRate * (sch[k].months / 12) : full * (sch[k].months / mat);
        done = { months: sch[k].months, ret: lr };
      } else if (last) {
        if (p.principalProtection >= 100) done = { months: mat, ret: 0 };
        else if (p.knockIn != null && !kiHit) done = { months: mat, ret: full };
        else done = { months: mat, ret: wp - 100 };
      }
    }
    if (!done) continue;

    runs++;
    annSum += done.ret * 12 / done.months;
    if (done.ret < 0) loss++;
    if (done.ret < worst) worst = done.ret;
    if (done.firstHit) first++;
  }
  if (!runs) return null;
  return { runs, firstRate: first / runs * 100, lossRate: loss / runs * 100, avgAnn: annSum / runs, worst };
}

const rows = D.products.map((p) => {
  const dd = drawdown(p);
  const bt = backtest(p);
  const sch = p.schedule || [];
  return {
    code: p.name.replace('미래에셋증권', ''),
    type: p.type || 'ELS',
    kind: kindOf(p),
    und: p.underlyings.join(' · '),
    annual: annual(p),
    mat: p.maturityMonths,
    obs: sch.length,
    b0: sch[0]?.barrier, bN: sch[sch.length - 1]?.barrier,
    ki: p.knockIn,
    risk: p.riskLabel,
    batch: p.offerStart === '2026-07-27' ? '1차' : '2차',
    offer: p.offerStart && p.offerEnd ? p.offerStart.slice(5).replace('-', '.') + '~' + p.offerEnd.slice(5).replace('-', '.') : '–',
    min: dd?.min, p1: dd?.p1,
    margin: (dd && p.knockIn != null) ? dd.min - p.knockIn : null,
    runs: bt?.runs, firstRate: bt?.firstRate, lossRate: bt?.lossRate, avgAnn: bt?.avgAnn, worst: bt?.worst,
  };
}).sort((a, b) => (a.margin ?? 999) - (b.margin ?? 999));

const byKind = ['지수형', '혼합형', '종목형'].map((k) => {
  const a = rows.filter((r) => r.kind === k);
  const avg = (f) => a.reduce((s, x) => s + (x[f] ?? 0), 0) / a.length;
  return {
    kind: k, n: a.length, annual: avg('annual'), firstRate: avg('firstRate'),
    lossRate: avg('lossRate'), avgAnn: avg('avgAnn'),
    breached: a.filter((r) => r.margin != null && r.margin < 0).length,
  };
});

const breached = rows.filter((r) => r.margin != null && r.margin < 0);
const thin = rows.filter((r) => r.margin != null && r.margin >= 0 && r.margin <= 6);
const dataFrom = String(H.dates[0]), dataTo = String(H.dates[H.dates.length - 1]);
const ymd = (s) => `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;

// ── 표 렌더 ──────────────────────────────────────────────────────────
const riskShort = (r) => (r || '–').replace('위험', '');
const sign = (v, d = 1) => (v >= 0 ? '+' : '') + v.toFixed(d);

const marginCell = (r) => {
  if (r.margin == null) return '<td class="num muted">낙인 없음</td>';
  const cls = r.margin < 0 ? 'bad' : r.margin <= 6 ? 'warn' : '';
  return `<td class="num ${cls}">${sign(r.margin)}%p</td>`;
};

const mainTable = rows.map((r) => `      <tr>
        <td class="code">${esc(r.code)}</td>
        <td><span class="chip ${r.kind === '지수형' ? 'idx' : r.kind === '종목형' ? 'stk' : 'mix'}">${r.kind}</span></td>
        <td class="und">${esc(r.und)}</td>
        <td class="num">${fmt(r.annual, 1)}%</td>
        <td class="num">${r.mat}개월</td>
        <td class="num">${r.b0}→${r.bN}</td>
        <td class="num">${r.ki == null ? '–' : r.ki + '%'}</td>
        <td class="num">${fmt(r.min)}</td>
        ${marginCell(r)}
        <td class="num">${fmt(r.firstRate)}%</td>
        <td class="num ${r.lossRate > 0 ? 'bad' : ''}">${fmt(r.lossRate)}%</td>
        <td class="num">${sign(r.avgAnn, 1)}%</td>
        <td class="nw muted">${riskShort(r.risk)}</td>
      </tr>`).join('\n');

const marketTable = market.map((m) => `      <tr>
        <td>${esc(m.name)}</td>
        <td class="muted">${m.kind}</td>
        <td class="num ${m.fromPeak <= -20 ? 'bad' : ''}">${sign(m.fromPeak)}%</td>
        <td class="num muted">${ymd(String(m.peakAt))}</td>
        <td class="num">${sign(m.m3)}%</td>
        <td class="num ${m.y1 > 100 ? 'hot' : ''}">${sign(m.y1, 0)}%</td>
        <td class="num">${m.mdd.toFixed(0)}%</td>
      </tr>`).join('\n');

const kindTable = byKind.map((k) => `      <tr>
        <td><span class="chip ${k.kind === '지수형' ? 'idx' : k.kind === '종목형' ? 'stk' : 'mix'}">${k.kind}</span></td>
        <td class="num">${k.n}건</td>
        <td class="num">${fmt(k.annual)}%</td>
        <td class="num">${fmt(k.firstRate)}%</td>
        <td class="num ${k.lossRate > 0 ? 'bad' : ''}">${fmt(k.lossRate, 2)}%</td>
        <td class="num">${sign(k.avgAnn)}%</td>
        <td class="num ${k.breached ? 'bad' : ''}">${k.breached}건</td>
      </tr>`).join('\n');

const breachList = breached.map((r) =>
  `<li><strong>${esc(r.code)}</strong> ${esc(r.und)} — 낙인 ${r.ki}%인데 워스트 퍼포머가 <strong class="bad">${fmt(r.min)}</strong>까지 내려간 적이 있습니다 (${fmt(Math.abs(r.margin))}%p 초과). 시뮬레이션 손실률 ${fmt(r.lossRate)}%.</li>`).join('\n      ');

const thinList = thin.map((r) =>
  `<li><strong>${esc(r.code)}</strong> ${esc(r.und)} — 낙인 ${r.ki}%, 역대 최저 ${fmt(r.min)}. 여유 <strong class="warn">${fmt(r.margin)}%p</strong>.</li>`).join('\n      ');

const html = `<title>8월 ELS 37건 비교분석</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --orange:#F58220; --orange-active:#CB6015; --orange-soft:#FAB072;
  --blue:#043B72; --canvas:#FFFFFF; --soft:#ECEFF4; --subtle:#F7F8FA;
  --hairline:#CDCECB; --hairline-soft:#E5E4E1;
  --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C; --muted-soft:#84888B;
  --error:#C62828; --warning:#B8860B; --success:#2E8540;
  --font-kr:'Noto Sans KR','Spoqa Han Sans Neo','Malgun Gothic',sans-serif;
  --font-num:'Inter','SF Mono',ui-monospace,monospace;
  --space-section:88px; --space-block:48px;
}
*{box-sizing:border-box;}
body{
  margin:0; background:var(--canvas); color:var(--body);
  font-family:var(--font-kr); font-size:19px; line-height:1.65;
  -webkit-font-smoothing:antialiased;
}
.page{max-width:1200px; margin:0 auto; padding:0 32px 96px;}
h1,h2,h3{color:var(--ink); text-wrap:balance; margin:0;}
h1{font-size:34px; font-weight:700; line-height:1.25; letter-spacing:-0.3px;}
h2{font-size:26px; font-weight:700; line-height:1.3;}
h3{font-size:20px; font-weight:600; line-height:1.35;}
p{margin:0;}
strong{color:var(--ink); font-weight:700;}
a{color:var(--blue);}

/* Hero */
.hero{background:var(--orange); color:#fff; padding:56px 0 48px; margin-bottom:var(--space-block);}
.hero .page{padding-bottom:0;}
.hero .tag{font-family:var(--font-num); font-size:13px; font-weight:600; letter-spacing:1.2px;
  text-transform:uppercase; opacity:.9;}
.hero h1{color:#fff; font-size:44px; margin:14px 0 12px; letter-spacing:-0.6px;}
.hero p{color:rgba(255,255,255,.94); font-size:20px; max-width:64ch;}
.hero .meta{display:flex; flex-wrap:wrap; gap:10px 28px; margin-top:26px;
  font-size:15px; color:rgba(255,255,255,.92); font-family:var(--font-num);}

/* Sections */
section{margin-top:var(--space-section);}
.rule{height:1px; background:var(--orange); margin-bottom:18px;}
.lead{margin-top:14px; max-width:74ch;}
.stack{display:flex; flex-direction:column; gap:18px; margin-top:22px;}

/* Callouts */
.note{border:1px solid var(--hairline); border-left:3px solid var(--orange);
  background:var(--subtle); padding:22px 26px; border-radius:2px;}
.note.alert{border-left-color:var(--error);}
.note h3{margin-bottom:8px;}
.note ul{margin:10px 0 0; padding-left:22px;}
.note li{margin-bottom:8px;}

/* Stats */
.stats{display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1px;
  background:var(--hairline-soft); border:1px solid var(--hairline); margin-top:24px;}
.stat{background:var(--canvas); padding:22px 24px;}
.stat .label{font-size:15px; font-weight:500; color:var(--muted); letter-spacing:.4px;}
.stat .value{font-family:var(--font-num); font-size:40px; font-weight:700; line-height:1.1;
  color:var(--blue); margin-top:8px; font-variant-numeric:tabular-nums;}
.stat .value.orange{color:var(--orange-active);}
.stat .value.bad{color:var(--error);}
.stat .sub{font-size:14px; color:var(--muted); margin-top:6px;}

/* Tables */
.scroll{overflow-x:auto; margin-top:24px; border:1px solid var(--hairline);}
table{border-collapse:collapse; width:100%; font-size:16px;}
thead th{background:var(--orange-soft); color:var(--ink); font-weight:700; text-align:left;
  padding:12px 10px; white-space:nowrap; border-bottom:1px solid var(--hairline);}
tbody td{padding:11px 10px; border-bottom:1px solid var(--hairline-soft); vertical-align:top;}
tbody tr:last-child td{border-bottom:none;}
tbody tr:hover{background:var(--subtle);}
.num{text-align:right; font-family:var(--font-num); font-variant-numeric:tabular-nums; white-space:nowrap;}
.nw{white-space:nowrap;}
.code{font-family:var(--font-num); font-size:15px; font-weight:600; color:var(--ink); white-space:nowrap;}
.und{font-size:15px; line-height:1.45; word-break:keep-all; min-width:168px;}
.muted{color:var(--muted);}
.bad{color:var(--error); font-weight:600;}
.warn{color:var(--warning); font-weight:600;}
.hot{color:var(--orange-active); font-weight:600;}
caption{caption-side:bottom; text-align:left; font-size:14px; color:var(--muted);
  padding:12px; line-height:1.5;}

.chip{display:inline-block; font-size:13px; font-weight:600; padding:3px 8px; border-radius:2px;
  white-space:nowrap; border:1px solid;}
.chip.idx{color:var(--blue); border-color:var(--blue); background:rgba(4,59,114,.06);}
.chip.stk{color:var(--orange-active); border-color:var(--orange-active); background:rgba(245,130,32,.08);}
.chip.mix{color:var(--muted); border-color:var(--muted-soft); background:var(--subtle);}

.foot{margin-top:var(--space-section); padding-top:24px; border-top:1px solid var(--hairline);
  font-size:15px; color:var(--muted); line-height:1.7;}

@media (max-width:768px){
  body{font-size:17px;}
  .page{padding:0 20px 64px;}
  .hero h1{font-size:32px;}
  :root{--space-section:60px; --space-block:36px;}
}
@media print{
  .hero{background:#fff !important; color:#000; border-bottom:2px solid var(--orange);}
  .hero h1, .hero p, .hero .meta, .hero .tag{color:#000 !important;}
  body{font-size:11pt;} .scroll{overflow:visible;} table{page-break-inside:auto;}
  tr{page-break-inside:avoid;} section{page-break-inside:auto;}
}
</style>

<header class="hero">
  <div class="page">
    <div class="tag">MIRAE ASSET · ELS ANALYSIS</div>
    <h1>8월 발행 ELS 37건, 낙인까지의 거리</h1>
    <p>미래에셋증권이 2026년 8월에 청약을 받은 ELS·ELB 37건을 회차 조건과 기초자산 실제 종가로 비교했습니다.
       쿠폰이 아니라 <strong style="color:#fff">기초자산이 과거에 어디까지 내려갔는지</strong>를 기준으로 줄을 세웠습니다.</p>
    <div class="meta">
      <span>상품 정보 ${D.updatedAt.slice(0, 10).replace(/-/g, '.')} 수집</span>
      <span>시세 ${ymd(dataFrom)} ~ ${ymd(dataTo)}</span>
      <span>37건 · 청약 전건 마감</span>
    </div>
  </div>
</header>

<div class="page">

<section style="margin-top:0">
  <div class="rule"></div>
  <h2>이 자료가 선 자리</h2>
  <p class="lead">먼저 무엇을 근거로 썼고 무엇을 못 봤는지 적습니다. 뒤의 숫자는 전부 이 범위 안에서만 유효합니다.</p>
  <div class="stack">
    <div class="note">
      <h3>근거로 쓴 것</h3>
      <ul>
        <li><strong>회차 조건</strong> — 미래에셋증권 홈페이지 ELS/DLS 캘린더에서 수집한 37건의 원문 표기(기초자산·배리어·낙인·수익률·청약기간·위험등급).</li>
        <li><strong>기초자산 종가</strong> — ${ymd(dataFrom)}부터 ${ymd(dataTo)}까지 ${H.dates.length.toLocaleString()}거래일 일별 종가(${esc(H.source || 'Yahoo Finance')}).</li>
        <li><strong>계산</strong> — 매 거래일 발행을 가정한 롤링 시뮬레이션. 종가 기준 워스트 퍼포머, 낙인은 기간 중 종가가 한 번이라도 아래로 내려가면 터치로 판정.</li>
      </ul>
    </div>
    <div class="note alert">
      <h3>보지 못한 것</h3>
      <ul>
        <li><strong>회차별 투자설명서를 열지 못했습니다.</strong> 따라서 리자드 조기상환 조항, 중도상환 수수료, 공정가액 차감폭은 이 자료에 없습니다. 홈페이지 목록에는 그 칸 자체가 없습니다.</li>
        <li><strong>여기 수치는 발행사 설명서의 “수익률 모의실험”이 아닙니다.</strong> 설명서는 2003년부터 20년 롤링을 쓰지만 이 자료는 10년입니다. 같은 상품이라도 숫자가 다릅니다.</li>
        <li><strong>세금·수수료·중도상환은 반영하지 않았습니다.</strong> 실수령액은 이보다 낮습니다.</li>
        <li><strong>37건 모두 청약이 끝났습니다.</strong> 지금 살 수 있는 상품이 아니라, 다음 회차를 읽는 기준으로 쓰는 자료입니다.</li>
      </ul>
    </div>
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2>지금 기초자산이 서 있는 자리</h2>
  <p class="lead">ELS의 손익은 기준가를 어디서 잡느냐로 절반이 결정됩니다. 8월 회차의 기준가는 다음 위치에서 잡혔습니다.</p>
  <div class="scroll">
    <table>
      <caption>고점은 최근 10년 내 최고 종가 기준. 최대낙폭은 같은 구간의 고점 대비 최대 하락률.</caption>
      <thead><tr>
        <th>기초자산</th><th>구분</th><th>고점 대비</th><th>고점 시점</th>
        <th>최근 3개월</th><th>최근 1년</th><th>10년 최대낙폭</th>
      </tr></thead>
      <tbody>
${marketTable}
      </tbody>
    </table>
  </div>
  <div class="note" style="margin-top:24px">
    <h3>읽는 법</h3>
    <p>두 가지가 동시에 보입니다. 하나는 <strong>진입 위치가 낮다</strong>는 것 — KOSPI200은 6월 고점 대비 ${fmt(market.find((m) => m.name === 'KOSPI200').fromPeak)}%,
       SK하이닉스는 ${fmt(market.find((m) => m.name === 'SK하이닉스').fromPeak)}% 아래에서 기준가가 잡혔습니다. 2024년 홍콩 ELS가 H지수 고점에서 발행된 것과는 반대 국면입니다.</p>
    <p style="margin-top:12px">다른 하나는 <strong>그 낙폭이 역사적 급등 직후에 나왔다</strong>는 것입니다. 최근 1년 수익률을 보면
       마이크론 ${sign(market.find((m) => m.name === '마이크론 테크놀로지').y1, 0)}%, SK하이닉스 ${sign(market.find((m) => m.name === 'SK하이닉스').y1, 0)}%,
       삼성전자 ${sign(market.find((m) => m.name === '삼성전자').y1, 0)}%입니다. 올라간 폭이 워낙 커서, 고점 대비 −20~−40%도 1년 전 수준보다는 한참 위입니다.
       뒤에 나오는 과거 시뮬레이션이 이 상품군에 대해 낙관적으로 나오는 이유가 여기 있습니다.</p>
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2>유형별 요약</h2>
  <p class="lead">쿠폰은 위험의 가격표입니다. 종목형이 지수형의 두 배 가까운 쿠폰을 주는 것은 조건이 좋아서가 아닙니다.</p>
  <div class="scroll">
    <table>
      <caption>1차 조기상환률·손실률·실현 연환산은 아래 롤링 시뮬레이션 결과의 유형별 평균입니다.</caption>
      <thead><tr>
        <th>유형</th><th>건수</th><th>평균 연쿠폰</th><th>1차 조기상환</th>
        <th>손실 종료</th><th>실현 연환산</th><th>낙인 돌파 이력</th>
      </tr></thead>
      <tbody>
${kindTable}
      </tbody>
    </table>
  </div>
  <div class="note alert" style="margin-top:24px">
    <h3>여기서 통념이 하나 깨집니다</h3>
    <p>“지수형은 안전하고 종목형은 위험하다”는 설명은 이 표에서 성립하지 않습니다.
       과거 10년 동안 낙인을 실제로 뚫은 ${breached.length}건 중 ${breached.filter((r) => r.kind === '지수형').length}건이 <strong>지수형</strong>이고,
       삼성전자·SK하이닉스 종목형은 한 건도 뚫지 않았습니다.</p>
    <p style="margin-top:12px">위험을 가르는 것은 유형이 아니라 <strong>기초자산이 과거에 어디까지 내려갔는지, 그 지점이 낙인에서 얼마나 떨어져 있는지</strong>입니다.
       HSCEI가 들어간 회차가 위험한 것은 지수라서가 아니라 HSCEI가 2018년 고점에서 ${fmt(market.find((m) => m.name === 'HSCEI').mdd, 0)}% 빠진 이력이 있기 때문입니다.</p>
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2>낙인까지의 거리</h2>
  <p class="lead">각 회차의 기초자산 조합이 과거 10년 동안 실제로 내려간 최저 수준과, 그 회차의 낙인 배리어를 뺀 값입니다.
     음수는 <strong>과거에 이미 낙인을 뚫은 적이 있다</strong>는 뜻입니다.</p>

  <div class="stats">
    <div class="stat">
      <div class="label">낙인 돌파 이력</div>
      <div class="value bad">${breached.length}건</div>
      <div class="sub">낙인 있는 회차 ${rows.filter((r) => r.ki != null).length}건 중</div>
    </div>
    <div class="stat">
      <div class="label">여유 6%p 이하</div>
      <div class="value orange">${thin.length}건</div>
      <div class="sub">한 번 더 같은 국면이면 닿는 거리</div>
    </div>
    <div class="stat">
      <div class="label">낙인 없음 · 원금지급</div>
      <div class="value">${rows.filter((r) => r.ki == null).length}건</div>
      <div class="sub">노낙인 ELS 및 ELB 포함</div>
    </div>
    <div class="stat">
      <div class="label">시뮬레이션 손실률 최대</div>
      <div class="value bad">${fmt(Math.max(...rows.map((r) => r.lossRate ?? 0)))}%</div>
      <div class="sub">${esc(rows.slice().sort((a, b) => (b.lossRate ?? 0) - (a.lossRate ?? 0))[0].code)}</div>
    </div>
  </div>

  <div class="stack" style="margin-top:28px">
    <div class="note alert">
      <h3>과거에 낙인을 뚫은 회차</h3>
      <ul>
      ${breachList}
      </ul>
    </div>
    <div class="note">
      <h3>여유가 6%p 이하인 회차</h3>
      <ul>
      ${thinList}
      </ul>
    </div>
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2>37건 전체 비교</h2>
  <p class="lead">낙인까지의 여유가 좁은 순서입니다. 여유가 좁을수록 위쪽에 옵니다.</p>
  <div class="scroll">
    <table>
      <caption>
        역대 최저 = 발행일마다 만기까지 지켜봤을 때 워스트 퍼포머가 내려간 가장 낮은 수준(기준가 100).
        여유 = 역대 최저 − 낙인. 1차 조기상환·손실·실현 연환산은 매 거래일 발행을 가정한 롤링 시뮬레이션 결과이며,
        만기까지 지켜볼 수 있는 발행일만 대상으로 합니다. 실현 = 보유기간으로 나눈 연환산 평균, 등급 = 홈페이지 표기 위험등급. 세금·수수료 미반영.
      </caption>
      <thead><tr>
        <th>회차</th><th>유형</th><th>기초자산</th><th>연쿠폰</th><th>만기</th>
        <th>배리어</th><th>낙인</th><th>역대 최저</th><th>여유</th>
        <th>1차 상환</th><th>손실</th><th>실현</th><th>등급</th>
      </tr></thead>
      <tbody>
${mainTable}
      </tbody>
    </table>
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2>이 시뮬레이션을 그대로 믿으면 안 되는 이유</h2>
  <p class="lead">위 표에서 대부분의 회차가 손실 0%로 나옵니다. 그 숫자를 고객에게 그대로 보여주면 불완전판매가 됩니다.</p>
  <div class="stack">
    <div class="note alert">
      <ul>
        <li><strong>표본이 독립적이지 않습니다.</strong> 하루씩 밀린 중첩 구간이라 손실 경로는 특정 시기에 뭉쳐서 발생합니다. 손실률 3%를 독립시행 확률처럼 읽으면 위험이 크게 희석됩니다.</li>
        <li><strong>구간이 10년뿐입니다.</strong> 2008년이 빠져 있습니다. 발행사 설명서는 2003년부터 20년을 씁니다.</li>
        <li><strong>반도체 종목형에는 구간 자체가 유리합니다.</strong> 이 10년은 삼성전자·SK하이닉스·마이크론의 역사적 강세장입니다. 지금처럼 1년에 3~7배 오른 뒤 잡는 기준가는 이 구간 어디에도 없는 분포입니다.</li>
        <li><strong>실현이 아니라 내재변동성으로 가격이 매겨집니다.</strong> 과거 기준으로 손실 0%인 상품에 연 50%가 붙었다면, 시장은 과거와 다른 분포를 보고 있다는 뜻입니다. 이 괴리를 빼고 백테스트만 제시하면 안 됩니다.</li>
      </ul>
    </div>
    <div class="note">
      <h3>대조군 — 발행사가 낸 숫자</h3>
      <p>같은 발행사의 직전 회차인 <strong>제37821회</strong>(EuroStoxx50·S&amp;P500·Nikkei225, 배리어 90-90-85-80-75-70, 낙인 45, 연 10.50%)의
         공시 원문에 실린 수익률 모의실험입니다. 2003.01.06~2023.05.26, 표본 4,780회.</p>
      <div class="scroll" style="margin-top:16px">
        <table>
          <thead><tr><th>상환구분</th><th>수익률</th><th>발생횟수</th><th>발생빈도</th></tr></thead>
          <tbody>
            <tr><td>1차 조기상환</td><td class="num">5.25%</td><td class="num">3,833</td><td class="num">80.19%</td></tr>
            <tr><td>2차 조기상환</td><td class="num">10.50%</td><td class="num">299</td><td class="num">6.26%</td></tr>
            <tr><td>3차 조기상환</td><td class="num">15.75%</td><td class="num">238</td><td class="num">4.98%</td></tr>
            <tr><td>4차 조기상환</td><td class="num">21.00%</td><td class="num">113</td><td class="num">2.36%</td></tr>
            <tr><td>5차 조기상환</td><td class="num">26.25%</td><td class="num">59</td><td class="num">1.23%</td></tr>
            <tr><td>만기상환</td><td class="num">31.50%</td><td class="num">76</td><td class="num">1.59%</td></tr>
            <tr><td class="bad">만기손실 −40%~−30%</td><td class="num">–</td><td class="num">37</td><td class="num bad">0.77%</td></tr>
            <tr><td class="bad">만기손실 −50%~−40%</td><td class="num">–</td><td class="num">125</td><td class="num bad">2.62%</td></tr>
          </tbody>
        </table>
      </div>
      <p style="margin-top:14px; font-size:15px; color:var(--muted)">
        출처 — 미래에셋증권 제37821~37839회 일괄신고추가서류(2026.06.05 공시). 20년 구간에서도 손실은 3.39%로 나오지만,
        그 손실이 <strong>−30%에서 −50% 사이에 몰려 있다</strong>는 점이 중요합니다. 낙인이 뚫리면 조금 잃는 게 아니라 크게 잃습니다.
      </p>
    </div>
  </div>
</section>

<section>
  <div class="rule"></div>
  <h2>다음 회차를 읽을 때의 기준</h2>
  <p class="lead">37건에서 반복해서 확인된 것들입니다. 청약 중인 회차에 그대로 적용하면 됩니다.</p>
  <div class="stack">
    <div class="note">
      <ul>
        <li><strong>쿠폰이 아니라 낙인까지의 거리부터 봅니다.</strong> 연 50%가 붙었다면 그 기초자산의 변동성이 그만큼이라는 뜻입니다. 같은 낙인 35%라도 기초자산이 HSCEI냐 삼성전자냐에 따라 의미가 전혀 다릅니다.</li>
        <li><strong>HSCEI가 들어간 회차는 낙인을 한 단계 더 낮춰 봅니다.</strong> 이번 37건에서 낙인을 실제로 뚫은 지수형은 전부 HSCEI 편입 회차였습니다.</li>
        <li><strong>배리어 시작점이 85 이상이면 1차 조기상환이 어려워집니다.</strong> 조기상환이 밀릴수록 낙인 관찰 기간이 길어집니다.</li>
        <li><strong>노낙인·원금지급형은 쿠폰이 낮은 대신 분포가 완전히 다릅니다.</strong> 손실 경로 자체가 없어 비교 대상이 아닙니다.</li>
        <li><strong>리자드 조항은 홈페이지 목록에서 확인되지 않습니다.</strong> 청약 전 회차별 신고서류를 반드시 대조해야 합니다.</li>
      </ul>
    </div>
  </div>
</section>

<p class="foot">
  이 자료는 공개된 상품 조건과 기초자산 종가로 계산한 <strong>분석 자료</strong>이며, 특정 상품의 매수·매도를 권유하지 않습니다.
  과거 시뮬레이션 결과는 미래 수익을 보장하지 않습니다. 실제 투자 판단은 회차별 투자설명서와 간이투자설명서를 확인한 뒤 하시기 바랍니다.
  ELS는 예금자보호 대상이 아니며 발행사 신용위험에 노출됩니다.<br>
  상품 정보 ${D.updatedAt.slice(0, 10).replace(/-/g, '.')} 수집 · 시세 ${esc(H.source || '')} · 리포트 생성 <span class="num">scripts/build_els_report.mjs</span>
</p>

</div>
`;

await writeFile(OUT, html);
console.log(`[report] ${OUT} 생성 (${(html.length / 1024).toFixed(0)} KB) — 회차 ${rows.length}건`);
console.log(`  낙인 돌파 ${breached.length}건 / 여유 6%p 이하 ${thin.length}건`);
