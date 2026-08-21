#!/usr/bin/env node
/**
 * ELS 세일즈 분석 자료 (4면) 생성 — els-sales.html
 *
 * 입력
 *  - tools/discovery/prospectus_parsed.json : 일괄신고추가서류에서 뽑은 회차별 조건·공정가액·
 *    적용 변동성·발행사 수익률 모의실험 (홈페이지 목록에는 없는 값들)
 *  - data/els.js : 기초자산 일별 종가 (자체 롤링 시뮬레이션용)
 *
 * 문서에 적히는 수치는 전부 여기서 계산한다. 손으로 옮겨적는 숫자를 두지 않는다.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { drawdown, backtest, fromProspectus } from './lib/els-engine.mjs';

const OUT = 'els-sales.html';
const LAST = '20260731000093';   // 제38008~38023회 — 마지막 판매 주간
const NEXT = '20260821000193';   // 제38031~38047회 — 다음 청약

const w = {};
new Function('window', await readFile('data/els.js', 'utf8'))(w);
const H = w.ELS_DATA.history;
const P = JSON.parse(await readFile('tools/discovery/prospectus_parsed.json', 'utf8'));

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const f1 = (v, d = 1) => v == null || Number.isNaN(v) ? '–' : v.toFixed(d);
const sgn = (v, d = 1) => v == null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(d);
const dot = (s) => (s || '').replace(/-/g, '.');
const won = (n) => n == null ? '–' : n.toLocaleString('ko-KR');

// ── 회차별 지표 ──────────────────────────────────────────────────────────────
function enrich(item) {
  const p = fromProspectus(item);
  const bt = p && backtest(p, H);
  const dd = p && drawdown(p, H);
  return {
    ...item,
    months: p?.maturityMonths,
    steps: p ? p.schedule.length : null,
    totalRate: p?.totalRate,
    barriers: p ? p.schedule.map((s) => s.barrier) : [],
    ourLoss: bt?.lossRate,
    ourFirst: bt?.firstRate,
    ourKi: bt?.kiRate,
    ourAvgAnn: bt?.avgAnn,
    ourWorst: bt?.worst,
    low: dd?.min,
    margin: dd && item.knockIn != null ? dd.min - item.knockIn : null,
    // 위험 점수 — 낮을수록 방어적. 낙인여유·공정가액 괴리·발행사 손실률을 함께 본다.
    score: (dd && item.knockIn != null ? Math.max(0, 40 - (dd.min - item.knockIn)) : 0)
         + Math.max(0, -(item.fairValueGap ?? 0)) * 1.5
         + (item.simLoss ?? 0) * 4,
  };
}

const filedOn = (rcp) => `${rcp.slice(0, 4)}-${rcp.slice(4, 6)}-${rcp.slice(6, 8)}`;
const last = { ...P[LAST], date: filedOn(LAST), items: P[LAST].items.map(enrich) };
const next = { ...P[NEXT], date: filedOn(NEXT), items: P[NEXT].items.map(enrich) };

// ── 기초자산 현재 위치 ───────────────────────────────────────────────────────
const market = Object.entries(H.series).map(([name, s]) => {
  let peak = -Infinity, peakAt = 0;
  s.forEach((v, i) => { if (v != null && v > peak) { peak = v; peakAt = i; } });
  let run = -Infinity, mdd = 0;
  s.forEach((v) => { if (v == null) return; if (v > run) run = v; const d = (v / run - 1) * 100; if (d < mdd) mdd = d; });
  const lastV = s[s.length - 1];
  const back = (n) => s[Math.max(0, s.length - 1 - n)];
  return { name, fromPeak: (lastV / peak - 1) * 100, peakAt: H.dates[peakAt],
           y1: (lastV / back(252) - 1) * 100, mdd };
});
const mk = (n) => market.find((m) => m.name === n);

// 발행사가 이론가에 쓴 변동성 (회차마다 같은 기준일이면 값이 같다)
const volOf = (batch) => {
  const map = new Map();
  batch.items.forEach((it) => it.volatility.forEach((v) => map.set(v.asset, v.vol)));
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};
const volLast = volOf(last), volNext = volOf(next);
const volDate = last.items[0].fairValueDate, volDateNext = next.items[0].fairValueDate;

const totalRaise = last.items.reduce((s, i) => s + (i.currency === 'KRW' ? i.issueSize || 0 : 0), 0);

// ── 정렬·선별 ────────────────────────────────────────────────────────────────
const byScore = (a, b) => a.score - b.score;
const lastRanked = [...last.items].sort(byScore);
const nextRanked = [...next.items].sort(byScore);
const worstFair = [...last.items, ...next.items].sort((a, b) => (a.fairValueGap ?? 0) - (b.fairValueGap ?? 0)).slice(0, 6);

// ── 표 조각 ──────────────────────────────────────────────────────────────────
const kindOf = (it) => {
  const IDX = new Set(['KOSPI200', 'S&P500', 'Nikkei225', 'EuroStoxx50', 'HSCEI']);
  return it.underlyings.every((u) => IDX.has(u)) ? '지수' : it.underlyings.some((u) => IDX.has(u)) ? '혼합' : '종목';
};
const chip = (k) => `<span class="chip ${k === '지수' ? 'idx' : k === '종목' ? 'stk' : 'mix'}">${k}</span>`;
const gapCell = (g) => {
  const cls = g == null ? '' : g <= -10 ? 'bad' : g <= -4 ? 'warn' : '';
  return `<td class="num ${cls}">${sgn(g, 1)}%</td>`;
};
const marginCell = (m) => {
  if (m == null) return '<td class="num muted">낙인 없음</td>';
  return `<td class="num ${m < 0 ? 'bad' : m <= 6 ? 'warn' : ''}">${sgn(m)}%p</td>`;
};

const productRows = (items) => items.map((it) => `        <tr>
          <td class="code">${it.no}</td>
          <td>${chip(kindOf(it))}</td>
          <td class="und">${esc(it.underlyings.join(' · '))}</td>
          <td class="num">${f1(it.annualRate, 1)}%</td>
          <td class="num">${it.months}개월</td>
          <td class="num nw" title="${it.barriers.join('-')}">${it.barriers.length > 4
            ? `${it.barriers[0]}→${it.barriers[it.barriers.length - 1]}<span class="muted"> (${it.barriers.length}회)</span>`
            : it.barriers.join('-')}</td>
          <td class="num">${it.knockIn == null ? '없음' : it.knockIn + '%'}</td>
          ${gapCell(it.fairValueGap)}
          <td class="num">${f1(it.simFirst, 1)}%</td>
          <td class="num ${it.simLoss > 1 ? 'bad' : ''}">${f1(it.simLoss, 2)}%</td>
          <td class="num">${f1(it.low, 1)}</td>
          ${marginCell(it.margin)}
        </tr>`).join('\n');

const marketRows = market.sort((a, b) => a.fromPeak - b.fromPeak).map((m) => `        <tr>
          <td>${esc(m.name)}</td>
          <td class="num ${m.fromPeak <= -20 ? 'bad' : ''}">${sgn(m.fromPeak)}%</td>
          <td class="num muted">${dot(String(m.peakAt).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))}</td>
          <td class="num ${m.y1 > 100 ? 'hot' : ''}">${sgn(m.y1, 0)}%</td>
          <td class="num">${f1(m.mdd, 0)}%</td>
        </tr>`).join('\n');

const volRows = (list, other) => list.map(([a, v]) => {
  const o = other.find(([x]) => x === a);
  return `        <tr><td>${esc(a)}</td><td class="num ${v >= 60 ? 'bad' : v >= 40 ? 'warn' : ''}">${f1(v, 2)}%</td>` +
         `<td class="num muted">${o ? f1(o[1], 2) + '%' : '–'}</td></tr>`;
}).join('\n');

const lossTable = (it) => {
  const rows = (it.lossBuckets || []).filter((b) => b.share > 0);
  if (!rows.length) return '<p class="muted" style="font-size:15px">이 회차는 20년 구간에서 손실 사례가 없습니다.</p>';
  return `<table class="mini"><thead><tr><th>손실 구간</th><th>횟수</th><th>빈도</th></tr></thead><tbody>` +
    rows.map((b) => `<tr><td>${esc(b.ret || b.label)}</td><td class="num">${won(b.count)}</td><td class="num bad">${f1(b.share, 2)}%</td></tr>`).join('') +
    `</tbody></table>`;
};

const fairBars = worstFair.map((it) => {
  const pct = Math.min(100, Math.abs(it.fairValueGap) / 35 * 100);
  return `        <div class="bar-row">
          <div class="bar-label">제${it.no}회 <span class="muted">${esc(it.underlyings.join(' · '))}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(1)}%"></div></div>
          <div class="bar-val">${sgn(it.fairValueGap, 1)}%</div>
        </div>`;
}).join('\n');

const pick = (items, n) => items.slice(0, n);
const avoid = (items, n) => items.slice(-n).reverse();

const recRows = (items, label) => items.map((it, i) => `        <tr>
          <td class="num">${i + 1}</td>
          <td class="code">${it.no}</td>
          <td class="und">${esc(it.underlyings.join(' · '))}</td>
          <td class="num">${f1(it.annualRate, 1)}%</td>
          <td class="num">${it.knockIn == null ? '없음' : it.knockIn + '%'}</td>
          ${marginCell(it.margin)}
          ${gapCell(it.fairValueGap)}
          <td class="num ${it.simLoss > 1 ? 'bad' : ''}">${f1(it.simLoss, 2)}%</td>
        </tr>`).join('\n');

const lizardOnes = [...last.items, ...next.items].filter((it) => it.lizard);

const html = `<title>ELS 세일즈 분석 8월 4주</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --orange:#F58220; --orange-active:#CB6015; --orange-soft:#FAB072;
  --blue:#043B72; --canvas:#FFFFFF; --soft:#ECEFF4; --subtle:#F7F8FA;
  --hairline:#CDCECB; --hairline-soft:#E5E4E1;
  --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C;
  --error:#C62828; --warning:#B8860B; --success:#2E8540;
  --font-kr:'Noto Sans KR','Spoqa Han Sans Neo','Malgun Gothic',sans-serif;
  --font-num:'Inter','SF Mono',ui-monospace,monospace;
}
*{box-sizing:border-box;}
body{margin:0; background:var(--canvas); color:var(--body);
  font-family:var(--font-kr); font-size:18px; line-height:1.62; -webkit-font-smoothing:antialiased;}
.sheet{max-width:1160px; margin:0 auto; padding:0 32px 72px;}
h1,h2,h3{color:var(--ink); text-wrap:balance; margin:0;}
h1{font-size:32px; font-weight:700; line-height:1.24; letter-spacing:-0.3px;}
h2{font-size:25px; font-weight:700; line-height:1.3;}
h3{font-size:19px; font-weight:600;}
p{margin:0;}
strong{color:var(--ink); font-weight:700;}

.hero{background:var(--orange); color:#fff; padding:44px 0 38px;}
.hero .sheet{padding-bottom:0;}
.hero .tag{font-family:var(--font-num); font-size:12px; font-weight:600; letter-spacing:1.4px; opacity:.92;}
.hero h1{color:#fff; font-size:40px; margin:12px 0 10px; letter-spacing:-0.6px;}
.hero p{color:rgba(255,255,255,.95); font-size:19px; max-width:66ch;}
.hero .meta{display:flex; flex-wrap:wrap; gap:8px 26px; margin-top:22px;
  font-family:var(--font-num); font-size:14px; color:rgba(255,255,255,.94);}

.page{padding-top:52px;}
.page + .page{margin-top:52px; border-top:1px solid var(--hairline);}
.page-no{font-family:var(--font-num); font-size:12px; font-weight:600; letter-spacing:1.4px;
  color:var(--orange-active); margin-bottom:10px;}
section{margin-top:40px;}
section:first-of-type{margin-top:0;}
.rule{height:1px; background:var(--orange); margin-bottom:16px;}
.lead{margin-top:12px; max-width:76ch;}
.stack{display:flex; flex-direction:column; gap:16px; margin-top:20px;}
.cols{display:grid; grid-template-columns:1fr 1fr; gap:22px; margin-top:22px;}

.note{border:1px solid var(--hairline); border-left:3px solid var(--orange);
  background:var(--subtle); padding:18px 22px; border-radius:2px;}
.note.alert{border-left-color:var(--error);}
.note.good{border-left-color:var(--success);}
.note h3{margin-bottom:6px;}
.note ul{margin:8px 0 0; padding-left:20px;}
.note li{margin-bottom:7px;}

.stats{display:grid; grid-template-columns:repeat(auto-fit,minmax(178px,1fr)); gap:1px;
  background:var(--hairline-soft); border:1px solid var(--hairline); margin-top:20px;}
.stat{background:var(--canvas); padding:18px 20px;}
.stat .label{font-size:14px; font-weight:500; color:var(--muted); letter-spacing:.3px;}
.stat .value{font-family:var(--font-num); font-size:34px; font-weight:700; line-height:1.1;
  color:var(--blue); margin-top:6px; font-variant-numeric:tabular-nums;}
.stat .value.orange{color:var(--orange-active);} .stat .value.bad{color:var(--error);}
.stat .sub{font-size:13px; color:var(--muted); margin-top:4px;}

.scroll{overflow-x:auto; margin-top:20px; border:1px solid var(--hairline);}
table{border-collapse:collapse; width:100%; font-size:15px;}
thead th{background:var(--orange-soft); color:var(--ink); font-weight:700; text-align:left;
  padding:10px 9px; white-space:nowrap; border-bottom:1px solid var(--hairline);}
tbody td{padding:9px; border-bottom:1px solid var(--hairline-soft); vertical-align:top;}
tbody tr:last-child td{border-bottom:none;}
tbody tr:hover{background:var(--subtle);}
.num{text-align:right; font-family:var(--font-num); font-variant-numeric:tabular-nums; white-space:nowrap;}
.nw{white-space:nowrap;} .muted{color:var(--muted);}
.code{font-family:var(--font-num); font-weight:600; color:var(--ink); white-space:nowrap;}
.und{font-size:14px; line-height:1.42; word-break:keep-all; min-width:158px;}
.bad{color:var(--error); font-weight:600;} .warn{color:var(--warning); font-weight:600;}
.hot{color:var(--orange-active); font-weight:600;}
caption{caption-side:bottom; text-align:left; font-size:13px; color:var(--muted); padding:10px; line-height:1.5;}
table.mini{font-size:14px; border:1px solid var(--hairline); margin-top:10px;}
table.mini thead th{padding:7px 9px;} table.mini tbody td{padding:6px 9px;}

.chip{display:inline-block; font-size:12px; font-weight:600; padding:2px 7px; border-radius:2px;
  white-space:nowrap; border:1px solid;}
.chip.idx{color:var(--blue); border-color:var(--blue); background:rgba(4,59,114,.06);}
.chip.stk{color:var(--orange-active); border-color:var(--orange-active); background:rgba(245,130,32,.08);}
.chip.mix{color:var(--muted); border-color:var(--muted); background:var(--subtle);}

.bar-row{display:grid; grid-template-columns:minmax(0,1fr) minmax(0,2fr) 62px;
  align-items:center; gap:12px; padding:7px 0; border-bottom:1px solid var(--hairline-soft);}
.bar-label{overflow-wrap:anywhere;}
.bar-label{font-size:14px;}
.bar-track{background:var(--soft); height:14px; position:relative;}
.bar-fill{background:var(--error); height:100%;}
.bar-val{font-family:var(--font-num); font-size:14px; font-weight:600; color:var(--error); text-align:right;}

.script{border:1px solid var(--hairline); padding:18px 22px; border-radius:2px;}
.script p + p{margin-top:10px;}
.q{color:var(--blue); font-weight:700;}

.foot{margin-top:44px; padding-top:18px; border-top:1px solid var(--hairline);
  font-size:14px; color:var(--muted); line-height:1.66;}

@media (max-width:820px){
  body{font-size:16px;} .sheet{padding:0 18px 48px;} .hero h1{font-size:29px;} .cols{grid-template-columns:1fr;}
}
@media (max-width:520px){
  .bar-row{grid-template-columns:1fr 52px; gap:6px 10px;}
  .bar-track{grid-column:1 / -1;}
}
@media print{
  .hero{background:#fff !important; border-bottom:2px solid var(--orange);}
  .hero h1,.hero p,.hero .meta,.hero .tag{color:#000 !important;}
  body{font-size:10.5pt;} .scroll{overflow:visible;}
  .page{page-break-before:always; border-top:none;} .page:first-of-type{page-break-before:auto;}
  tr,.note,.stats{page-break-inside:avoid;}
}
</style>

<header class="hero">
  <div class="sheet">
    <div class="tag">MIRAE ASSET · ELS SALES ANALYSIS</div>
    <h1>마지막 판매 주간 ELS 16건, 투자설명서로 다시 읽기</h1>
    <p>제${last.range}회 — 청약 ${dot(last.offer)}. 홈페이지 목록에 없는 <strong style="color:#fff">공정가액·적용 변동성·리자드 조항</strong>을
       일괄신고추가서류 원문에서 꺼내고, 발행사 20년 모의실험과 자체 10년 롤링 시뮬레이션을 나란히 놓았습니다.</p>
    <div class="meta">
      <span>발행 ${dot(last.items[0].issueDate)} · 만기 ${dot(last.items[0].maturityDate)}</span>
      <span>16건 · 모집 ${won(totalRaise / 100000000)}억원</span>
      <span>공시 ${dot(last.date || '')} 기준</span>
    </div>
  </div>
</header>

<div class="sheet">

<!-- ══════════ 1면 ══════════ -->
<div class="page">
  <div class="page-no">1 / 4 · 시장 위치와 이번 회차</div>

  <section>
    <div class="rule"></div>
    <h2>세 줄 요약</h2>
    <div class="stack">
      <div class="note good">
        <h3>1. 기준가는 좋은 자리에서 잡혔습니다</h3>
        <p>KOSPI200이 6월 고점 대비 <strong>${f1(mk('KOSPI200').fromPeak)}%</strong>, SK하이닉스가
           <strong>${f1(mk('SK하이닉스').fromPeak)}%</strong> 아래에서 최초기준가격이 결정됐습니다.
           2024년 홍콩 ELS가 H지수 고점에서 발행된 것과 정반대 국면입니다.</p>
      </div>
      <div class="note">
        <h3>2. 쿠폰은 조건이 아니라 변동성의 가격표입니다</h3>
        <p>발행사가 이론가에 적용한 변동성은 ${dot(volDate)} 기준
           ${volLast.slice(0, 3).map(([a, v]) => `<strong>${esc(a)} ${f1(v, 1)}%</strong>`).join(', ')} 입니다.
           연 40%대 쿠폰이 붙은 회차는 조건이 후한 게 아니라 그만큼 흔들리는 자산입니다.</p>
      </div>
      <div class="note alert">
        <h3>3. 같은 10,000원이 아닙니다</h3>
        <p>공정가액이 발행가 대비 <strong>${sgn(Math.min(...last.items.map((i) => i.fairValueGap ?? 0)), 1)}%</strong>인 회차부터
           <strong>${sgn(Math.max(...last.items.map((i) => i.fairValueGap ?? 0)), 1)}%</strong>인 회차까지 있습니다.
           홈페이지 목록만 보면 전부 같은 10,000원짜리로 보입니다.</p>
      </div>
    </div>
  </section>

  <section>
    <div class="rule"></div>
    <h2>기초자산이 서 있는 자리</h2>
    <p class="lead">ELS 손익의 절반은 기준가를 어디서 잡느냐로 결정됩니다. 최근 1년 급등 뒤의 조정이라는 점이 이번 회차의 성격을 규정합니다.</p>
    <div class="scroll">
      <table>
        <caption>최근 10년 종가 기준. 고점은 같은 구간의 최고 종가.</caption>
        <thead><tr><th>기초자산</th><th>고점 대비</th><th>고점 시점</th><th>최근 1년</th><th>10년 최대낙폭</th></tr></thead>
        <tbody>
${marketRows}
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <div class="rule"></div>
    <h2>발행사가 이론가에 쓴 변동성</h2>
    <p class="lead">투자설명서에만 있는 숫자입니다. 상담에서 “왜 이 상품이 연 42%인가”를 설명할 때 가장 정확한 근거가 됩니다.</p>
    <div class="cols">
      <div class="scroll" style="margin-top:0">
        <table>
          <caption>Volatility Surface에 VIX 방법론을 적용해 산출한 해당 만기 변동성 (설명서 기재).</caption>
          <thead><tr><th>기초자산</th><th>${dot(volDate)} 적용</th><th>${dot(volDateNext)} 적용</th></tr></thead>
          <tbody>
${volRows(volLast, volNext)}
          </tbody>
        </table>
      </div>
      <div class="note">
        <h3>읽는 법</h3>
        <p>마이크론 <strong>${f1((volNext.find(([a]) => a === '마이크론 테크놀로지') || [])[1], 2)}%</strong>는
           1년 뒤 주가가 반토막이 나도, 두 배가 되어도 이상하지 않다는 뜻입니다. 이 변동성으로 만든 상품에
           낙인 25%가 붙었다면 “거의 안 뚫린다”가 아니라 “뚫릴 확률을 그 쿠폰으로 사고 있다”가 맞습니다.</p>
        <p style="margin-top:10px">지수는 다릅니다. KOSPI200
           <strong>${f1((volNext.find(([a]) => a === 'KOSPI200') || [])[1], 2)}%</strong>도 역사적으로 높은 편이지만
           종목 대비 절반 수준이고, 지수는 상장폐지·실적 쇼크 같은 개별 위험이 없습니다.</p>
      </div>
    </div>
  </section>
</div>

<!-- ══════════ 2면 ══════════ -->
<div class="page">
  <div class="page-no">2 / 4 · 16건 전수 비교</div>

  <section>
    <div class="rule"></div>
    <h2>제${last.range}회 조건과 검증 결과</h2>
    <p class="lead">낙인까지의 여유가 좁은 순서입니다. <strong>역대 최저</strong>는 과거 10년간 매 거래일 발행을 가정했을 때
       워스트 퍼포머가 내려간 가장 낮은 수준(기준가 100), <strong>여유</strong>는 거기서 낙인을 뺀 값입니다. 음수는 과거에 이미 뚫렸다는 뜻입니다.</p>
    <div class="scroll">
      <table>
        <caption>
          공정가액 괴리 = (공정가액 ÷ 발행가 − 1). 설명서 기재 ${dot(volDate)} 기준이며 만기까지의 헤지비용은 가산되지 않은 값입니다.
          발행사 모의실험은 2003년부터의 20년 롤링(설명서 기재), 역대 최저·여유는 최근 10년 종가로 계산했습니다.
        </caption>
        <thead><tr>
          <th>회차</th><th>구분</th><th>기초자산</th><th>연쿠폰</th><th>만기</th><th>배리어</th><th>낙인</th>
          <th>공정가액 괴리</th><th>발행사 1차상환</th><th>발행사 손실</th><th>역대 최저</th><th>여유</th>
        </tr></thead>
        <tbody>
${productRows([...last.items].sort((a, b) => (a.margin ?? 999) - (b.margin ?? 999)))}
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <div class="rule"></div>
    <h2>손실은 드물지만, 나면 크게 납니다</h2>
    <p class="lead">발행사 20년 모의실험에서 손실 비중이 가장 높았던 두 회차의 손실 분포입니다.
       손실 사례가 <strong>−30% ~ −50% 구간에 몰려</strong> 있습니다. 낙인은 조금 잃는 사건이 아닙니다.</p>
    <div class="cols">
${[...last.items].sort((a, b) => (b.simLoss ?? 0) - (a.simLoss ?? 0)).slice(0, 2).map((it) => `      <div class="note alert">
        <h3>제${it.no}회 · ${esc(it.underlyings.join(' · '))}</h3>
        <p style="font-size:15px">연 ${f1(it.annualRate, 1)}% · 낙인 ${it.knockIn}% · 표본 ${won(it.simRuns)}회 ·
           손실 <strong class="bad">${f1(it.simLoss, 2)}%</strong></p>
        ${lossTable(it)}
      </div>`).join('\n')}
    </div>
  </section>
</div>

<!-- ══════════ 3면 ══════════ -->
<div class="page">
  <div class="page-no">3 / 4 · 홈페이지 목록에 없는 것</div>

  <section>
    <div class="rule"></div>
    <h2>같은 10,000원이 아닙니다 — 공정가액 괴리</h2>
    <p class="lead">발행가는 모두 10,000원이지만, 제3의 평가기관이 매긴 이론가는 회차마다 다릅니다.
       아래는 최근 두 회차 묶음에서 괴리가 큰 순서입니다. <strong>이 값은 만기까지의 헤지비용을 아직 더하지 않은 가격</strong>이라
       실질 비용은 이보다 큽니다.</p>
    <div style="margin-top:18px">
${fairBars}
    </div>
    <div class="note alert" style="margin-top:20px">
      <p>연 30% 쿠폰을 받자고 들어간 상품이 발행 시점에 이미 <strong>${sgn(worstFair[0].fairValueGap, 1)}%</strong> 낮게 평가돼 있다면,
         첫 평가일에 조기상환되지 않는 순간부터 회수 난도가 급격히 올라갑니다. 이 숫자는 고객이 홈페이지에서 절대 볼 수 없고,
         상담에서 먼저 꺼내면 신뢰를 얻는 대신 상품을 못 파는 쪽에 가깝습니다. <strong>그래도 꺼내야 합니다.</strong>
         고난도금융투자상품 설명 의무의 핵심이 여기 있습니다.</p>
    </div>
  </section>

  <section>
    <div class="rule"></div>
    <h2>홈페이지 목록에 칸이 없는 세 가지</h2>
    <div class="cols">
      <div class="note">
        <h3>리자드 조기상환</h3>
        ${lizardOnes.length ? lizardOnes.map((it) => `<p><strong>제${it.no}회</strong> — ${it.lizard.step}차 평가일에 배리어를 못 채워도,
           그때까지 <strong>${it.lizard.barrier}%</strong> 미만으로 내려간 적이 없으면 액면 ${f1(it.lizard.payout, 2)}%로 상환됩니다.</p>`).join('')
          : '<p>이번 두 회차 묶음에는 리자드 조항이 없습니다.</p>'}
        <p style="margin-top:10px">홈페이지 목록에는 배리어와 낙인 칸만 있어 이 조항이 보이지 않습니다.
           <strong>청약 전 회차별 신고서류를 반드시 대조해야 하는 첫 번째 이유입니다.</strong></p>
      </div>
      <div class="note">
        <h3>중도상환 비용</h3>
        <p>공정가액의 <strong>95% 이상</strong>, 단 발행 후 6개월까지는 <strong>90% 이상</strong>으로 지급합니다.
           6개월 내 환매하면 공정가액에서 최대 10%가 추가로 깎입니다.</p>
        <p>신청 불가일도 함께 안내해야 합니다 — 최종관찰일 직전 4영업일부터 최종관찰일까지, 각 조기상환평가일과 그 직전 영업일,
           만기평가일과 그 직전 영업일. <strong>고객이 “지금 빼달라”고 하는 시점이 정확히 이 구간과 겹치는 경우가 많습니다.</strong></p>
      </div>
    </div>
    <div class="note" style="margin-top:16px">
      <h3>낙인 판정은 종가 기준입니다</h3>
      <p>“최초기준가격평가일 익일로부터 최종관찰일(포함)까지 … <strong>(종가 기준)</strong>”이 원문 표현입니다.
         장중에 낙인을 스쳐도 종가가 회복되면 터치가 아닙니다. 이 한 줄이 고객 불안을 크게 줄입니다.</p>
    </div>
  </section>

  <section>
    <div class="rule"></div>
    <h2>자체 시뮬레이션이 발행사보다 낙관적인 이유</h2>
    <p class="lead">같은 상품을 최근 10년 종가로 돌리면 손실률이 발행사 20년 결과보다 낮게 나옵니다. 그 차이를 설명 없이 쓰면 안 됩니다.</p>
    <div class="note alert">
      <ul>
        <li><strong>구간이 다릅니다.</strong> 발행사는 2003년부터 20년, 자체 계산은 최근 10년입니다. 2008년이 빠져 있습니다.</li>
        <li><strong>반도체에 특히 유리한 구간입니다.</strong> 이 10년은 삼성전자·SK하이닉스·마이크론의 역사적 강세장입니다.
            최근 1년만 봐도 마이크론 ${sgn(mk('마이크론 테크놀로지').y1, 0)}%, SK하이닉스 ${sgn(mk('SK하이닉스').y1, 0)}%입니다.</li>
        <li><strong>표본이 독립적이지 않습니다.</strong> 하루씩 밀린 중첩 구간이라 손실 경로는 특정 시기에 뭉쳐 발생합니다.
            발행사 표본 ${won(last.items[0].simRuns)}회도 마찬가지입니다.</li>
        <li><strong>가격은 실현이 아니라 내재변동성으로 매겨집니다.</strong> 과거 기준 손실 0%인 상품에 연 40%가 붙었다면
            시장이 과거와 다른 분포를 보고 있다는 뜻입니다.</li>
      </ul>
    </div>
  </section>
</div>

<!-- ══════════ 4면 ══════════ -->
<div class="page">
  <div class="page-no">4 / 4 · 판단과 다음 회차</div>

  <section>
    <div class="rule"></div>
    <h2>마지막 판매 주간에서 무엇이 좋았나</h2>
    <p class="lead">낙인까지의 여유, 공정가액 괴리, 발행사 20년 손실률을 함께 본 순서입니다.
       쿠폰이 높은 순서가 아니라 <strong>받는 쿠폰 대비 감수하는 위험이 작은 순서</strong>입니다.</p>
    <div class="scroll">
      <table>
        <caption>상위 5건 — 방어적인 순서.</caption>
        <thead><tr><th>순위</th><th>회차</th><th>기초자산</th><th>연쿠폰</th><th>낙인</th><th>여유</th><th>공정가액 괴리</th><th>발행사 손실</th></tr></thead>
        <tbody>
${recRows(pick(lastRanked, 5))}
        </tbody>
      </table>
    </div>
    <div class="scroll">
      <table>
        <caption>하위 3건 — 같은 기준에서 가장 공격적인 조합.</caption>
        <thead><tr><th>순위</th><th>회차</th><th>기초자산</th><th>연쿠폰</th><th>낙인</th><th>여유</th><th>공정가액 괴리</th><th>발행사 손실</th></tr></thead>
        <tbody>
${avoid(lastRanked, 3).map((it, i) => recRows([it]).replace('<td class="num">1</td>', `<td class="num muted">${lastRanked.length - i}</td>`)).join('\n')}
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <div class="rule"></div>
    <h2>같은 기준을 다음 회차에 적용하면 — 제${next.range}회</h2>
    <p class="lead">청약 <strong>${dot(next.offer)}</strong>, 발행 ${dot(next.items[0].issueDate)}. ${next.count}건이 ${dot(next.date || '')} 공시됐습니다.
       마지막 주간과 같은 잣대로 줄을 세운 결과입니다.</p>
    <div class="scroll">
      <table>
        <caption>공정가액은 ${dot(volDateNext)} 기준. 상위 5건과 하위 3건.</caption>
        <thead><tr><th>순위</th><th>회차</th><th>기초자산</th><th>연쿠폰</th><th>낙인</th><th>여유</th><th>공정가액 괴리</th><th>발행사 손실</th></tr></thead>
        <tbody>
${recRows(pick(nextRanked, 5))}
${avoid(nextRanked, 3).map((it, i) => recRows([it]).replace('<td class="num">1</td>', `<td class="num muted">${nextRanked.length - i}</td>`)).join('\n')}
        </tbody>
      </table>
    </div>
    <div class="note alert" style="margin-top:18px">
      <h3>다음 회차에서 특히 조심할 것</h3>
      <ul>
${avoid(nextRanked, 3).map((it) => {
  const why = [];
  if ((it.fairValueGap ?? 0) <= -10) why.push(`공정가액이 발행가보다 <strong class="bad">${sgn(it.fairValueGap, 1)}%</strong> 낮습니다`);
  if (it.margin != null && it.margin < 0) why.push(`과거 10년 안에 낙인 ${it.knockIn}%가 <strong class="bad">${f1(Math.abs(it.margin))}%p</strong> 뚫린 이력이 있습니다`);
  else if (it.margin != null && it.margin <= 10) why.push(`낙인까지 여유가 <strong class="warn">${f1(it.margin)}%p</strong>뿐입니다`);
  if ((it.simLoss ?? 0) >= 2) why.push(`발행사 20년 모의실험 손실률이 <strong class="bad">${f1(it.simLoss, 2)}%</strong>로 이번 회차 중 가장 높습니다`);
  return `        <li><strong>제${it.no}회</strong> (${esc(it.underlyings.join(' · '))}, 연 ${f1(it.annualRate, 1)}%) — ${why.join('. ')}.</li>`;
}).join('\n')}
      </ul>
      <p style="margin-top:10px">쿠폰만 보고 권하면 안 되는 조합입니다. 권한다면 이 숫자들을 먼저 말해야 합니다.</p>
    </div>
  </section>

  <section>
    <div class="rule"></div>
    <h2>상담에서 반드시 말할 다섯 가지</h2>
    <div class="script">
      <p><span class="q">1.</span> “이 상품은 <strong>원금이 보장되지 않고</strong>, 낙인이 뚫리면 손실이 −30%에서 −50% 구간에 몰립니다.
         조금 잃는 상품이 아닙니다.”</p>
      <p><span class="q">2.</span> “쿠폰이 높은 이유는 조건이 좋아서가 아니라 <strong>기초자산 변동성이 그만큼 높기 때문</strong>입니다.”
         <span class="muted">— 예: 제${nextRanked[nextRanked.length - 1].no}회 ${esc(nextRanked[nextRanked.length - 1].underlyings.join(' · '))}의 적용 변동성은
         ${nextRanked[nextRanked.length - 1].volatility.map((v) => `${esc(v.asset)} ${f1(v.vol, 1)}%`).join(', ')}입니다.</span></p>
      <p><span class="q">3.</span> “발행가는 10,000원이지만 <strong>공정가액</strong>은 그보다 낮습니다.
         만기까지의 헤지비용은 여기에 아직 반영되지 않았습니다.”
         <span class="muted">— 같은 회차 기준 ${won(nextRanked[nextRanked.length - 1].fairValue)}원(${sgn(nextRanked[nextRanked.length - 1].fairValueGap, 1)}%).</span></p>
      <p><span class="q">4.</span> “중간에 빼시려면 <strong>공정가액의 95%</strong>, 6개월 안이면 90%입니다.
         조기상환평가일 전후로는 신청 자체가 안 되는 날이 있습니다.”</p>
      <p><span class="q">5.</span> “과거 시뮬레이션은 <strong>2003년부터의 예시</strong>이지 예측치가 아닙니다.
         설명서에도 그렇게 적혀 있습니다.”</p>
    </div>
  </section>

  <p class="foot">
    출처 — 회차 조건·공정가액·적용 변동성·수익률 모의실험은 미래에셋증권 일괄신고추가서류
    (DART 접수번호 ${last.rcpNo}, ${next.rcpNo}) 원문에서 추출했습니다.
    역대 최저·여유·자체 시뮬레이션은 기초자산 최근 10년 일별 종가(${esc(H.source || '')})로 계산한 값이며
    <strong>설명서 수치가 아닙니다</strong>. 세금·수수료·중도상환 비용은 반영하지 않았습니다.<br>
    이 자료는 내부 검토용 분석이며 특정 상품의 매수를 권유하지 않습니다. ELS는 예금자보호 대상이 아니고 발행사 신용위험에 노출됩니다.
    대외 배포 전 준법감시 부서 확인이 필요합니다.
  </p>
</div>

</div>
`;

await writeFile(OUT, html);
console.log(`[sales] ${OUT} 생성 (${(html.length / 1024).toFixed(0)} KB)`);
console.log(`  제${last.range}회 ${last.count}건 / 제${next.range}회 ${next.count}건`);
console.log(`  공정가액 괴리 최악: 제${worstFair[0].no}회 ${worstFair[0].fairValueGap}%`);
