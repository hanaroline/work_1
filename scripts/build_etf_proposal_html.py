#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""월배당 ETF 고객제안서를 **HTML 한 장**으로 만든다.

엑셀판(`build_etf_proposal.py`)과 같은 자료, 같은 식을 쓴다. 두 파일이 서로
다른 숫자를 내놓으면 하나만 있는 것보다 나쁘므로, 계산식은 아래 CALC 주석에
엑셀 쪽 수식과 나란히 적어 두었고 검사기가 두 결과를 맞춰 본다
(`scripts/check_etf_html.mjs`).

왜 HTML 도 만드나
    엑셀은 담당자가 만지는 도구고, HTML 은 고객에게 보내는 장이다. 브라우저만
    있으면 열리고, 인쇄와 PDF 저장이 그 자리에서 되고, 휴대전화에서도 읽힌다.
    엑셀을 못 여는 자리(사내 메일 미리보기, 태블릿)가 실제로 있다.

자료는 파일 안에 박아 넣는다. 한 파일만 보내면 그대로 열린다 — 외부에서
무엇을 받아 오지 않으므로 망가질 일도, 기다릴 일도 없다.

디자인은 미래에셋 기준(mas-design)을 따른다. 오렌지 #F58220 / 블루 #043B72,
1px 오렌지 섹션 룰, 표 머리 #FAB072, 날카로운 모서리, 그라데이션·이탤릭 없음.

쓰기: python scripts/build_etf_proposal_html.py [원천json] [출력html]
"""
from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "data" / "cc_etf.json"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "docs" / "etf-proposal.html"

COMPARE_YIELD = 8
COMPARE_AUM = 6


def load():
    if not SRC.exists():
        sys.exit(f"[중단] {SRC} 가 없습니다. 먼저 수집기를 돌리십시오.")
    data = json.loads(SRC.read_text(encoding="utf-8"))
    if not [x for x in data.get("items", []) if x.get("adopted")]:
        sys.exit("[중단] 채택된 종목이 0건입니다. 빈 제안서를 만들지 않습니다.")
    return data


def freq_label(x):
    f = x.get("payoutFreq")
    if not f:
        return ""
    return "판정 불가" if f.startswith("판정 불가") else f


def main():
    data = load()
    items = data["items"]
    by_yield = lambda x: -(x.get("distTtmRate") or 0)  # noqa: E731

    adopted = sorted([x for x in items if x.get("adopted")], key=by_yield)
    # 고를 수 있는 종목 — 엑셀 드롭다운과 **같은 규칙**이다. 연 분배율을 낼 수
    # 없는 종목은 뺀다. 이 문서의 모든 값이 "실투자금 × 연 분배율 ÷ 12" 이라
    # 그 값이 없으면 0원이 나오는데, 0원은 "분배를 안 한다" 는 거짓말이 된다.
    usable_rejected = sorted(
        [x for x in items
         if not x.get("adopted") and x.get("dataComplete") is not False
         and (x.get("price") or 0) > 0 and x.get("distTtmRate") is not None],
        key=by_yield,
    )
    selectable = adopted + usable_rejected

    # 비교표는 월배당으로 한정한다. 월 얼마를 받는지 견주라고 만든 표에 연 1회
    # 배당을 올리면 표가 제 뜻을 잃는다. 다른 주기는 아래 '종목 조회' 에서 본다.
    monthly_adopted = [x for x in adopted if (x.get("payoutFreq") or "") == "월배당"]
    pool_cmp = monthly_adopted or adopted
    cmp_yield = pool_cmp[:COMPARE_YIELD]
    cmp_aum = sorted(
        [x for x in pool_cmp if (x.get("assetClassCode") or "") != "0108"],
        key=lambda x: -(x.get("aum") or 0),
    )[:COMPARE_AUM]
    seen, compare = set(), []
    for x in cmp_yield + cmp_aum:
        if x["code"] not in seen:
            seen.add(x["code"])
            compare.append(x)
    compare.sort(key=by_yield)

    # 기본 선택 — 엑셀과 같은 규칙. 월배당을 먼저 고른다. 안 걸면 "순자산 최대"
    # 가 연 1회 배당하는 대형 지수 ETF 를 뽑는다.
    not_parking = [x for x in (monthly_adopted or adopted) if (x.get("assetClassCode") or "") != "0108"]
    default = max(not_parking or monthly_adopted or adopted, key=lambda x: (x.get("aum") or 0))

    payload = {
        "asOf": data.get("asOf") or (data.get("collectedAt") or "")[:10],
        "rules": data.get("rules", {}),
        "universe": data.get("universe"),
        "adoptedCount": len(adopted),
        "defaultCode": default["code"],
        "items": [
            {
                "code": x["code"], "name": x["name"], "manager": x.get("manager") or "",
                "price": x.get("price"), "aum": x.get("aum"), "turnover60": x.get("turnover60"),
                "expense": x.get("expenseRatio"), "vol": x.get("volatility"),
                "ttm": x.get("distTtmRate"), "freq": freq_label(x),
                "count12m": x.get("payoutCount12m"), "type": x.get("type") or "",
                "asset": x.get("assetClass") or "", "adopted": bool(x.get("adopted")),
                "why": x.get("excludeReason") or "", "lastDiv": x.get("lastDistDate") or "",
                "index": x.get("index") or "",
                # 과세비율. 못 구한 종목은 1(전액 과세)로 둔다 — 모를 때는
                # 세금을 많이 매기는 쪽으로 기운다.
                "taxR": 1.0 if x.get("taxableRatio") is None else x["taxableRatio"],
            }
            for x in selectable
        ],
        "compare": [x["code"] for x in compare],
    }

    vol_note = "1년"
    dd = [x.get("volatilityDays") for x in adopted if x.get("volatilityDays")]
    if dd and min(dd) < 200:
        vol_note = f"최소 {min(dd)}거래일"

    html = PAGE.replace("__DATA__", json.dumps(payload, ensure_ascii=False))
    html = html.replace("__ASOF__", payload["asOf"] or "")
    html = html.replace("__TODAY__", date.today().isoformat())
    html = html.replace("__VOLNOTE__", vol_note)
    html = html.replace("__MINAUM__", f'{payload["rules"].get("minAum", 0) / 1e8:,.0f}')
    html = html.replace("__MINTO__", f'{payload["rules"].get("minTurnover", 0) / 1e8:,.0f}')
    html = html.replace("__MAXVOL__", str(payload["rules"].get("maxVol", "")))
    html = html.replace("__NSEL__", str(len(selectable)))
    html = html.replace("__NADOPT__", str(len(adopted)))
    html = html.replace("__NUNIV__", str(data.get("universe") or len(items)))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"만들었습니다: {OUT}  (고를 수 있는 종목 {len(selectable)} / 채택 {len(adopted)})")


# ══════════════════════════════════════════════════════════════════════
# 한 장짜리 HTML. 자료는 __DATA__ 자리에 박아 넣는다.
PAGE = r"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>월배당 ETF 투자 제안서</title>
<!-- 글꼴은 **PC에 깔린 것을 먼저 쓰고**, 없을 때만 구글 폰트를 받는다.
     이 문서는 인터넷이 없는 자리에서도 열려야 하고(사내망·출장·고객 사무실),
     고객에게 메일로 보내는 파일이라 무거워도 안 된다. 그래서 글꼴을 파일 안에
     심지 않는다 — 한글 웹폰트는 굵기마다 메가바이트 단위라 제안서 한 장이
     몇 MB가 된다.
     media="print" 로 받아 놓고 다 받으면 all 로 바꾼다. 이러면 이 요청이
     **첫 화면을 붙잡지 못한다.** 사내 프록시가 응답 없이 물고 있어도 본문은
     제때 뜬다. 인터넷이 없으면 조용히 실패하고 아래 지정한 PC 글꼴로 간다. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" media="print" onload="this.media='all';this.onload=null"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap">
<style>
:root{
  --orange:#F58220; --orange-active:#CB6015; --soft:#FAB072;
  --blue:#043B72; --highlight:#D7D7D7;
  --canvas:#FFFFFF; --surface:#ECEFF4; --subtle:#F7F8FA;
  --hair:#CDCECB; --hair-soft:#E5E4E1; --line-dark:#49535B;
  --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C; --muted-soft:#84888B;
  --error:#C62828; --warn:#D4A017; --ok:#2E8540;
  /* 미래에셋 표준 글꼴이 먼저, 그다음 PC에 반드시 있는 한글 글꼴로 내려간다.
     예전에는 'Noto Sans KR' 다음이 곧장 sans-serif 였는데, 그 둘이 없는
     PC에서는 한글이 기본 산세리프로 떨어진다. 윈도우는 맑은 고딕,
     맥은 애플 SD 고딕으로 받아 두면 인터넷 없이도 제 모양이 난다. */
  --font-kr:'Spoqa Han Sans Neo','Noto Sans KR','Malgun Gothic','Apple SD Gothic Neo',sans-serif;
  /* 숫자는 등폭이 아니라 **자릿수 정렬**(tabular-nums)이 중요하다. 예전에는
     Inter 다음이 'SF Mono',monospace 였는데, SF Mono 는 맥에만 있어서
     윈도우에서 인터넷이 끊기면 금액이 전부 Courier New 로 찍혔다. 제안서의
     모든 원화 금액이 타자기 글꼴이 되는 셈이다. 같은 계열 산세리프로 내린다. */
  --font-num:'Inter','Aptos','Segoe UI',system-ui,-apple-system,sans-serif;
  --space-section:88px; --space-block:44px;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  font-family:var(--font-kr); font-size:17px; line-height:1.65;
  color:var(--body); background:var(--canvas);
  -webkit-font-smoothing:antialiased;
}
.num{font-family:var(--font-num); font-variant-numeric:tabular-nums}
/* 숫자 칸은 줄을 바꾸지 않는다. "100,000,000" 과 "원" 이 갈라지면 표가 두
   줄로 벌어지면서 금액이 두 개처럼 읽힌다. */
td.num,td.r,th.r,.kpi .v,.kpi .s{white-space:nowrap}

/* ── 머리띠 ─────────────────────────────────────────── */
.band{background:var(--orange); color:#fff; padding:18px 0 22px}
.band .tag{font-size:12px; letter-spacing:.4px; opacity:.85}
.band h1{font-size:34px; font-weight:700; margin:6px 0 2px; letter-spacing:-.3px; color:#fff}
.band .sub{font-size:14px; opacity:.9}
.band-rule{height:3px; background:var(--blue)}
.meta{font-size:13px; color:var(--muted); padding:10px 0 0}

.page{max-width:1140px; margin:0 auto; padding:0 24px}
@media(max-width:768px){ .page{padding:0 16px} .band h1{font-size:26px} }

/* ── 섹션 ───────────────────────────────────────────── */
section{margin-top:var(--space-block)}
.rule{height:1px; background:var(--orange); margin-bottom:14px}
h2{font-size:21px; font-weight:700; color:var(--ink); margin:0 0 4px;
   display:flex; align-items:baseline; gap:10px}
h2 .n{color:var(--orange); font-size:19px; font-weight:700}
h2 .hint{font-size:13px; font-weight:400; color:var(--muted)}
/* 번호 대신 붙이는 표식. 이 절은 담당자가 고를 때 쓰는 도구라 인쇄본에서
   빠지는데, 번호를 달아 두면 인쇄본의 절 번호가 4 다음 6 으로 건너뛰어
   무언가 빠뜨린 문서처럼 보인다. */
h2 .tool-tag{font-size:12px; font-weight:500; color:var(--muted);
  border:1px solid var(--hair); border-radius:2px; padding:2px 8px; align-self:center}

/* ── 표 ─────────────────────────────────────────────── */
table{width:100%; border-collapse:collapse; margin-top:12px; font-size:15px}
th{background:var(--soft); color:var(--ink); font-weight:700; font-size:14px;
   padding:10px 8px; text-align:center; border:1px solid var(--hair-soft)}
td{padding:8px; border:1px solid var(--hair-soft); color:var(--body)}
tbody tr:nth-child(even) td{background:var(--subtle)}
tbody tr:hover td{background:#F1F3F6}
td.r,th.r{text-align:right}
td.c,th.c{text-align:center}
tfoot td{background:var(--highlight); font-weight:700; color:var(--ink);
         border-top:2px solid var(--line-dark)}
.tbl-wrap{border:1px solid var(--hair); overflow-x:auto}
.tbl-wrap table{margin:0}

/* ── 입력 ───────────────────────────────────────────── */
.grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(215px,1fr)); gap:14px; margin-top:14px}
label{display:block; font-size:13px; font-weight:500; color:var(--muted); margin-bottom:5px}
input,select{
  width:100%; font-family:var(--font-kr); font-size:16px; color:var(--ink);
  padding:9px 11px; border:1px solid var(--hair); border-radius:2px; background:#fff;
}
input.num{font-family:var(--font-num); text-align:right}
input:focus,select:focus{outline:2px solid var(--orange); outline-offset:-1px; border-color:var(--orange)}
select{cursor:pointer}

button{
  font-family:var(--font-kr); font-size:15px; font-weight:500; cursor:pointer;
  padding:9px 17px; border-radius:2px; border:1px solid var(--hair);
  background:#fff; color:var(--ink);
}
button:hover{background:var(--subtle)}
button.primary{background:var(--orange); border-color:var(--orange); color:#fff}
button.primary:hover{background:var(--orange-active)}
button.icon{padding:5px 10px; font-size:14px; color:var(--muted)}
.btns{display:flex; gap:9px; flex-wrap:wrap; margin-top:14px}

/* ── 수치 카드 ──────────────────────────────────────── */
.kpis{display:grid; grid-template-columns:repeat(auto-fit,minmax(215px,1fr)); gap:14px; margin-top:14px}
.kpi{border:1px solid var(--hair); padding:17px 19px; background:#fff; border-radius:2px;
     /* 격자 칸은 기본이 min-width:auto 라, 줄바꿈을 막은 긴 숫자가 칸을 밀어내
        오른쪽이 잘린다. 0 으로 두어야 격자가 정한 너비를 지킨다. */
     min-width:0}
.kpi.hero{background:var(--surface)}
.kpi .k{font-size:13px; font-weight:500; color:var(--muted); letter-spacing:.3px}
.kpi .v{font-size:29px; font-weight:700; color:var(--ink); line-height:1.15; margin-top:5px}
.kpi.hero .v{color:var(--orange); font-size:34px}
.kpi .s{font-size:13px; color:var(--muted-soft); margin-top:3px}

.warn{color:var(--warn); font-weight:700; font-size:14px; margin-top:9px}
.err{color:var(--error); font-weight:700; font-size:14px; margin-top:9px}
.note{font-size:13px; color:var(--muted); margin-top:9px}
ul.notice{font-size:14px; color:var(--body); padding-left:19px; margin:10px 0}
ul.notice li{margin:5px 0}
.footer{margin:var(--space-section) 0 44px; padding-top:16px; border-top:1px solid var(--hair-soft);
        font-size:12px; color:var(--muted-soft)}
.badge{display:inline-block; font-size:12px; padding:1px 7px; border:1px solid var(--hair);
       border-radius:2px; color:var(--muted)}
.badge.no{color:var(--warn); border-color:var(--warn)}

/* ── 인쇄 ───────────────────────────────────────────── */
@media print{
  @page{ size:A4; margin:12mm }
  body{font-size:10.5pt; line-height:1.35; color:#000}
  .noprint{display:none !important}
  .page{max-width:100%; padding:0}
  .band{padding:10px 0 12px; -webkit-print-color-adjust:exact; print-color-adjust:exact}
  .band h1{font-size:19pt}
  section{margin-top:16px; page-break-inside:avoid}
  h2{font-size:12pt}
  table{font-size:8.6pt; page-break-inside:avoid}
  th,td{padding:3px 4px}
  th,tfoot td,.kpi.hero,.band,.band-rule{-webkit-print-color-adjust:exact; print-color-adjust:exact}
  .kpi .v{font-size:15pt} .kpi.hero .v{font-size:17pt}
  /* 인쇄에서는 입력 칸이 아니라 값으로 보여야 한다. 테두리와 화살표를 지운다 —
     셀렉트 화살표와 날짜 아이콘이 그대로 찍히면 문서가 아니라 화면 사진처럼 보인다. */
  input,select{border:none; padding:0; font-size:10.5pt; background:transparent;
               -webkit-appearance:none; appearance:none}
  input::-webkit-calendar-picker-indicator{display:none}
  /* 카드는 두 칸으로. 화면용 세 칸을 그대로 두면 A4 폭을 넘어 오른쪽이 잘린다. */
  .kpis,.grid{grid-template-columns:repeat(2,1fr); gap:8px}
  .kpi{padding:8px 10px}
  .tbl-wrap{overflow:visible}
  /* 빈 포트폴리오 줄은 인쇄에서 뺀다 — 고객이 받는 장에 빈 줄이 깔리면 잡음이다 */
  tr.empty{display:none}
  /* 종목 조회는 인쇄에서 뺀다. 담당자가 고를 때 쓰는 도구지 고객에게 보낼
     내용이 아니고, 조건을 안 좁히면 백사십 줄이 그대로 딸려 나간다. */
  section.tool{display:none}
}
</style>
</head>
<body>

<div class="band">
  <div class="page">
    <div class="tag">사내한 · Confidential</div>
    <h1>월배당 ETF 투자 제안서</h1>
    <div class="sub">Monthly Distribution ETF Portfolio</div>
  </div>
</div>
<div class="band-rule"></div>

<div class="page">
  <div class="meta">자료 ETFCHECK · 기준일 __ASOF__ · 매월 1일 자동 갱신 · 모집단 __NUNIV__종목 중 채택 __NADOPT__</div>

  <div class="btns noprint">
    <button class="primary" onclick="window.print()">인쇄 / PDF 저장</button>
    <button onclick="saveState()">작성 내용 저장</button>
    <button onclick="document.getElementById('loadFile').click()">불러오기</button>
    <input type="file" id="loadFile" accept=".json" style="display:none" onchange="loadState(this)">
    <button onclick="resetAll()">처음으로</button>
    <span class="note" id="saveMsg" style="align-self:center"></span>
  </div>

  <!-- 1. 고객 정보 -->
  <section>
    <div class="rule"></div>
    <h2><span class="n">1</span> 고객 정보 및 투자 조건</h2>
    <div class="grid">
      <div><label for="cust">고객명</label><input id="cust" value="홍길동"></div>
      <div><label for="amt">총 투자금액 (원)</label><input id="amt" class="num" value="100,000,000"></div>
      <div><label for="mode">배분 방식</label>
        <select id="mode"><option>비율</option><option>금액</option></select></div>
      <div><label for="tax">배당소득세율 (%)</label><input id="tax" class="num" value="15.4"></div>
      <div><label for="pdate">제안일</label><input id="pdate" type="date" value="__TODAY__"></div>
    </div>
    <div class="note">비율 = 총액을 %로 나눔 · 금액 = 종목별 금액 직접 입력. 국내 상장 ETF 분배금 기준 15.4%(지방소득세 포함).</div>
  </section>

  <!-- 2. 포트폴리오 -->
  <section>
    <div class="rule"></div>
    <h2><span class="n">2</span> 투자 포트폴리오
      <span class="hint">고를 수 있는 종목 __NSEL__</span></h2>
    <div class="tbl-wrap">
      <table id="pf">
        <thead><tr>
          <th style="min-width:230px">투자 ETF</th><th style="width:92px">배분</th>
          <th class="r" style="width:120px">배정금액</th><th class="r" style="width:82px">매수 수량</th>
          <th class="r" style="width:120px">실투자금액</th>
          <th class="r" style="width:118px">월 분배금(세전)</th><th class="r" style="width:118px">월 분배금(세후)</th>
          <th class="c noprint" style="width:44px"></th>
        </tr></thead>
        <tbody id="pfBody"></tbody>
        <tfoot><tr>
          <td>합계</td><td class="r num" id="tAlloc">0</td><td class="r num" id="tAssign">0</td>
          <td class="r"></td><td class="r num" id="tInvest">0</td>
          <td class="r num" id="tPre">0</td><td class="r num" id="tPost">0</td><td class="noprint"></td>
        </tr></tfoot>
      </table>
    </div>
    <div class="btns noprint"><button onclick="addRow()">+ 종목 추가</button></div>
    <div class="err" id="wAlloc"></div>
    <div class="warn" id="wReject"></div>
    <div class="warn" id="wFreq"></div>
    <div class="note">빈 줄은 계산에서 빠집니다. 매수 수량은 정수로 내림하며, 남는 금액은 미투자 잔액이 됩니다.</div>
  </section>

  <!-- 3. 요약 -->
  <section>
    <div class="rule"></div>
    <h2><span class="n">3</span> 예상 분배금 요약</h2>
    <div class="kpis">
      <div class="kpi hero"><div class="k">월 예상 분배금 (세전)</div><div class="v num" id="kPre">0원</div>
        <div class="s num" id="kPost">세후 0원</div></div>
      <div class="kpi"><div class="k">연 예상 분배금 (세전)</div><div class="v num" id="kAnnPre">0원</div>
        <div class="s num" id="kAnnPost">세후 0원</div></div>
      <div class="kpi"><div class="k">연 수익률 (세전, 가중평균)</div><div class="v num" id="kAnnRate">0.00%</div>
        <div class="s num" id="kAnnRateNet">세후 0.00%</div></div>
      <div class="kpi"><div class="k">실제 투자금액</div><div class="v num" id="kInvest">0원</div>
        <div class="s num" id="kIdle">미투자 잔액 0원</div></div>
    </div>
    <div class="note">연 수익률은 담은 종목들의 최근 12개월 실제 분배금을 투자 비중으로 가중평균한 값입니다. 확정 수익률이 아니며 매월 달라집니다.</div>
  </section>

  <!-- 4. 금액 구간 -->
  <section>
    <div class="rule"></div>
    <h2><span class="n">4</span> 총 투자금액별 예상 분배금 <span class="hint">위 구성을 그대로 두고 금액만 바꿨을 때</span></h2>
    <div class="tbl-wrap"><table>
      <thead><tr><th class="r">투자금액 구간</th><th class="r">월 분배금(세전)</th><th class="r">월 분배금(세후)</th>
        <th class="r">연 분배금(세전)</th><th class="r">연 분배금(세후)</th></tr></thead>
      <tbody id="tiers"></tbody>
    </table></div>
    <div class="note">단주 절사를 반영하지 않은 근사치라 위 표와 몇천 원 차이가 날 수 있습니다.</div>
  </section>

  <!-- 5. 종목 조회 -->
  <section class="tool">
    <div class="rule"></div>
    <h2><span class="tool-tag">담당자용</span> 종목 조회
      <span class="hint">지급주기와 연 분배율로 고릅니다 · 인쇄본에는 들어가지 않습니다</span></h2>
    <div class="grid">
      <div><label for="qFreq">지급주기</label><select id="qFreq"></select></div>
      <div><label for="qMin">연 분배율 최소 (%)</label><input id="qMin" class="num" value="0"></div>
      <div><label for="qMax">연 분배율 최대 (%)</label><input id="qMax" class="num" value="100"></div>
      <div><label for="qName">종목명 포함</label><input id="qName" placeholder="예: 미국배당"></div>
      <div><label for="qAdopt">채택 여부</label>
        <select id="qAdopt"><option>전체</option><option>채택만</option><option>기준 미달만</option></select></div>
    </div>
    <div class="note" id="qCount"></div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>종목명</th><th class="c">지급주기</th><th class="r">연 분배율</th><th class="r">월 환산</th>
        <th class="r">현재가</th><th class="r">변동성(__VOLNOTE__)</th><th class="r">순자산</th><th class="c">채택</th>
        <th class="c noprint">담기</th></tr></thead>
      <tbody id="qBody"></tbody>
    </table></div>
    <div class="note">'판정 불가' 는 상장 1년이 안 돼 지급주기를 말할 수 없는 종목입니다. 빼지 않고 그대로 담았습니다.</div>
  </section>

  <!-- 6. 비교 -->
  <section>
    <div class="rule"></div>
    <h2><span class="n">5</span> 월배당 ETF 비교 <span class="hint">1억원 단독 투자 기준</span></h2>
    <div class="tbl-wrap"><table>
      <thead><tr><th>종목명</th><th class="c">유형</th><th class="r">현재가</th><th class="r">연 분배율</th>
        <th class="r">월 분배금(세전)</th><th class="r">월 분배금(세후)</th><th class="r">변동성</th></tr></thead>
      <tbody id="cmpBody"></tbody>
    </table></div>
  </section>

  <!-- 7. 유의사항 -->
  <section>
    <div class="rule"></div>
    <h2><span class="n">6</span> 유의사항</h2>
    <ul class="notice">
      <li>이 자료는 투자 권유가 아니라 참고 자료입니다. 최종 투자 판단과 그 결과는 투자자 본인에게 귀속됩니다.</li>
      <li>ETF 는 예금자보호법의 보호를 받지 않으며, 원금 손실이 발생할 수 있습니다.</li>
      <li>분배금은 확정되지 않습니다. 커버드콜 ETF 의 분배 재원은 옵션 프리미엄이므로, 시장 변동성이 낮아지면 분배금도 함께 줄어듭니다.</li>
      <li>분배금의 일부가 원금에서 지급될 수 있습니다(자본 환급). 이 경우 기준가가 그만큼 낮아집니다.</li>
      <li>표시된 연 분배율은 최근 12개월 실제 분배금 합계를 현재가로 나눈 값이며, 앞으로의 수익률을 보장하지 않습니다.</li>
      <li>세율은 국내 상장 ETF 분배금 기준 15.4%(배당소득세 14% + 지방소득세 1.4%)를 적용했습니다. 금융소득종합과세 대상자는 실효세율이 달라집니다.</li>
      <li>세금은 분배금 전액이 아니라 <b>과세표준액</b>에만 붙습니다. 국내주식 매매차익과 장내파생 손익은 과세표준에 들어가지 않으므로,
          그 재원으로 분배하는 종목은 분배금의 상당 부분이 비과세입니다. 그래서 종목마다 다른 과세비율을 적용했습니다.</li>
      <li>과세비율은 <b>최근 12개월에 실제로 매겨진 과세표준액을 같은 기간 분배금으로 나눈 값</b>입니다. 지나간 실적이므로 앞으로도 같다는
          뜻은 아닙니다 — 분배 재원(배당·이자·매매차익·파생손익)의 구성이 바뀌면 비율도 함께 바뀌고, 실제로 한 종목 안에서도 회차마다
          0%에서 17%까지 움직인 사례가 있습니다. 실제 세액은 지급 시점의 과세표준으로 확정되므로 이 문서와 다를 수 있습니다.
          과세비율을 구하지 못한 종목은 전액 과세로 보수적으로 계산했습니다.</li>
      <li>세무 상담이 필요한 사안은 이 문서로 갈음하지 마시고 세무 전문가의 확인을 받으십시오.</li>
      <li>매매수수료·거래세·환율 변동은 반영하지 않았습니다. 총보수는 분배율에 이미 반영되어 있습니다(기준가 차감).</li>
      <li>수량은 정수 매수를 가정해 내림 처리했습니다. 남는 금액은 '미투자 잔액' 으로 표시됩니다.</li>
      <li>여러 종목에 나눠 담아도 분배 시기는 종목마다 다릅니다. 매월 같은 날 한꺼번에 들어오지 않습니다.</li>
      <li>목록에는 커버드콜뿐 아니라 리츠·채권형·배당주·파킹형 월배당 ETF 가 함께 있습니다. 분배 재원과 위험이 서로 다릅니다.</li>
      <li>유동성·변동성 기준에 미달한 종목도 담을 수 있게 열어 두었습니다. 담으면 위에 표시됩니다.</li>
    </ul>
  </section>

  <div class="footer">
    자료 출처 ETFCHECK (www.etfcheck.co.kr) · 기준일 __ASOF__ ·
    채택 기준: 국내 상장, 순자산 __MINAUM__억원 이상, 60일 평균거래대금 __MINTO__억원 이상,
    연환산 변동성 __MAXVOL__% 이하, 상장 12개월 이상
  </div>
</div>

<script>
const DATA = __DATA__;
const F = new Map(DATA.items.map(x => [x.code, x]));
const won = n => (Math.round(n)).toLocaleString('ko-KR') + '원';
const pct = (n, d = 2) => (n).toFixed(d) + '%';
const numOf = s => { const v = parseFloat(String(s).replace(/[^0-9.\-]/g, '')); return isFinite(v) ? v : 0; };

/* CALC — 엑셀판과 같은 식이다. 둘이 어긋나면 안 되므로 여기 한 군데에만 둔다.
     배정금액   = 비율 ? 총액 × 배분/100 : 배분(입력한 금액)
     매수 수량  = floor(배정금액 ÷ 현재가)          (정수 매수)
     실투자금액 = 매수 수량 × 현재가
     월 분배금  = 실투자금액 × 연 분배율 ÷ 12
     세후       = 세전 × (1 − 세율)
   엑셀 쪽 수식은 build_etf_proposal.py 의 포트폴리오 줄에 그대로 있다. */
function calcRow(code, alloc, total, mode, tax) {
  const it = F.get(code);
  if (!it || !(it.price > 0)) return null;
  const assign = mode === '비율' ? total * alloc / 100 : alloc;
  const qty = Math.floor(assign / it.price);
  const invest = qty * it.price;
  const pre = invest * (it.ttm / 100) / 12;
  // 세금은 분배금 전액이 아니라 과세표준액에만 붙는다. 종목마다 그 비율이
  // 달라서(국내주식형 커버드콜 2~3% · 해외형 100%) 종목의 값을 곱한다.
  const tr = it.taxR === undefined || it.taxR === null ? 1 : it.taxR;
  return { it, assign, qty, invest, pre, post: pre * (1 - tax * tr) };
}

let rows = [];
const $ = id => document.getElementById(id);

function optionsHtml(sel) {
  return '<option value="">— 종목 선택 —</option>' + DATA.items.map(x =>
    `<option value="${x.code}"${x.code === sel ? ' selected' : ''}>${x.name}${x.adopted ? '' : ' (기준 미달)'}</option>`
  ).join('');
}

function addRow(code = '', alloc = '') {
  rows.push({ code, alloc });
  render();
}
function delRow(i) { rows.splice(i, 1); if (!rows.length) rows.push({ code: '', alloc: '' }); render(); }

/* 줄을 다시 그리는 일과 숫자를 다시 셈하는 일을 나눠 둔다.
   ──────────────────────────────────────────────────────────────────────
   예전에는 배분 칸에 글자 하나 칠 때마다 render() 가 표 전체를 innerHTML
   로 새로 그렸다. 그러면 **지금 타이핑하고 있는 input 자체가 지워지고 새로
   만들어져서** 커서가 날아간다. "20" 을 치면 2 까지만 들어가고 0 은 갈 데가
   없어진 칸으로 떨어진다. 한 자리밖에 못 넣는 칸이 되어 있었다.

   그래서 칸을 건드리는 일과 값을 고쳐 쓰는 일을 갈랐다. 타이핑 중에는
   recalc() 만 부른다 — 파생된 숫자 칸만 textContent 로 갈아 끼우고 input 과
   select 은 손대지 않으므로 커서가 그대로 있다. 표 구조가 진짜로 바뀌는
   때(줄 추가·삭제·불러오기)에만 renderRows() 로 다시 그린다.

   종목 select 도 recalc() 만 부르면 된다. 종목을 바꿔도 줄의 생김새는 그대로고
   숫자만 달라지기 때문이다. 다시 그리면 오히려 고른 값이 튄다. */
function render() { renderRows(); recalc(); }

function renderRows() {
  $('pfBody').innerHTML = rows.map((r, i) => `<tr class="${r.code ? '' : 'empty'}">
      <td><select onchange="rows[${i}].code=this.value;recalc()">${optionsHtml(r.code)}</select></td>
      <td><input class="num" value="${r.alloc}" oninput="rows[${i}].alloc=this.value;recalc()"></td>
      <td class="r num" data-f="assign"></td>
      <td class="r num" data-f="qty"></td>
      <td class="r num" data-f="invest"></td>
      <td class="r num" data-f="pre"></td>
      <td class="r num" data-f="post"></td>
      <td class="c noprint"><button class="icon" onclick="delRow(${i})">✕</button></td>
    </tr>`).join('');
}

function recalc() {
  const total = numOf($('amt').value), mode = $('mode').value, tax = numOf($('tax').value) / 100;

  // 줄 안의 숫자 칸만 갈아 끼운다. input/select 은 건드리지 않는다.
  const trs = $('pfBody').querySelectorAll('tr');
  rows.forEach((r, i) => {
    const tr = trs[i];
    if (!tr) return;
    const c = r.code ? calcRow(r.code, numOf(r.alloc), total, mode, tax) : null;
    tr.className = r.code ? '' : 'empty';
    const set = (f, v) => { const el = tr.querySelector(`[data-f="${f}"]`); if (el) el.textContent = v; };
    set('assign', c ? won(c.assign) : '');
    set('qty', c ? c.qty.toLocaleString('ko-KR') + '주' : '');
    set('invest', c ? won(c.invest) : '');
    set('pre', c ? won(c.pre) : '');
    set('post', c ? won(c.post) : '');
  });

  const cs = rows.map(r => r.code ? calcRow(r.code, numOf(r.alloc), total, mode, tax) : null).filter(Boolean);
  const sum = k => cs.reduce((s, c) => s + c[k], 0);
  const tAlloc = rows.reduce((s, r) => s + (r.code ? numOf(r.alloc) : 0), 0);
  const invest = sum('invest'), pre = sum('pre'), post = sum('post');

  $('tAlloc').textContent = mode === '비율' ? tAlloc.toFixed(2) : won(tAlloc);
  $('tAssign').textContent = won(sum('assign'));
  $('tInvest').textContent = won(invest);
  $('tPre').textContent = won(pre);
  $('tPost').textContent = won(post);

  $('wAlloc').textContent =
    !cs.length ? '' :
    mode === '비율'
      ? (Math.abs(tAlloc - 100) > 0.01 ? '※ 배분 비율 합계가 100%가 아닙니다. 배분 칸을 확인하십시오.' : '')
      : (sum('assign') > total ? '※ 배분 금액 합계가 총 투자금액을 넘습니다.' : '');
  $('wReject').textContent = cs.some(c => !c.it.adopted)
    ? '※ 유동성·변동성 기준에 미달한 종목이 담겨 있습니다. 아래 종목 조회에서 사유를 확인하십시오.' : '';
  $('wFreq').textContent = cs.some(c => c.it.freq && c.it.freq !== '월배당')
    ? "※ 월배당이 아닌 종목이 담겨 있습니다. '월 예상 분배금' 은 연 분배금을 12로 나눈 월 환산액이며, 실제 지급은 그 종목의 주기(분기·연 등)를 따릅니다." : '';

  const annPre = pre * 12, annPost = post * 12;
  $('kPre').textContent = won(pre);
  $('kPost').textContent = '세후 ' + won(post);
  $('kAnnPre').textContent = won(annPre);
  $('kAnnPost').textContent = '세후 ' + won(annPost);
  $('kAnnRate').textContent = invest > 0 ? pct(annPre / invest * 100) : '0.00%';
  $('kAnnRateNet').textContent = '세후 ' + (invest > 0 ? pct(annPost / invest * 100) : '0.00%');
  $('kInvest').textContent = won(invest);
  $('kIdle').textContent = '미투자 잔액 ' + won(Math.max(0, total - invest));

  // 구간표 — 지금 구성의 가중 연 분배율을 금액만 바꿔 적용한다.
  const rate = invest > 0 ? annPre / invest : 0;
  // 종목마다 과세비율이 달라 하나의 세율로는 낼 수 없다. 지금 담은 구성이
  // 실제로 내는 비율(세후 합 ÷ 세전 합)을 그대로 쓴다.
  const netR = pre > 0 ? post / pre : 1 - tax;
  $('tiers').innerHTML = [1e7, 3e7, 5e7, 1e8, 2e8, 3e8, 5e8, 1e9].map(a => {
    const p = a * rate / 12;
    return `<tr><td class="r num">${won(a)}</td><td class="r num">${won(p)}</td>
      <td class="r num">${won(p * netR)}</td><td class="r num">${won(p * 12)}</td>
      <td class="r num">${won(p * 12 * netR)}</td></tr>`;
  }).join('');

  saveLocal();
}

/* 종목 조회 — 엑셀은 배열 수식을 못 써서 숨긴 칸으로 60줄까지만 뽑지만,
   여기서는 줄 수 제한 없이 조건에 맞는 것을 전부 보여 준다. */
function renderQuery() {
  const f = $('qFreq').value, lo = numOf($('qMin').value), hi = numOf($('qMax').value);
  const nm = $('qName').value.trim(), ad = $('qAdopt').value;
  const tax = numOf($('tax').value) / 100;
  const hit = DATA.items.filter(x =>
    (f === '전체' || x.freq === f) &&
    x.ttm != null && x.ttm >= lo - 1e-9 && x.ttm <= hi + 1e-9 &&
    (!nm || x.name.includes(nm)) &&
    (ad === '전체' || (ad === '채택만' ? x.adopted : !x.adopted))
  );
  $('qCount').innerHTML = `조건에 맞는 종목 <b>${hit.length}</b>종목 / 전체 ${DATA.items.length}종목`;
  $('qBody').innerHTML = hit.map(x => `<tr>
    <td>${x.name}${x.adopted ? '' : ` <span class="badge no" title="${x.why}">기준 미달</span>`}</td>
    <td class="c">${x.freq || '—'}</td>
    <td class="r num">${pct(x.ttm)}</td>
    <td class="r num">${pct(x.ttm / 12, 3)}</td>
    <td class="r num">${x.price ? x.price.toLocaleString('ko-KR') : '—'}</td>
    <td class="r num">${x.vol != null ? pct(x.vol, 1) : '—'}</td>
    <td class="r num">${x.aum ? (x.aum / 1e8).toLocaleString('ko-KR', { maximumFractionDigits: 0 }) + '억' : '—'}</td>
    <td class="c">${x.adopted ? '채택' : '제외'}</td>
    <td class="c noprint"><button class="icon" onclick="pick('${x.code}')">담기</button></td>
  </tr>`).join('') || '<tr><td colspan="9" class="c">조건에 맞는 종목이 없습니다.</td></tr>';
}
function pick(code) {
  const empty = rows.findIndex(r => !r.code);
  if (empty >= 0) rows[empty].code = code; else rows.push({ code, alloc: '' });
  render();
  document.getElementById('pf').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderCompare() {
  const tax = numOf($('tax').value) / 100;
  $('cmpBody').innerHTML = DATA.compare.map(c => {
    const x = F.get(c); if (!x) return '';
    const qty = Math.floor(1e8 / x.price), invest = qty * x.price;
    const pre = invest * (x.ttm / 100) / 12;
    return `<tr><td>${x.name}</td><td class="c">${x.type}</td>
      <td class="r num">${x.price.toLocaleString('ko-KR')}</td>
      <td class="r num">${pct(x.ttm)}</td><td class="r num">${won(pre)}</td>
      <td class="r num">${won(pre * (1 - tax * (x.taxR == null ? 1 : x.taxR)))}</td>
      <td class="r num">${x.vol != null ? pct(x.vol, 1) : '—'}</td></tr>`;
  }).join('');
}

/* 저장 / 불러오기.
   파일로 내려받는 쪽이 본체다 — 브라우저를 바꾸거나 다른 사람에게 넘겨도
   그대로 열린다. localStorage 는 실수로 새로고침했을 때를 위한 보조일 뿐이라
   읽고 쓰는 자리를 전부 try 로 감싼다(사생활 보호 창에서는 막힌다). */
function state() {
  return { cust: $('cust').value, amt: $('amt').value, mode: $('mode').value,
           tax: $('tax').value, pdate: $('pdate').value, rows };
}
function applyState(s) {
  if (!s) return;
  for (const k of ['cust', 'amt', 'mode', 'tax', 'pdate']) if (s[k] != null) $(k).value = s[k];
  rows = Array.isArray(s.rows) && s.rows.length ? s.rows : [{ code: DATA.defaultCode, alloc: 100 }];
  render();
}
function saveState() {
  const s = state();
  const name = (s.cust || '고객').replace(/[\\/:*?"<>|]/g, '') + '_월배당ETF제안서.json';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
  msg('저장했습니다 — ' + name);
}
function loadState(input) {
  const f = input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { try { applyState(JSON.parse(r.result)); msg('불러왔습니다 — ' + f.name); }
                     catch { msg('읽을 수 없는 파일입니다.'); } };
  r.readAsText(f); input.value = '';
}
function saveLocal() { try { localStorage.setItem('etfProposal', JSON.stringify(state())); } catch {} }
function resetAll() {
  try { localStorage.removeItem('etfProposal'); } catch {}
  location.reload();
}
function msg(t) { $('saveMsg').textContent = t; setTimeout(() => { $('saveMsg').textContent = ''; }, 4000); }

// 시작
(function init() {
  const freqs = ['전체', ...[...new Set(DATA.items.map(x => x.freq).filter(Boolean))]];
  $('qFreq').innerHTML = freqs.map(f => `<option>${f}</option>`).join('');
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('etfProposal') || 'null'); } catch {}
  if (saved) applyState(saved); else { rows = [{ code: DATA.defaultCode, alloc: 100 }]; render(); }
  renderQuery(); renderCompare();
  // 여기서도 recalc() 만 부른다. 총 투자금액을 치는 동안 표를 새로 그리면,
  // 그 표 안에서 고치고 있던 배분 칸이 같이 지워진다.
  for (const id of ['amt', 'mode', 'tax', 'cust', 'pdate'])
    $(id).addEventListener('input', () => { recalc(); renderCompare(); });
  for (const id of ['qFreq', 'qMin', 'qMax', 'qName', 'qAdopt'])
    $(id).addEventListener('input', renderQuery);
})();
</script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
