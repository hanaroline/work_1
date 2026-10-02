#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""고객 자산배분 제안서 — 화면 한 장(proposal.html)을 만든다.

드리프트를 막는 설계
──────────────────────────────────────────────────────────────────────
배분 계산을 자바스크립트에 옮겨 적으면 파이썬(엑셀)과 **언젠가 조용히
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
import proposal_exposure as EXP
import proposal_metrics as MET

ROOT = P.ROOT
OUT = os.path.join(ROOT, "proposal.html")

# 화면에 실을 상품 수. **0 이면 전부.**
#
# 처음에는 자산군마다 40 종만 심었다. 그랬더니 「상품 고르기」에 35 종밖에 안
# 떴다 — 5 종은 이미 골라 놓았으니 남는 것이 그만큼이었다. 국내펀드만 615 종이
# 있는데 40 종에서 고르라는 것은 고르라는 말이 아니다. 전부 심으면 271 KB 쯤
# 늘지만(저장소에 30 MB 짜리 화면도 있다) 고를 수 있는 것이 스무 배가 된다.
PER_CLASS = 0

HORIZON_BUCKETS = [(1, "1년 이내"), (3, "3년"), (5, "5년"), (10, "5년 초과")]


def trim(p):
    """화면이 쓰는 칸만 남긴다.

    **왜 이 상품인지도 함께 싣는다.** 화면은 상품을 바꿔 끼울 수 있으므로,
    기본 다섯이 아닌 것이 표에 올라와도 고른 까닭이 보여야 한다.
      sc  위험조정 점수(0~1)        wy  근거 한 줄        tg  측정등급(1/2/3)
      my  가장 긴 창이 몇 해인지    mc  그 창의 연평균    mv/md 변동성·최대낙폭
    과거 1 년만 싣던 것을 이것으로 바꾼다 — 1 해는 너무 짧아 운이 실적처럼
    보이고, 국내ETF 는 그 1 해조차 없어 「—」가 줄줄이 찍혔다.
    """
    out = {"n": p.get("name"), "c": p.get("code"), "k": p.get("kind"),
           "t": p.get("type") or p.get("assetClass"),
           "co": p.get("company"), "s": p.get("size"),
           "r": p.get("ret1y"), "v": p.get("vol"),
           "f1": p.get("feeMin"), "f2": p.get("feeMax"),
           "rg": p.get("riskGrade"), "src": p.get("src"),
           "as": p.get("asOf"),
           # **노출을 함께 싣는다.** 화면에서 상품을 바꾸면 도넛의 「실제 노출」도
           # 따라 바뀌어야 하므로, 자산군 이름이 아니라 이 값으로 셈한다.
           "e": p.get("노출"),
           "sc": round(p["점수"], 4) if p.get("점수") is not None else None,
           "wy": p.get("점수근거"), "tg": p.get("측정등급")}
    years, w = MET.longest(p.get("지표") or {})
    if w:
        # **감정평가 기준가는 변동성·낙폭을 싣지 않는다.** 점수에서 빼 놓고
        # 표에는 0.7% 를 그대로 찍으면 고객은 그것을 시세로 읽는다. 뺀
        # 까닭은 「고른 까닭」 줄이 말해 준다.
        appraised = "기준가_평가식_시세아님" in (p.get("flags") or [])
        out["my"] = years
        out["mc"] = round(w["cagr"], 2) if w.get("cagr") is not None else None
        out["mv"] = (None if appraised else
                     round(w["vol"], 2) if w.get("vol") is not None else None)
        out["md"] = (None if appraised else
                     round(w["mdd"], 2) if w.get("mdd") is not None else None)
    if p.get("distTtmRate") is not None:
        out["d"] = p["distTtmRate"]
    if p.get("flags"):
        out["fl"] = p["flags"]
    return {k: v for k, v in out.items() if v is not None}


def build_data():
    u = P.load_universe()
    cma_table, cma_gen = P.cma()
    avail = {c for c, s in u["자산군"].items() if s.get("종목수")}

    plans = {}
    for risk in P.PROFILES:
        for years, label in HORIZON_BUCKETS:
            w, prof, notes = P.allocate(risk, years, avail)
            plans["%d|%d" % (risk, years)] = {
                "w": w, "notes": notes,
                "m": P.portfolio(w, u["자산군"]),
            }

    prods, picked = {}, {}
    for cls in P.CLASSES:
        if cls == "현금":
            continue
        # 「고르기」 목록에는 **전부** 싣는다 — 35 종밖에 안 떠서 못 고르던 일이 있었다.
        prods[cls] = [trim(p) for p in P.pick_products(
            u["상품"], cls, PER_CLASS or 10 ** 9)]
        # **처음 담기는 다섯은 따로 정한다.** 전체 목록은 n 이 커서 집중·중복
        # 상한이 끝내 다 풀린 순수 점수 순이다. 그 앞에서 다섯을 잘라 쓰면
        # 상한을 거치지 않은 다섯(같은 지수 둘, 반도체 넷)이 그대로 나온다.
        picked[cls] = [(p.get("code") or p.get("name"))
                       for p in P.pick_products(u["상품"], cls, 5)]

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
        "defaultPick": picked,
        "refWeights": P.PROFILES[3]["w"],
        # 자산군 이름이 아니라 **노출**로 셈하는 기대수익률 가정.
        "cma": cma_table, "cmaGenerated": cma_gen,
        "cmaMethod": "빌딩블록",
        "expoClasses": EXP.CLASSES,
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

/* hero — 낮게. 제안서는 표와 숫자를 보는 화면이라 머리가 클 까닭이 없다. */
.hero{background:var(--orange);color:#fff;padding:22px 0 20px}
.hero .page{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
.hero h1{font-size:28px;font-weight:700;line-height:1.2;letter-spacing:-.3px;margin:0}
.hero p{font-size:16px;margin:4px 0 0;opacity:.95}
.tag{font-size:13px;letter-spacing:.6px;opacity:.9;margin:0 0 4px;display:block}
@media(max-width:768px){.hero{padding:18px 0 16px}.hero h1{font-size:23px}.hero p{font-size:15px}}

/* 도구 막대 — 히어로 바로 아래 붙여 두고 스크롤해도 따라온다.
   단추가 화면 곳곳에 흩어져 있으면 무엇을 누를 수 있는지 알 수 없다. */
.toolbar{position:sticky;top:0;z-index:20;background:#fff;
  border-bottom:1px solid var(--hair);padding:10px 0}
.toolbar .page{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.toolbar .sep{flex:1 1 auto}
.toolbar .now{font-size:15px;color:var(--muted);white-space:nowrap}

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
/* 첫 섹션까지 104px 를 띄우면 도구줄 밑이 텅 빈 채로 시작한다. 섹션 사이
   간격은 브랜드 규격이므로 그대로 두고, 맨 위만 좁힌다. */
.page>.section:first-of-type{margin-top:44px}
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

/* 고른 까닭 — 상품 줄 바로 아래에 붙는 한 줄. 표를 넓히지 않으려고 칸을
   늘리는 대신 줄을 하나 더 둔다(칸이 열이면 인쇄가 오른쪽에서 잘린다). */
tr.why td{background:var(--subtle);border-top:0;color:var(--muted);
  font-size:14px;padding:6px 12px 9px}
tr.why:hover td,tbody tr.why:hover{background:var(--subtle)}
tr.why .lbl{display:inline-block;min-width:62px;color:var(--muted2);font-size:12px;
  letter-spacing:.02em;margin-right:6px}
tr.why strong{color:var(--ink);font-weight:700}
tr.why .score{float:right;color:var(--muted2);font-variant-numeric:tabular-nums}
/* 몇 해를 잰 값인지 숫자 옆에 작게. 「연평균 21.5%%」만 적으면 그것이 1 해인지
   5 해인지 알 수 없는데, 그 둘은 무게가 전혀 다르다. */
.win{display:inline-block;margin-left:4px;color:var(--muted2);font-size:12px}
.tier{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:9px;
  font-size:11px;font-weight:700;white-space:nowrap;vertical-align:1px}
.tier.t1{background:#FDEBD8;color:#8A4B00}
.tier.t2{background:#E8EEF6;color:#2A4E7E}
.tier.t3{background:#EFEFEF;color:#6B6B6B}

/* 한눈에 보는 판 — 도넛 + 묶음 요약 */
.overview{display:grid;grid-template-columns:320px 1fr;gap:28px;align-items:start;
  margin-top:var(--space-block)}
@media(max-width:860px){.overview{grid-template-columns:1fr}}
.donutbox{border:1px solid var(--hair);border-radius:4px;padding:20px;text-align:center}
.donutbox svg{width:100%;max-width:260px;height:auto}
.donut-mid{font-size:13px;fill:var(--muted)}
.donut-big{font-size:22px;font-weight:700;fill:var(--ink)}
.legend{display:flex;flex-direction:column;gap:6px;margin-top:14px;text-align:left}
.legend div{display:flex;align-items:center;gap:8px;font-size:15px}
.legend i{width:12px;height:12px;flex:0 0 12px;display:inline-block}
.legend .v{margin-left:auto;font-weight:600;color:var(--ink)}
.groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px}
.gcard{border:1px solid var(--hair);border-radius:4px;padding:16px}
.gcard .lb{font-size:14px;color:var(--muted);margin:0 0 4px;letter-spacing:.4px}
.gcard .v{font-size:28px;font-weight:700;color:var(--blue);margin:0;line-height:1.1}
.gcard .sub{font-size:13px;color:var(--muted2);margin:4px 0 0}
.gbar{height:8px;background:var(--soft);margin-top:10px;display:flex}
.gbar span{height:100%}

/* 인쇄용 머리글·꼬리글은 화면에서 감춘다. printhead 를 감추지 않았더니
   히어로 바로 밑에 제목이 한 번 더 찍히고, 그 사이가 텅 빈 채로 보였다 —
   「맨 위 높이가 너무 크다」의 정체가 이것이었다. 화면에서는 같은 요약을
   도구줄의 #toolNow 가 이미 보여 준다. */
.printonly,.printhead,.pct{display:none}
/* 실제 노출 범례는 여섯 군이라 가로로 편다 */
.legend.wide{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px 18px;margin:14px 0 0}

/* **KO/EN 은 둘 중 하나만 보인다.** 이 두 줄이 없어서 「자산배분 제안서Asset
   Allocation Proposal」처럼 두 말이 붙어 나왔다. 단추는 있는데 아무 일도
   일어나지 않는 화면이었다. */
html[lang="ko"] [data-en]{display:none}
html[lang="en"] [data-ko]{display:none}

/* 고쳐 쓰는 칸 — 비중 조정·상품 빼기 */
.wIn{width:82px;padding:5px 8px;font-size:16px;text-align:right;
  border:1px solid var(--hair);border-radius:2px;background:#FFF7E6;color:#0000FF;
  font-weight:600;font-variant-numeric:tabular-nums}
.wIn:focus{outline:2px solid var(--orange);outline-offset:1px}
.wIn.off{background:#fff;color:var(--muted);font-weight:400}
.total.bad td{background:#F8D7D7}
.warnline{color:var(--err);font-weight:600}
.xbtn{border:1px solid var(--hair);background:#fff;color:var(--muted);
  border-radius:2px;width:26px;height:26px;line-height:1;cursor:pointer;font-size:15px}
.xbtn:hover{background:#F8D7D7;color:var(--err);border-color:var(--err)}
.addrow{display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap}
.addrow select{flex:1 1 320px;min-width:0;font-size:16px;padding:8px 10px}
.addrow .btn{height:38px;padding:8px 16px;font-size:15px}
.edited{font-size:14px;color:var(--orange);font-weight:600}
@media print{
  @page{ size:A4 portrait; margin:13mm 12mm; }
  .lang,.noprint,.tools,.toolbar,.xbtn,.addrow{display:none!important}
  .printonly{display:block}
  .hero{display:none!important}
  .printhead{display:block;margin:0 0 10pt}
  .printhead h1{font-size:19pt;margin:0 0 3pt;color:#000}
  .printhead .meta{font-size:9.5pt;color:#333}
  body{font-size:9.5pt;line-height:1.45;color:#000}
  .page{max-width:100%;padding:0}
  /* 구간 사이 여백을 줄여 쪽이 헤프게 넘어가지 않게 한다 */
  .section{margin-top:16pt}
  .section-title{font-size:13pt;margin-bottom:8pt}
  h3{font-size:11pt;margin:10pt 0 4pt}
  .stats,.groups{gap:8pt;margin-top:10pt}
  .stat,.gcard{padding:8pt;border-radius:0}
  .stat .v{font-size:17pt}
  .gcard .v{font-size:15pt}
  .stat .lb,.gcard .lb{font-size:8.5pt}
  .stat .sub,.gcard .sub{font-size:7.5pt}
  .overview{grid-template-columns:230px 1fr;gap:12pt;margin-top:10pt}
  .bars{margin-top:10pt}
  .bar-row{padding:2pt 0}
  /* **표가 종이보다 넓으면 문서 전체가 넓어진다.** 상품 표는 열이 아홉이라
     최소 너비가 A4 폭을 넘었고, 그러자 본문 폭이 그 표에 맞춰 늘어나면서
     카드·묶음이 통째로 오른쪽으로 삐져나가 잘렸다 — 표 하나 때문에 쪽 전체가
     밀린 것이다. 글자를 끊을 수 있게 해 최소 너비를 줄인다. */
  html,body{width:100%}
  .page{width:100%}
  table{font-size:8.5pt;margin-top:6pt;width:100%}
  /* 끊는 것은 **긴 상품명만**이다. 숫자 칸까지 끊었더니 「400만원」이
     「400만 / 원」으로, 보수가 「0.16~1.3 / 6%」로 갈라져 읽을 수 없었다. */
  th,td{padding:3pt 5pt}
  td:first-child,th:first-child{overflow-wrap:anywhere;word-break:break-word}
  td.num,th.num{white-space:nowrap}
  /* 칸 수를 못 박는다. auto-fit 은 본문 폭을 잘못 잡으면 칸을 안 줄인다. */
  .stats{grid-template-columns:repeat(4,1fr)}
  .groups{grid-template-columns:repeat(2,1fr)}
  .note{padding:6pt 10pt;margin:8pt 0;font-size:9pt}
  .caption{font-size:8pt}
  /* 고른 까닭은 인쇄물에도 남긴다 — 고객이 들고 가는 것은 이 종이다. */
  tr.why td{font-size:7.5pt;padding:2pt 5pt 4pt;background:#F7F8FA}
  tr.why .lbl{min-width:0}
  .tier{font-size:6.5pt;padding:0 3pt}
  .win{font-size:6.5pt}
  .wIn{border:0;background:#fff;color:#000;padding:0;width:auto;font-weight:600;
    -webkit-appearance:none;appearance:none}
  /* 인쇄물에서는 입력칸이 아니라 숫자다. % 가 없으면 「5.0」이 무엇인지 모른다. */
  .pct{display:inline}
  .tbl-wrap{overflow:visible}

  /* **쪽이 잘리거나 밀리지 않게.** 표·카드·묶음은 통째로 한 쪽에 둔다. */
  .stat,.gcard,.donutbox,.note,.bar-row,tr{page-break-inside:avoid;break-inside:avoid}
  table{page-break-inside:auto}
  thead{display:table-header-group}
  tfoot{display:table-footer-group}
  h2,h3{page-break-after:avoid;break-after:avoid}
  .section{page-break-inside:auto}
  .prodblock{page-break-inside:avoid;break-inside:avoid}
  /* **쪽을 새로 열지 않는다.** 강제로 넘겼더니 유의사항 몇 줄을 위해 빈 쪽이
     한 장 더 나왔다. 자리가 있으면 이어 붙이고, 없을 때만 넘어가게 둔다. */
  .printfoot{margin-top:14pt;page-break-inside:avoid;break-inside:avoid}
  .printfoot ul{margin:6pt 0 0;padding-left:14pt}
  .printfoot li{font-size:8.5pt;line-height:1.5;margin-bottom:3pt}
  .printfoot p{font-size:9pt;margin:0}
  #printSrc{font-size:8pt;color:#444;margin-top:8pt}
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

<div class="toolbar noprint">
  <div class="page">
    <button class="btn primary" id="btnPrint">
      <span data-ko>인쇄</span><span data-en>Print</span></button>
    <button class="btn" id="btnPdf">
      <span data-ko>PDF 저장</span><span data-en>Save PDF</span></button>
    <button class="btn" id="btnCsv">
      <span data-ko>CSV</span><span data-en>CSV</span></button>
    <span class="sep"></span>
    <span class="now" id="toolNow"></span>
    <button class="btn" id="btnLink">
      <span data-ko>링크 복사</span><span data-en>Copy link</span></button>
    <button class="btn" id="btnWeights" style="display:none">
      <span data-ko>비중 되돌리기</span><span data-en>Reset weights</span></button>
    <button class="btn" id="btnReset">
      <span data-ko>처음으로</span><span data-en>Reset</span></button>
  </div>
</div>

<div class="page">

  <div class="printhead">
    <h1>자산배분 제안서</h1>
    <div class="meta" id="printMeta"></div>
  </div>

  <section class="section noprint">
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
    <div class="overview">
      <div class="donutbox">
        <div id="donut"></div>
        <div class="legend" id="legend"></div>
      </div>
      <div>
        <div class="groups" id="groups"></div>
        <div class="bars" id="bars"></div>
      </div>
    </div>
    <div class="note">
      <strong data-ko>아래 「실제 노출」이 이 제안의 내용입니다.</strong>
      <strong data-en>The "actual exposure" below is what this proposal really holds.</strong>
      <span data-ko>위 자산군 이름(국내ETF·해외펀드…)은 <strong>포장지</strong>입니다 —
        국내에 상장된 미국 지수 ETF 는 이름은 「국내ETF」지만 담긴 것은 미국 주식입니다.
        아래는 지금 고른 상품이 실제로 무엇에 투자하는지를 다시 센 값이며,
        상품을 바꾸면 함께 바뀝니다.</span>
      <span data-en>Asset-class labels are wrappers; this is recomputed from what the
        selected products actually hold.</span>
    </div>
    <div class="legend wide" id="realExpo"></div>
    <div id="planNotes"></div>
    <div class="tbl-wrap"><table id="allocTbl"></table></div>
    <p class="hint" id="sumWarn"></p>

    <div class="stats" id="stats"></div>
    <div class="note" id="coverNote"></div>
  </section>

  <section class="section">
    <div class="section-rule"></div>
    <h2 class="section-title"><span data-ko>3. 제안 상품</span><span data-en>3. Suggested products</span></h2>
    <p class="caption"><span data-ko><strong>여러 해의 위험조정 성과로 고릅니다.</strong>
      1·3·5 해의 연평균 수익률, 연변동성, 최대낙폭, 보수, 그리고 창이 바뀌어도
      성과가 유지되는지를 함께 보아 점수를 냅니다. 지난해 수익률 순으로도,
      규모 순으로도 고르지 않습니다 — 규모는 문턱일 뿐입니다.</span>
      <span data-en>Ranked by multi-year risk-adjusted score, not by past return or size.</span></p>
    <div class="note"><span data-ko><strong>「고른 까닭」은 실제로 잰 값입니다.</strong>
      상품 이름 옆의 꼬리표가 무엇을 쟀는지 말합니다 —
      <span class="tier t1">다년 실측</span> 5·3·1 해를 모두 재어 견준 것,
      <span class="tier t2">1해 실측</span> 1 해치 시세만 있어 다년 비교를 못 한 것,
      <span class="tier t3">미측정</span> 시세가 없어 변동성·낙폭을 아예 못 잰 것(펀드).
      <strong>잰 상품이 넉넉하면 미측정 상품은 후보에서 뺍니다</strong> —
      수익률만 있고 위험이 없는 것을 위에 올리면 그것이 바로 수익률 추종입니다.
      적힌 수치는 모두 지나간 실적이며 미래 수익률이 아닙니다.</span>
      <span data-en>Tags state what was measured: multi-year, one year, or unmeasurable
      (funds, whose source gives only seven trading days).</span></div>
    <div id="products"></div>
  </section>

  <section class="section noprint">
    <div class="section-rule"></div>
    <h2 class="section-title"><span data-ko>4. 자산군 실측치</span><span data-en>4. Measured by asset class</span></h2>
    <div class="tbl-wrap"><table>
      <thead><tr><th>자산군</th><th class=num>종목</th><th class=num>수익률 산출</th>
      <th class=num>과거 1년(중앙)</th><th class=num>변동성(중앙)</th><th class=num>최대낙폭(중앙)</th></tr></thead>
      <tbody>%(stats)s</tbody></table></div>
    <p class="caption">— 는 원천에 없어 셈하지 않은 것입니다. 만들어 넣지 않습니다.
      펀드는 달 간격 기준가로 셈합니다 — 일봉보다 거칠어 최대낙폭이 다소 얕게 나옵니다.</p>
  </section>

  <section class="section noprint">
    <div class="section-rule"></div>
    <h2 class="section-title"><span data-ko>5. 자료 출처</span><span data-en>5. Sources</span></h2>
    <div class="tbl-wrap"><table>
      <thead><tr><th>자산군</th><th>원천</th><th class=num>종목</th><th>기준일</th><th>비고</th></tr></thead>
      <tbody>%(srcs)s</tbody></table></div>
  </section>

  <div class="printonly printfoot">
    <div class="section-rule"></div>
    <p><strong>유의사항</strong></p>
    <ul>
      <li>「과거 1년」은 원천에서 실제로 잰 값이며 <strong>미래 수익률이 아닙니다.</strong>
          최근 1년이 그랬다는 것과 앞으로 그러리라는 것은 다른 말입니다.</li>
      <li>빈칸(—)은 원천에 없어 셈하지 않은 값입니다. 만들어 넣지 않았습니다.</li>
      <li>변동성은 자산군 사이 상관관계를 셈하지 않은 가중합이라 실제보다 높게 나옵니다.
          펀드는 달 간격 기준가로 셈해 결이 다르므로, 덮은 비중을 함께 적었습니다.</li>
      <li>「해외펀드」는 해외에 설정된 뮤추얼펀드가 아니라 <strong>해외에 투자하는 국내 설정
          공모펀드</strong>입니다.</li>
      <li>이 자료는 참고용이며 투자 권유가 아닙니다. 실제 제안 전 준법감시 검토를 받으십시오.</li>
    </ul>
    <p id="printSrc"></p>
  </div>

  <footer class="noprint">
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
// 묶음 막대가 쓰는 색. 예전에 이 세 이름을 안 만들어 두고 쓰는 바람에
// `ORANGE is not defined` 로 render() 가 통째로 죽었다 — 화면은 멀쩡해 보이고
// 값만 안 채워진다. node --check 는 문법만 보므로 이것을 못 잡는다.
const ORANGE = CHART[0], BLUE = CHART[1], SOFT_ORANGE = CHART[2];
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
// 근거 문구는 파이썬이 만든 것이고 「**…**」로 힘줌을 표시한다. 상품 이름이
// 섞이므로 태그를 먼저 죽이고 나서 힘줌만 되살린다.
const esc = s => String(s==null?'':s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
// 얼마나 잰 것인지 — 고객이 「연평균 3.4%%」와 「과거 1해 152%%」를 같은
// 무게로 읽으면 안 된다. 셋째 등급은 시세가 없어 위험을 아예 못 잰 것이다.
const TIER = {1:['다년 실측','5·3·1해를 모두 재어 견주었습니다'],
              2:['1해 실측','1 해치 시세만 있어 다년 비교를 못 했습니다'],
              3:['미측정','시세가 없어 변동성·낙폭을 못 쟀습니다 — 원천의 1해 수익률과 보수만 봅니다']};
const tier = p => { const t = TIER[p.tg]; return t
  ? `<span class="tier t${p.tg}" title="${t[1]}">${t[0]}</span>` : ''; };

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

// ── 사람이 고친 것 ──────────────────────────────────────────────────
//
// 제안은 출발점이고 조정이 실무의 본체다. 비중을 고치고 상품을 빼는 것은
// 여기서 한다.
//
// **배분 규칙 자체는 여전히 파이썬에만 있다.** 여기 있는 산수는 「고친 비중으로
// 가중합을 다시 낸다」뿐이고, 사람이 고치는 이상 화면에 없을 수 없다.
// 성향·기간을 바꾸면 고친 것을 버리고 그 성향의 제안값으로 돌아간다 —
// 안 그러면 어느 성향의 비중인지 알 수 없게 된다.
const S = { w:{}, sel:{}, q:{}, key:'' };

function planKey(){ return $('#risk').value + '|' + $('#yrs').value; }

function resetEdits(){
  S.w = {}; S.sel = {}; S.q = {}; S.key = planKey();
  D.classes.forEach(c=>{
    if(c==='현금') return;
    // **규칙이 고른 다섯**을 쓴다. 전체 목록의 앞 다섯을 자르면 집중·중복
    // 상한을 거치지 않은 규모 순이 나온다(반도체 넷, 같은 지수 둘).
    S.sel[c] = (D.defaultPick||{})[c] || (D.products[c]||[]).slice(0,5).map(p=>p.c||p.n);
  });
}

// 실제로 쓰는 비중 — 고친 값이 있으면 그것, 없으면 제안값.
function eff(c){
  const plan = D.plans[planKey()];
  return (S.w[c] === undefined || S.w[c] === null) ? (plan.w[c]||0) : S.w[c];
}
function effAll(){
  const o = {}; D.classes.forEach(c=>o[c]=eff(c)); return o;
}
function isEdited(){
  const plan = D.plans[planKey()];
  return D.classes.some(c=>S.w[c]!==undefined && Math.abs(S.w[c]-(plan.w[c]||0))>0.001);
}

// 고친 비중으로 지표를 다시 낸다. proposal_lib.portfolio 와 같은 셈이다 —
// 덮은 비중까지 같이 내는 것이 요점이다(못 잰 몫을 숨기지 않는다).
function metrics(w){
  const o = {ret:0, retCov:0, vol:0, volCov:0, mdd:0, mddCov:0, cash:w['현금']||0, sum:0};
  D.classes.forEach(c=>{
    const x = w[c]||0; o.sum += x;
    if(c==='현금' || x<=0) return;
    const st = D.stats[c]||{};
    const r=st['ret1y_중앙값'], v=st['vol_중앙값'], m=st['mdd_중앙값'];
    if(typeof r==='number'){ o.ret += r*x/100; o.retCov += x; }
    if(typeof v==='number'){ o.vol += v*x/100; o.volCov += x; }
    if(typeof m==='number'){ o.mdd += m*x/100; o.mddCov += x; }
  });
  return o;
}

// 도넛을 SVG 로 직접 그린다. 라이브러리를 부르면 한 파일로 여는 화면이
// 망에 기대게 된다 — 고객 앞에서 열 때 인터넷이 없을 수도 있다.
function donut(items, total){
  const R = 54, C = 2*Math.PI*R;
  let off = 0;
  const arcs = items.map(([c,v,col])=>{
    const len = total>0 ? C*v/total : 0;
    const el = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${col}"
      stroke-width="26" stroke-dasharray="${len} ${C-len}"
      stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${c} ${fmt(v,1)}%%</title></circle>`;
    off += len; return el;
  }).join('');
  return `<svg viewBox="0 0 140 140" role="img" aria-label="자산군 비중 도넛">
    <circle r="${R}" cx="70" cy="70" fill="none" stroke="#ECEFF4" stroke-width="26"/>
    ${arcs}
    <text x="70" y="66" text-anchor="middle" class="donut-mid">자산군</text>
    <text x="70" y="86" text-anchor="middle" class="donut-big">${items.length}</text>
  </svg>`;
}

// **자산군 이름이 아니라 담긴 것으로 센다.**
//
// 예전에는 「국내ETF」니까 국내, 「해외펀드」니까 해외 하는 식으로 이름을 보고
// 묶었다. 그런데 「국내ETF 15%%」에 TIGER 미국S&P500 이 들어 있으면 이름은
// 국내인데 고객 돈은 미국에 가 있다. 실제로 「국내 40%% · 해외 45%%」라고
// 인쇄된 제안서의 진짜 노출이 한국 주식 5%% · 해외 주식 57%% 였다.
//
// 그래서 **지금 골라 둔 상품의 노출**로 다시 센다. 상품을 바꾸면 이 숫자도
// 따라 바뀐다 — 그것이 맞다.
function sleeveExpo(c){
  const all = D.products[c]||[], key = p => p.c || p.n;
  const chosen = (S.sel[c]||[]).map(k=>all.find(p=>key(p)===k)).filter(Boolean);
  const o = {}; let n = 0;
  chosen.forEach(p=>{ if(!p.e) return; n++;
    Object.entries(p.e).forEach(([k,v])=>{ o[k]=(o[k]||0)+v; }); });
  if(!n) return null;
  Object.keys(o).forEach(k=>o[k]/=n);
  return o;
}
function realExpo(w){
  const o = {}; let unknown = 0;
  D.classes.forEach(c=>{
    const x = w[c]||0; if(x<=0) return;
    if(c==='현금'){ o['현금성']=(o['현금성']||0)+x; return; }
    const e = sleeveExpo(c);
    if(!e){ unknown += x; return; }
    Object.entries(e).forEach(([k,v])=>{ o[k]=(o[k]||0)+x*v; });
  });
  if(unknown>0.005) o['미배정']=unknown;
  return o;
}
// 노출 × 기대수익률 가정 → 포트폴리오 기대수익률. 덮은 비중도 함께 낸다.
function expoReturn(e){
  let t=0, cov=0;
  Object.entries(e||{}).forEach(([k,v])=>{
    const r = (D.cma||{})[k];
    if(typeof r === 'number'){ t += r*v/100; cov += v; }
  });
  return cov ? {ret:t, cov:cov} : {ret:null, cov:0};
}

function render(){
  if(planKey() !== S.key) resetEdits();
  const risk = $('#risk').value, yrs = $('#yrs').value;
  const amt = Number($('#amt').value||0);
  const plan = D.plans[planKey()];
  const w = effAll(), m = metrics(w);
  $('#amtHint').textContent = won(amt);
  const who = $('#client').value.trim();
  $('#printMeta').textContent =
    [who, D.profiles[risk].name, $('#yrs').selectedOptions[0].textContent, won(amt)]
      .filter(Boolean).join('  ·  ') + '   |   ' + D.generated + ' (KST)'
    + (isEdited() ? '   |   비중 조정됨' : '');
  $('#riskHint').textContent = D.profiles[risk].desc;

  $('#planNotes').innerHTML = plan.notes.map(n=>
    `<div class="note">${n.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</div>`).join('');

  const entries = D.classes.map((c,i)=>[c, w[c]||0,
                       c==='현금' ? CASH_COLOR : CHART[i%%CHART.length]])
                           .filter(e=>e[1]>0);
  // 한눈 판 — 도넛 · 범례 · 묶음 카드
  $('#donut').innerHTML = donut(entries, m.sum);
  $('#legend').innerHTML = entries.map(([c,x,col])=>
    `<div><i style="background:${col}"></i>${c}<span class="v">${fmt(x,1)}%%</span></div>`).join('');

  const RE = realExpo(w);
  const EXCOL = {'국내주식':ORANGE,'해외주식':BLUE,'국내채권':SOFT_ORANGE,
                 '해외채권':'#0086B8','대체':'#AD624E','현금성':CASH_COLOR,
                 '미배정':'#D7D7D7'};
  const sum2 = ks => ks.reduce((a,k)=>a+(RE[k]||0),0);
  const gcard = (lb, val, sub, parts) => `<div class="gcard">
      <p class="lb">${lb}</p><p class="v">${fmt(val,1)}%%</p>
      <p class="sub">${sub}</p>
      ${parts?`<div class="gbar">${parts}</div>`:''}</div>`;
  const seg = (v,col) => v>0 ? `<span style="width:${v}%%;background:${col}"></span>` : '';
  const er = expoReturn(RE);
  $('#groups').innerHTML = [
    gcard('주식', sum2(['국내주식','해외주식']),
          `국내 ${fmt(RE['국내주식']||0,1)}%% · 해외 ${fmt(RE['해외주식']||0,1)}%%`,
          seg(RE['국내주식']||0,ORANGE)+seg(RE['해외주식']||0,BLUE)
          +seg(100-sum2(['국내주식','해외주식']),'#ECEFF4')),
    gcard('채권', sum2(['국내채권','해외채권']),
          `국내 ${fmt(RE['국내채권']||0,1)}%% · 해외 ${fmt(RE['해외채권']||0,1)}%%`,
          seg(RE['국내채권']||0,SOFT_ORANGE)+seg(RE['해외채권']||0,'#0086B8')
          +seg(100-sum2(['국내채권','해외채권']),'#ECEFF4')),
    gcard('국내 자산', sum2(['국내주식','국내채권']),
          `해외 ${fmt(sum2(['해외주식','해외채권']),1)}%% · 대체 ${fmt(RE['대체']||0,1)}%% · 현금 ${fmt(RE['현금성']||0,1)}%%`,
          seg(sum2(['국내주식','국내채권']),ORANGE)
          +seg(sum2(['해외주식','해외채권']),BLUE)
          +seg(RE['대체']||0,'#AD624E')+seg(RE['현금성']||0,CASH_COLOR)),
    gcard('기대수익률 (가정)', er.ret==null?0:er.ret,
          er.ret==null ? '기대수익률 가정이 없습니다'
            : `${D.cmaMethod} 기준 · 노출의 ${fmt(er.cov,0)}%% 를 덮습니다`,
          seg(RE['국내주식']||0,ORANGE)+seg(RE['해외주식']||0,BLUE)
          +seg(RE['국내채권']||0,SOFT_ORANGE)+seg(RE['해외채권']||0,'#0086B8')
          +seg(RE['대체']||0,'#AD624E')+seg(RE['현금성']||0,CASH_COLOR)),
  ].join('');
  // 실제 노출을 숫자로도 적는다 — 카드만으로는 여섯 군이 다 안 보인다.
  const rex = $('#realExpo');
  if(rex) rex.innerHTML = Object.entries(RE).sort((a,b)=>b[1]-a[1])
    .map(([k,v])=>`<div><i style="background:${EXCOL[k]||'#ccc'}"></i>${k}`
      + `<span class="v">${fmt(v,1)}%%</span></div>`).join('');

  $('#toolNow').textContent =
    `${D.profiles[risk].name} · ${$('#yrs').selectedOptions[0].textContent} · ${won(amt)}`
    + (isEdited() ? ' · 조정됨' : '');
  $('#printSrc').textContent =
    `자료 기준 — ${D.sources && D.sources['펀드'] ? '펀드 '+(D.sources['펀드'].asOf||'') : ''}`
    + ` · 유니버스 ${D.universe_generated||''} · 문서 ${D.generated} (KST)`;

  $('#bars').innerHTML = entries.map(([c,x,col])=>`
    <div class="bar-row"><div class="nm">${c}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(x,100)}%%;background:${col}"></div></div>
      <div class="pc">${fmt(x,1)}%%</div></div>`).join('');

  // 배분 표 — 비중 칸은 **고칠 수 있다**
  const bad = Math.abs(m.sum-100) > 0.05;
  $('#allocTbl').innerHTML = `<thead><tr><th>자산군</th><th class=num>비중<span class="noprint"> (고칠 수 있음)</span></th>
    <th class=num>금액</th><th class=num>과거 1년(중앙)</th><th class=num>변동성(중앙)</th></tr></thead>
    <tbody>${D.classes.map(c=>{
      const st = D.stats[c]||{}, r = st['ret1y_중앙값'], v = st['vol_중앙값'];
      const x = w[c]||0;
      const changed = S.w[c]!==undefined && Math.abs(S.w[c]-(plan.w[c]||0))>0.001;
      return `<tr><td>${c}${changed?' <span class="edited">·수정</span>':''}</td>
        <td class=num><input class="wIn${changed?'':' off'}" type="number" step="0.5" min="0" max="100"
             data-c="${c}" value="${x.toFixed(1)}" aria-label="${c} 비중"><span class="pct">%%</span></td>
        <td class=num>${won(Math.round(amt*x/100))}</td>
        <td class="num${r==null?' na':''}">${r==null?'—':fmt(r)+'%%'}</td>
        <td class="num${v==null?' na':''}">${v==null?'—':fmt(v)+'%%'}</td></tr>`;
    }).join('')}
    <tr class="total${bad?' bad':''}"><td>합계</td>
      <td class=num>${fmt(m.sum,1)}%%</td><td class=num>${won(Math.round(amt*m.sum/100))}</td>
      <td class=num>${fmt(m.ret)}%%</td><td class=num>${fmt(m.vol)}%%</td></tr></tbody>`;
  $('#sumWarn').innerHTML = bad
    ? `<span class="warnline">비중 합계가 ${fmt(m.sum,1)}%% 입니다 — 100%% 로 맞추십시오.</span>
       금액과 지표는 적힌 비중 그대로 셈한 값이라 지금은 앞뒤가 맞지 않습니다.`
    : (isEdited() ? '제안값에서 고친 비중입니다. 합계는 100%% 입니다.' : '');
  $('#btnWeights').style.display = isEdited() ? '' : 'none';

  // 지표 — 고친 비중으로 다시 낸 값이다
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
      <p class="v">${fmt(m.ret)}%%</p>
      <p class="sub">미래 수익률이 아닙니다. 실적을 덮은 비중 ${fmt(m.retCov,0)}%%</p></div>
    <div class="stat"><p class="lb">변동성 (가중합)</p>
      <p class="v">${fmt(m.vol)}%%</p>
      <p class="sub">분산효과 제외 — 실제보다 높게 나옵니다. 덮은 비중 ${fmt(m.volCov,0)}%%</p></div>
    <div class="stat"><p class="lb">최대낙폭 (가중합)</p>
      <p class="v">${fmt(m.mdd)}%%</p>
      <p class="sub">덮은 비중 ${fmt(m.mddCov,0)}%%</p></div>
    <div class="stat"><p class="lb">현금</p>
      <p class="v o">${fmt(m.cash,1)}%%</p>
      <p class="sub">${won(Math.round(amt*m.cash/100))}</p></div>
    ${tgtCard}`;

  const cov = m.volCov;
  $('#coverNote').innerHTML = cov >= 99
    ? '<span data-ko>포트폴리오 전체의 변동성을 셈했습니다.</span>'
    : `<strong>변동성은 이 배분의 ${fmt(cov,0)}%%만 덮습니다.</strong>
       나머지 ${fmt(100-cov,0)}%%는 원천이 값을 주지 않아 셈하지
       않았습니다. 표에 적힌 변동성을 포트폴리오 전체의 값으로 읽지 마십시오.`;

  // 상품 — 채택한 것만 싣고, × 로 빼고, 아래에서 골라 넣는다
  $('#products').innerHTML = D.classes.filter(c=>c!=='현금' && (w[c]||0)>0).map(c=>{
    const all = D.products[c]||[];
    const key = p => p.c || p.n;
    const chosen = (S.sel[c]||[]).map(k=>all.find(p=>key(p)===k)).filter(Boolean);
    const rest = all.filter(p=>!(S.sel[c]||[]).includes(key(p)));
    const x = w[c]||0;
    const isStock = (c==='국내주식'||c==='해외주식');
    const caveat = isStock
      ? `<p class="caption"><strong>여러 해의 위험조정 성과로 추린 것이며, 종목 추천이 아닙니다.</strong>
         개별 종목 선정은 별도 상담 사항입니다. 적힌 연평균·변동성·최대낙폭은
         모두 <strong>지나간 실적</strong>이고, 앞으로도 그러리라는 뜻이 아닙니다.</p>` : '';
    const each = chosen.length ? Math.round(amt*x/100/chosen.length) : 0;
    const body = chosen.length ? `
      <div class="tbl-wrap"><table><thead><tr><th>상품</th><th>유형</th><th>운용/발행</th>
      <th class=num>연평균</th><th class=num>변동성</th><th class=num>최대낙폭</th><th class=num>보수</th>
      <th class=num>배분액</th><th class="noprint"></th></tr></thead><tbody>${chosen.map(p=>`<tr>
        <td>${p.n||p.c||''} ${tier(p)}</td><td>${p.t||'—'}</td><td>${p.co||'—'}</td>
        <td class="num${p.mc==null?' na':''}">${p.mc==null?'—':
          fmt(p.mc)+'%%<span class="win">'+p.my+'해</span>'}</td>
        <td class="num${p.mv==null?' na':''}">${p.mv==null?'—':fmt(p.mv)+'%%'}</td>
        <td class="num${p.md==null?' na':''}">${p.md==null?'—':fmt(p.md,0)+'%%'}</td>
        <td class="num${p.f1==null?' na':''}">${p.f1==null?'—':
          (p.f2!=null&&p.f2!==p.f1? fmt(p.f1,2)+'~'+fmt(p.f2,2):fmt(p.f1,2))+'%%'}</td>
        <td class=num>${won(each)}</td>
        <td class="noprint"><button class="xbtn" data-rm="${c}" data-k="${key(p)}"
            title="이 상품 빼기" aria-label="${(p.n||'')} 빼기">×</button></td>
      </tr>${p.wy?`<tr class="why"><td colspan="9"><span class="lbl">고른 까닭</span>
        ${md(p.wy)}${p.sc==null?'':`<span class="score">점수 ${fmt(p.sc*100,0)}</span>`}</td></tr>`:''}
      `).join('')}</tbody></table></div>`
      : `<div class="note"><strong>고른 상품이 없습니다.</strong>
         아래에서 골라 넣으십시오 — 비중 ${fmt(x,1)}%% 가 배분될 자리입니다.</div>`;
    // 615 종짜리 목록은 스크롤로 못 고른다. 이름·운용사·유형으로 걸러 낸다.
    const q = (S.q[c]||'').trim().toLowerCase();
    const hit = q ? rest.filter(p=>
          ((p.n||'')+' '+(p.co||'')+' '+(p.t||'')+' '+(p.c||'')).toLowerCase().includes(q))
        : rest;
    const adder = rest.length ? `
      <div class="addrow noprint">
        <input type="search" data-q="${c}" value="${(S.q[c]||'').replace(/"/g,'&quot;')}"
               placeholder="이름·운용사·유형으로 찾기 (전체 ${rest.length}종)"
               aria-label="${c} 상품 찾기" style="flex:1 1 260px">
        <select data-add="${c}" aria-label="${c} 상품 고르기">
          <option value="">${hit.length ? `고르기 — ${hit.length}종${
            hit.length>300?' 중 300종 표시':''}` : '찾는 상품이 없습니다'}</option>
          ${hit.slice(0,300).map(p=>`<option value="${key(p)}">${(p.n||p.c||'')}${
            p.mc==null?'':' · '+p.my+'해 연'+fmt(p.mc)+'%%'}${
            p.mv==null?'':' · 변동성 '+fmt(p.mv)+'%%'}${
            p.tg===3?' · 미측정':''}${p.co?' · '+p.co:''}</option>`).join('')}
        </select>
        <button class="btn" data-addbtn="${c}">넣기</button>
      </div>` : '';
    return `<div class="prodblock"><h3>${c} — ${fmt(x,1)}%% · ${won(Math.round(amt*x/100))}
              <span class="caption">(고른 ${chosen.length}종 · 한 종목당 ${won(each)})</span></h3>
            ${caveat}${body}</div>${adder}`;
  }).join('');
}

// 비중 칸을 고치면 바로 반영한다. 합계가 100 이 아니어도 막지 않는다 —
// 고치는 도중에는 당연히 어긋나고, 막으면 고칠 수가 없다. 대신 크게 적어 둔다.
document.addEventListener('input', e=>{
  const qc = e.target.dataset && e.target.dataset.q;
  if(qc !== undefined && qc !== null && e.target.type === 'search'){
    S.q[qc] = e.target.value;
    render();
    // 다시 그리면 포커스를 잃으므로 그 칸으로 되돌린다.
    const el = document.querySelector(`input[data-q="${qc}"]`);
    if(el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    return;
  }
  const c = e.target.dataset && e.target.dataset.c;
  if(!c || !e.target.classList.contains('wIn')) return;
  const v = Number(e.target.value);
  S.w[c] = isNaN(v) ? 0 : Math.max(0, Math.min(100, v));
  render(); remember();
});
document.addEventListener('click', e=>{
  const rm = e.target.dataset && e.target.dataset.rm;
  if(rm){ S.sel[rm] = (S.sel[rm]||[]).filter(k=>k!==e.target.dataset.k);
          render(); remember(); return; }
  const ab = e.target.dataset && e.target.dataset.addbtn;
  if(ab){
    const sel = document.querySelector(`select[data-add="${ab}"]`);
    if(sel && sel.value){ (S.sel[ab] = S.sel[ab]||[]).push(sel.value);
                          render(); remember();
                          toast('상품을 넣었습니다.'); }
    return;
  }
});

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
// CSV 는 **화면에서 고친 그대로**를 내보낸다.
//
// 예전에는 제안값(plan.w)과 처음 고른 상품(D.products)을 그대로 적었다. 비중을
// 고치고 상품을 빼도 CSV 에는 고치기 전 것이 실렸다 — 조정안 JSON(PPT 용도로
//  내보내던 것)이 조정 결과를 들고 있어서 가려져 있던 고장이다. PPT 를 접으면서
// 그 JSON 도 없앴으니 CSV 가
// 유일한 자료 내보내기가 된다. 고친 것이 안 나가면 안 된다.
function csv(){
  const risk=$('#risk').value, yrs=$('#yrs').value, amt=Number($('#amt').value||0);
  const who=$('#client').value.trim();
  const w = effAll(), m = metrics(w);
  const q = v => '"' + String(v==null?'':v).replace(/"/g,'""') + '"';
  const L = [];
  L.push(['자산배분 제안서'].map(q).join(','));
  L.push(['고객', who, '성향', D.profiles[risk].name,
          '기간', $('#yrs').selectedOptions[0].textContent,
          '투자금액(만원)', amt].map(q).join(','));
  L.push(['생성', D.generated + ' KST', '유니버스', D.universe_generated||'',
          '비중', isEdited()? '화면에서 조정함' : '성향 기준 제안값'].map(q).join(','));
  L.push('');
  L.push(['자산군','비중(%%)','금액(만원)','과거1년(중앙,%%)','변동성(중앙,%%)'].map(q).join(','));
  D.classes.forEach(c=>{
    const x = w[c]||0; if(x<=0) return;
    const st = D.stats[c]||{};
    L.push([c, x.toFixed(1), Math.round(amt*x/100),
            st['ret1y_중앙값']==null?'':st['ret1y_중앙값'].toFixed(1),
            st['vol_중앙값']==null?'':st['vol_중앙값'].toFixed(1)].map(q).join(','));
  });
  // **키 이름은 화면 쪽(metrics) 것을 쓴다.** 파이썬의 portfolio() 는 한글 키를
  // 내지만 화면의 metrics() 는 영문 키다. 한글 키를 그대로 옮겨 적었더니
  // CSV 단추가 통째로 죽었다 — 눌러도 아무 일도 안 일어난다.
  L.push(['합계', m.sum.toFixed(1), Math.round(amt*m.sum/100),
          m.ret.toFixed(1), m.vol.toFixed(1)].map(q).join(','));
  L.push(['실적 덮은 비중(%%)', m.retCov.toFixed(0),
          '변동성 덮은 비중(%%)', m.volCov.toFixed(0)].map(q).join(','));
  L.push('');
  L.push(['자산군','상품','유형','운용/발행','규모(원)','측정','잰 기간(해)',
          '연평균(%%)','변동성(%%)','최대낙폭(%%)','보수(%%)','배분액(만원)',
          '고른 까닭'].map(q).join(','));
  D.classes.forEach(c=>{
    const x = w[c]||0; if(x<=0 || c==='현금') return;
    const all = D.products[c]||[], key = p => p.c || p.n;
    const chosen = (S.sel[c]||[]).map(k=>all.find(p=>key(p)===k)).filter(Boolean);
    const each = chosen.length ? Math.round(amt*x/100/chosen.length) : '';
    chosen.forEach(p=>{
      L.push([c, p.n||p.c||'', p.t||'', p.co||'', p.s==null?'':p.s,
              (TIER[p.tg]||[''])[0], p.my==null?'':p.my,
              p.mc==null?'':p.mc.toFixed(1), p.mv==null?'':p.mv.toFixed(1),
              p.md==null?'':p.md.toFixed(0),
              p.f1==null?'':p.f1, each,
              (p.wy||'').replace(/\\*\\*/g,'')].map(q).join(','));
    });
  });
  L.push('');
  L.push([('「연평균」은 잰 기간의 연환산 수익률이며 실제로 잰 값입니다 — ' +
           '미래 수익률이 아닙니다. 「측정」이 미측정인 상품은 시세가 없어 ' +
           '변동성·최대낙폭을 못 쟀습니다. 빈칸은 원천에 없어 셈하지 않은 ' +
           '값입니다. 이 자료는 참고용이며 투자 권유가 아닙니다.')].map(q).join(','));
  return '\\ufeff' + L.join('\\r\\n');
}

$('#btnWeights').onclick = ()=>{ S.w = {}; render(); remember();
                                 toast('비중을 제안값으로 되돌렸습니다.'); };


// KO/EN — 단추만 있고 아무 일도 안 하던 것을 잇는다. 보이고 안 보이고는
// CSS 가 하고, 여기서는 html 의 lang 만 바꾼다.
function setLang(l){
  document.documentElement.lang = l;
  ['ko','en'].forEach(k=>$('#'+k).setAttribute('aria-checked', String(k===l)));
  try{ localStorage.setItem('mas-proposal-lang', l); }catch(e){}
}
$('#ko').onclick = ()=>setLang('ko');
$('#en').onclick = ()=>setLang('en');
try{ const l = localStorage.getItem('mas-proposal-lang'); if(l) setLang(l); }catch(e){}

$('#btnPrint').onclick = ()=>window.print();
// 브라우저에는 「PDF 로 저장」 API 가 없다. 인쇄 대화상자의 대상을 PDF 로
// 고르는 것이 그것이므로, 같은 대화상자를 열되 어디를 눌러야 하는지 알려 준다.
$('#btnPdf').onclick = ()=>{
  toast('인쇄 대화상자에서 대상을 「PDF로 저장」으로 고르십시오.');
  setTimeout(()=>window.print(), 700);
};
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


SMOKE = r"""
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
p.on('console', m => { if (m.type() === 'error'
    && !/ERR_CERT|ERR_NAME|net::/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.goto('file://' + process.argv[2]);
await p.waitForTimeout(700);
// 화면이 실제로 채워졌는지 — render() 가 죽으면 이 칸들이 빈 채로 남는다.
const filled = await p.evaluate(() => {
  const q = s => (document.querySelector(s)?.innerHTML || '').trim().length;
  return { donut: q('#donut'), legend: q('#legend'), groups: q('#groups'),
           bars: q('#bars'), alloc: q('#allocTbl'), prods: q('#products'),
           opts: Math.max(0, ...[...document.querySelectorAll('select[data-add]')]
                                 .map(s => s.options.length)) };
});
await b.close();
const empty = Object.entries(filled).filter(([, v]) => !v).map(([k]) => k);
console.log(JSON.stringify({ errs, filled, empty }));
process.exit(errs.length || empty.length ? 1 : 0);
"""


def smoke_js(path):
    """**화면을 실제로 띄워 본다.** `node --check` 는 문법만 본다 — 정의하지
    않은 이름을 쓰면 파싱은 멀쩡히 되고 브라우저에서만 죽는다. 실제로
    `ORANGE is not defined` 하나로 render() 가 통째로 멈춰, 틀은 다 보이는데
    도넛·표·상품이 전부 빈 화면이 나왔다. 그 꼴을 고객 앞에서 보지 않으려면
    기계가 한 번 열어 봐야 한다.

    playwright 가 없으면 건너뛴다 — 검사를 못 했다는 사실만 적는다.
    """
    import shutil
    import subprocess
    if not shutil.which("node"):
        return
    # **저장소 안에 놓는다.** /tmp 에 두면 노드가 그 자리를 기준으로 playwright
    # 를 찾다 못 찾고, 「playwright 가 없다」며 검사를 건너뛴다 — 설치돼 있는데도.
    runner = os.path.join(ROOT, ".proposal-smoke.mjs")
    with open(runner, "w", encoding="utf-8") as fp:
        fp.write(SMOKE)
    try:
        r = subprocess.run(["node", runner, path], cwd=ROOT,
                           capture_output=True, text=True, timeout=120)
    except (OSError, subprocess.TimeoutExpired) as exc:
        print("  (화면 띄우기 검사를 건너뜁니다 — %s)" % exc)
        return
    finally:
        os.remove(runner)
    if r.returncode != 0:
        if "Cannot find package 'playwright'" in r.stderr:
            print("  (playwright 가 없어 화면 띄우기 검사를 건너뜁니다)")
            return
        raise SystemExit("화면이 제대로 그려지지 않습니다:\n%s"
                         % (r.stdout + r.stderr)[:1200])
    print("  화면 띄우기 검사 통과 %s" % r.stdout.strip()[:160])


def main():
    data, u = build_data()
    html = render(data, u)
    check_js(html)
    with open(OUT, "w", encoding="utf-8") as fp:
        fp.write(html)
    smoke_js(OUT)
    print("자산군 %d · 상품 %d 종을 실었습니다."
          % (len(u["자산군"]), sum(len(v) for v in data["products"].values())))
    print("배분 %d 가지를 미리 셈해 넣었습니다 (성향 %d × 기간 %d)."
          % (len(data["plans"]), len(P.PROFILES), len(HORIZON_BUCKETS)))
    print("%s  (%.0f KB)" % (os.path.relpath(OUT, ROOT),
                             os.path.getsize(OUT) / 1024))


if __name__ == "__main__":
    main()
