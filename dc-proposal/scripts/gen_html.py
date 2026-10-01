# -*- coding: utf-8 -*-
"""퇴직연금 DC 제안서 — 위험자산 비중별 포트폴리오 (표지+30/50/70%).
HTML 4슬라이드(16:9). 미리보기 및 PDF print 소스. 데이터는 build_ppt.py와 동일."""
import html, io, os

OUT = "/home/user/work_1/dc-proposal/irp_proposal_preview.html"

# ---------------- 데이터 (보존된 사양) ----------------
ETF = {
 "반도체":     dict(name="TIGER 미국필라델피아반도체나스닥", grade="매우높은위험",
                   strat="미국 상장 반도체 시총 상위 30종목 · AI 인프라(전력·데이터센터) 실적 가시성 최선호"),
 "AI":        dict(name="TIGER 글로벌AI액티브", grade="높은위험",
                   strat="AI 성장 수혜 글로벌 기업에 액티브 투자 · 공급망 전반 확산 수혜"),
 "반도체TOP10": dict(name="TIGER 반도체TOP10", grade="매우높은위험",
                   strat="국내 반도체 시총 상위 10종목 · 메모리 부족·CAPEX 확산의 한국 반도체 집중 수혜"),
 "차이나":     dict(name="TIGER 차이나반도체FACTSET", grade="매우높은위험",
                   strat="중국·홍콩 상장 반도체 시총 상위 25종목 · H200 규제에 따른 반도체 자급·AI 인프라 수혜"),
}
# 기간별 수익률 (1개월, 3개월, 6개월, 1년) — 사용자 직접 제공
RETURNS = {
 "반도체":     ["-7.72","+36.51","+62.40","+133.88"],
 "AI":        ["-12.27","+23.93","+45.90","+94.51"],
 "반도체TOP10": ["-32.23","+3.82","+54.79","+198.59"],
 "차이나":     ["+19.25","+71.73","+71.26","+187.44"],
}
PORTS = [
 dict(tag="30%", risk=30, profile="안정추구형",
      desc="원금 안정성을 최우선으로, 위험자산은 최소한으로 가져가되 핵심 성장 테마에만 집중하는 포트폴리오",
      items=[("반도체",12),("AI",9),("반도체TOP10",9)]),
 dict(tag="50%", risk=50, profile="위험중립형",
      desc="수익과 안정의 균형. 안전자산 절반으로 변동성을 제어하며 성장 테마를 폭넓게 담는 포트폴리오",
      items=[("반도체",20),("AI",15),("반도체TOP10",11),("차이나",4)]),
 dict(tag="70%", risk=70, profile="수익추구형",
      desc="퇴직연금 위험자산 최대 한도(70%)를 활용해 반도체·AI 성장 테마의 수익 기회를 적극 추구하는 포트폴리오",
      items=[("반도체",28),("AI",22),("반도체TOP10",14),("차이나",6)]),
]
DEPOSIT = dict(gubun="예금", name="한국증권금융 정기예금", grade="매우낮은위험",
    strat="원리금보장 · 예금자보호(1인 1억원) · AAA 최고 신용등급 · 위험자산 변동성에 대한 안전판(확정금리) 역할",
    rate="3.70")

# 색상 (한국식: 상승=적색, 하락=청색)
NAVY="#142A4C"; ORANGE="#F26A1B"; GOLD="#F29F05"; SAFE="#2E6DB4"
RUP="#C0392B"; RDN="#1F6FB2"
GRADE_COLOR={"매우높은위험":"#B23A2E","높은위험":"#D06A1B","다소높은위험":"#D99A12",
             "보통위험":"#2E6DB4","낮은위험":"#2E8B6B","매우낮은위험":"#2E8B6B"}
# 표에 들어갈 짧은 등급 라벨(폭 절약) — 괄호로 원문 병기
GSHORT={"매우높은위험":"매우높음","높은위험":"높음","다소높은위험":"다소높음",
        "보통위험":"보통","낮은위험":"낮음","매우낮은위험":"매우낮음"}

def rc(v):  # 수익률 색
    v=v.strip()
    if v.startswith("+"): return RUP
    if v.startswith("-"): return RDN
    return "#555"

def esc(s): return html.escape(str(s))

# ---------------- 도넛(conic-gradient) ----------------
def donut(risk):
    safe=100-risk
    # 위험자산(오렌지) + 안전자산(네이비톤)
    return (f"background:conic-gradient({ORANGE} 0 {risk}%, {SAFE} {risk}% 100%);")

# ---------------- 슬라이드 빌드 ----------------
def content_slide(p):
    rows=[]
    # ETF 행
    for key,w in p["items"]:
        e=ETF[key]; r=RETURNS[key]
        gradcol=GRADE_COLOR.get(e["grade"],"#555")
        rets="".join(
            f'<td class="c-ret" style="color:{rc(x)}">{esc(x)}</td>' for x in r)
        rows.append(f"""
        <tr>
          <td class="c-gub">ETF</td>
          <td class="c-nm"><b>{esc(e['name'])}</b><span class="strat">{esc(e['strat'])}</span></td>
          <td class="c-grade"><span class="badge" style="background:{gradcol}">{esc(GSHORT[e['grade']])}</span></td>
          <td class="c-w">{w}</td>
          <td class="c-rate">–</td>
          {rets}
        </tr>""")
    # 예금 행
    d=DEPOSIT; dw=100-p["risk"]; gradcol=GRADE_COLOR[d["grade"]]
    rows.append(f"""
        <tr class="dep">
          <td class="c-gub">예금</td>
          <td class="c-nm"><b>{esc(d['name'])}</b><span class="strat">{esc(d['strat'])}</span></td>
          <td class="c-grade"><span class="badge" style="background:{gradcol}">{esc(GSHORT[d['grade']])}</span></td>
          <td class="c-w">{dw}</td>
          <td class="c-rate"><b>{esc(d['rate'])}</b></td>
          <td class="c-ret dash">–</td><td class="c-ret dash">–</td>
          <td class="c-ret dash">–</td><td class="c-ret dash">–</td>
        </tr>""")
    # 투자포인트
    points=[
        f"위험자산 {p['risk']}% / 안전자산 {100-p['risk']}% — <b>{esc(p['profile'])}</b>",
        "반도체·AI 성장 테마 집중, 예금으로 변동성 하단 방어",
        "예금은 원리금보장·예금자보호로 포트폴리오 안전판 역할",
    ]
    pts="".join(f"<li>{t}</li>" for t in points)
    etf_sum=sum(w for _,w in p["items"])
    return f"""
<figure class="slidewrap">
<div class="slide">
  <div class="band">
    <div class="band-l"><span class="kicker">퇴직연금 DC 포트폴리오 제안</span>
      <h2>위험자산 비중 {p['risk']}% · <span class="profile">{esc(p['profile'])}</span></h2></div>
    <div class="band-r">{p['tag']}</div>
  </div>
  <div class="body">
    <div class="left">
      <table class="tbl">
        <thead>
          <tr>
            <th rowspan="2">구분</th><th rowspan="2" class="h-nm">상품명 · 투자전략</th>
            <th rowspan="2">위험등급</th><th rowspan="2">비중<br>(%)</th>
            <th rowspan="2">금리<br>(연,%,세전)</th>
            <th colspan="4" class="h-ret">기간별 수익률 (%)</th>
          </tr>
          <tr><th>1개월</th><th>3개월</th><th>6개월</th><th>1년</th></tr>
        </thead>
        <tbody>{''.join(rows)}</tbody>
      </table>
      <p class="note">※ ETF 기간별 수익률은 고객 직접 확인 기준 · 기준일 별도 표기 · 과거 수익률이 미래 수익을 보장하지 않습니다.
         예금 금리는 세전 연이율(확정)이며 가입시점 고시금리 적용.</p>
    </div>
    <div class="right">
      <div class="donut-wrap">
        <div class="donut" style="{donut(p['risk'])}">
          <div class="donut-hole"><span class="dh-big">{p['risk']}<small>%</small></span><span class="dh-sub">위험자산</span></div>
        </div>
        <div class="legend">
          <span><i style="background:{ORANGE}"></i>위험자산(ETF) {p['risk']}%</span>
          <span><i style="background:{SAFE}"></i>안전자산(예금) {100-p['risk']}%</span>
        </div>
      </div>
      <div class="pts"><h3>투자 포인트</h3><ul>{pts}</ul></div>
      <div class="cards">
        <div class="card"><span class="ct">구성상품</span><span class="cv">ETF {len(p['items'])}+예금 1</span></div>
        <div class="card"><span class="ct">위험자산</span><span class="cv">{etf_sum}%</span></div>
        <div class="card"><span class="ct">예금금리</span><span class="cv">{DEPOSIT['rate']}%</span></div>
      </div>
    </div>
  </div>
  <div class="foot"><span>미래에셋증권 마포WM</span><span>퇴직연금 DC 제안서 · 2026년 7월</span></div>
</div>
</figure>"""

def cover():
    return f"""
<figure class="slidewrap">
<div class="slide cover">
  <div class="cv-top"><span class="cv-brand">미래에셋증권 마포WM</span></div>
  <div class="cv-mid">
    <div class="cv-rule"></div>
    <h1>퇴직연금 DC 제안서</h1>
    <p class="cv-sub">위험자산 비중별 포트폴리오 제안</p>
    <div class="cv-chips"><span>위험자산 30%</span><span>50%</span><span>70%</span></div>
  </div>
  <div class="cv-bot"><span>미래에셋증권 마포WM</span><span>2026년 7월</span></div>
</div>
</figure>"""

SLIDES = cover() + "".join(content_slide(p) for p in PORTS)

CSS = f"""
:root{{--navy:{NAVY};--orange:{ORANGE};--gold:{GOLD};--safe:{SAFE};}}
*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#eef1f5;font-family:"Malgun Gothic","맑은 고딕","Noto Sans KR","NanumGothic",sans-serif;
  color:#1b2430;padding:24px;}}
.intro{{max-width:1180px;margin:0 auto 14px;color:#415;font-size:14px;}}
.deck{{display:flex;flex-direction:column;gap:22px;max-width:1180px;margin:0 auto;}}
.cap{{font-size:12px;color:#889;margin:-14px 0 2px 2px;}}
.slidewrap{{margin:0;}}
.slide{{position:relative;width:100%;aspect-ratio:16/9;background:#fff;border-radius:10px;
  box-shadow:0 6px 24px rgba(20,42,76,.14);overflow:hidden;container-type:inline-size;}}

/* ===== 표지 ===== */
.cover{{background:
  radial-gradient(120% 90% at 85% 15%, rgba(242,106,27,.20), transparent 55%),
  linear-gradient(135deg,#0d1f3c 0%,var(--navy) 45%,#0a1a33 100%);
  background-color:var(--navy);color:#fff;display:flex;flex-direction:column;justify-content:space-between;}}
.cover .cv-top{{padding:5cqw 6cqw 0;}}
.cv-brand{{font-size:2.1cqw;letter-spacing:.18em;color:#cdd8ea;font-weight:700;}}
.cv-mid{{padding:0 6cqw;}}
.cv-rule{{width:9cqw;height:.7cqw;background:var(--orange);border-radius:2px;margin-bottom:3cqw;}}
.cover h1{{font-size:8.4cqw;font-weight:800;letter-spacing:-.01em;line-height:1.04;}}
.cv-sub{{margin-top:2.2cqw;font-size:3.4cqw;color:#d7deea;font-weight:500;}}
.cv-chips{{margin-top:4cqw;display:flex;gap:1.6cqw;}}
.cv-chips span{{border:1px solid rgba(255,255,255,.4);border-radius:40px;padding:1cqw 2.4cqw;
  font-size:2.3cqw;color:#eaf0f8;}}
.cv-chips span:first-child{{background:var(--orange);border-color:var(--orange);font-weight:700;}}
.cv-bot{{display:flex;justify-content:space-between;padding:0 6cqw 5cqw;font-size:2.3cqw;color:#b9c6dc;}}

/* ===== 본문 밴드 ===== */
.band{{height:10.5cqw;background:linear-gradient(100deg,var(--navy),#1d3a63);color:#fff;
  display:flex;align-items:center;justify-content:space-between;padding:0 4cqw;}}
.kicker{{font-size:1.8cqw;letter-spacing:.14em;color:#b9c6dc;font-weight:700;}}
.band h2{{font-size:3.2cqw;font-weight:800;margin-top:.3cqw;}}
.band .profile{{color:var(--gold);}}
.band-r{{font-size:5cqw;font-weight:800;color:#fff;background:var(--orange);
  padding:.5cqw 2.2cqw;border-radius:8px;line-height:1;}}

.body{{display:flex;gap:2.2cqw;padding:1.8cqw 3cqw 0.5cqw;height:calc(100% - 10.5cqw - 4.4cqw);}}
.left{{flex:1 1 65%;min-width:0;display:flex;flex-direction:column;}}
.right{{flex:0 0 30%;display:flex;flex-direction:column;gap:1.2cqw;}}

/* ===== 표 ===== */
.tbl{{width:100%;border-collapse:collapse;font-size:1.6cqw;table-layout:fixed;}}
.tbl th{{background:#eef2f8;color:var(--navy);font-weight:700;border:1px solid #d3dbe7;
  padding:.5cqw .2cqw;text-align:center;line-height:1.12;font-size:1.46cqw;}}
.tbl th.h-nm{{width:29%;}} .tbl th.h-ret{{background:#e7edf6;}}
.tbl td{{border:1px solid #dde3ec;padding:.32cqw .25cqw;text-align:center;vertical-align:middle;
  overflow:hidden;}}
.c-gub{{font-weight:700;color:var(--navy);width:5%;font-size:1.5cqw;}}
.c-nm{{text-align:left!important;width:29%;padding-left:.6cqw!important;}}
.c-nm b{{display:block;font-size:1.6cqw;color:#15233b;line-height:1.15;}}
.c-nm .strat{{display:block;margin-top:.22cqw;font-size:1.24cqw;color:#5a6676;line-height:1.26;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}}
.c-grade{{width:10%;}}
.badge{{display:inline-block;color:#fff;font-size:1.18cqw;font-weight:700;border-radius:20px;
  padding:.24cqw .66cqw;white-space:nowrap;}}
.c-w{{width:6%;font-weight:800;color:var(--navy);font-size:2cqw;}}
.c-rate{{width:8%;color:#1b2430;font-size:1.5cqw;}}
.c-ret{{width:10.5%;font-weight:700;font-size:1.36cqw;font-variant-numeric:tabular-nums;white-space:nowrap;}}
.c-ret.dash,.c-rate.dash{{color:#9aa4b2;font-weight:400;}}
tr.dep td{{background:#f3f8f4;}}
tr.dep .c-nm b{{color:#1d5b43;}}
.note{{margin-top:.8cqw;font-size:1.16cqw;color:#7a8595;line-height:1.38;}}

/* ===== 우측 패널 ===== */
.donut-wrap{{background:#f7f9fc;border:1px solid #e4e9f1;border-radius:10px;padding:.8cqw;
  display:flex;flex-direction:column;align-items:center;}}
.donut{{width:10.2cqw;height:10.2cqw;border-radius:50%;position:relative;}}
.donut-hole{{position:absolute;inset:26%;background:#fff;border-radius:50%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  box-shadow:inset 0 0 0 1px #eceff4;}}
.dh-big{{font-size:3.2cqw;font-weight:800;color:var(--navy);line-height:1;}}
.dh-big small{{font-size:1.5cqw;}}
.dh-sub{{font-size:1.15cqw;color:#6b7686;margin-top:.15cqw;}}
.legend{{margin-top:.7cqw;display:flex;flex-direction:column;gap:.35cqw;font-size:1.28cqw;}}
.legend span{{display:flex;align-items:center;gap:.6cqw;color:#445060;}}
.legend i{{width:1.3cqw;height:1.3cqw;border-radius:3px;display:inline-block;}}
.pts{{background:#fff;border:1px solid #e4e9f1;border-radius:10px;padding:1cqw 1.2cqw;}}
.pts h3{{font-size:1.64cqw;color:var(--navy);margin-bottom:.5cqw;border-left:3px solid var(--orange);
  padding-left:.9cqw;}}
.pts ul{{list-style:none;display:flex;flex-direction:column;gap:.45cqw;}}
.pts li{{position:relative;padding-left:1.5cqw;font-size:1.3cqw;color:#374250;line-height:1.28;}}
.pts li:before{{content:"";position:absolute;left:.3cqw;top:.48cqw;width:.66cqw;height:.66cqw;
  background:var(--orange);border-radius:50%;}}
.cards{{display:flex;gap:.7cqw;}}
.card{{flex:1;background:var(--navy);color:#fff;border-radius:8px;padding:.65cqw .3cqw;
  display:flex;flex-direction:column;align-items:center;gap:.2cqw;}}
.card .ct{{font-size:1.1cqw;color:#b9c6dc;}}
.card .cv{{font-size:1.42cqw;font-weight:800;}}

.foot{{position:absolute;bottom:0;left:0;right:0;height:4.4cqw;background:#f4f6fa;
  border-top:1px solid #e3e8f0;display:flex;align-items:center;justify-content:space-between;
  padding:0 4cqw;font-size:1.4cqw;color:#7a8595;}}
.foot span:first-child{{font-weight:700;color:var(--navy);}}

/* ===== 인쇄(PDF) ===== */
@media print{{
  @page{{ size:13.333in 7.5in; margin:0; }}
  html,body{{background:#fff;padding:0;margin:0;}}
  .intro,.cap{{display:none !important;}}
  .deck{{gap:0;max-width:none;}}
  .slide{{border-radius:0;box-shadow:none;width:13.333in;height:7.5in;aspect-ratio:auto;}}
  .slidewrap{{break-after:page;page-break-after:always;}}
  .slidewrap:last-child{{break-after:auto;page-break-after:auto;}}
}}
"""

DOC = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>퇴직연금 DC 제안서</title><style>{CSS}</style></head>
<body>
<div class="intro">퇴직연금 DC 제안서 — 위험자산 비중별 포트폴리오(표지 + 30% / 50% / 70%). 미래에셋증권 마포WM · 2026년 7월</div>
<div class="deck">{SLIDES}</div>
</body></html>"""

with open(OUT,"w",encoding="utf-8") as f:
    f.write(DOC)
print("wrote", OUT, len(DOC), "bytes")
