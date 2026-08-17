#!/usr/bin/env python3
"""포트폴리오 점검 리포트를 만든다.

보유 종목·ETF 를 입력하면 한 장으로 정리해 준다 — 평가손익, 종목별 비중,
지역·통화·유형 배분, 보유 가중 기간 성과와 벤치마크 대조, 집중도 진단,
그리고 ELS 낙인 여력.

**입력한 보유 내역은 브라우저 밖으로 나가지 않는다.** 서버도 요청도 없고,
저장은 localStorage 뿐이다. 고객 자산 정보를 다루므로 이 성질을 깨는 변경은
하지 말 것.

시세는 «마지막 수집 시점» 값이다. 실시간이 아니다 — 페이지에 기준 시각을
크게 박아 둔다.

    python3 scripts/build_portfolio_report.py    → portfolio-check.html

박아 넣는 데이터
    data/market/latest.json   109종(국내주식·ETF·미국·유럽·일본·중국·미 업종)
                              의 종가·통화·기간수익률, 원화 환산 환율, 벤치마크
    data/els.js               기초자산 10종의 10년 일별 종가 (낙인 판정용)
"""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARKET = ROOT / 'data' / 'market' / 'latest.json'
ELS = ROOT / 'data' / 'els.js'
OUT = ROOT / 'portfolio-check.html'

import masviz as mv

# 버킷 → (유형, 지역). universe 항목마다 붙여 배분 집계에 쓴다.
BUCKETS = [
    ('stocks',     'stock',  'KR', '국내주식'),
    ('kr_etf',     'etf',    'KR', '국내 ETF'),
    ('us_stocks',  'stock',  'US', '미국주식'),
    ('eu_stocks',  'stock',  'EU', '유럽주식'),
    ('jp_stocks',  'stock',  'JP', '일본주식'),
    ('cn_stocks',  'stock',  'CN', '중국·홍콩주식'),
    ('us_sectors', 'etf',    'US', '미국 업종 ETF'),
]

REGION_KO = {'KR': '국내', 'US': '미국', 'EU': '유럽', 'JP': '일본', 'CN': '중국·홍콩'}
TYPE_KO = {'stock': '개별주식', 'etf': 'ETF'}


def build_fx(m: dict) -> tuple[dict, list[str]]:
    """통화 → 원화 환산 배수. 만들 수 없는 통화는 따로 알린다.

    원/달러는 국내 고시 기준인 매매기준율(usdkrw_naver)을 쓴다. 야후
    ``KRW=X`` 는 런던 기준 24시간 시세라 서울 종가가 아니다.
    """
    rows = {r['key']: r['close'] for r in (m.get('fx') or {}).get('rows', [])}
    pairs = m.get('fx_pairs') or {}

    def pair(key):
        v = pairs.get(key) or {}
        return v.get('close') if isinstance(v, dict) else None

    usd = (m.get('usdkrw_naver') or {}).get('rate') or rows.get('usdkrw')
    fx: dict[str, float] = {'KRW': 1.0}
    missing: list[str] = []
    if not usd:
        return fx, ['USD']
    fx['USD'] = usd

    if rows.get('eurkrw'):
        fx['EUR'] = rows['eurkrw']
    if rows.get('jpykrw'):
        fx['JPY'] = rows['jpykrw'] / 100.0     # 표에는 100엔당으로 실린다
    if rows.get('cnykrw'):
        fx['CNY'] = rows['cnykrw']

    # 달러 상대 쌍에서 원화 크로스를 만든다. 야후가 «달러당 통화» 로 주는
    # 쌍은 나누고, «통화당 달러» 로 주는 쌍은 곱한다.
    for cur, key, op in [('CHF', 'usdchf', 'div'), ('TWD', 'usdtwd', 'div'),
                         ('HKD', 'usdhkd', 'div'), ('DKK', 'usddkk', 'div'),
                         ('GBP', 'gbpusd', 'mul')]:
        v = rows.get(key) or pair(key)
        if v:
            fx[cur] = usd / v if op == 'div' else usd * v
        else:
            missing.append(cur)
    if 'GBP' in fx:
        fx['GBp'] = fx['GBP'] / 100.0          # 런던은 펜스로 호가한다
    else:
        missing.append('GBp')

    return fx, missing


def build_universe(m: dict) -> list[dict]:
    out = []
    for bucket, kind, region, label in BUCKETS:
        for name, d in (m.get(bucket) or {}).items():
            if d.get('close') is None:
                continue
            p = d.get('perf') or {}
            out.append({
                'name': name,
                'symbol': d.get('symbol'),
                'type': kind,
                'region': region,
                'group': label,
                'currency': d.get('currency') or 'KRW',
                'close': d['close'],
                'chg': d.get('change_pct'),
                'date': d.get('date'),
                'perf': {k: p.get(k) for k in ('w1', 'm1', 'm3', 'ytd', 'y1')},
                'note': d.get('note_ko'),
            })
    out.sort(key=lambda r: (r['region'], r['type'], r['name']))
    return out


def build_els_history() -> dict:
    """els.js 의 history 만 떼어 온다 — 낙인 판정에 쓰는 일별 종가."""
    src = ELS.read_text(encoding='utf-8')
    m = re.search(r'"history":\s*(\{.*?\}),\s*\n\s*"checkedAt"', src, flags=re.S)
    if not m:
        return {}
    try:
        h = json.loads(m.group(1))
    except ValueError:
        return {}
    return {'dates': h.get('dates') or [], 'series': h.get('series') or {},
            'symbols': h.get('symbols') or {}, 'range': h.get('range')}


def build(m: dict) -> str:
    fx, fx_missing = build_fx(m)
    universe = build_universe(m)
    idx = m.get('indices') or {}
    bench = {}
    for key, label in [('kospi', '코스피'), ('kosdaq', '코스닥'),
                       ('sp500', 'S&P 500'), ('nasdaq', '나스닥')]:
        d = idx.get(key) or {}
        if d.get('close') is not None:
            bench[label] = {k: (d.get('perf') or {}).get(k)
                            for k in ('w1', 'm1', 'm3', 'ytd', 'y1')}

    payload = {
        'asOf': {
            'collected': m.get('generated_at_kst'),
            'kospiDate': (idx.get('kospi') or {}).get('date'),
            'built': date.today().isoformat(),
        },
        'fx': fx,
        'fxMissing': fx_missing,
        'universe': universe,
        'bench': bench,
        'els': build_els_history(),
        'regionKo': REGION_KO,
        'typeKo': TYPE_KO,
    }

    data_js = json.dumps(payload, ensure_ascii=False, separators=(',', ':'))
    return (PAGE
            .replace('__TOKENS__', mv.TOKENS)
            .replace('__LANG_CSS__', mv.LANG_TOGGLE_CSS)
            .replace('__PAGE_CSS__', PAGE_CSS)
            .replace('__LANG_TOGGLE__', mv.LANG_TOGGLE_HTML)
            .replace('__TOOLTIP_JS__', mv.TOOLTIP_JS)
            .replace('__LANG_JS__', mv.LANG_JS)
            .replace('__DATA__', data_js)
            .replace('__BUILT__', date.today().isoformat()))


PAGE_CSS = """
.hero{background:var(--primary);color:var(--on-primary);padding:38px 0 34px;margin-bottom:56px}
.hero-inner{max-width:1200px;margin:0 auto;padding:0 32px;display:flex;
  align-items:flex-start;justify-content:space-between;gap:19px}
.hero-tag{font-family:var(--font-en);font-size:14px;letter-spacing:.6px;opacity:.9;margin-bottom:10px}
.hero h1{color:var(--on-primary);font-size:34px;font-weight:700;letter-spacing:-.3px;line-height:1.25}
.hero-sub{margin:10px 0 0;font-size:19px;opacity:.97;max-width:62ch}
.hero-note{margin:14px 0 0;font-size:15px;opacity:.92}
.hero code{background:rgba(255,255,255,.18);color:#fff}
@media (max-width:768px){.hero-inner{padding:0 20px}.hero h1{font-size:26px}}

.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
@media (max-width:760px){.stats{grid-template-columns:repeat(2,1fr)}}
@media (max-width:420px){.stats{grid-template-columns:1fr}}
.stat{border:1px solid var(--hairline);border-radius:4px;padding:16px;min-width:0}
.stat-label{font-size:16px;font-weight:500;letter-spacing:.4px;color:var(--muted)}
.stat-value{font-family:var(--font-en);font-size:30px;font-weight:700;line-height:1.1;
  color:var(--ink);margin-top:4px;word-break:break-all}
.stat-unit{font-size:15px;font-weight:500;color:var(--muted);margin-left:3px}
.stat-chg{font-size:15px;margin-top:4px;font-weight:500}

/* ---------- 입력 ---------- */
.holdings{width:100%;border-collapse:collapse;border:1px solid var(--hairline);font-size:17px}
.holdings th{background:var(--primary-soft);color:#1A1A1A;font-weight:700;font-size:16px;
  padding:10px 13px;text-align:left;white-space:nowrap}
.holdings td{padding:6px 8px;border-bottom:1px solid var(--hairline-soft);vertical-align:middle}
.holdings input{font:inherit;font-size:16px;width:100%;min-width:0;padding:8px 10px;
  border:1px solid var(--hairline);border-radius:2px;background:var(--canvas);color:var(--ink)}
.holdings input:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.holdings input.num{text-align:right;font-family:var(--font-en)}
.holdings input[aria-invalid="true"]{border-color:var(--up)}
.holdings td.meta{font-size:15px;color:var(--muted);white-space:nowrap;font-family:var(--font-en)}
.holdings td.act{width:44px;text-align:center}
.row-del{font:inherit;font-size:18px;line-height:1;width:32px;height:32px;border-radius:2px;
  border:1px solid var(--hairline);background:var(--canvas);color:var(--muted);cursor:pointer}
.row-del:hover{background:var(--surface-subtle);color:var(--up);border-color:var(--up)}
.input-wrap{overflow-x:auto}
.holdings{min-width:720px}

.btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:19px;align-items:center}
.btn{font:inherit;font-size:16px;font-weight:500;padding:9px 17px;border-radius:2px;
  border:1px solid var(--hairline);background:var(--canvas);color:var(--body);cursor:pointer}
.btn-primary{background:var(--primary);border-color:var(--primary);color:#fff}
.btn-primary:hover{background:var(--primary-active);border-color:var(--primary-active)}
.btn:not(.btn-primary):hover{background:var(--surface-subtle);color:var(--ink)}
.btn:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.btn-danger:hover{color:var(--up);border-color:var(--up)}
.saved{font-size:14px;color:var(--muted);margin-left:auto}

.paste-box{width:100%;font:inherit;font-size:16px;font-family:var(--font-en);
  min-height:90px;padding:10px 12px;margin-top:14px;border:1px solid var(--hairline);
  border-radius:2px;background:var(--canvas);color:var(--ink);display:none}
.paste-box.open{display:block}

.panel-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px}
@media (max-width:1000px){.panel-grid{grid-template-columns:1fr}}
.panel{min-width:0}
.panel h3.sub{margin-top:0}

.diag{margin:0;padding:0;list-style:none;font-size:17px}
.diag li{display:flex;gap:12px;align-items:flex-start;padding:12px 0;
  border-bottom:1px solid var(--hairline-soft)}
.diag li:last-child{border-bottom:0}
.flag{flex:none;font-size:14px;font-weight:700;padding:2px 9px;border-radius:2px;
  border:1px solid;white-space:nowrap;margin-top:3px}
.flag-warn{color:var(--up);border-color:var(--up)}
.flag-watch{color:#8A6A0D;border-color:#D4A017}
.flag-ok{color:#1F5C2C;border-color:#2E8540}
.diag b{color:var(--ink)}
/* 상태값 — 시장 등락(적/청)과 섞이면 «여력이 크다» 가 하락색으로 읽힌다.
   예약 팔레트를 쓰고, 반드시 문구를 함께 단다. */
.st-ok{color:#2E8540} .st-bad{color:#C62828} .st-warn{color:#8A6A0D}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .st-ok{color:#63C07C}
  :root:not([data-theme="light"]) .st-bad{color:#FF7A7A}
  :root:not([data-theme="light"]) .st-warn{color:#E4BB55}
}
.diag .why{display:block;font-size:15px;color:var(--muted);margin-top:2px}

.empty-state{border:1px dashed var(--hairline);border-radius:4px;padding:28px;
  color:var(--muted);font-size:17px;text-align:center}

.els-form{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;align-items:end}
@media (max-width:860px){.els-form{grid-template-columns:1fr 1fr}}
@media (max-width:480px){.els-form{grid-template-columns:1fr}}
.field label{display:block;font-size:15px;font-weight:500;color:var(--muted);margin-bottom:5px}
.field input,.field select{font:inherit;font-size:16px;width:100%;padding:8px 10px;
  border:1px solid var(--hairline);border-radius:2px;background:var(--canvas);color:var(--ink)}
.field input:focus-visible,.field select:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}

footer .note{border-top:1px solid var(--hairline);padding-top:19px}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .hero{background:#8A4410;--on-primary:#FFF1E4}
  :root:not([data-theme="light"]) .hero h1{color:#FFF1E4}
}
@media print{
  .hero{padding:16px 0;margin-bottom:24px}
  .btn-row,.paste-box,.row-del,.holdings td.act{display:none !important}
  .holdings input{border:0;padding:0;background:transparent}
}
"""

PAGE = r"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>포트폴리오 점검 | 미래에셋증권 마포WM</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
__TOKENS__
__LANG_CSS__
__PAGE_CSS__
</style>
</head>
<body>

<header class="hero"><div class="hero-inner">
  <div>
    <div class="hero-tag" data-en="INTERNAL USE · PORTFOLIO CHECK">[사내한] · 포트폴리오 점검</div>
    <h1 data-en="Portfolio Check">포트폴리오 점검</h1>
    <p class="hero-sub" data-en="Enter holdings and read the concentration, currency exposure and knock-in headroom on one page.">보유 내역을 넣으면 편중·환노출·낙인 여력을 한 장으로 봅니다.</p>
    <p class="hero-note" id="asof"></p>
  </div>
  __LANG_TOGGLE__
</div></header>

<main>

<section class="section" id="sec-1">
  <div class="section-rule"></div>
  <h2 class="section-title"><span class="sec-num">1</span><span data-en="Holdings">보유 내역</span></h2>
  <div class="input-wrap">
    <table class="holdings">
      <thead><tr>
        <th data-en="Instrument">종목 · ETF</th>
        <th style="width:130px" data-en="Quantity">수량</th>
        <th style="width:150px" data-en="Avg cost">평균단가</th>
        <th data-en="Last price">현재가</th>
        <th class="act"></th>
      </tr></thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
  <datalist id="universe"></datalist>
  <div class="btn-row">
    <button class="btn btn-primary" type="button" id="add" data-en="Add row">행 추가</button>
    <button class="btn" type="button" id="paste-toggle" data-en="Paste list">목록 붙여넣기</button>
    <button class="btn" type="button" id="sample" data-en="Load example">예시 채우기</button>
    <button class="btn btn-danger" type="button" id="clear" data-en="Clear all">전체 지우기</button>
    <button class="btn" type="button" id="print" data-en="Print / PDF">인쇄 · PDF</button>
    <span class="saved" id="saved"></span>
  </div>
  <textarea class="paste-box" id="paste" spellcheck="false"
    placeholder="한 줄에 하나씩: 종목명, 수량, 평균단가&#10;삼성전자, 100, 250000&#10;TIGER 미국S&amp;P500, 300, 21000"></textarea>
  <p class="note" id="input-note"></p>
</section>

<section class="section" id="sec-2">
  <div class="section-rule"></div>
  <h2 class="section-title"><span class="sec-num">2</span><span data-en="Summary">요약</span></h2>
  <div id="summary"></div>
</section>

<section class="section" id="sec-3">
  <div class="section-rule"></div>
  <h2 class="section-title"><span class="sec-num">3</span><span data-en="Weights and P&amp;L">종목별 비중 · 손익</span></h2>
  <div id="weights"></div>
</section>

<section class="section" id="sec-4">
  <div class="section-rule"></div>
  <h2 class="section-title"><span class="sec-num">4</span><span data-en="Allocation">배분 — 지역 · 통화 · 유형</span></h2>
  <div id="alloc"></div>
</section>

<section class="section" id="sec-5">
  <div class="section-rule"></div>
  <h2 class="section-title"><span class="sec-num">5</span><span data-en="Performance vs benchmarks">기간 성과 — 벤치마크 대조</span></h2>
  <div id="perf"></div>
</section>

<section class="section" id="sec-6">
  <div class="section-rule"></div>
  <h2 class="section-title"><span class="sec-num">6</span><span data-en="Concentration check">집중도 진단</span></h2>
  <div id="diag"></div>
</section>

<section class="section" id="sec-7">
  <div class="section-rule"></div>
  <h2 class="section-title"><span class="sec-num">7</span><span data-en="ELS knock-in headroom">ELS 낙인 여력</span></h2>
  <div class="els-form">
    <div class="field"><label for="els-asset" data-en="Underlying">기초자산</label>
      <select id="els-asset"></select></div>
    <div class="field"><label for="els-base" data-en="Strike date">최초기준가격 결정일</label>
      <input id="els-base" type="date"></div>
    <div class="field"><label for="els-ki" data-en="Knock-in (%)">낙인 배리어 (%)</label>
      <input id="els-ki" class="num" type="number" min="1" max="100" step="1" value="45"></div>
    <div class="field"><label for="els-barrier" data-en="Redemption barrier (%)">조기상환 배리어 (%)</label>
      <input id="els-barrier" class="num" type="number" min="1" max="120" step="1" value="85"></div>
  </div>
  <div id="els-out"></div>
</section>

<footer class="section">
  <p class="note" id="disclaimer"></p>
</footer>

</main>

<script>
window.MV_LANG_KEY = 'mas-portfolio-lang';
var PF = __DATA__;

/* ============================================================ 유틸 */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
function isEn() { return document.documentElement.getAttribute('lang') === 'en'; }
function t(ko, en) { return isEn() ? en : ko; }
function num(v, d) {
  if (v == null || !isFinite(v)) return '—';
  return v.toLocaleString(isEn() ? 'en-US' : 'ko-KR',
    { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
}
/* 등락·수익률 — 부호를 always 붙인다. */
function pct(v, d) {
  if (v == null || !isFinite(v)) return '—';
  return (v >= 0 ? '+' : '') + v.toFixed(d == null ? 2 : d) + '%';
}
/* 비중·구성비 — 부호를 붙이지 않는다. 오르내린 값이 아니다. */
function share(v, d) {
  if (v == null || !isFinite(v)) return '—';
  return v.toFixed(d == null ? 1 : d) + '%';
}
/* 두 수준의 차 — 퍼센트포인트다. 수익률로 읽히면 안 된다. */
function ppt(v, d) {
  if (v == null || !isFinite(v)) return '—';
  return (v >= 0 ? '+' : '') + v.toFixed(d == null ? 1 : d) + t('%p', 'pp');
}
function cls(v) { return v == null ? 'flat' : (v > 0 ? 'up' : (v < 0 ? 'down' : 'flat')); }
/* 금액. 한글은 조·억·만, 영문은 T/B/M/K 로 가른다 — 두 체계의 자릿수가
   달라 «만원» 을 그대로 «0k» 로 옮기면 한 자리가 어긋난다. */
function won(v) {
  if (v == null || !isFinite(v)) return '—';
  var a = Math.abs(v);
  if (isEn()) {
    if (a >= 1e12) return (v / 1e12).toFixed(2) + 'T KRW';
    if (a >= 1e9) return (v / 1e9).toFixed(2) + 'B KRW';
    if (a >= 1e6) return (v / 1e6).toFixed(2) + 'M KRW';
    if (a >= 1e3) return (v / 1e3).toFixed(1) + 'K KRW';
    return num(v, 0) + ' KRW';
  }
  if (a >= 1e12) return (v / 1e12).toFixed(2) + '조원';
  if (a >= 1e8) return (v / 1e8).toFixed(2) + '억원';
  if (a >= 1e4) return (v / 1e4).toFixed(1) + '만원';
  return num(v, 0) + '원';
}
function signWon(v) { return (v > 0 ? '+' : '') + won(v); }

/* ============================================================ 차트 (JS)
   masviz.py 와 같은 규칙으로 그린다 — 계열 4개 이하, 등락은 적/청
   다이버징, 값은 막대 끝에 직접, CSS 클래스는 공유한다. 입력이 런타임에
   들어오므로 파이썬 쪽 SVG 를 재사용할 수 없어 여기서 다시 그린다. */
var UP = '#C62828', DOWN = '#043B72', NEUTRAL = '#84888B', AXIS = '#49535B';
var PALETTE = ['#F58220', '#043B72', '#FAB072', '#0086B8'];

function hbars(rows, opt) {
  opt = opt || {};
  rows = rows.filter(function (r) { return r[1] != null && isFinite(r[1]); });
  if (!rows.length) return '<p class="chart-empty">' + t('표시할 값이 없습니다.', 'Nothing to plot.') + '</p>';

  var unit = opt.unit == null ? '%' : opt.unit;
  var digits = opt.digits == null ? 2 : opt.digits;
  var width = opt.width || 760, rowH = opt.rowH || 26;
  var labelW = opt.labelW || 190, valueW = opt.valueW || 96, pad = 8;
  var plotW = width - labelW - valueW - pad * 2;
  var height = rowH * rows.length + 22;
  var vmax = Math.max.apply(null, rows.map(function (r) { return Math.abs(r[1]); })) || 1;
  var hasPos = rows.some(function (r) { return r[1] > 0; });
  var hasNeg = rows.some(function (r) { return r[1] < 0; });
  var zero, scale;
  if (hasPos && hasNeg) { zero = labelW + pad + plotW / 2; scale = (plotW / 2) / vmax; }
  else if (hasNeg) { zero = labelW + pad + plotW; scale = plotW / vmax; }
  else { zero = labelW + pad; scale = plotW / vmax; }

  var fmt = opt.fmt || function (v) {
    return (v >= 0 && (hasNeg || unit === '%') ? '+' : '') + v.toFixed(digits) + unit;
  };
  var out = ['<svg class="chart" viewBox="0 0 ' + width + ' ' + height +
    '" role="img" preserveAspectRatio="xMidYMid meet">'];
  out.push('<line x1="' + zero.toFixed(1) + '" y1="4" x2="' + zero.toFixed(1) +
    '" y2="' + (height - 18).toFixed(1) + '" stroke="' + AXIS + '" stroke-width="1"/>');

  rows.forEach(function (r, i) {
    var label = r[0], v = r[1];
    var y = 4 + i * rowH, barH = rowH - 10;
    var w = Math.abs(v) * scale, x = v >= 0 ? zero : zero - w;
    var color = opt.color || (v > 0 ? UP : (v < 0 ? DOWN : NEUTRAL));
    out.push(
      '<g class="mark" tabindex="0" data-label="' + esc(label) + '" data-value="' + esc(fmt(v)) + '">' +
      '<rect class="row-hit" x="0" y="' + (y - 5).toFixed(1) + '" width="' + width +
        '" height="' + rowH + '" fill="transparent"/>' +
      '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(w, 1).toFixed(1) +
        '" height="' + barH + '" rx="' + (w >= 4 ? 4 : 0) + '" fill="' + color + '"/>' +
      '<text class="bar-label" x="' + labelW + '" y="' + (y + barH * 0.5 + 4).toFixed(1) +
        '" text-anchor="end">' + esc(label) + '</text>' +
      '<text class="bar-value ' + (opt.color ? '' : cls(v)) + '" x="' + (width - valueW + 4) +
        '" y="' + (y + barH * 0.5 + 4).toFixed(1) + '">' + esc(fmt(v)) + '</text>' +
      '</g>');
  });
  var anchor = (hasPos && hasNeg) ? 'middle' : (hasNeg ? 'end' : 'start');
  out.push('<text class="axis-note" x="' + zero.toFixed(1) + '" y="' + (height - 4).toFixed(1) +
    '" text-anchor="' + anchor + '">0' + esc(unit) + ' ' + t('기준', 'base') + '</text>');
  out.push('</svg>');
  return out.join('');
}

function table(headers, rows, aligns, opt) {
  opt = opt || {};
  var out = ['<div class="table-wrap"><table' + (opt.compact ? ' class="compact"' : '') + '><thead><tr>'];
  headers.forEach(function (h, i) {
    out.push('<th' + (aligns[i] === 'right' ? ' style="text-align:right"' : '') + '>' + h + '</th>');
  });
  out.push('</tr></thead><tbody>');
  rows.forEach(function (r) {
    out.push('<tr' + (opt.hl && opt.hl.indexOf(r[0]) >= 0 ? ' class="hl"' : '') + '>');
    r.forEach(function (c, i) {
      out.push('<td' + (aligns[i] === 'right' ? ' class="n"' : '') + '>' + c + '</td>');
    });
    out.push('</tr>');
  });
  out.push('</tbody></table></div>');
  return out.join('');
}

function tile(label, value, sub, subV, unit) {
  return '<div class="stat"><div class="stat-label">' + esc(label) + '</div>' +
    '<div class="stat-value">' + value + (unit ? '<span class="stat-unit">' + esc(unit) + '</span>' : '') +
    '</div>' + (sub ? '<div class="stat-chg ' + cls(subV) + '">' + sub + '</div>' : '') + '</div>';
}

/* ============================================================ 상태 */
var BY_NAME = {};
PF.universe.forEach(function (u) { BY_NAME[u.name] = u; });

var STORE_KEY = 'mas-portfolio-holdings';
var holdings = [];   /* [{name, qty, cost}] */

function load() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    holdings = raw ? JSON.parse(raw) : [];
  } catch (e) { holdings = []; }
  if (!Array.isArray(holdings)) holdings = [];
}
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(holdings));
    var el = document.getElementById('saved');
    el.textContent = t('이 브라우저에 저장됨', 'Saved in this browser');
  } catch (e) {
    document.getElementById('saved').textContent = t('저장 실패(브라우저 설정)', 'Save failed');
  }
}

/* 환산 배수를 못 만든 통화는 원화 합계에서 빼고 따로 알린다. */
function toKRW(value, currency) {
  var r = PF.fx[currency];
  return (r == null) ? null : value * r;
}

function priced() {
  return holdings.map(function (h) {
    var u = BY_NAME[h.name];
    var qty = Number(h.qty) || 0;
    var cost = Number(h.cost) || 0;
    if (!u || !qty) return { h: h, u: u, qty: qty, cost: cost, value: null, book: null };
    var value = toKRW(u.close * qty, u.currency);
    var book = cost ? toKRW(cost * qty, u.currency) : null;
    return {
      h: h, u: u, qty: qty, cost: cost, value: value, book: book,
      pnl: (value != null && book != null) ? value - book : null,
      ret: (value != null && book != null && book) ? (value / book - 1) * 100 : null
    };
  });
}

/* ============================================================ 입력 표 */
function metaHtml(name) {
  var u = BY_NAME[name];
  if (u) {
    return num(u.close, u.currency === 'KRW' ? 0 : 2) + ' ' + u.currency +
      ' · <span class="' + cls(u.chg) + '">' + pct(u.chg) + '</span>';
  }
  return name
    ? '<span class="up">' + t('알 수 없는 종목', 'unknown') + '</span>'
    : '<span class="flat">—</span>';
}

function rowHtml(h, i) {
  var u = BY_NAME[h.name];
  var meta = metaHtml(h.name);
  return '<tr>' +
    '<td><input list="universe" data-i="' + i + '" data-f="name" value="' + esc(h.name) +
      '" placeholder="' + t('종목명 입력', 'Instrument name') + '"' +
      (u || !h.name ? '' : ' aria-invalid="true"') + '></td>' +
    '<td><input class="num" data-i="' + i + '" data-f="qty" type="number" min="0" step="any" value="' +
      esc(h.qty == null ? '' : h.qty) + '"></td>' +
    '<td><input class="num" data-i="' + i + '" data-f="cost" type="number" min="0" step="any" value="' +
      esc(h.cost == null ? '' : h.cost) + '"></td>' +
    '<td class="meta">' + meta + '</td>' +
    '<td class="act"><button class="row-del" type="button" data-del="' + i +
      '" aria-label="' + t('행 삭제', 'Delete row') + '">×</button></td>' +
    '</tr>';
}

function renderInput() {
  document.getElementById('rows').innerHTML =
    holdings.map(rowHtml).join('') ||
    '<tr><td colspan="5" class="meta">' +
    t('행 추가 또는 예시 채우기로 시작하십시오.', 'Add a row or load the example.') + '</td></tr>';
  renderNote();
}

function renderNote() {
  var unknown = holdings.filter(function (h) { return h.name && !BY_NAME[h.name]; });
  var note = t(
    '시세는 수집 대상 ' + PF.universe.length + '종에 대해서만 붙습니다. 목록에 없는 종목은 평가에서 빠집니다.',
    'Prices exist for the ' + PF.universe.length + ' collected instruments only; anything else is excluded.');
  if (unknown.length) {
    note += ' ' + t('현재 ' + unknown.length + '건이 미인식입니다: ', unknown.length + ' unrecognised: ') +
      unknown.map(function (h) { return esc(h.name); }).join(', ');
  }
  if (PF.fxMissing && PF.fxMissing.length) {
    note += ' ' + t(
      '환율이 없어 원화 환산이 안 되는 통화: ' + PF.fxMissing.join(', ') + '. 해당 보유는 합계에서 제외됩니다.',
      'No FX for ' + PF.fxMissing.join(', ') + '; those holdings are excluded from the KRW total.');
  }
  document.getElementById('input-note').innerHTML = note;
}

/* ============================================================ 리포트 */
function renderAll() {
  renderInput();
  renderReport();
}

function renderReport() {
  var rows = priced().filter(function (r) { return r.u && r.qty > 0; });
  var valued = rows.filter(function (r) { return r.value != null; });
  var total = valued.reduce(function (a, r) { return a + r.value; }, 0);

  var empty = '<div class="empty-state">' +
    t('보유 내역을 넣으면 여기에 결과가 나옵니다.', 'Enter holdings to see results here.') + '</div>';

  if (!valued.length || !total) {
    ['summary', 'weights', 'alloc', 'perf', 'diag'].forEach(function (id) {
      document.getElementById(id).innerHTML = empty;
    });
    renderEls();
    return;
  }

  valued.forEach(function (r) { r.w = r.value / total * 100; });
  valued.sort(function (a, b) { return b.value - a.value; });

  var book = valued.reduce(function (a, r) { return a + (r.book || 0); }, 0);
  var withBook = valued.filter(function (r) { return r.book != null; });
  var pnl = withBook.reduce(function (a, r) { return a + r.pnl; }, 0);
  var bookSum = withBook.reduce(function (a, r) { return a + r.book; }, 0);
  var ret = bookSum ? (pnl / bookSum) * 100 : null;
  var hhi = valued.reduce(function (a, r) { return a + Math.pow(r.w / 100, 2); }, 0) * 10000;
  var top3 = valued.slice(0, 3).reduce(function (a, r) { return a + r.w; }, 0);

  /* ---- 2. 요약 ---- */
  document.getElementById('summary').innerHTML = '<div class="stats">' +
    tile(t('평가금액', 'Market value'), won(total)) +
    tile(t('평가손익', 'P&L'),
      withBook.length ? '<span class="' + cls(pnl) + '">' + signWon(pnl) + '</span>' : '—',
      withBook.length ? t('수익률 ', 'Return ') + pct(ret) : t('평균단가 미입력', 'No cost basis'), ret) +
    tile(t('보유 종목 수', 'Positions'), num(valued.length, 0), '', null, t('종목', '')) +
    tile(t('최대 비중', 'Largest weight'), share(valued[0].w), esc(valued[0].u.name)) +
    tile(t('상위 3 비중', 'Top 3 weight'), share(top3)) +
    tile(t('집중도 HHI', 'HHI'), num(hhi, 0),
      hhi >= 2500 ? t('고집중', 'Highly concentrated')
        : (hhi >= 1500 ? t('중간', 'Moderate') : t('분산', 'Diversified')),
      hhi >= 2500 ? -1 : null) +
    '</div>' +
    '<p class="note">' + t(
      'HHI 는 비중을 제곱해 합한 값(0~10,000)입니다. 1,500 미만 분산 · 2,500 이상 고집중은 ' +
      '경쟁정책에서 쓰는 일반 기준을 옮긴 것으로, 감독 규정이 아니라 참고선입니다.',
      'HHI is the sum of squared weights (0–10,000). The 1,500 / 2,500 bands are a general ' +
      'rule of thumb, not a regulatory threshold.') + '</p>';

  /* ---- 3. 비중 · 손익 ---- */
  var wHtml = hbars(valued.map(function (r) { return [r.u.name, r.w]; }),
    { unit: '%', digits: 1, color: PALETTE[0], fmt: function (v) { return v.toFixed(1) + '%'; } });
  wHtml += table(
    [t('종목', 'Instrument'), t('수량', 'Qty'), t('현재가', 'Price'), t('평가금액', 'Value'),
     t('비중', 'Weight'), t('평가손익', 'P&L'), t('수익률', 'Return')],
    valued.map(function (r) {
      return [
        esc(r.u.name) + ' <span class="dim">' + esc(r.u.currency) + '</span>',
        num(r.qty, 0),
        num(r.u.close, r.u.currency === 'KRW' ? 0 : 2),
        won(r.value),
        share(r.w),
        r.pnl == null ? '—' : '<span class="' + cls(r.pnl) + '">' + signWon(r.pnl) + '</span>',
        r.ret == null ? '—' : '<span class="' + cls(r.ret) + '">' + pct(r.ret) + '</span>'
      ];
    }),
    ['left', 'right', 'right', 'right', 'right', 'right', 'right']);
  var excluded = rows.filter(function (r) { return r.value == null; });
  if (excluded.length) {
    wHtml += '<p class="note">' + t('원화 환산이 안 되어 제외: ', 'Excluded (no FX): ') +
      excluded.map(function (r) { return esc(r.u.name) + ' (' + r.u.currency + ')'; }).join(', ') + '</p>';
  }
  document.getElementById('weights').innerHTML = wHtml;

  /* ---- 4. 배분 ---- */
  function group(keyFn, labelFn) {
    var acc = {};
    valued.forEach(function (r) {
      var k = keyFn(r);
      acc[k] = (acc[k] || 0) + r.w;
    });
    return Object.keys(acc).sort(function (a, b) { return acc[b] - acc[a]; })
      .map(function (k) { return [labelFn(k), acc[k]]; });
  }
  var byRegion = group(function (r) { return r.u.region; },
    function (k) { return isEn() ? k : (PF.regionKo[k] || k); });
  var byCurrency = group(function (r) { return r.u.currency; }, function (k) { return k; });
  var byType = group(function (r) { return r.u.type; },
    function (k) { return isEn() ? k : (PF.typeKo[k] || k); });

  function panel(title, rows_) {
    return '<div class="panel"><h3 class="sub">' + esc(title) + '</h3>' +
      hbars(rows_, { unit: '%', digits: 1, width: 420, labelW: 120, valueW: 74,
                     color: PALETTE[0], fmt: function (v) { return v.toFixed(1) + '%'; } }) +
      '</div>';
  }
  document.getElementById('alloc').innerHTML =
    '<div class="panel-grid">' +
      panel(t('지역', 'Region'), byRegion) +
      panel(t('통화', 'Currency'), byCurrency) +
      panel(t('유형', 'Type'), byType) +
    '</div>' +
    '<p class="note">' + t(
      '비중은 원화 환산 평가금액 기준입니다. 통화는 상장 통화이며, 기업의 실제 매출 통화 ' +
      '노출과는 다릅니다 — 원화 상장 수출기업도 달러에 노출됩니다.',
      'Weights are by KRW-converted value. Currency is the listing currency, not the ' +
      'issuer’s revenue exposure.') + '</p>';

  /* ---- 5. 기간 성과 ---- */
  var SPANS = [['w1', t('1주', '1W')], ['m1', t('1개월', '1M')],
               ['m3', t('3개월', '3M')], ['ytd', 'YTD'], ['y1', t('1년', '1Y')]];
  function weighted(span) {
    var sw = 0, acc = 0;
    valued.forEach(function (r) {
      var v = r.u.perf && r.u.perf[span];
      if (v == null) return;
      sw += r.w; acc += r.w * v;
    });
    return sw ? { value: acc / sw, cover: sw } : { value: null, cover: 0 };
  }
  var mine = {};
  SPANS.forEach(function (s) { mine[s[0]] = weighted(s[0]); });

  var perfHtml = hbars(SPANS.map(function (s) { return [s[1], mine[s[0]].value]; }),
    { unit: '%', digits: 2, labelW: 110 });
  var benchNames = Object.keys(PF.bench);
  perfHtml += table(
    [t('구간', 'Span'), t('보유 가중', 'Portfolio')].concat(benchNames.map(esc))
      .concat([t('반영 비중', 'Coverage')]),
    SPANS.map(function (s) {
      var row = [s[1],
        mine[s[0]].value == null ? '—'
          : '<span class="' + cls(mine[s[0]].value) + '">' + pct(mine[s[0]].value) + '</span>'];
      benchNames.forEach(function (b) {
        var v = PF.bench[b][s[0]];
        row.push(v == null ? '—' : '<span class="' + cls(v) + '">' + pct(v) + '</span>');
      });
      row.push(share(mine[s[0]].cover, 0));
      return row;
    }),
    ['left'].concat(new Array(benchNames.length + 2).fill('right')));
  perfHtml += '<p class="note">' + t(
    '보유 가중은 «지금 비중 × 각 종목의 과거 기간수익률» 입니다. 그 기간 내내 이 비중을 ' +
    '들고 있었다는 가정이며, 매매·배당·수수료·세금을 반영하지 않으므로 실제 수익률이 ' +
    '아닙니다. «반영 비중» 은 해당 구간 값이 있는 보유의 비중 합입니다.',
    'Portfolio figures apply today’s weights to each holding’s past return. They assume ' +
    'those weights were held throughout and ignore trades, dividends, fees and taxes.') + '</p>';
  document.getElementById('perf').innerHTML = perfHtml;

  /* ---- 6. 집중도 진단 ---- */
  var flags = [];
  function flag(level, title, why) { flags.push({ level: level, title: title, why: why }); }

  if (valued[0].w >= 20) {
    flag('warn', t(valued[0].u.name + ' 단일 비중 ' + share(valued[0].w),
                   valued[0].u.name + ' at ' + share(valued[0].w)),
      t('한 종목이 20% 를 넘으면 그 종목의 사고가 포트폴리오 전체 손익을 결정합니다.',
        'A single position above 20% lets one name decide the whole outcome.'));
  }
  if (top3 >= 50) {
    flag('warn', t('상위 3종목이 ' + share(top3), 'Top 3 at ' + share(top3)),
      t('상위 3종목이 절반을 넘습니다. 종목 수가 많아도 실질 분산은 3종목 수준입니다.',
        'The top three exceed half the book; effective diversification is about three names.'));
  }
  if (hhi >= 2500) {
    flag('watch', t('HHI ' + num(hhi, 0) + ' — 고집중 구간', 'HHI ' + num(hhi, 0) + ' — highly concentrated'),
      t('2,500 이상은 일반적으로 고집중으로 봅니다.', 'Above 2,500 is generally read as concentrated.'));
  }
  byRegion.forEach(function (r) {
    if (r[1] >= 70) {
      flag('watch', t(r[0] + ' 비중 ' + share(r[1]), r[0] + ' at ' + share(r[1])),
        t('한 지역에 70% 이상이면 그 시장의 지수 위험을 거의 그대로 받습니다.',
          'Over 70% in one region means you carry that market’s index risk almost fully.'));
    }
  });
  var nonKrw = byCurrency.filter(function (c) { return c[0] !== 'KRW'; })
    .reduce(function (a, c) { return a + c[1]; }, 0);
  if (nonKrw >= 40) {
    flag('watch', t('외화 노출 ' + share(nonKrw), 'FX exposure ' + share(nonKrw)),
      t('원/달러가 10% 움직이면 이 부분의 원화 평가액도 그만큼 흔들립니다.',
        'A 10% move in USD/KRW moves this slice of the KRW valuation by about as much.'));
  }
  if (byType.length === 1 && byType[0][0] === (isEn() ? 'stock' : PF.typeKo.stock) && valued.length < 5) {
    flag('watch', t('개별주식 ' + valued.length + '종목만 보유', 'Only ' + valued.length + ' single stocks'),
      t('종목 수가 적으면 개별 기업 위험이 지수 위험보다 커집니다.',
        'With few names, single-issuer risk dominates market risk.'));
  }
  if (!flags.length) {
    flag('ok', t('눈에 걸리는 편중은 없습니다', 'No concentration flags'),
      t('단일 20% · 상위3 50% · 단일 지역 70% · 외화 40% 선을 모두 밑돕니다.',
        'Below the 20% / 50% / 70% / 40% reference lines.'));
  }

  var LEVEL = { warn: t('점검', 'Check'), watch: t('참고', 'Watch'), ok: t('양호', 'OK') };
  document.getElementById('diag').innerHTML =
    '<ul class="diag">' + flags.map(function (f) {
      return '<li><span class="flag flag-' + f.level + '">' + LEVEL[f.level] + '</span>' +
        '<span><b>' + esc(f.title) + '</b><span class="why">' + esc(f.why) + '</span></span></li>';
    }).join('') + '</ul>' +
    '<p class="note">' + t(
      '기준선(단일 20% · 상위3 50% · 단일 지역 70% · 외화 40%)은 널리 쓰이는 참고값을 ' +
      '옮긴 것이고 감독 규정이나 사내 기준이 아닙니다. 고객 성향·목표에 따라 적정 수준은 ' +
      '달라집니다.',
      'These reference lines are common rules of thumb, not regulatory or firm limits.') + '</p>';

  renderEls();
}

/* ---- 7. ELS 낙인 여력 ---- */
function ymd(n) {
  var s = String(n);
  return s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8);
}

function renderEls() {
  var out = document.getElementById('els-out');
  var h = PF.els || {};
  if (!h.dates || !h.dates.length) {
    out.innerHTML = '<p class="chart-empty">' +
      t('기초자산 과거 시세가 없어 계산할 수 없습니다.', 'No underlying history available.') + '</p>';
    return;
  }
  var asset = document.getElementById('els-asset').value;
  var series = h.series[asset];
  var baseStr = document.getElementById('els-base').value;
  var ki = Number(document.getElementById('els-ki').value);
  var barrier = Number(document.getElementById('els-barrier').value);
  if (!series || !baseStr) {
    out.innerHTML = '<p class="note">' +
      t('기초자산과 최초기준가격 결정일을 고르면 계산합니다.',
        'Pick an underlying and a strike date.') + '</p>';
    return;
  }

  var baseNum = Number(baseStr.replace(/-/g, ''));
  /* 기준일 이후 첫 거래일을 쓴다 — 결정일이 휴장일일 수 있다. */
  var bi = -1;
  for (var i = 0; i < h.dates.length; i++) {
    if (h.dates[i] >= baseNum && series[i] != null) { bi = i; break; }
  }
  if (bi < 0) {
    out.innerHTML = '<p class="note">' + t(
      '그 날짜 이후의 시세가 없습니다. 보유 시세 범위는 ' + ymd(h.dates[0]) + ' ~ ' +
        ymd(h.dates[h.dates.length - 1]) + ' 입니다.',
      'No prices after that date. Range is ' + ymd(h.dates[0]) + ' to ' +
        ymd(h.dates[h.dates.length - 1]) + '.') + '</p>';
    return;
  }

  var base = series[bi];
  var lastI = series.length - 1;
  while (lastI > bi && series[lastI] == null) lastI--;
  var cur = series[lastI] / base * 100;

  var minLvl = Infinity, minAt = null;
  for (var j = bi; j <= lastI; j++) {
    if (series[j] == null) continue;
    var lvl = series[j] / base * 100;
    if (lvl < minLvl) { minLvl = lvl; minAt = h.dates[j]; }
  }
  var touched = minLvl <= ki;
  var headroom = cur - ki;
  var toBarrier = cur - barrier;

  out.innerHTML = '<div class="stats" style="margin-top:19px">' +
    tile(t('현재 수준', 'Current level'), pct(cur - 100, 1),
      t('최초기준가격 = 100', 'Strike = 100'), cur - 100) +
    tile(t('기간 중 최저', 'Period low'), pct(minLvl - 100, 1),
      minAt ? ymd(minAt) : '', minLvl - 100) +
    tile(t('낙인까지 여력', 'Knock-in headroom'),
      '<span class="' + (headroom > 0 ? 'st-ok' : 'st-bad') + '">' + ppt(headroom) + '</span>',
      t('현재 수준 − 낙인 ' + ki + '%', 'Current level − ' + ki + '% barrier')) +
    tile(t('조기상환 배리어까지', 'To redemption barrier'),
      '<span class="' + (toBarrier >= 0 ? 'st-ok' : 'st-warn') + '">' + ppt(toBarrier) + '</span>',
      t(toBarrier >= 0 ? '배리어 충족' : '미달', toBarrier >= 0 ? 'Above' : 'Below')) +
    '</div>' +
    '<ul class="diag">' +
      '<li><span class="flag ' + (touched ? 'flag-warn' : 'flag-ok') + '">' +
        (touched ? t('낙인 터치', 'Knocked in') : t('미터치', 'Not touched')) + '</span>' +
      '<span><b>' + t(
        touched
          ? '기간 중 종가가 낙인선(' + ki + '%) 아래로 내려간 적이 있습니다.'
          : '기간 중 종가가 낙인선(' + ki + '%) 아래로 내려간 적이 없습니다.',
        touched ? 'A closing price fell below the ' + ki + '% barrier.'
                : 'No closing price fell below the ' + ki + '% barrier.') + '</b>' +
      '<span class="why">' + t(
        '기간 ' + ymd(h.dates[bi]) + ' ~ ' + ymd(h.dates[lastI]) + ' · 일별 종가 기준. ' +
          '장중 저가는 보지 않으므로 실제 낙인 판정과 다를 수 있습니다.',
        'Window ' + ymd(h.dates[bi]) + ' to ' + ymd(h.dates[lastI]) +
          ', daily closes only — intraday lows are not checked.') + '</span></span></li>' +
    '</ul>' +
    '<p class="note">' + t(
      '기초자산이 여럿인 상품은 가장 부진한 자산(워스트 퍼포머)이 판정 기준입니다 — ' +
      '보유한 상품의 기초자산을 하나씩 넣어 가장 낮은 값을 보십시오. 시세 출처는 ' +
      'Yahoo Finance 일별 종가이고, 실제 상품 조건은 투자설명서가 우선합니다.',
      'For multi-asset products the worst performer decides; check each underlying and take ' +
      'the lowest. Prices are Yahoo Finance daily closes; the prospectus governs.') + '</p>';
}

/* ============================================================ 이벤트 */
document.getElementById('rows').addEventListener('input', function (e) {
  var el = e.target;
  if (!el.dataset.f) return;
  var i = Number(el.dataset.i);
  if (!holdings[i]) return;
  holdings[i][el.dataset.f] = el.value;
  save();

  /* 이름 칸을 통째로 다시 그리면 커서가 튄다. 그래서 그 행의 현재가 칸과
     안내 문구만 제자리에서 갱신하고, 표 자체는 건드리지 않는다. 나머지
     구역은 언제나 다시 계산한다 — 미인식 종목도 즉시 반영된다. */
  if (el.dataset.f === 'name') {
    var td = el.closest('tr').querySelector('td.meta');
    if (td) td.innerHTML = metaHtml(el.value);
    el.setAttribute('aria-invalid', String(!!el.value && !BY_NAME[el.value]));
    renderNote();
    renderReport();
  } else {
    renderReport();
  }
});

document.getElementById('rows').addEventListener('click', function (e) {
  var b = e.target.closest('button[data-del]');
  if (!b) return;
  holdings.splice(Number(b.dataset.del), 1);
  save();
  renderAll();
});

document.getElementById('add').addEventListener('click', function () {
  holdings.push({ name: '', qty: '', cost: '' });
  save();
  renderAll();
  var inputs = document.querySelectorAll('#rows input[data-f="name"]');
  if (inputs.length) inputs[inputs.length - 1].focus();
});

document.getElementById('clear').addEventListener('click', function () {
  if (!holdings.length) return;
  if (!confirm(t('보유 내역을 모두 지웁니다. 계속하시겠습니까?',
                 'This clears every holding. Continue?'))) return;
  holdings = [];
  save();
  renderAll();
});

document.getElementById('sample').addEventListener('click', function () {
  /* 실제 고객 자산이 아니라 화면을 확인하기 위한 예시다. */
  var want = [['삼성전자', 100, 250000], ['SK하이닉스', 30, 700000],
              ['TIGER 미국S&P500', 300, 21000], ['엔비디아', 20, 180],
              ['KODEX 미국채10년선물', 200, 11000]];
  holdings = want.filter(function (w) { return BY_NAME[w[0]]; })
    .map(function (w) { return { name: w[0], qty: w[1], cost: w[2] }; });
  save();
  renderAll();
});

document.getElementById('print').addEventListener('click', function () { window.print(); });

document.getElementById('paste-toggle').addEventListener('click', function () {
  var box = document.getElementById('paste');
  box.classList.toggle('open');
  if (box.classList.contains('open')) box.focus();
});

document.getElementById('paste').addEventListener('change', function (e) {
  var added = [];
  e.target.value.split(/\r?\n/).forEach(function (line) {
    if (!line.trim()) return;
    var p = line.split(/[,\t;]/).map(function (s) { return s.trim(); });
    if (!p[0]) return;
    added.push({ name: p[0], qty: p[1] || '', cost: p[2] || '' });
  });
  if (!added.length) return;
  holdings = holdings.concat(added);
  save();
  e.target.value = '';
  e.target.classList.remove('open');
  renderAll();
});

['els-asset', 'els-base', 'els-ki', 'els-barrier'].forEach(function (id) {
  document.getElementById(id).addEventListener('input', renderEls);
});

/* ============================================================ 시작 */
document.getElementById('universe').innerHTML = PF.universe.map(function (u) {
  return '<option value="' + esc(u.name) + '">' + esc(u.group) + ' · ' + esc(u.currency) + '</option>';
}).join('');

var assetSel = document.getElementById('els-asset');
assetSel.innerHTML = Object.keys((PF.els || {}).series || {}).sort().map(function (k) {
  return '<option value="' + esc(k) + '">' + esc(k) + '</option>';
}).join('');

/* 기준일 기본값 — 시세 마지막 날에서 1년 전. 흔한 만기 구간 안이다. */
(function () {
  var d = (PF.els || {}).dates || [];
  if (!d.length) return;
  var last = String(d[d.length - 1]);
  var y = Number(last.slice(0, 4)) - 1;
  document.getElementById('els-base').value = y + '-' + last.slice(4, 6) + '-' + last.slice(6, 8);
  document.getElementById('els-base').max = ymd(d[d.length - 1]);
  document.getElementById('els-base').min = ymd(d[0]);
})();

function renderStatic() {
  document.getElementById('asof').innerHTML = t(
    '시세 기준 <strong>' + esc(PF.asOf.collected) + ' KST</strong> · 국내 종가 ' +
      esc(PF.asOf.kospiDate) + ' · 원/달러 ' + num(PF.fx.USD, 1) + '원 · 수집 ' +
      PF.universe.length + '종. <strong>실시간이 아닙니다.</strong>',
    'Prices as of <strong>' + esc(PF.asOf.collected) + ' KST</strong> · KR close ' +
      esc(PF.asOf.kospiDate) + ' · USD/KRW ' + num(PF.fx.USD, 1) + ' · ' +
      PF.universe.length + ' instruments. <strong>Not live.</strong>');
  document.getElementById('disclaimer').innerHTML = t(
    '<strong>입력한 보유 내역은 이 브라우저를 벗어나지 않습니다.</strong> 서버로 전송하지 않고 ' +
    'localStorage 에만 저장하므로, 공용 PC 에서는 «전체 지우기» 로 지워 주십시오. ' +
    '평가금액은 마지막 수집 종가와 표시된 환율로 계산한 값이라 실제 계좌 잔고와 다릅니다. ' +
    '세금·수수료·배당은 반영하지 않았습니다. 사내 참고 자료이며 투자 권유가 아닙니다. ' +
    '고객에게 제시할 경우 준법감시 부서 확인을 권장합니다.',
    '<strong>Holdings never leave this browser.</strong> Nothing is sent to a server; ' +
    'data lives in localStorage only, so use “Clear all” on shared machines. Values use the ' +
    'last collected closes and the FX shown, so they differ from your actual account. Taxes, ' +
    'fees and dividends are excluded. Internal reference only — not investment advice.');
  document.getElementById('saved').textContent = holdings.length
    ? t('이 브라우저에 저장됨', 'Saved in this browser') : '';
}

/* 언어를 바꾸면 리포트 문구도 함께 바뀌어야 한다. */
new MutationObserver(function () { renderStatic(); renderAll(); })
  .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

load();
renderStatic();
renderAll();

__TOOLTIP_JS__
__LANG_JS__
</script>
<!-- 생성 __BUILT__ · scripts/build_portfolio_report.py -->
</body>
</html>
"""


def main() -> None:
    m = json.loads(MARKET.read_text(encoding='utf-8'))
    OUT.write_text(build(m), encoding='utf-8')
    fx, missing = build_fx(m)
    uni = build_universe(m)
    els = build_els_history()
    print(f'{OUT.relative_to(ROOT)} 생성 — {OUT.stat().st_size // 1024} KB')
    print(f'  유니버스 {len(uni)}종 · 환율 {len(fx)}통화'
          + (f' (환산 불가 {", ".join(missing)})' if missing else ''))
    print(f'  ELS 기초자산 {len(els.get("series", {}))}종 / '
          f'{len(els.get("dates", []))}거래일')


if __name__ == '__main__':
    main()
