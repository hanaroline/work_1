#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""고객 자산배분 제안서 — 화면 한 장(proposal.html)을 만든다.

드리프트를 막는 설계
──────────────────────────────────────────────────────────────────────
배분 계산을 자바스크립트에 옮겨 적으면 파이썬(엑셀·PPT)과 **언젠가 조용히
어긋난다.** 그래서 **성향 5 × 기간 4 = 20 가지 배분을 파이썬이 미리 셈해
넣고, 화면은 고르기만 한다.** 화면에는 배분 산수가 없다.

목표수익률 역산만은 화면에서 셈한다 — 기대수익률이 사람이 그때그때 넣는
가정이라 미리 셈해 둘 수 없기 때문이다. 그 산수는 proposal_lib.target_weights
와 같은 식이고, 식이 한 줄뿐이라 옮겨 적은 자리를 주석으로 표시해 두었다.

디자인은 미래에셋 기준을 따른다 — 오렌지 #F58220 · 블루 #043B72, 1px 오렌지
섹션 룰, 표 머리 #FAB072, 본문 19px, 모서리 4px 이하, 한/영 토글 우상단.

쓰는 법
  python3 scripts/build_proposal_page.py

산출물
  proposal.html   (한 파일로 열림 — 자료가 안에 들어 있다)
"""

import json
import os
from datetime import datetime

import proposal_lib as P

ROOT = P.ROOT
OUT = os.path.join(ROOT, "proposal.html")

# 화면에 실을 상품 수. 자산군마다 규모 순으로 이만큼만 넣는다 — 전부 넣으면
# 파일이 커지고, 제안서에서 실제로 보여 줄 것은 몇 개뿐이다.
PER_CLASS = 40

HORIZON_BUCKETS = [(1, "1년 이내"), (3, "3년"), (5, "5년"), (10, "5년 초과")]


def trim(p):
    """화면이 쓰는 칸만 남긴다."""
    out = {"n": p.get("name"), "c": p.get("code"), "k": p.get("kind"),
           "t": p.get("type") or p.get("assetClass"),
           "co": p.get("company"), "s": p.get("size"),
           "r": p.get("ret1y"), "v": p.get("vol"),
           "f1": p.get("feeMin"), "f2": p.get("feeMax"),
           "rg": p.get("riskGrade"), "src": p.get("src"),
           "as": p.get("asOf")}
    if p.get("distTtmRate") is not None:
        out["d"] = p["distTtmRate"]
    if p.get("flags"):
        out["fl"] = p["flags"]
    return {k: v for k, v in out.items() if v is not None}


def build_data():
    u = P.load_universe()
    avail = {c for c, s in u["자산군"].items() if s.get("종목수")}

    plans = {}
    for risk in P.PROFILES:
        for years, label in HORIZON_BUCKETS:
            w, prof, notes = P.allocate(risk, years, avail)
            plans["%d|%d" % (risk, years)] = {
                "w": w, "notes": notes,
                "m": P.portfolio(w, u["자산군"]),
            }

    prods = {}
    for cls in P.CLASSES:
        if cls == "현금":
            continue
        prods[cls] = [trim(p) for p in P.pick_products(u["상품"], cls, PER_CLASS)]

    return {
        "generated": datetime.now(P.KST).strftime("%Y-%m-%d %H:%M"),
        "universe_generated": u.get("generated_at_kst"),
        "classes": P.CLASSES,
        "profiles": {str(k): {"name": v["name"], "desc": v["desc"]}
                     for k, v in P.PROFILES.items()},
        "horizons": [{"y": y, "label": l} for y, l in HORIZON_BUCKETS],
        "plans": plans,
        "stats": u["자산군"],
        "sources": u["원천"],
        "policy": u["정책"],
        "products": prods,
        "refWeights": P.PROFILES[3]["w"],
    }, u


CSS = """
:root{
  --orange:#F58220; --blue:#043B72; --orange-soft:#FAB072; --orange-active:#CB6015;
  --canvas:#FFFFFF; --soft:#ECEFF4; --subtle:#F7F8FA;
  --hair:#CDCECB; --hair-soft:#E5E4E1;
  --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C; --muted2:#84888B;
  --err:#C62828; --ok:#2E8540; --warn:#D4A017;
  --space-section:104px; --space-block:56px; --space-content:28px;
  --font-kr:'Spoqa Han Sans Neo','Noto Sans KR',sans-serif;
  --font-en:'Inter','Aptos','Segoe UI',system-ui,sans-serif;
}
@media(max-width:768px){:root{--space-section:72px;--space-block:36px}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--canvas);color:var(--body);
  font-family:var(--font-kr);font-size:19px;line-height:1.65;
  font-variant-numeric:tabular-nums}
html[lang="en"] body{font-family:var(--font-en)}
.page{max-width:1200px;margin:0 auto;padding:0 32px}
@media(max-width:768px){.page{padding:0 20px}body{font-size:17px}}

/* hero */
.hero{background:var(--orange);color:#fff;padding:56px 0 48px}
.hero .page{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap}
.hero h1{font-size:48px;font-weight:700;line-height:1.15;letter-spacing:-.5px;margin:0 0 10px}
.hero p{font-size:20px;margin:0;opacity:.95}
.tag{font-size:14px;letter-spacing:.6px;opacity:.9;margin:0 0 14px;display:block}
@media(max-width:768px){.hero h1{font-size:34px}.hero p{font-size:17px}}

/* lang toggle */
.lang{display:flex;border:1px solid var(--hair);border-radius:2px;overflow:hidden;
  box-shadow:0 2px 8px rgba(0,0,0,.06);background:#fff;flex:0 0 auto}
.lang button{font-family:var(--font-en);font-size:14px;font-weight:500;letter-spacing:.5px;
  padding:10px 17px;border:0;background:#fff;color:var(--muted);cursor:pointer}
.lang button+button{border-left:1px solid var(--hair)}
.lang button[aria-checked="true"]{background:var(--orange);color:#fff}
.lang button:not([aria-checked="true"]):hover{background:var(--subtle);color:var(--ink)}

/* sections */
.section{margin-top:var(--space-section)}
.section-rule{height:1px;background:var(--orange);margin-bottom:19px}
.section-title{font-size:26px;font-weight:700;color:var(--ink);margin:0 0 var(--space-content)}
h3{font-size:22px;font-weight:600;color:var(--ink);margin:38px 0 14px}
@media(max-width:768px){.section-title{font-size:22px}h3{font-size:19px}}

/* form */
.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:19px}
label{display:block;font-size:16px;font-weight:500;letter-spacing:.6px;color:var(--muted);margin-bottom:8px}
input,select{width:100%;font-family:inherit;font-size:19px;padding:10px 12px;
  border:1px solid var(--hair);border-radius:2px;background:#fff;color:var(--ink)}
input:focus,select:focus{outline:2px solid var(--orange);outline-offset:1px;border-color:var(--orange)}
.hint{font-size:14px;color:var(--muted2);margin-top:6px;line-height:1.4}

/* stats */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:19px;margin-top:var(--space-block)}
.stat{border:1px solid var(--hair);border-radius:4px;padding:24px}
.stat .lb{font-size:16px;font-weight:500;letter-spacing:.6px;color:var(--muted);margin:0}
.stat .v{font-size:44px;font-weight:700;line-height:1.05;letter-spacing:-.6px;margin:8px 0 0;color:var(--blue)}
.stat .v.o{color:var(--orange)}
.stat .sub{font-size:14px;color:var(--muted2);margin:8px 0 0;line-height:1.4}

/* bars */
.bars{margin-top:var(--space-block)}
.bar-row{display:grid;grid-template-columns:120px 1fr 96px;gap:14px;align-items:center;padding:7px 0}
.bar-row .nm{font-size:17px;color:var(--ink)}
.bar-track{background:var(--soft);height:26px;position:relative}
.bar-fill{height:100%;transition:width .25s ease}
.bar-row .pc{text-align:right;font-size:17px;font-weight:600;color:var(--ink)}
@media(max-width:768px){.bar-row{grid-template-columns:96px 1fr 72px;gap:10px}.bar-row .nm{font-size:15px}}

/* tables */
table{width:100%;border-collapse:collapse;border:1px solid var(--hair);margin-top:14px;font-size:16px}
th{background:var(--orange-soft);color:var(--ink);font-weight:700;text-align:left;padding:10px 12px;
  border:1px solid var(--hair-soft)}
td{padding:9px 12px;border:1px solid var(--hair-soft)}
tbody tr:hover{background:var(--subtle)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
td.na{color:var(--muted2)}
.total td{background:#D7D7D7;font-weight:700}
.tbl-wrap{overflow-x:auto}

/* 도구 단추 */
.tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:var(--space-content)}
.btn{font-family:inherit;font-size:16px;font-weight:500;padding:10px 19px;
  border:1px solid var(--hair);border-radius:2px;background:#fff;color:var(--ink);
  cursor:pointer;height:42px}
.btn:hover{background:var(--subtle)}
.btn.primary{background:var(--orange);border-color:var(--orange);color:#fff}
.btn.primary:hover{background:var(--orange-active);border-color:var(--orange-active)}
.btn:focus-visible{outline:2px solid var(--orange);outline-offset:1px}
.toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);
  background:var(--ink);color:#fff;font-size:15px;padding:10px 19px;border-radius:2px;
  opacity:0;pointer-events:none;transition:opacity .2s}
.toast.on{opacity:1}
/* 인쇄할 때만 나오는 머리글 — 화면에는 이미 히어로가 있다 */
.printhead{display:none}

/* notes */
.note{border-left:3px solid var(--orange);background:var(--subtle);padding:14px 19px;margin:19px 0;font-size:17px}
.note.warn{border-left-color:var(--warn)}
.note strong{color:var(--ink)}
.caption{font-size:14px;color:var(--muted2);line-height:1.5}
footer{margin:var(--space-section) 0 72px;padding-top:28px;border-top:1px solid var(--hair)}

[data-en]{display:none}
html[lang="en"] [data-ko]{display:none}
html[lang="en"] [data-en]{display:inline}
html[lang="en"] div[data-en],html[lang="en"] p[data-en],html[lang="en"] span.blk[data-en]{display:block}

@media print{
  .lang,.noprint,.tools{display:none!important}
  .printhead{display:block;margin-bottom:14pt}
  .printhead h1{font-size:20pt;margin:0 0 4pt;color:#000}
  .printhead .meta{font-size:10pt;color:#333}
  body{font-size:13pt;line-height:1.4}
  .page{max-width:100%;padding:0}
  .hero{background:#fff!important;color:#000!important;padding:0 0 12pt}
  .hero h1{color:#000}
  .section{margin-top:28pt;page-break-inside:avoid}
  table,.stat,.bars{page-break-inside:avoid}
  h2,h3{page-break-after:avoid}
}
"""


def render(data, u):
    d = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    stats_rows = []
    for cls, s in u["자산군"].items():
        def f(x, suf="%"):
            return ("%.1f%s" % (x, suf)) if isinstance(x, (int, float)) else "—"
        stats_rows.append(
            "<tr><td>%s</td><td class=num>%d</td><td class=num>%d</td>"
            "<td class=num>%s</td><td class='num%s'>%s</td>"
            "<td class='num%s'>%s</td></tr>"
            % (cls, s["종목수"], s["수익률산출가능"], f(s["ret1y_중앙값"]),
               "" if isinstance(s["vol_중앙값"], (int, float)) else " na",
               f(s["vol_중앙값"]),
               "" if isinstance(s["mdd_중앙값"], (int, float)) else " na",
               f(s["mdd_중앙값"])))

    src_rows = []
    for name, meta in u["원천"].items():
        if not isinstance(meta, dict):
            continue
        note = meta.get("note") or meta.get("error") or ""
        src_rows.append("<tr><td>%s</td><td>%s</td><td class=num>%s</td>"
                        "<td>%s</td><td class=caption>%s</td></tr>"
                        % (name, meta.get("src") or "—",
                           meta.get("count", "—"), meta.get("asOf") or "—",
                           note[:150]))

    return """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>자산배분 제안서 — 미래에셋증권</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>%(css)s</style>
</head>
<body>

<div class="hero">
  <div class="page">
    <div>
      <span class="tag"><span data-ko>고객 제안용</span><span data-en>For client proposal</span></span>
      <h1><span data-ko>자산배분 제안서</span><span data-en>Asset Allocation Proposal</span></h1>
      <p><span data-ko>투자금액·기간·성향을 넣으면 배분과 상품을 제안합니다</span>
         <span data-en>Enter amount, horizon and risk profile to see an allocation</span></p>
    </div>
    <div class="lang noprint" role="radiogroup" aria-label="Language">
      <button id="ko" role="radio" aria-checked="true">KO</button>
      <button id="en" role="radio" aria-checked="false">EN</button>
    </div>
  </div>
</div>

<div class="page">

  <div class="printhead">
    <h1>자산배분 제안서</h1>
    <div class="meta" id="printMeta"></div>
  </div>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title"><span data-ko>1. 고객 정보</span><span data-en>1. Client inputs</span></h2>
    <div class="form">
      <div>
        <label><span data-ko>고객명</span><span data-en>Client</span></label>
        <input type="text" id="client" placeholder="예: 홍길동 고객님">
        <p class="hint"><span data-ko>인쇄·CSV 에 함께 적힙니다.</span>
           <span data-en>Appears on print and CSV.</span></p>
      </div>
      <div>
        <label><span data-ko>투자금액 (만원)</span><span data-en>Amount (KRW 10k)</span></label>
        <input type="number" id="amt" value="10000" min="0" step="100">
        <p class="hint" id="amtHint"></p>
      </div>
      <div>
        <label><span data-ko>투자기간</span><span data-en>Horizon</span></label>
        <select id="yrs"></select>
      </div>
      <div>
        <label><span data-ko>위험성향</span><span data-en>Risk profile</span></label>
        <select id="risk"></select>
        <p class="hint" id="riskHint"></p>
      </div>
      <div>
        <label><span data-ko>목표 연수익률 (%%) — 선택</span><span data-en>Target return (%%) — optional</span></label>
        <input type="number" id="tgt" placeholder="비워 두면 성향 기준" step="0.5">
        <p class="hint"><span data-ko>넣으면 그 수익률에 필요한 위험을 함께 보여 줍니다.</span>
           <span data-en>If set, shows the risk required to target it.</span></p>
      </div>
    </div>

    <div class="tools noprint">
      <button class="btn primary" id="btnPrint">
        <span data-ko>인쇄 · PDF 저장</span><span data-en>Print / Save PDF</span></button>
      <button class="btn" id="btnCsv">
        <span data-ko>CSV 내려받기</span><span data-en>Download CSV</span></button>
      <button class="btn" id="btnLink">
        <span data-ko>이 설정 링크 복사</span><span data-en>Copy link</span></button>
      <button class="btn" id="btnReset">
        <span data-ko>처음으로</span><span data-en>Reset</span></button>
    </div>

    <div class="note warn">
      <span data-ko><strong>기대수익률은 가정입니다.</strong> 아래 「과거 1년 실적」은
      유니버스에서 실제로 잰 값이고, 미래 수익률이 아닙니다. 최근 1년이 그랬다는 것과
      앞으로 그러리라는 것은 다른 말입니다. 목표수익률 칸은 <strong>사람이 넣는 가정</strong>으로만
      쓰이며, 이 화면은 기대수익률 기본값을 몰래 넣지 않습니다.</span>
      <span data-en class="blk"><strong>Expected return is an assumption.</strong>
      The "trailing 1-year" figures below are measured, not forecasts.</span>
    </div>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title"><span data-ko>2. 제안 배분</span><span data-en>2. Proposed allocation</span></h2>
    <div id="planNotes"></div>
    <div class="bars" id="bars"></div>
    <div class="tbl-wrap"><table id="allocTbl"></table></div>
    <div class="stats" id="stats"></div>
    <div class="note" id="coverNote"></div>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title"><span data-ko>3. 제안 상품</span><span data-en>3. Suggested products</span></h2>
    <p class="caption"><span data-ko>규모와 보수로 고릅니다. 수익률 순으로 고르지 않습니다 —
      지난해 제일 많이 오른 것을 권하는 습관이 고객에게 가장 비쌉니다.</span>
      <span data-en>Ranked by size and fee, not by past return.</span></p>
    <div id="products"></div>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title"><span data-ko>4. 자산군 실측치</span><span data-en>4. Measured by asset class</span></h2>
    <div class="tbl-wrap"><table>
      <thead><tr><th>자산군</th><th class=num>종목</th><th class=num>수익률 산출</th>
      <th class=num>과거 1년(중앙)</th><th class=num>변동성(중앙)</th><th class=num>최대낙폭(중앙)</th></tr></thead>
      <tbody>%(stats)s</tbody></table></div>
    <p class="caption">— 는 원천에 없어 셈하지 않은 것입니다. 만들어 넣지 않습니다.
      펀드는 기준가 이력이 7 거래일뿐이라 변동성을 셈하지 않고 위험등급을 씁니다.</p>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title"><span data-ko>5. 자료 출처</span><span data-en>5. Sources</span></h2>
    <div class="tbl-wrap"><table>
      <thead><tr><th>자산군</th><th>원천</th><th class=num>종목</th><th>기준일</th><th>비고</th></tr></thead>
      <tbody>%(srcs)s</tbody></table></div>
  </section>

  <footer>
    <p class="caption">
      유니버스 생성 %(ugen)s · 화면 생성 %(gen)s (KST)<br>
      변동성은 자산군 사이 상관관계를 셈하지 않은 <strong>가중합</strong>입니다 —
      분산효과가 빠져 있어 실제보다 높게 나옵니다. 낮게 보이게 만드는 것보다 높게 두는 편이 안전합니다.<br>
      「해외펀드」는 해외에 설정된 뮤추얼펀드가 아니라 <strong>해외에 투자하는 국내 설정 공모펀드</strong>입니다.<br>
      해외주식 시가총액은 %(fxnote)s 로 원화 환산했습니다.<br>
      이 화면은 참고 자료이며 투자 권유가 아닙니다. 실제 제안 전 준법감시 검토를 받으십시오.
    </p>
  </footer>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
const D = %(data)s;
// 차트 색은 미래에셋 고정 순서다. 현금은 「잔여」이므로 중성 회색(#84888B)에
// 고정한다 — 시리즈 색을 주면 현금이 하나의 투자 자산처럼 읽힌다.
const CHART = ['#F58220','#043B72','#FAB072','#0086B8','#AD624E','#00A9CE','#F0B26B','#7E9FC3'];
const CASH_COLOR = '#84888B';
const $ = s => document.querySelector(s);
const fmt = (x,n=1) => (x===null||x===undefined||isNaN(x)) ? '—' : Number(x).toFixed(n);
const won = v => { // 만원 단위 입력 → 읽기 좋은 한국어
  if(!v) return '0원';
  const eok = Math.floor(v/10000), man = v%%10000;
  return (eok? eok+'억 ':'') + (man? man.toLocaleString()+'만':'') + '원';
};
// 규모(원 단위) → 조/억. 17138730억 같은 표기는 사람이 못 읽는다.
const size = v => {
  if(v==null||isNaN(v)) return '—';
  if(v >= 1e12) return (v/1e12).toLocaleString(undefined,{maximumFractionDigits:0})+'조원';
  if(v >= 1e8)  return (v/1e8).toLocaleString(undefined,{maximumFractionDigits:0})+'억원';
  return Math.round(v).toLocaleString()+'원';
};

function fillSelects(){
  $('#yrs').innerHTML = D.horizons.map(h=>`<option value="${h.y}">${h.label}</option>`).join('');
  $('#yrs').value = 10;
  $('#risk').innerHTML = Object.entries(D.profiles)
    .map(([k,v])=>`<option value="${k}">${k}. ${v.name}</option>`).join('');
  $('#risk').value = 3;
}

// 목표수익률 역산 — proposal_lib.target_weights 와 같은 식이다.
// 비중 = (목표 - 현금수익) / (위험자산 기대수익 - 현금수익)
// 기대수익률 가정이 없으면 셈하지 않는다(가정을 몰래 만들지 않는다).
function targetShare(target, riskyRet, cashRet){
  if(!(riskyRet > cashRet)) return null;
  return (target - cashRet) / (riskyRet - cashRet);
}

function render(){
  const risk = $('#risk').value, yrs = $('#yrs').value;
  const amt = Number($('#amt').value||0);
  const plan = D.plans[risk+'|'+yrs];
  $('#amtHint').textContent = won(amt);
  const who = $('#client').value.trim();
  $('#printMeta').textContent =
    [who, D.profiles[risk].name, $('#yrs').selectedOptions[0].textContent, won(amt)]
      .filter(Boolean).join('  ·  ') + '   |   ' + D.generated + ' (KST)';
  $('#riskHint').textContent = D.profiles[risk].desc;

  // 안내
  $('#planNotes').innerHTML = plan.notes.map(n=>
    `<div class="note">${n.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')}</div>`).join('');

  // 막대
  const entries = D.classes.map((c,i)=>[c, plan.w[c]||0,
                       c==='현금' ? CASH_COLOR : CHART[i%%CHART.length]])
                           .filter(e=>e[1]>0);
  $('#bars').innerHTML = entries.map(([c,w,col])=>`
    <div class="bar-row"><div class="nm">${c}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${w}%%;background:${col}"></div></div>
      <div class="pc">${fmt(w,1)}%%</div></div>`).join('');

  // 표
  $('#allocTbl').innerHTML = `<thead><tr><th>자산군</th><th class=num>비중</th>
    <th class=num>금액</th><th class=num>과거 1년(중앙)</th><th class=num>변동성(중앙)</th></tr></thead>
    <tbody>${entries.map(([c,w])=>{
      const s = D.stats[c]||{};
      const r = s['ret1y_중앙값'], v = s['vol_중앙값'];
      return `<tr><td>${c}</td><td class=num>${fmt(w,1)}%%</td>
        <td class=num>${won(Math.round(amt*w/100))}</td>
        <td class="num${r==null?' na':''}">${r==null?'—':fmt(r)+'%%'}</td>
        <td class="num${v==null?' na':''}">${v==null?'—':fmt(v)+'%%'}</td></tr>`;
    }).join('')}
    <tr class="total"><td>합계</td><td class=num>100.0%%</td><td class=num>${won(amt)}</td>
      <td class=num>${fmt(plan.m['과거1년실적'])}%%</td>
      <td class=num>${fmt(plan.m['변동성_가중합'])}%%</td></tr></tbody>`;

  // 지표
  const m = plan.m;
  const tgt = Number($('#tgt').value);
  let tgtCard = '';
  if(tgt){
    // 위험자산 기대수익률 가정이 없으므로 과거 실적으로는 역산하지 않는다.
    tgtCard = `<div class="stat"><p class="lb">목표 연수익률</p>
      <p class="v o">${fmt(tgt)}%%</p>
      <p class="sub">역산하려면 <strong>자산군별 기대수익률 가정</strong>이 있어야 합니다.
      과거 실적으로 역산하면 「지난해처럼 오른다」고 가정하는 셈이라 하지 않습니다.</p></div>`;
  }
  $('#stats').innerHTML = `
    <div class="stat"><p class="lb">과거 1년 실적 (가중)</p>
      <p class="v">${fmt(m['과거1년실적'])}%%</p>
      <p class="sub">미래 수익률이 아닙니다. 실적을 덮은 비중 ${fmt(m['실적덮은비중'],0)}%%</p></div>
    <div class="stat"><p class="lb">변동성 (가중합)</p>
      <p class="v">${fmt(m['변동성_가중합'])}%%</p>
      <p class="sub">분산효과 제외 — 실제보다 높게 나옵니다. 덮은 비중 ${fmt(m['변동성덮은비중'],0)}%%</p></div>
    <div class="stat"><p class="lb">최대낙폭 (가중합)</p>
      <p class="v">${fmt(m['최대낙폭_가중합'])}%%</p>
      <p class="sub">덮은 비중 ${fmt(m['낙폭덮은비중'],0)}%%</p></div>
    <div class="stat"><p class="lb">현금</p>
      <p class="v o">${fmt(m['현금비중'],1)}%%</p>
      <p class="sub">${won(Math.round(amt*m['현금비중']/100))}</p></div>
    ${tgtCard}`;

  const cov = m['변동성덮은비중'];
  $('#coverNote').innerHTML = cov >= 99
    ? '<span data-ko>포트폴리오 전체의 변동성을 셈했습니다.</span>'
    : `<strong>변동성은 이 배분의 ${fmt(cov,0)}%%만 덮습니다.</strong>
       나머지 ${fmt(100-cov,0)}%%(주로 펀드)는 기준가 이력이 7 거래일뿐이라 셈하지
       않았습니다. 표에 적힌 변동성을 포트폴리오 전체의 값으로 읽지 마십시오.`;

  // 상품
  $('#products').innerHTML = entries.filter(([c])=>c!=='현금').map(([c,w])=>{
    const items = (D.products[c]||[]).slice(0,8);
    if(!items.length) return `<h3>${c} — ${fmt(w,1)}%%</h3>
      <div class="note"><strong>제안할 상품 자료가 없습니다.</strong></div>`;
    // 개별 종목은 「이걸 사라」가 아니라 그 자산군이 어떤 종목들로 이뤄지는지
    // 보여 주는 것이다. 단서를 달지 않으면 제안서가 종목 추천으로 읽힌다.
    const caveat = (c==='국내주식'||c==='해외주식')
      ? `<p class="caption"><strong>시가총액 상위 종목입니다 — 종목 추천이 아닙니다.</strong>
         개별 종목 선정은 별도 상담 사항이며, 과거 1년은 지나간 실적일 뿐입니다.</p>` : '';
    return `<h3>${c} — ${fmt(w,1)}%% · ${won(Math.round(amt*w/100))}</h3>${caveat}
      <div class="tbl-wrap"><table><thead><tr><th>상품</th><th>유형</th><th>운용/발행</th>
      <th class=num>규모</th><th class=num>과거 1년</th><th class=num>변동성</th><th class=num>보수</th>
      </tr></thead><tbody>${items.map(p=>`<tr>
        <td>${p.n||p.c||''}</td><td>${p.t||'—'}</td><td>${p.co||'—'}</td>
        <td class="num${p.s==null?' na':''}">${size(p.s)}</td>
        <td class="num${p.r==null?' na':''}">${p.r==null?'—':fmt(p.r)+'%%'}</td>
        <td class="num${p.v==null?' na':''}">${p.v==null?'—':fmt(p.v)+'%%'}</td>
        <td class="num${p.f1==null?' na':''}">${p.f1==null?'—':
          (p.f2!=null&&p.f2!==p.f1? fmt(p.f1,2)+'~'+fmt(p.f2,2):fmt(p.f1,2))+'%%'}</td>
      </tr>`).join('')}</tbody></table></div>`;
  }).join('');
}

function setLang(l){
  document.documentElement.lang = l;
  $('#ko').setAttribute('aria-checked', l==='ko');
  $('#en').setAttribute('aria-checked', l==='en');
  try{ localStorage.setItem('mas-lang', l); }catch(e){}
}
$('#ko').onclick = ()=>setLang('ko');
$('#en').onclick = ()=>setLang('en');
try{ const s=localStorage.getItem('mas-lang'); if(s) setLang(s); }catch(e){}

// ── 설정을 주소에 담아 링크로 넘긴다 ─────────────────────────────────
// 제안 도구는 「이 조건으로 뽑아 봤습니다」를 남에게 보여 줄 일이 많다.
// 링크에 담아 두면 파일을 주고받지 않아도 같은 화면을 연다.
const FIELDS = ['client','amt','yrs','risk','tgt'];
function toHash(){
  const o = {}; FIELDS.forEach(f=>{ const v=$('#'+f).value; if(v) o[f]=v; });
  return new URLSearchParams(o).toString();
}
function fromHash(){
  const q = new URLSearchParams(location.hash.slice(1));
  let any = false;
  FIELDS.forEach(f=>{ if(q.has(f)){ $('#'+f).value = q.get(f); any = true; } });
  return any;
}
function remember(){ try{ localStorage.setItem('mas-proposal', toHash()); }catch(e){} }
function recall(){
  try{ const v=localStorage.getItem('mas-proposal');
       if(v){ const q=new URLSearchParams(v);
              FIELDS.forEach(f=>{ if(q.has(f)) $('#'+f).value = q.get(f); }); return true; } }
  catch(e){}
  return false;
}

function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.remove('on'), 2200);
}

// CSV — 엑셀에서 바로 열리게 BOM 을 붙인다(없으면 한글이 깨진다).
function csv(){
  const risk=$('#risk').value, yrs=$('#yrs').value, amt=Number($('#amt').value||0);
  const plan=D.plans[risk+'|'+yrs], who=$('#client').value.trim();
  const q = v => '"' + String(v==null?'':v).replace(/"/g,'""') + '"';
  const L = [];
  L.push(['자산배분 제안서'].map(q).join(','));
  L.push(['고객', who, '성향', D.profiles[risk].name,
          '기간', $('#yrs').selectedOptions[0].textContent,
          '투자금액(만원)', amt].map(q).join(','));
  L.push(['생성', D.generated + ' KST', '유니버스', D.universe_generated||''].map(q).join(','));
  L.push('');
  L.push(['자산군','비중(%%)','금액(만원)','과거1년(중앙,%%)','변동성(중앙,%%)'].map(q).join(','));
  D.classes.forEach(c=>{
    const w = plan.w[c]||0; if(w<=0) return;
    const st = D.stats[c]||{};
    L.push([c, w.toFixed(1), Math.round(amt*w/100),
            st['ret1y_중앙값']==null?'':st['ret1y_중앙값'].toFixed(1),
            st['vol_중앙값']==null?'':st['vol_중앙값'].toFixed(1)].map(q).join(','));
  });
  const m = plan.m;
  L.push(['합계','100.0',amt, m['과거1년실적'].toFixed(1), m['변동성_가중합'].toFixed(1)].map(q).join(','));
  L.push(['실적 덮은 비중(%%)', m['실적덮은비중'].toFixed(0),
          '변동성 덮은 비중(%%)', m['변동성덮은비중'].toFixed(0)].map(q).join(','));
  L.push('');
  L.push(['자산군','상품','유형','운용/발행','규모(원)','과거1년(%%)','변동성(%%)','보수(%%)'].map(q).join(','));
  D.classes.forEach(c=>{
    const w = plan.w[c]||0; if(w<=0 || c==='현금') return;
    (D.products[c]||[]).slice(0,8).forEach(p=>{
      L.push([c, p.n||p.c||'', p.t||'', p.co||'', p.s==null?'':p.s,
              p.r==null?'':p.r.toFixed(1), p.v==null?'':p.v.toFixed(1),
              p.f1==null?'':p.f1].map(q).join(','));
    });
  });
  L.push('');
  L.push([('「과거 1년」은 실제로 잰 값이며 미래 수익률이 아닙니다. ' +
           '빈칸은 원천에 없어 셈하지 않은 값입니다. ' +
           '이 자료는 참고용이며 투자 권유가 아닙니다.')].map(q).join(','));
  return '\\ufeff' + L.join('\\r\\n');
}

$('#btnPrint').onclick = ()=>window.print();
$('#btnCsv').onclick = ()=>{
  const who = $('#client').value.trim().replace(/[\\/:*?"<>|]/g,'') || '고객';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv()], {type:'text/csv;charset=utf-8'}));
  a.download = `자산배분제안_${who}_${D.generated.slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  toast('CSV 를 내려받았습니다.');
};
$('#btnLink').onclick = async ()=>{
  const url = location.origin + location.pathname + '#' + toHash();
  try{ await navigator.clipboard.writeText(url); toast('링크를 복사했습니다.'); }
  catch(e){ location.hash = toHash(); toast('주소창의 링크를 복사해 주세요.'); }
};
$('#btnReset').onclick = ()=>{
  $('#client').value=''; $('#amt').value=10000; $('#yrs').value=10;
  $('#risk').value=3; $('#tgt').value='';
  try{ localStorage.removeItem('mas-proposal'); }catch(e){}
  history.replaceState(null,'',location.pathname);
  render(); toast('처음 설정으로 되돌렸습니다.');
};

fillSelects();
['#client','#amt','#yrs','#risk','#tgt'].forEach(sel=>{
  $(sel).addEventListener('input', ()=>{ render(); remember(); });
  $(sel).addEventListener('change', ()=>{ render(); remember(); });
});
// 링크로 들어온 설정이 먼저다. 없으면 지난번에 보던 설정을 되살린다.
if(!fromHash()) recall();
window.addEventListener('hashchange', ()=>{ fromHash(); render(); });
render();
</script>
</body>
</html>
""" % {"css": CSS, "data": d, "stats": "".join(stats_rows),
       "srcs": "".join(src_rows),
       "gen": data["generated"], "ugen": data.get("universe_generated") or "—",
       "fxnote": fx_note(u)}


def fx_note(u):
    """환산에 쓴 환율과 출처를 적는다. 환산한 수치는 근거를 함께 실어야 한다."""
    fx = ((u.get("원천", {}).get("해외주식") or {}).get("환율") or {})
    if not fx.get("usdkrw"):
        return "환율 정보가 없어 환산하지 않았습니다"
    return "USD/KRW %.2f (%s)" % (fx["usdkrw"], fx.get("src", "출처 미상"))


def check_js(html):
    """만든 화면의 자바스크립트가 **파싱되는지** 본다.

    이 파일의 JS 는 파이썬 일반 문자열 안에 들어 있다. 그래서 `\\r\\n` 이나
    `\\ufeff` 처럼 역슬래시를 쓰는 자리는 파이썬이 먼저 집어삼킨다 — 실제로
    `L.join('\\r\\n')` 이 진짜 줄바꿈으로 바뀌어 문자열이 끊겼고, **화면 전체의
    JS 가 통째로 죽었다.** 단추도 표도 아무것도 안 들었는데 HTML 은 멀쩡해
    보였다. 그래서 기계가 본다.

    node 가 없으면 건너뛴다 — 검사를 못 했다고 빌드를 막지는 않되, 건너뛴
    사실은 적는다.
    """
    import re
    import shutil
    import subprocess
    import tempfile
    if not shutil.which("node"):
        print("  (node 가 없어 JS 구문 검사를 건너뜁니다)")
        return
    m = re.search(r"<script>(.*)</script>", html, re.S)
    if not m:
        raise SystemExit("화면에 <script> 가 없습니다 — 만들다 만 것입니다.")
    with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8",
                                     delete=False) as fp:
        fp.write(m.group(1))
        path = fp.name
    try:
        r = subprocess.run(["node", "--check", path],
                           capture_output=True, text=True)
    finally:
        os.remove(path)
    if r.returncode != 0:
        raise SystemExit("자바스크립트가 파싱되지 않습니다:\n%s"
                         % (r.stderr or r.stdout)[:800])
    print("  JS 구문 검사 통과")


def main():
    data, u = build_data()
    html = render(data, u)
    check_js(html)
    with open(OUT, "w", encoding="utf-8") as fp:
        fp.write(html)
    print("자산군 %d · 상품 %d 종을 실었습니다."
          % (len(u["자산군"]), sum(len(v) for v in data["products"].values())))
    print("배분 %d 가지를 미리 셈해 넣었습니다 (성향 %d × 기간 %d)."
          % (len(data["plans"]), len(P.PROFILES), len(HORIZON_BUCKETS)))
    print("%s  (%.0f KB)" % (os.path.relpath(OUT, ROOT),
                             os.path.getsize(OUT) / 1024))


if __name__ == "__main__":
    main()
