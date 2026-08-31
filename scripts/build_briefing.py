# -*- coding: utf-8 -*-
"""마포WM 브리핑을 짓는다 — 10절 구조.

  python3 scripts/build_briefing.py [--date YYYY-MM-DD] [--kind morning|close|global]

**판을 물려 짓지 않는다.** 어제 파일을 복사해 고치는 방식이 글을 굳게 만들었으므로
(지침 7-2-1), 표와 날짜 이름표와 파생 수치는 전부 이 파일이 시세 자료에서 만들고,
그날의 서술만 `data/briefing/narrative-<날짜>.json` 에서 받는다.

서술 파일이 없거나 어떤 키가 비면 **어제 문장이 남는 것이 아니라** 자료에서 계산한
한 줄이 대신 나가고, 어느 키가 비었는지 검증 노트에 적힌다. 굳을 자리를 없앤 것이다.

절 열 개(지침 7절):
  01 today     오늘의 결론
  02 korea     국내 증시
  03 flows     수급 · 증시 주변자금
  04 global    간밤 해외
  05 earnings  실적 · 컨퍼런스콜
  06 macro     금리 · 환율 · 원자재
  07 deep      심층 분석            ← 조건부
  08 calendar  일정 · 체크포인트
  09 talking   고객 응대
  10 verify    데이터 · 검증
"""
import argparse
import datetime
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from briefing_lib import (  # noqa: E402
    KST, WD, VF_OK, VF_MD, VF_C, VF_1, VF_N,
    d, DK, DE, DD, DS, n, pct, bp, eok, jo, esc,
    L, TH, THP, perf_cells, tbl, exp as _exp, P, lede, stat, card, callout,
    sparkline, bar, Doc, Narrative, assemble)
import briefing_lib as _lib  # noqa: E402
from briefing_prepare import prepare, KIND_NAME  # noqa: E402


# ══════════════════════════════════════════════════════════════════
# 핵심본 (--core) — 같은 자료, 같은 서술, **다섯 쪽**
# ══════════════════════════════════════════════════════════════════
# 전체 판은 브리핑을 준비하는 사람이 읽는 것이고, 핵심본은 **개장 전에
# 한 번 훑는 것**이다. 그래서 줄이는 기준이 「덜 중요한 것」이 아니라
# **「지금 결정에 닿지 않는 것」** 이다.
#
#   접는 상세(exp)   → 통째로 뺀다. 근거는 전체 판에 그대로 있다
#   종목 표          → 위아래 여덟씩에서 **넷씩**으로
#   05 실적          → 절을 빼고 01 에 한 줄로 남긴다
#   10 검증          → 노트 전체 대신 **한 문단** + 전체 판으로 가는 길
#
# **서술은 한 글자도 줄이지 않는다.** 그날 손으로 쓴 문장이 핵심본의
# 본론이고, 걷어내는 것은 근거 표 쪽이다.
CORE = _lib.CORE      # 표를 만드는 쪽 전부가 같은 스위치를 본다

CORE_CSS = """
<style id="core-density">
/* ── 핵심본 밀도 ────────────────────────────────────────────────
   전체 판은 앉아서 읽는 문서라 호흡이 넓다. 핵심본은 **개장 전에 한 번
   훑는 시트**라 같은 내용을 절반의 자리에 넣는다. 줄인 것은 여백과 글자
   크기이지 내용이 아니다 — 표의 설명 줄(.sub)은 그대로 둔다. 그것을
   없애면 「이 지수가 무엇인지」가 PDF 에서 통째로 사라진다(지침 4-3절).

   껍데기 CSS 뒤에 붙이므로 같은 우선순위에서 이긴다(지침 6절).        */
.section{margin-top:30px}
/* 좁은 표를 나란히 세운다. 화면이 좁아지면 스스로 한 단으로 풀린다 —
   폭 훑기에서 340px 까지 넘침 0 이어야 하므로 고정 2·3단을 쓰지 않는다. */
.duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(430px,100%),1fr));gap:0 14px}
.trio{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(232px,100%),1fr));gap:0 12px}
.duo > *,.trio > *{min-width:0}
/* 격자 칸 안에서는 표가 min-width 를 고집하면 안 된다 — 칸보다 넓어져
   700~1080px 구간에서 62 곳이 넘쳤다. 폭을 풀고 글자를 한 치수 줄인다. */
.duo table.data,.trio table.data{min-width:0!important;width:100%}
.duo .table-wrap,.trio .table-wrap{overflow-x:visible}
.trio table.data th,.trio table.data td{padding:3px 5px;font-size:12px}
.trio table.data caption{font-size:12.5px}
/* 반 칸에 들어가려면 표가 350px 안쪽이어야 한다. 글자와 여백을 한 치수 줄이고,
   스파크라인 칸은 통째로 뺀다 &mdash; 132px 짜리 그림 하나가 표를 574px 로
   밀어 올려 혼자 223px 넘쳤다. 추이 그림은 전체 판에 그대로 있다.        */
.duo table.data th,.duo table.data td{padding:2px 5px;font-size:11.5px;line-height:1.3}
.duo table.data caption{font-size:12.5px}
.duo table.data .sparkcell,.duo table.data th.sparkcell{display:none}
.duo table.data .sub{font-size:10.5px}
.duo table.data .wrap,.trio table.data .wrap{white-space:normal;word-break:keep-all;overflow-wrap:anywhere}
.duo table.data .n,.trio table.data .n{overflow-wrap:normal;white-space:nowrap}
.hol{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr));gap:2px 14px;
  margin:0 0 10px;padding:0;list-style:none}
.hol li{font-size:12.5px;line-height:1.45;padding:1px 0;border-bottom:1px solid var(--hairline-soft)}
.hol li b{font-weight:600;color:var(--ink)}
.hol li em{font-style:normal;color:var(--primary-active);font-weight:600}
/* 오늘의 결론 — **여섯 값을 한 줄에.** 껍데기는 3단 두 줄로 세우는데, 그러면
   첫 쪽에서 카드 여섯이 세로로 두 뼘을 먹는다. 개장 전에 훑는 시트에서 지수·
   거래대금·외국인·금리·환율은 **한 눈에 나란히** 놓여야 견줄 수 있다.
   auto-fit 이라 좁은 화면에서는 스스로 줄을 접는다(340px 까지 넘침 0).      */
.stat-grid.six{grid-template-columns:repeat(auto-fit,minmax(min(152px,100%),1fr))!important}
.stat-grid.six .stat{padding:8px 10px}
.stat-grid.six .stat-label{font-size:11.5px;letter-spacing:.3px}
.stat-grid.six .stat-value{font-size:19px}
.stat-grid.six .stat-chg{font-size:12px}
.stat-grid.six .stat-note{font-size:10.5px;line-height:1.3;margin-top:3px}
@media print{ .stat-grid.six{grid-template-columns:repeat(6,1fr)!important}
  .stat-grid.six .stat{padding:5px 6px}
  .stat-grid.six .stat-label{font-size:6.6pt} .stat-grid.six .stat-value{font-size:12pt}
  .stat-grid.six .stat-chg{font-size:7.4pt} .stat-grid.six .stat-note{font-size:6.2pt;line-height:1.2} }
h3.mini{font-size:15px;font-weight:600;color:var(--ink);margin:14px 0 6px}
@media print{ h3.mini{font-size:10pt;margin:9px 0 4px;break-after:avoid} }
@media print{
  .duo{grid-template-columns:1fr 1fr;gap:0 10px}
  .duo table.data th,.duo table.data td{padding:1.5px 4px;font-size:7.6pt}
  .duo table.data caption{font-size:8.4pt}
  .trio{grid-template-columns:1fr 1fr 1fr;gap:0 9px}
  .hol{grid-template-columns:1fr 1fr 1fr 1fr;gap:1px 9px}
  .hol li{font-size:7.3pt;line-height:1.22}
}
/* 머리말 — 큰 글자가 그날의 한마디를 하므로 46px 은 두 줄로 넘친다.
   한 치수 줄이되 **여전히 쪽에서 가장 큰 글자**로 둔다.                  */
.hero h1{font-size:34px;line-height:1.2;margin:0 0 12px}
.hero-kicker{font-size:14px;margin:0 0 9px}
.hero-lede{font-size:17.5px;line-height:1.5}
.hero{margin-top:18px;padding-bottom:16px}
.hero-meta{margin-top:12px;font-size:12.5px}
@media print{
  .hero h1{font-size:19pt;line-height:1.18;margin-bottom:6px}
  .hero-kicker{font-size:8pt;margin-bottom:5px}
  .hero-lede{font-size:10.4pt;line-height:1.42}
  .hero-meta{margin-top:6px;font-size:6.8pt}
  .hero{margin-top:0;padding-bottom:7px}
}
.shell > main > .section:first-child{margin-top:14px}
.sec-num{font-size:12px;letter-spacing:1px}
.section-title{font-size:20px}
p.lede{font-size:15.5px;line-height:1.5;margin:0 0 11px}
.section > p{font-size:15.5px;line-height:1.55;margin:0 0 9px}
.stat-grid{margin:0 0 13px}
.stat{padding:10px 12px}
.stat-label{font-size:12.5px;margin:0 0 2px}
.stat-value{font-size:23px;line-height:1.05;margin:0}
.stat-chg{font-size:13px;margin:1px 0 0}
.stat-note{font-size:11.5px;line-height:1.35;margin:4px 0 0}
.callout{padding:16px 18px;margin:0}
.callout-title{font-size:16.5px;margin:0 0 7px}
.callout p{font-size:15px;line-height:1.55;margin:0 0 8px}
.callout p:last-child{margin-bottom:0}
.table-wrap{margin:0 0 11px}
table.data caption{font-size:13.5px;padding-bottom:4px}
table.data th,table.data td{padding:4px 8px;font-size:13px;line-height:1.35}
table.data .sub{font-size:11px;line-height:1.28}
.tbl-foot,table.data tfoot td{font-size:11px;line-height:1.4;padding:5px 8px}
.soft-grid{gap:9px}
.soft-card{padding:12px 14px}
.soft-card .q{font-size:15px;margin:0 0 5px}
.soft-card p{font-size:14px;line-height:1.5;margin:0}
footer.foot{margin-top:22px;padding:16px 0 24px;font-size:11px}
@media print{
  .section{margin-top:22px}
  .section{margin-top:4px}
  table.data th,table.data td{padding:1.1px 4.5px;font-size:7.9pt;line-height:1.08}
  table.data .sub{font-size:6.7pt;line-height:1.1}
  table.data caption{font-size:8.7pt;padding-bottom:2px}
  .tbl-foot,table.data tfoot td{font-size:6.4pt;line-height:1.2}
  p.lede{font-size:9.1pt;line-height:1.33;margin-bottom:4px}
  .section > p{font-size:9.1pt;line-height:1.33;margin-bottom:3px}
  .stat-grid{margin-bottom:5px}
  .callout{padding:8px 11px}
  .callout p{font-size:9.0pt;line-height:1.36;margin-bottom:4px}
  .soft-card{padding:6px 8px}
  .soft-card p{font-size:8.5pt;line-height:1.3}
  .soft-card .q{font-size:9.6pt}
  .stat{padding:7px 9px}
  .stat-value{font-size:14.5pt}
  .stat-note{font-size:7pt;line-height:1.25}
  .section-title{font-size:14.5pt}
  .table-wrap{margin-bottom:3px}
  footer.foot{margin-top:6px;padding:5px 0 2px;break-before:avoid}
  /* 다섯 쪽에 맞추려면 **블록을 통째로 붙들면 안 된다.** 전체 판은 짧은 표를
     붙들어 쪽 가운데가 갈리지 않게 하지만, 그 대가로 앞 쪽에 빈 띠가 남는다.
     핵심본은 자리가 없으므로 이어붙이고, **줄만 쪼개지지 않게** 한다.     */
  table.data,.table-wrap,.callout,.soft-grid,.soft-card,.stat-grid{break-inside:auto!important}
  table.data tbody tr,table.data thead tr{break-inside:avoid}
  table.data thead{display:table-header-group}
  table.data caption{break-after:avoid}
  /* 인쇄용 「브리핑 목록」은 전체 판의 기능이다. 핵심본은 다섯 쪽짜리 시트라
     서른 줄짜리 목록을 실을 자리가 없다 — 화면에서는 사이드바에 그대로 있다. */
  .archive-print{display:none!important}
  /* 나란히 세우기 — 좁은 표는 한 단씩 쓰면 자리가 아깝다. 유럽·일본·중화권
     셋을 3단으로 세우면 셋이 한 표 높이에 들어간다.                     */
  .duo,.trio{break-inside:auto!important}
}
</style>
"""



def exp(tko, ten, body):
    """핵심본에서는 접는 상세를 아예 싣지 않는다."""
    return "" if CORE[0] else _exp(tko, ten, body)


def _cut(seq, k=2):
    """핵심본이면 앞에서 k 개만. 전체 판은 그대로 둔다."""
    return seq[:k] if CORE[0] else seq


# ══════════════════════════════════════════════════════════════════
# 자료
# ══════════════════════════════════════════════════════════════════
MARKET = [None]     # --market 로 지정한 시세 파일. 없으면 latest.json


def load():
    """시세를 읽는다.

    **판을 다시 지을 때는 그 판의 기준 시각 스냅샷을 쓰십시오.** `latest.json` 은
    수집이 돌 때마다 덮어써지므로, 개장 뒤에 아침 판을 다시 지으면 표만 조용히
    **장중값**으로 굴러가고 글은 종가 이야기에 멈춰 있습니다 &mdash; 2026-08-31 에
    실제로 그랬습니다(07:40 수집분은 삼성전자 &minus;3.38%, 09:24 수집분은
    &minus;3.70%). 지침 4-3절의 「표는 자료에서 나오고 글은 안 나온다」가 휴장이
    아니라 **같은 날 안에서** 터지는 경우입니다.

        git show <수집 커밋>:data/market/latest.json > /tmp/snap.json
        python3 scripts/build_briefing.py --market /tmp/snap.json
    """
    D = json.load(io.open(MARKET[0] or (ROOT + "/data/market/latest.json"), encoding="utf-8"))
    try:
        H = json.load(io.open(ROOT + "/data/market/history.json", encoding="utf-8"))
    except Exception:                                             # noqa: BLE001
        H = {"rows": []}
    return D, H


def narrative_for(day, kind="morning"):
    """그날의 서술 파일을 읽는다 — **판 이름을 붙인 것을 먼저 본다.**

    예전에는 `narrative-<날짜>.json` 하나뿐이었다. 그런데 모닝과 장마감은
    서로 다른 예약이 서로 다른 창에서 돌고, 같은 날 둘 다 나온다. 2026-08-28
    에 실제로 장마감 판의 서술이 모닝 판의 서술 파일을 덮어썼다 — 같은
    이름이었기 때문이다. 발행된 판은 이미 만들어진 뒤라 무사했지만, 그날
    아침에 무엇을 썼는지는 저장소에서 사라졌다.

    이제 `narrative-<날짜>-<판>.json` 을 먼저 찾고, 없으면 옛 이름으로
    떨어진다(지난 판들이 그 이름으로 남아 있다).
    """
    base = ROOT + "/data/briefing/narrative-%s" % day.isoformat()
    for p in ("%s-%s.json" % (base, kind), "%s.json" % base):
        if os.path.exists(p):
            return json.load(io.open(p, encoding="utf-8"))
    return {}


# ══════════════════════════════════════════════════════════════════
# 절
# ══════════════════════════════════════════════════════════════════
def sec_today(C):
    """01 오늘의 결론 — 카드 여섯 + 세 줄.

    **여기서 쓴 숫자를 뒤에서 다시 적지 않는다**(지침 7-2-1 ①). 뒤 절은 표가
    말하게 두고, 이 절만 「그래서 무엇을 할 것인가」를 말한다.
    """
    I, KS, KQ, ksb, kqb, kf = C["I"], C["KS"], C["KQ"], C["ksb"], C["kqb"], C["kf"]
    N, ru, S = C["N"], C["ru"], C["S"]
    ten = C["adv_per_ten"]

    cards = [
        stat("코스피 (" + DS(C["prev_kr"]) + ")", "KOSPI (" + DE(C["prev_kr"]) + ")",
             n(KS["close"]), pct(KS["change_pct"]),
             "상승 " + n(ksb["advancing"], 0) + " 대 하락 " + n(ksb["declining"], 0)
             + " &mdash; 열에 " + n(ten, 0),
             n(ksb["advancing"], 0) + " up, " + n(ksb["declining"], 0) + " down"),
        stat("코스닥", "KOSDAQ", n(KQ["close"]), pct(KQ["change_pct"]),
             "상승 " + n(kqb["advancing"], 0) + " 대 하락 " + n(kqb["declining"], 0),
             n(kqb["advancing"], 0) + " up, " + n(kqb["declining"], 0) + " down"),
        stat("거래대금", "Turnover", n(C["turnover"][0][1]) + "조", C["turnover_word"],
             C["turnover_trail"], C["turnover_trail_en"]),
        stat("외국인 순매수", "Foreign net", eok(kf["foreign"]), "",
             "기관 " + eok(kf["institution"]) + " &middot; 개인 " + eok(kf["retail"]),
             "Institutions " + eok(kf["institution"]) + ", retail " + eok(kf["retail"])),
        stat("미 10년물", "US 10-year", n(ru["curve"]["ust10y"], 3) + "%",
             bp(ru["change_bp"]["ust10y"]),
             "2년 " + bp(ru["change_bp"]["ust2y"]) + " &middot; 30년 " + bp(ru["change_bp"]["ust30y"]),
             "2y " + bp(ru["change_bp"]["ust2y"]) + ", 30y " + bp(ru["change_bp"]["ust30y"])),
        stat("원/달러", "USD/KRW", n(C["usdkrw"]["close"], 2), pct(C["usdkrw"]["change_pct"]),
             "달러인덱스 " + pct(I["dxy"]["change_pct"]),
             "Dollar index " + pct(I["dxy"]["change_pct"])),
    ]

    paras = []
    for i, key in enumerate(("today_1", "today_2", "today_3")):
        fb_ko, fb_en = C["fallback_today"][i]
        a, b = N.get(key, fb_ko, fb_en)
        paras.append(P(a, b))

    grid = "stat-grid six"
    return ('<div class="' + grid + '">\n' + "\n".join(cards) + '\n</div>\n'
            + callout("오늘 09시 개장에 들고 갈 것",
                      "What to carry into the 09:00 open", paras))


def sec_korea(C):
    """02 국내 증시 — 지수·폭·종목. 종목표는 **주도와 부진 여덟씩**으로 줄인다."""
    I, KS, KQ, ksb, kqb, N, S = C["I"], C["KS"], C["KQ"], C["ksb"], C["kqb"], C["N"], C["S"]
    idx_head = [TH("지수", "Index", "wrap"), TH("설명", "What it says", "note wrap"),
                TH("종가", "Close", "n"), TH("등락률", "Change %", "n"), THP(),
                TH("검증", "Verified", "n opt")]
    rows = []
    for k, ko, en, nk, ne in (
            ("kospi", "코스피", "KOSPI", "대형주 중심. 삼성전자·SK하이닉스가 절반 가까이",
             "Large caps; two chipmakers are nearly half of it"),
            ("kosdaq", "코스닥", "KOSDAQ", "중소형·성장주 중심",
             "Small and mid-cap growth")):
        v = I[k]
        rows.append('      <tr><th class="wrap">' + L(ko, en) + '</th>'
                    '<td class="n note">' + L(nk, ne) + '</td>'
                    '<td class="n">' + n(v["close"]) + '</td>' + _cell(v["change_pct"])
                    + perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
    kr_idx = tbl("국내 지수 &mdash; " + DK(C["prev_kr"], True) + " 마감",
                 "Korean indices &mdash; " + DE(C["prev_kr"], True) + " close",
                 idx_head, rows, cls="data compact",
                 foot_ko=C["kr_idx_foot_ko"], foot_en=C["kr_idx_foot_en"])

    # 폭 · 52주 위치 — 한 표로 합쳐 절 수를 줄인다
    br_head = [TH("항목", "Measure", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
               TH("코스피", "KOSPI", "n"), TH("코스닥", "KOSDAQ", "n"),
               TH("검증", "Verified", "n opt")]
    br_rows = [
        _brow("상승 / 하락 종목", "Advancing / declining",
              "지수 방향과 어긋나면 대형주 몇 개가 지수를 움직인 것입니다",
              "If it disagrees with the index, a few heavyweights moved it",
              n(ksb["advancing"], 0) + " / " + n(ksb["declining"], 0),
              n(kqb["advancing"], 0) + " / " + n(kqb["declining"], 0), True),
        _brow("오른 종목 비율", "Share advancing",
              "열 종목 가운데 몇 개가 올랐는지",
              "How many in ten rose",
              "열에 " + n(C["adv_per_ten"], 0), "열에 " + n(C["adv_per_ten_q"], 0)),
        _brow("52주 구간 내 위치", "Position in the 52-week range",
              "(종가 &minus; 저) &divide; (고 &minus; 저). 지금이 비싼 자리인지",
              "(close &minus; low) / (high &minus; low)",
              n(C["pos52_ks"], 1) + "%", n(C["pos52_kq"], 1) + "%"),
        _brow("상한 / 하한", "Limit up / down", "&nbsp;", "&nbsp;",
              n(ksb.get("limit_up"), 0) + " / " + n(ksb.get("limit_down"), 0),
              n(kqb.get("limit_up"), 0) + " / " + n(kqb.get("limit_down"), 0)),
    ]
    breadth = tbl("시장의 폭 &mdash; " + DK(C["prev_kr"]), "Market breadth &mdash; " + DE(C["prev_kr"]),
                  br_head, br_rows, cls="data compact",
                  foot_ko="<strong>52주 최고는 네이버 지수 페이지 표기 그대로</strong>이며 최근 종가 흐름과 "
                          "차이가 큽니다 &mdash; 검증 노트를 보십시오 " + VF_N + ".",
                  foot_en="<strong>The 52-week high is as published by Naver</strong> and sits far above recent "
                          "closes &mdash; see the verification notes " + VF_N + ".")

    kr_stk = _stock_table("국내 주요 종목 &mdash; " + DK(C["prev_kr"]) + " 마감, 단위 원",
                          "Korean stocks &mdash; " + DE(C["prev_kr"]) + " close, in won",
                          C["kr_top"], C["kr_bot"], C["why"],
                          foot_ko=C["kr_stk_foot_ko"], foot_en=C["kr_stk_foot_en"])

    a, b = N.get("korea_lede", C["fb_korea"][0], C["fb_korea"][1])
    if CORE[0]:
        # 「시장의 폭」을 되살렸다 — 52주 구간 내 위치는 「지금이 비싼 자리인가」에
        # 답하는 유일한 값이고, 카드로는 담기지 않는다(재검증기도 이 값을 찾는다).
        # 종목은 **옆으로 세워 스무 개**를 싣는다(네 개로는 아무 말도 못 한다).
        # **지수표와 폭표를 하나로 합친다.** 둘 다 「코스피/코스닥이 지금 어떤
        # 상태인가」를 말하는데 캡션과 꼬리말을 따로 달고 있었고, 지수표가 두
        # 줄뿐이라 옆 칸에 맞춰 늘어나며 103px 이 비었다. 한 표로 합치면 그
        # 빈자리가 사라지고, 옆 칸에는 업종표가 들어간다.
        snap = _kr_snapshot_core(C, kr_idx, breadth)
        return (lede(a, b) + '\n<div class="duo">\n' + snap + "\n"
                + (_sector_kr_core(C) or "") + '\n</div>\n'
                + _stock_core("국내 종목 &mdash; " + DK(C["prev_kr"]) + " 마감, 원",
                              "Korean stocks &mdash; " + DE(C["prev_kr"]) + ", in won",
                              *_wide(C["S"], 10), why=C["why"],
                              foot_ko=C["kr_stk_foot_ko"], foot_en=C["kr_stk_foot_en"]))
    return (lede(a, b) + "\n" + kr_idx + "\n" + breadth + "\n" + kr_stk + "\n"
            + exp("업종 상위·하위와 등락 종목 수 추이",
                  "Sector leaders and laggards, and breadth over time",
                  C["sector_tbl"] + "\n" + C["breadth_trend"]))


def sec_flows(C):
    """03 수급 · 증시 주변자금 — 요건 8. 외국인/기관/개인 · 예탁금 · 신용 · 매물대."""
    N, kf, qf, KSI, mfl = C["N"], C["kf"], C["qf"], C["KSI"], C["mfl"]
    head = [TH("주체 &middot; 항목", "Who / what", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
            TH("코스피", "KOSPI", "n"), TH("코스닥", "KOSDAQ", "n"), TH("검증", "Verified", "n opt")]
    rows = [
        _brow("외국인 순매수", "Foreign net buying",
              "방향보다 <strong>전날 대비 변화</strong>가 큽니다 &mdash; 팔던 손이 멎는 것만으로 지수가 움직입니다",
              "The change matters more than the level",
              eok(kf["foreign"]), eok(qf["foreign"]), True),
        _brow("기관 순매수", "Institutions", "연기금·투신·보험", "Pensions, funds, insurers",
              eok(kf["institution"]), eok(qf["institution"])),
        _brow("개인 순매수", "Retail", "외국인·기관이 판 것을 누가 받았는지",
              "Who absorbed what the others sold", eok(kf["retail"]), eok(qf["retail"])),
        _brow("프로그램 비차익", "Non-arb programme",
              "크게 마이너스면 <strong>바스켓 매도</strong>가 지수를 눌렀다는 신호입니다",
              "Deeply negative means basket selling weighed on the index",
              eok(KSI["program_trading"]["non_arb"]),
              eok(C["KQI"]["program_trading"]["non_arb"])),
    ]
    flow_tbl = tbl("투자자별 순매수 &mdash; " + DK(C["prev_kr"]) + ", 단위 원",
                   "Net buying by investor type &mdash; " + DE(C["prev_kr"]),
                   head, rows, cls="data compact",
                   foot_ko=C["flow_foot_ko"], foot_en=C["flow_foot_en"])

    # 증시 주변자금 — 예탁금·신용·펀드. **증감은 *_delta 를 쓴다**(지침 1절).
    mh = [TH("항목", "Item", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
          TH("잔액", "Level", "n"), TH("전일 대비", "Change", "n"),
          TH("10영업일 흐름", "10 sessions", "n sparkcell"), TH("검증", "Verified", "n opt")]
    ser = (C["D"].get("money_flow") or {}).get("series") or []

    def _sp(key):
        vals = [r.get(key) for r in ser if r.get(key) is not None]
        return sparkline(vals[::-1] if vals else [])

    mrows = [
        _mrow("고객예탁금", "Customer deposits",
              "<strong>증시로 들어와 대기 중인 돈</strong>입니다. 늘면 살 힘이 붙습니다",
              "Cash parked and waiting to buy",
              jo(mfl.get("deposit")) + "원", eok(mfl.get("deposit_delta")), _sp("deposit"), True),
        _mrow("신용융자 잔고", "Margin loans",
              "<strong>빌려서 산 돈</strong>입니다. 늘면 오를 때도 내릴 때도 폭이 커집니다",
              "Money borrowed to buy; it amplifies both directions",
              jo(mfl.get("credit_balance")) + "원", eok(mfl.get("credit_balance_delta")),
              _sp("credit_balance")),
        _mrow("주식형 펀드", "Equity funds", "간접 투자 쪽 자금", "Indirect flows",
              jo(mfl.get("fund_equity")) + "원", eok(mfl.get("fund_equity_delta")),
              _sp("fund_equity")),
        _mrow("채권형 펀드", "Bond funds", "위험을 덜 때 이쪽이 늡니다",
              "This grows when risk comes off",
              jo(mfl.get("fund_bond")) + "원", eok(mfl.get("fund_bond_delta")),
              _sp("fund_bond")),
    ]
    money_tbl = tbl("증시 주변자금 &mdash; " + DK(d(mfl["date"])) + " 기준",
                    "Money around the market &mdash; as of " + DE(d(mfl["date"])),
                    mh, mrows, cls="data compact",
                    foot_ko="<strong>신용융자와 예탁금은 결제일 기준</strong>이라 종가일보다 1~2영업일 "
                            "늦습니다 " + VF_MD + ". 증감은 네이버가 주는 부호 없는 값이 아니라 "
                            "<strong>계열에서 계산한 실제 증감</strong>입니다 " + VF_C + ". "
                            "스파크라인의 세로 축은 <strong>줄마다 따로 맞췄으므로 높이를 줄끼리 견주지 마십시오.</strong>",
                    foot_en="<strong>Deposits and margin balances are on a settlement basis</strong>, one to two "
                            "sessions behind the close " + VF_MD + ". Changes are computed from the series, not "
                            "taken from the unsigned figure Naver publishes " + VF_C + ". "
                            "<strong>Each sparkline is scaled to its own row</strong> &mdash; do not compare heights.")

    body = lede(*N.get("flows_lede", C["fb_flows"][0], C["fb_flows"][1]))
    if CORE[0]:
        body += '\n<div class="duo">\n' + flow_tbl + "\n" + money_tbl + '\n</div>'
    else:
        body += "\n" + flow_tbl + "\n" + money_tbl
    if not CORE[0]:
        # 매물대만 전체 판에 둔다 — 근사이고, 그날의 결정보다 추이로 읽는 값이다.
        if C["supply_tbl"]:
            body += "\n" + C["supply_tbl"]
    body += "\n" + exp("투자자별 순매수 추이 &mdash; 최근 10거래일",
                       "Net buying by investor type &mdash; last 10 sessions", C["inv_trend"])
    return body


def sec_global(C):
    """04 간밤 해외 — 미국·유럽·아시아를 **한 절에** 넣는다(지침 7절 압축)."""
    I, N = C["I"], C["N"]
    idx_head = [TH("지수", "Index", "wrap"), TH("지역", "Region", "wrap"),
                TH("종가", "Close", "n"), TH("등락률", "Change %", "n"), THP(),
                TH("검증", "Verified", "n opt")]
    # 핵심본에서도 **아시아와 유럽 지수를 빼지 않는다.** 여섯 개만 세웠더니
    # 옆의 업종표보다 65px 짧아 칸 아래가 비었는데, 정작 홍콩&middot;상하이
    # &middot;가권&middot;DAX 는 실려 있지도 않았다 &mdash; 중화권 개별 종목은
    # 3단에 있으면서 그 지수가 없는 판이었다. 빈자리에 그것을 넣는다.
    CORE_KEYS = ("dow", "sp500", "nasdaq", "sox", "vix", "stoxx600", "dax",
                 "nikkei", "hangseng", "shanghai", "taiwan")
    SPEC = [("dow", "다우", "Dow", "미국", "US"), ("sp500", "S&amp;P 500", "S&amp;P 500", "미국", "US"),
            ("nasdaq", "나스닥", "NASDAQ", "미국", "US"), ("sox", "SOX (반도체)", "SOX", "미국", "US"),
            ("vix", "VIX", "VIX", "미국", "US"),
            ("stoxx600", "STOXX 600", "STOXX 600", "유럽", "Europe"),
            ("dax", "DAX", "DAX", "유럽", "Europe"), ("ftse", "FTSE 100", "FTSE 100", "유럽", "Europe"),
            ("nikkei", "니케이", "Nikkei", "아시아", "Asia"),
            ("hangseng", "항셍", "Hang Seng", "아시아", "Asia"),
            ("shanghai", "상하이", "Shanghai", "아시아", "Asia"),
            ("taiwan", "가권", "Taiwan", "아시아", "Asia")]
    rows = []
    for k, ko, en, rk, re_ in SPEC:
        v = I.get(k)
        if not v:
            continue
        if CORE[0] and k not in CORE_KEYS:
            continue
        hl = ' class="hl"' if k in ("sox", "taiwan") else ''
        rows.append('      <tr' + hl + '><th class="wrap">' + L(ko, en) + '</th>'
                    '<td class="wrap">' + L(rk, re_) + '</td>'
                    '<td class="n">' + n(v["close"]) + '</td>' + _cell(v["change_pct"])
                    + perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
    gidx = tbl("해외 지수 &mdash; " + DK(C["prev_us"]) + " 현지 마감",
               "Overseas indices &mdash; local close, " + DE(C["prev_us"]),
               idx_head, rows, cls="data compact",
               foot_ko="<strong>아시아는 미국보다 먼저 닫습니다</strong> &mdash; 같은 날짜라도 아시아는 "
                       "미국 장중에 나온 소식을 모르는 채 거래를 끝냅니다 " + VF_C + ". "
                       "<strong>가권은 TSMC 비중이 커 반도체 투심의 대리 지표</strong>로 봅니다.",
               foot_en="<strong>Asia closes before New York</strong> &mdash; on the same date, Asia trades without "
                       "knowing what the US session brings " + VF_C + ". <strong>Taiwan, TSMC-heavy, reads as a "
                       "proxy for semiconductor sentiment.</strong>")

    us_stk = _stock_table("미국 주요 종목 &mdash; " + DK(C["prev_us"]) + ", 단위 달러",
                          "US stocks &mdash; " + DE(C["prev_us"]) + ", in dollars",
                          C["us_top"], C["us_bot"], C["why"],
                          foot_ko=C["us_stk_foot_ko"], foot_en=C["us_stk_foot_en"])

    a, b = N.get("global_lede", C["fb_global"][0], C["fb_global"][1])
    if CORE[0]:
        trio = "".join(x for x in (
            _region_core(C, "eu_stocks", "유럽 &mdash; 거래 통화 기준", "Europe &mdash; local currency"),
            _region_core(C, "jp_stocks", "일본 &mdash; 단위 엔", "Japan &mdash; in yen"),
            _region_core(C, "cn_stocks", "중화권 &mdash; 본토 CNY &middot; 홍콩 HKD",
                         "Greater China &mdash; CNY and HKD"),
        ) if x)
        trio_foot = ('<p class="tbl-foot">' + L(
            "세 표는 <strong>통화가 다 다릅니다</strong>(EUR&middot;GBp&middot;CHF&middot;JPY&middot;CNY"
            "&middot;HKD) &mdash; <strong>종가는 견주지 말고 등락률로 견주십시오.</strong> 도쿄와 홍콩은 "
            "국내 오후에 닫으므로 <strong>미국 장중 소식을 모르는 값</strong>입니다 " + VF_MD + ".",
            "The three tables are in <strong>different currencies</strong> (EUR, GBp, CHF, JPY, CNY, HKD) "
            "&mdash; <strong>compare percentages, not price levels.</strong> Tokyo and Hong Kong close "
            "before the US session " + VF_MD + ".") + '</p>')
        # 업종 ETF 는 「어느 업종에 돈이 붙었나」를 한 표로 말한다 &mdash; 금리가
        # 움직인 날에는 이것이 지수보다 많은 것을 설명한다(은행↑ 유틸리티↓).
        # 해외 지수와 업종 ETF 는 둘 다 열이 적어 나란히 세운다 &mdash; 「어디가
        # 얼마나」와 「어느 업종에 돈이 붙었나」를 한눈에 붙여 읽게 된다.
        # 업종은 **여섯으로 줄여 왼쪽 지수표와 줄 수를 맞춘다**(_sector_core).
        return (lede(a, b) + '\n<div class="duo">\n' + gidx + "\n"
                + (_sector_core(C, keep=8) or "") + '\n</div>\n'
                + _stock_core("미국 종목 &mdash; " + DK(C["prev_us"]) + ", 달러",
                              "US stocks &mdash; " + DE(C["prev_us"]) + ", in dollars",
                              C["us_top"], C["us_bot"], C["why"],
                              foot_ko=C["us_stk_foot_ko"], foot_en=C["us_stk_foot_en"])
                + ("\n<div class=\"trio\">\n" + trio + "\n</div>\n" + trio_foot if trio else ""))
    return (lede(a, b) + "\n" + gidx + "\n" + us_stk + "\n"
            + exp("미국 업종 ETF &middot; 유럽 &middot; 일본 &middot; 중국 개별 종목",
                  "US sector ETFs, and single stocks in Europe, Japan and China",
                  C["us_sec_tbl"] + "\n" + C["eu_tbl"] + "\n" + C["jp_tbl"] + "\n" + C["cn_tbl"]))


def sec_earnings(C):
    """05 실적 · 컨퍼런스콜 — 요건 3. **기사 원문 그대로** 싣는다."""
    N = C["N"]
    E = (C["D"].get("earnings") or {})
    items = E.get("items") or []
    a, b = N.get("earnings_lede",
                 ("오늘 수집분에서 실적&middot;컨퍼런스콜을 다룬 대목이 <strong>" + str(len(items))
                  + "건</strong> 나왔습니다"
                  + ("(컨퍼런스콜 언급 " + str(E.get("with_call", 0)) + "건)." if items else ".")
                  + " 아래는 <strong>기사 본문을 그대로</strong> 옮긴 것입니다 " + VF_1 + "."
                  if items else
                  "<strong>오늘 수집분에는 실적&middot;컨퍼런스콜을 다룬 기사가 없습니다</strong> " + VF_N
                  + " &mdash; 지어내지 않고 비워 둡니다."),
                 ("Today&rsquo;s collection contains <strong>" + str(len(items))
                  + "</strong> passages on results and calls; the text below is quoted verbatim " + VF_1 + "."
                  if items else
                  "<strong>No article in today&rsquo;s collection covers results or calls</strong> " + VF_N + "."))
    if not items:
        return lede(a, b)

    VERD = {"beat": ("<span class=\"vf ok\">상회</span>", "<span class=\"vf ok\">BEAT</span>"),
            "miss": ("<span class=\"vf bad\">하회</span>", "<span class=\"vf bad\">MISS</span>")}
    head = [TH("기업", "Company", "wrap"), TH("기사에서", "From the article", "wrap"),
            TH("판정", "Verdict", "n"), TH("컨콜", "Call", "n"), TH("검증", "Verified", "n opt")]
    rows = []
    for e in items[:8]:
        vk, ve = VERD.get(e.get("verdict"), ("&mdash;", "&mdash;"))
        px = C["price_of"](e["company"])
        rows.append('      <tr' + (' class="hl"' if e.get("has_call") else '') + '>'
                    '<th class="wrap">' + esc(e["company"])
                    + ('<span class="sub">' + px + '</span>' if px else '') + '</th>'
                    '<td class="wrap">' + esc(e["quotes"][0])[:220] + '</td>'
                    '<td class="n">' + L(vk, ve) + '</td>'
                    '<td class="n">' + ("&#9679;" if e.get("has_call") else "&mdash;") + '</td>'
                    '<td class="n opt">' + VF_1 + '</td></tr>')
    t = tbl("실적 &middot; 컨퍼런스콜 &mdash; 오늘 수집분",
            "Results and calls &mdash; from today&rsquo;s collection", head, rows,
            cls="data compact",
            foot_ko="<strong>판정은 기사에 「상회」·「하회」라고 적혀 있을 때만</strong> 답니다 &mdash; "
                    "컨센서스를 저희가 다시 계산한 것이 아닙니다 " + VF_1 + ". 「컨콜」 표시는 그 기사에 "
                    "컨퍼런스콜 발언이 인용된 경우입니다. <strong>이름 밑 숫자는 그 종목의 직전 마감</strong>입니다.",
            foot_en="<strong>A verdict appears only where the article itself says beat or miss</strong> &mdash; we do "
                    "not recompute consensus " + VF_1 + ". The call marker means the article quotes the earnings "
                    "call. <strong>The figure under each name is that stock&rsquo;s last close.</strong>")

    calls = [e for e in items if e.get("call_quotes")]
    body = lede(a, b) + "\n" + t
    if calls:
        cc = "\n".join(
            card(e["company"] + " &mdash; 컨퍼런스콜", e["company"] + " &mdash; earnings call",
                 " ".join(esc(q) for q in e["call_quotes"][:2])[:420] + " " + VF_1,
                 " ".join(esc(q) for q in e["call_quotes"][:2])[:420] + " " + VF_1)
            for e in calls[:3])
        body += '\n<div class="soft-grid">\n' + cc + '\n</div>'
    return body


def sec_macro(C):
    """06 금리 · 환율 · 원자재 — 세 절이던 것을 하나로(지침 7절 압축)."""
    I, ru, N, ec, rk = C["I"], C["ru"], C["N"], C["ec"], C["rk"]
    h = [TH("항목", "Item", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
         TH("현재", "Level", "n"), TH("전일 대비", "Change", "n"),
         TH("검증", "Verified", "n opt")]
    rows = [
        _brow("미 국채 2년", "US 2-year",
              "<strong>정책금리 기대</strong>가 가장 먼저 붙는 만기입니다",
              "Where policy expectations show up first",
              n(ru["curve"]["ust2y"], 3) + "%", bp(ru["change_bp"]["ust2y"]), True),
        _brow("미 국채 10년", "US 10-year",
              "국내 성장주&middot;반도체의 <strong>할인율</strong>입니다",
              "The discount rate on Korean growth and semis",
              n(ru["curve"]["ust10y"], 3) + "%", bp(ru["change_bp"]["ust10y"]), True),
        _brow("미 국채 30년", "US 30-year", "재정과 기간 프리미엄이 붙는 자리",
              "Where fiscal risk and term premium sit",
              n(ru["curve"]["ust30y"], 3) + "%", bp(ru["change_bp"]["ust30y"])),
        _brow("10년 &minus; 2년", "10s minus 2s",
              "<strong>기울기</strong>. 가팔라지면 성장&middot;물가 쪽, 눌리면 정책 쪽입니다",
              "The slope &mdash; steepening is growth, flattening is policy",
              bp(ru.get("spread_10y_2y_bp"), 0), "&mdash;"),
        _brow("국고채 10년", "Korea 10-year", "한미 금리차가 원화 방향과 직결됩니다",
              "The Korea&ndash;US gap drives the won",
              n((ec.get("ktb10y") or {}).get("value"), 3) + "%",
              bp(((rk.get("perf") or {}).get("ktb10y") or {}).get("w1"))),
        _brow("한미 10년 금리차", "Korea minus US, 10-year",
              "마이너스면 <strong>국내 금리가 미국보다 낮다</strong>는 뜻이고 원화에 부담입니다",
              "Negative means Korean yields sit below US yields",
              bp(C["kr_us_gap"], 1), "&mdash;"),
        _brow("COFIX (신규취급액)", "COFIX, new loans",
              "<strong>고객 대출금리에 직결</strong>됩니다", "Feeds directly into retail loan rates",
              n(rk.get("cofix_new"), 2) + "%", "&mdash;"),
    ] + ([] if CORE[0] else [
        _brow("MOVE", "MOVE", "채권판 VIX. 금리가 움직여도 이게 죽어 있으면 안도입니다",
              "The VIX of bonds", n(I["move"]["close"]), pct(I["move"]["change_pct"]))
    ]) + [
    ]
    rates = tbl("금리 &mdash; " + DK(C["prev_us"]) + " 확정",
                "Rates &mdash; official fixings, " + DE(C["prev_us"]), h, rows,
                cls="data compact",
                foot_ko="미 국채는 <strong>재무부 확정 고시</strong>이고 " + VF_OK + ", 국고채는 한국은행 "
                        "ECOS 입니다. <strong>한미 금리차는 같은 만기끼리 뺀 값</strong>입니다 " + VF_C + ". "
                        + ("만기 열한 개 전부는 <strong>오른쪽 곡선표</strong>에 있습니다."
                           if CORE[0] else "만기 열한 개 전부는 아래 상세에 있습니다."),
                foot_en="US yields are <strong>Treasury official fixings</strong> " + VF_OK + "; Korean yields come "
                        "from ECOS. <strong>The gap is same-maturity subtraction</strong> " + VF_C + ". "
                        + ("The full eleven-point curve is <strong>in the right-hand column</strong>."
                           if CORE[0] else "The full eleven-point curve is in the detail below."))

    a, b = N.get("macro_lede", C["fb_macro"][0], C["fb_macro"][1])
    if CORE[0]:
        # 원자재를 한 줄로 깔면 표 하나가 쪽 폭을 통째로 먹는다. 열이 여덟인
        # 준비 단계 표(cm_tbl)는 반 칸에 넣으면 넘치므로(700~1600px 에서 최대
        # 246px) **이름·종가·등락률 셋으로 줄인 판**을 따로 만들어 오른 칸에
        # 환율 밑으로 세운다. 왼쪽은 금리(일곱 줄), 오른쪽은 환율(다섯) + 원자재
        # (일곱) — 두 칸의 높이가 얼추 맞는다.
        return (lede(a, b) + '\n<div class="duo">\n'
                + '<div>\n' + rates + "\n" + (_cm_core(C) or "") + '\n</div>\n'
                + '<div>\n' + C["fx_tbl"] + "\n" + (_curve_core(C) or "") + '\n</div>\n</div>')
    return (lede(a, b) + "\n" + rates + "\n" + C["fx_tbl"] + "\n" + C["cm_tbl"] + "\n"
            + exp("미 재무부 곡선 만기 11개 &middot; 달러 상대 통화",
                  "The full US curve and the dollar crosses",
                  C["curve_tbl"] + "\n" + C["usdfx_tbl"]))


def sec_deep(C):
    """07 심층 분석 — 요건 6. **큰 이벤트가 있는 날만** 실린다."""
    N = C["N"]
    dp = N.d.get("deep")
    if not isinstance(dp, dict) or not dp.get("title_ko"):
        return None
    N.used.add("deep")
    blocks = [lede(dp.get("lede_ko", ""), dp.get("lede_en", ""))]
    for row in dp.get("blocks", []):
        blocks.append(card(row.get("q_ko", ""), row.get("q_en", ""),
                           row.get("a_ko", ""), row.get("a_en", "")))
    if CORE[0]:
        # 핵심본에서도 **그날의 이슈와 실적은 남긴다.** 요약이 「무엇이 움직였나」만
        # 말하고 「그래서 이것이 무슨 뜻인가」를 말하지 않으면, 받아 보는 쪽이 다시
        # 물어야 한다. 카드는 넷까지, 딸린 표는 접어 두지 않고 그대로 싣는다.
        blocks = blocks[:5]
    body = blocks[0] + '\n<div class="soft-grid">\n' + "\n".join(blocks[1:]) + '\n</div>'
    if dp.get("table"):
        body += "\n" + dp["table"]
    return (dp["title_ko"], dp.get("title_en", dp["title_ko"]), body)


def sec_calendar(C):
    """08 일정 — **지난 줄은 스스로 빠진다**(지침 7-2-1 ③)."""
    N, today = C["N"], C["today"]
    rows_in = N.d.get("calendar") or []
    head = [TH("일시 (KST)", "When", "wrap"), TH("왜 보는가", "Why it matters", "note wrap"),
            TH("구분", "Type", "wrap"), TH("일정", "Event", "wrap"), TH("검증", "Verified", "n opt")]
    kept, dropped = [], 0
    for r in rows_in:
        last = _cal_last(r.get("when_ko", ""), today.year)
        if last and last < today:
            dropped += 1
            continue
        kept.append('      <tr' + (' class="hl"' if r.get("hl") else '') + '>'
                    '<th class="wrap">' + r.get("when_ko", "") + '</th>'
                    '<td class="n note">' + L(r.get("why_ko", "&nbsp;"), r.get("why_en", "&nbsp;")) + '</td>'
                    '<td class="wrap">' + L(r.get("type_ko", ""), r.get("type_en", "")) + '</td>'
                    '<td class="wrap">' + L(r.get("what_ko", ""), r.get("what_en", "")) + '</td>'
                    '<td class="n opt">' + VF_1 + '</td></tr>')
    C["cal_dropped"] = dropped

    if not kept:
        return lede("<strong>오늘 실을 예정 일정이 서술 파일에 없습니다</strong> " + VF_N
                    + " &mdash; 지어내지 않고 비워 둡니다.",
                    "<strong>No forward calendar was supplied for today</strong> " + VF_N + ".")
    t = tbl("예정 일정 &mdash; " + DK(today) + " 이후 (한국시간)",
            "Scheduled events from " + DE(today) + ", KST", head, kept, cls="data compact",
            foot_ko="<strong>지난 줄은 스스로 빠집니다</strong> &mdash; 오늘 " + str(dropped) + "줄을 걷어냈습니다 "
                    + VF_C + ". <strong>컨센서스와 전망은 결과가 아닙니다.</strong> 거래소가 일정을 바꾸므로 "
                            "주문 직전 다시 확인하십시오.",
            foot_en="<strong>Elapsed rows drop out on their own</strong> &mdash; " + str(dropped)
                    + " removed today " + VF_C + ". <strong>Forecasts are not results.</strong> Exchanges move "
                      "dates; reconfirm before acting.")
    a, b = N.get("calendar_lede",
                 "앞으로 2주 이상을 봅니다. <strong>날짜가 정해져 있고 시장을 움직일 수 있는 것</strong>만 "
                 "넣었습니다 &mdash; 매일 같은 시각에 열리는 개장&middot;마감은 넣지 않습니다.",
                 "Two weeks or more ahead. <strong>Only dated events that can move the market</strong> &mdash; "
                 "recurring opens and closes are left out.")
    body = lede(a, b) + "\n" + t
    # 휴장일은 **자료 파일**에서 온다(지침 7-3절). 이 절 안에 접어서 둔다.
    if CORE[0]:
        hol = _holidays_core(C)
        if hol:
            body += ('\n<h3 class="mini">' + L("휴장일 &mdash; 국내&middot;해외 가까운 순",
                                              "Market holidays &mdash; Korea and overseas") + "</h3>\n" + hol)
        return body
    if C.get("holiday_tbl"):
        body += "\n" + exp("휴장일 &mdash; 국내&middot;해외 앞으로 넉 달",
                           "Market holidays &mdash; Korea and overseas, next four months",
                           C["holiday_tbl"])
    return body


def sec_talking(C):
    """09 고객 응대 — 질문 넷. **이 판의 표에서 나온 숫자로만** 답한다."""
    N = C["N"]
    qs = N.d.get("talking") or []
    if qs:
        N.used.add("talking")
    else:
        qs = C["fb_talking"]
    cards = "\n".join(card("Q. " + q.get("q_ko", ""), "Q. " + q.get("q_en", ""),
                           q.get("a_ko", ""), q.get("a_en", "")) for q in qs[:3 if CORE[0] else 4])
    a, b = N.get("talking_lede",
                 "아래 답변은 <strong>모두 이 판의 표에서 나온 숫자로만</strong> 만들었습니다. "
                 "<strong>확정된 투자 판단이 아닙니다.</strong>",
                 "Every answer below is built only from the tables in this edition. "
                 "<strong>None of it is a settled investment judgement.</strong>")
    if CORE[0]:
        return '<div class="soft-grid">\n' + cards + '\n</div>'
    return lede(a, b) + '\n<div class="soft-grid">\n' + cards + '\n</div>'


# 서술 슬롯 개수는 **판을 다 짓고 나서** 채운다. 검증 절 안에서 바로 세면
# 그 절 자신의 서술(verify_lede)이 아직 비기 전이라 하나 적게 나온다 —
# 실제로 「자료에서 만든 자리 2곳」이라 적고 3곳이 나갔다.
NUSED, NFB = "<!--n-used-->", "<!--n-fb-->"


def sec_verify_core(C):
    """핵심본의 10절 — 노트 전체 대신 **한 문단**.

    줄인다고 검증을 감추지는 않는다. 무엇을 어디서 가져왔는지, 오늘 무엇을
    확인하지 못했는지, 그리고 **전체 판 어디를 보면 되는지**는 남긴다.
    """
    N = C["N"]
    notes = N.d.get("verify") or []
    if notes:
        N.used.add("verify")
    heads_ko = "; ".join(re.sub(r"<[^>]+>", "", x.get("t_ko", "")) for x in notes[:4])
    heads_en = "; ".join(re.sub(r"<[^>]+>", "", x.get("t_en", "")) for x in notes[:4])
    more_ko = (" 외 %d건" % (len(notes) - 4)) if len(notes) > 4 else ""
    more_en = (" and %d more" % (len(notes) - 4)) if len(notes) > 4 else ""
    return "\n".join((
        lede("<strong>이것은 핵심본입니다 &mdash; 다섯 쪽 안에 그날의 결론만 담았습니다.</strong> "
             "표의 근거, 만기별 곡선, 지역별 종목표, 검증 노트 전체는 <strong>같은 날짜의 전체 판</strong>에 "
             "그대로 있습니다.",
             "<strong>This is the core edition &mdash; the day's conclusions in five pages.</strong> "
             "Supporting tables, the full maturity curve, regional stock tables and the complete "
             "verification notes remain in <strong>the full edition of the same date</strong>."),
        P("<strong>어디서 왔나.</strong> 시세는 야후&middot;네이버&middot;한국은행 ECOS, 미 국채는 "
          "<strong>재무부 일별 고시 확정치</strong>, 사유&middot;일정은 그날 수집한 기사 본문입니다 "
          + VF_MD + ". 누적&middot;스프레드&middot;비율은 <strong>계산</strong>입니다 " + VF_C + ".",
          "<strong>Where it comes from.</strong> Prices from Yahoo, Naver and the Bank of Korea's ECOS; US "
          "Treasuries from <strong>Treasury's official daily par yields</strong>; reasons and calendar items "
          "from article text collected that morning " + VF_MD + ". Cumulative figures, spreads and ratios are "
          "<strong>computed</strong> " + VF_C + "."),
        P("<strong>오늘 짚어 둔 것.</strong> " + (heads_ko + more_ko if notes else
          "그날에만 있는 검증 항목은 없습니다") + ". <strong>받지 못하는 항목</strong>은 VKOSPI("
          "무료 원천 없음, VIX 로 대신합니다)와 미수금&middot;반대매매(금융투자협회 방화벽, 신용융자로 "
          "대신합니다), 한국은행 기준금리(ECOS 샘플 인증키가 0행을 돌려줍니다)입니다 " + VF_N + ".",
          "<strong>Flagged today.</strong> " + (heads_en + more_en if notes else
          "No date-specific verification items") + ". <strong>Still unavailable</strong>: VKOSPI (no free source; "
          "we use the VIX), unpaid balances and forced liquidations (KOFIA firewall; we use margin loans), and the "
          "BOK policy rate (ECOS returns zero rows on the sample key) " + VF_N + "."),
    ))


def sec_verify(C):
    """10 데이터 · 검증 — **대부분 접는다**(지침 7절 압축)."""
    N, D = C["N"], C["D"]
    notes = N.d.get("verify") or []
    if notes:
        N.used.add("verify")
    fixed = [
        ("(a) 묶음마다 기준일이 다릅니다", "(a) The basis date differs by group",
         "<strong>오늘 09시 개장 전이라 「오늘 시세」는 아직 없습니다.</strong> 국내&middot;해외 지수와 종목, "
         "업종 ETF, 미 국채 곡선, 원자재는 모두 <strong>" + DK(C["prev_us"], True) + " 마감</strong>이고, "
         "<strong>환율만 24시간 시장이라 오늘 아침(" + DK(C["today"]) + ") 값</strong>입니다 " + VF_MD + ". "
         "예탁금&middot;신용융자는 결제일 기준이라 <strong>" + DK(d(C["mfl"]["date"])) + "</strong>입니다. "
         "<strong>기준일이 다른 값을 섞어 읽지 마십시오</strong> &mdash; 표마다 날짜를 달아 두었습니다.",
         "<strong>Korea has not opened, so there is no &lsquo;today&rsquo; price.</strong> Indices, single stocks, "
         "sector ETFs, the Treasury curve and commodities are all at the <strong>" + DE(C["prev_us"], True)
         + " close</strong>; <strong>only FX, a 24-hour market, is as of this morning</strong> " + VF_MD + ". "
         "Deposits and margin balances are on a settlement basis. <strong>Do not mix bases</strong> &mdash; every "
         "table carries its date."),
        ("(b) 서술은 날마다 새로 씁니다", "(b) The prose is written fresh each day",
         "이 판은 <strong>어제 파일을 복사해 만들지 않습니다.</strong> 표&middot;날짜 이름표&middot;비율&middot;"
         "개수는 전부 <code>build_briefing.py</code> 가 시세 자료에서 만들고, 그날의 서술만 따로 받습니다. "
         "오늘 <strong>손으로 쓴 자리가 " + NUSED + "곳</strong>, <strong>자료에서 만든 문장이 대신 "
         "나간 자리가 " + NFB + "곳</strong>입니다 " + VF_C + ". "
         "<strong>비면 어제 문장이 남는 것이 아니라 자료에서 계산한 한 줄이 나갑니다</strong> &mdash; 굳을 자리를 "
         "없앤 것입니다(지침 7-2-1).",
         "This edition is <strong>not built by copying yesterday&rsquo;s file.</strong> Tables, date labels, ratios "
         "and counts are all derived from the market data by <code>build_briefing.py</code>; only the day&rsquo;s "
         "prose is supplied separately. Today <strong>" + NUSED + " passages were written by hand</strong> "
         "and <strong>" + NFB + " fell back to a data-derived line</strong> " + VF_C + ". "
         "<strong>A gap yields a computed sentence, never yesterday&rsquo;s</strong>."),
        ("(c) 매물대는 근사입니다", "(c) The supply bands are an approximation",
         "가격대별 거래량 분포를 주는 무료 원천이 없습니다. 그래서 <strong>일별 (종가, 거래대금)을 지수대로 "
         "묶어</strong> 「최근 어느 구간에서 손이 바뀌었나」를 냅니다 " + VF_C + ". "
         "<strong>진짜 매물대가 아니므로 「몇 주가 물려 있다」로 읽지 마십시오</strong> &mdash; "
         "「거래가 어디에 쌓였나」까지만 말합니다.",
         "No free source publishes volume by price. We <strong>bucket daily (close, turnover) into price "
         "bands</strong> to show where trading concentrated " + VF_C + ". <strong>This is not a true volume "
         "profile</strong> &mdash; read it as where turnover sat, not as trapped supply."),
        ("(d) 확인하지 못한 것", "(d) What we could not verify",
         "VKOSPI(KRX 인증키 없음 &mdash; VIX 로 대용), 미수금&middot;반대매매 금액(금투협 웹방화벽 &mdash; "
         "신용잔고로 대용), 한국은행 기준금리(ECOS 샘플키가 0행을 돌려줌). "
         "<strong>셋 다 지어내지 않고 비워 두었습니다</strong> " + VF_N + ".",
         "VKOSPI (no KRX key &mdash; VIX used instead), forced-liquidation amounts (KOFIA firewall &mdash; margin "
         "balances used instead) and the Bank of Korea policy rate (the ECOS sample key returns no rows). "
         "<strong>All three are left blank rather than filled in</strong> " + VF_N + "."),
    ]
    all_notes = [(x.get("t_ko"), x.get("t_en"), x.get("b_ko"), x.get("b_en")) for x in notes] + fixed
    cards = "\n".join(card(a, b, c, e) for a, b, c, e in all_notes)
    ok = sum(1 for s in D["sources"].values() if s.get("ok"))
    a, b = N.get("verify_lede",
                 "시세는 <strong>" + D["generated_at_kst"][:16] + " 수집분</strong>이고, 원천 "
                 + str(len(D["sources"])) + "곳 가운데 <strong>" + str(ok) + "곳</strong>이 응답했습니다 "
                 + VF_MD + ". 아래는 <strong>이 판이 무엇을 알고 무엇을 모르는지</strong>입니다.",
                 "Prices were collected at <strong>" + D["generated_at_kst"][:16] + "</strong>; <strong>"
                 + str(ok) + "</strong> of " + str(len(D["sources"])) + " sources responded " + VF_MD + ". "
                 "Below is <strong>what this edition knows and what it does not</strong>.")
    return (lede(a, b) + "\n"
            + exp("검증 노트 &mdash; " + str(len(all_notes)) + "건",
                  "Verification notes &mdash; " + str(len(all_notes)) + " items",
                  '<div class="soft-grid">\n' + cards + '\n</div>')
            + exp("데이터 계보 &mdash; 어느 숫자가 어디서 왔나",
                  "Data lineage &mdash; where each number came from", C["lineage"]))


# ══════════════════════════════════════════════════════════════════
# 조각
# ══════════════════════════════════════════════════════════════════
def _cell(v):
    return '<td class="n">' + pct(v) + '</td>'


def _brow(ko, en, nk, ne, a, b, hl=False):
    return ('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(ko, en) + '</th>'
            '<td class="n note">' + L(nk, ne) + '</td>'
            '<td class="n">' + a + '</td><td class="n">' + b + '</td>'
            '<td class="n opt">' + VF_MD + '</td></tr>')


def _mrow(ko, en, nk, ne, lvl, chg, spark, hl=False):
    return ('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(ko, en) + '</th>'
            '<td class="n note">' + L(nk, ne) + '</td>'
            '<td class="n">' + lvl + '</td><td class="n">' + chg + '</td>'
            '<td class="n sparkcell">' + spark + '</td>'
            '<td class="n opt">' + VF_MD + '</td></tr>')


def _cal_last(txt, year):
    import re as _re
    days = []
    for mm, dd in _re.findall(r"(\d{1,2})/(\d{1,2})", txt or ""):
        try:
            days.append(datetime.date(year, int(mm), int(dd)))
        except ValueError:
            pass
    return max(days) if days else None


def _ncols(head):
    """머리행이 **실제로 세우는 열 수**를 마크업에서 센다.

    항목 개수로 세면 안 된다 &mdash; `THP()` 는 한 항목이 네 열(1주·1개월·
    3개월·연초)을 내고, 핵심본에서는 빈 문자열이라 아예 열을 내지 않는다.
    구분 행의 colspan 을 이 값으로 맞추지 않으면 재검증기가 열 수 불일치를
    낸다(전체 판 8칸, 핵심본 4칸 — 둘 다 실제로 걸렸다).
    """
    h = "".join(head)
    total = 0
    for m in re.finditer(r'(?is)<th\b([^>]*)>', h):
        cs = re.search(r'(?i)\bcolspan\s*=\s*"?(\d+)"?', m.group(1))
        total += int(cs.group(1)) if cs else 1
    return max(1, total)


def _region_core(C, key, tko, ten):
    """핵심본용 지역 종목 표 — **좁게** 만든다.

    전체 판의 지역 표는 종목 열두 개에 「핵심」 설명까지 달려 한 표가 400px 을
    넘는다. 셋을 그대로 실으면 여섯 쪽에 들어가지 않는다. 그래서 핵심본에서는
    **가장 오른 셋과 가장 내린 셋**만, 이름&middot;종가&middot;등락률 세 칸으로
    세우고 3단으로 나란히 놓는다. 설명과 나머지 종목은 전체 판에 그대로 있다.
    """
    dct = (C["D"].get(key) or {})
    if not dct:
        return ""
    order = sorted(dct.items(), key=lambda kv: -(kv[1].get("change_pct") or 0))
    if len(order) < 4:
        return ""
    head = [TH("종목", "Name", "wrap"), TH("종가", "Close", "n"), TH("등락률", "Change %", "n")]
    rows = []
    for label_ko, label_en, grp in (("오른 쪽", "Up", order[:3]), ("내린 쪽", "Down", order[-3:])):
        rows.append('      <tr class="grp"><th class="wrap" colspan="3">'
                    + L(label_ko, label_en) + '</th></tr>')
        for k, v in grp:
            rows.append('      <tr><th class="wrap">' + esc(k) + '</th>'
                        '<td class="n">' + n(v["close"]) + '</td>' + _cell(v.get("change_pct"))
                        + '</tr>')
    # 꼬리말은 표마다 달지 않는다 &mdash; 세 표가 각자 두 줄씩 달면 여섯 줄이
    # 되는데, 하는 말은 「통화가 다르니 등락률로 견주라」 하나다. 부르는 쪽이
    # 3단 아래에 한 문단으로 붙인다.
    return tbl(tko, ten, head, rows, cls="data compact")


def _wide(dct, k=10):
    """핵심본 종목표용 재정렬 — **옆으로 세우니 더 실을 수 있다.**

    준비 단계는 전체 판 기준으로 위아래 여덟씩을 뽑아 둔다. 핵심본은 두 표를
    나란히 세우므로 같은 높이에 열씩 들어간다 &mdash; 수집한 쉰다섯 종목에서
    다시 뽑는다. 원본 dict 가 그대로 있으므로 손실 없이 넓힐 수 있다.
    """
    items = [(nm, v) for nm, v in dct.items() if v.get("change_pct") is not None]
    items.sort(key=lambda kv: -kv[1]["change_pct"])
    return items[:k], items[-k:]


def _stock_core(tko, ten, top, bot, why, foot_ko="", foot_en="", k=10):
    """핵심본용 종목표 — **오른 쪽과 내린 쪽을 나란히 세워 개수를 늘린다.**

    한 표에 세로로 쌓으면 종목 하나가 한 줄씩 자리를 먹어, 여섯 쪽에 맞추려고
    네 개까지 줄여 놓았었다. 네 개로는 「무엇이 움직였나」에 답하지 못한다.
    같은 자리에 두 표를 옆으로 놓으면 **같은 높이에 두 배**가 들어간다 &mdash;
    열을 이름&middot;종가&middot;등락률 셋으로 줄이면 반 칸에 들어간다.
    사유는 있는 종목만 이름 밑에 붙인다(설명 열을 따로 세우지 않는다).
    """
    head = [TH("종목", "Name", "wrap"), TH("종가", "Close", "n"), TH("등락률", "Change %", "n")]

    def one(cap_ko, cap_en, group):
        rows = []
        for name, v in group[:k]:
            wk, we = why.get(name, ("", ""))
            sub = L('<span class="sub">' + wk + '</span>', '<span class="sub">' + we + '</span>') if wk else ""
            rows.append('      <tr><th class="wrap">' + esc(name) + sub + '</th>'
                        '<td class="n">' + n(v["close"]) + '</td>' + _cell(v.get("change_pct"))
                        + '</tr>')
        return tbl(cap_ko, cap_en, head, rows, cls="data compact")

    return ('<div class="duo">\n'
            + one("오른 쪽 &middot; " + tko, "Gainers &middot; " + ten, top) + "\n"
            + one("내린 쪽 &middot; " + tko, "Losers &middot; " + ten, list(reversed(bot))) + "\n"
            '</div>\n'
            + ('<p class="tbl-foot">' + L(foot_ko, foot_en) + '</p>' if foot_ko else ""))


def _sector_core(C, keep=6):
    """핵심본용 미국 업종 ETF — **주요 업종만.**

    열한 업종을 다 실으면 왼쪽 해외 지수표(여섯 줄)보다 다섯 줄이 길어, 나란히
    세운 두 칸의 아래가 어긋난다. 그날 **가장 오른 셋과 가장 내린 셋**만 남기면
    줄 수가 지수표와 맞고, 「어느 업종에 돈이 붙고 어디서 빠졌나」라는 이 표의
    쓸모는 그대로다 &mdash; 가운데 여섯은 어차피 지수와 같이 움직인 것들이다.
    열한 업종 전부는 전체 판에 있다.
    """
    SEC = C["D"].get("us_sectors") or {}
    items = [(k, v) for k, v in SEC.items() if v.get("change_pct") is not None]
    if not items:
        return ""
    items.sort(key=lambda kv: -kv[1]["change_pct"])
    h = keep // 2
    pick = items[:h] + items[-h:] if len(items) > keep else items
    head = [TH("업종", "Sector", "wrap"), TH("무엇이 들어 있나", "What it holds", "note wrap"),
            TH("등락", "Chg %", "n")]
    rows = ['      <tr><th class="wrap">' + esc(k) + '</th>'
            '<td class="n note">' + L(v.get("note_ko") or "&nbsp;", v.get("note_en") or "&nbsp;") + '</td>'
            + _cell(v.get("change_pct")) + '</tr>' for k, v in pick]
    return tbl("S&amp;P 500 주요 업종 &mdash; 오른 " + str(h) + " &middot; 내린 " + str(h),
               "S&amp;P 500 sectors &mdash; top and bottom " + str(h),
               head, rows, cls="data compact",
               foot_ko="<strong>금리가 오른 날은 부동산&middot;유틸리티가 먼저 밀립니다</strong> &mdash; "
                       "배당으로 사는 자산이기 때문입니다. 열한 업종 전부는 전체 판에 있습니다 " + VF_C + ".",
               foot_en="<strong>When yields rise, real estate and utilities give way first</strong> &mdash; "
                       "they are bought for yield. All eleven sectors are in the full edition " + VF_C + ".")


def _curve_core(C):
    """핵심본용 미 국채 곡선 &mdash; **금리표 밑의 빈자리를 채운다.**

    금리표는 일곱 줄이고 오른 칸의 환율+원자재는 열두 줄이라, 격자가 두 칸을
    같은 높이로 늘리면서 왼쪽 아래에 173px 이 비어 있었다. 거기에 들어갈 것이
    마침 있다 &mdash; 금리표 꼬리말이 「만기 열한 개 전부는 아래 상세에」라고
    가리키는데 **핵심본에는 상세가 없다.** 가리키는 곳이 없는 문장이었다.
    만기&middot;수익률&middot;전일 대비 셋으로 줄여 그 자리에 세운다.
    """
    ru = C["ru"]
    LAB = [("ust1m", "1개월", "1M"), ("ust3m", "3개월", "3M"), ("ust6m", "6개월", "6M"),
           ("ust1y", "1년", "1Y"), ("ust2y", "2년", "2Y"), ("ust3y", "3년", "3Y"),
           ("ust5y", "5년", "5Y"), ("ust7y", "7년", "7Y"), ("ust10y", "10년", "10Y"),
           ("ust20y", "20년", "20Y"), ("ust30y", "30년", "30Y")]
    rows = []
    for k, ko, en in LAB:
        if k not in ru["curve"]:
            continue
        rows.append('      <tr' + (' class="hl"' if k in ("ust2y", "ust10y", "ust30y") else '') + '>'
                    '<th class="wrap">' + L(ko, en) + '</th>'
                    '<td class="n">' + n(ru["curve"][k], 3) + '%</td>'
                    '<td class="n">' + bp(ru["change_bp"].get(k)) + '</td></tr>')
    if not rows:
        return ""
    return tbl("미 재무부 확정 곡선 &mdash; 만기 " + str(len(rows)) + "개",
               "US Treasury official curve &mdash; " + str(len(rows)) + " maturities",
               [TH("만기", "Maturity", "wrap"), TH("수익률", "Yield", "n"),
                TH("전일 대비", "Change", "n")], rows, cls="data compact",
               foot_ko="<strong>짧은 쪽이 더 움직였으면 정책 기대</strong>, 장기물까지 같이 움직였으면 "
                       "<strong>성장&middot;물가 전망</strong>이 움직인 것입니다 " + VF_OK + ".",
               foot_en="<strong>The front end moving means policy expectations</strong>; the long end moving "
                       "means the growth and inflation view " + VF_OK + ".")


def _kr_snapshot_core(C, kr_idx, breadth):
    """핵심본용 국내 상태표 &mdash; **지수와 폭을 한 표로.**

    두 표는 같은 질문에 답한다 &mdash; 「코스피&middot;코스닥이 지금 어떤 상태인가」.
    그런데 캡션 둘, 꼬리말 둘을 달고 있었고, 지수표는 두 줄뿐이라 옆 칸(네 줄)에
    맞춰 늘어나며 103px 을 비웠다. 종가&middot;등락률을 폭표와 같은
    「항목 &times; 코스피&middot;코스닥」 꼴로 바꿔 한 표에 넣는다.

    `kr_idx`&middot;`breadth` 는 전체 판이 쓰는 두 표다 &mdash; 받아만 두고 쓰지
    않는다. 인자로 받는 것은 **부르는 쪽이 둘 다 만들었다는 것을 드러내기 위해서**다.
    """
    KS, KQ, ksb, kqb = C["KS"], C["KQ"], C["ksb"], C["kqb"]
    rows = [
        _brow("종가", "Close", "코스피는 대형주 중심 &mdash; <strong>삼성전자&middot;SK하이닉스가 절반 "
                              "가까이</strong>입니다. 코스닥은 중소형&middot;성장주 중심입니다",
              "KOSPI is large-cap heavy; KOSDAQ is small and mid-cap growth",
              n(KS["close"]), n(KQ["close"]), True),
        _brow("등락률", "Change %", "&nbsp;", "&nbsp;",
              pct(KS["change_pct"]), pct(KQ["change_pct"])),
        _brow("상승 / 하락 종목", "Advancing / declining",
              "지수 방향과 어긋나면 대형주 몇 개가 지수를 움직인 것입니다",
              "If it disagrees with the index, a few heavyweights moved it",
              n(ksb["advancing"], 0) + " / " + n(ksb["declining"], 0),
              n(kqb["advancing"], 0) + " / " + n(kqb["declining"], 0)),
        _brow("오른 종목 비율", "Share advancing", "열 종목 가운데 몇 개가 올랐는지",
              "How many in ten rose",
              "열에 " + n(C["adv_per_ten"], 0), "열에 " + n(C["adv_per_ten_q"], 0)),
        _brow("52주 구간 내 위치", "Position in the 52-week range",
              "(종가 &minus; 저) &divide; (고 &minus; 저). <strong>지금이 비싼 자리인지</strong>",
              "(close &minus; low) / (high &minus; low)",
              n(C["pos52_ks"], 1) + "%", n(C["pos52_kq"], 1) + "%"),
        _brow("상한 / 하한", "Limit up / down", "&nbsp;", "&nbsp;",
              n(ksb.get("limit_up"), 0) + " / " + n(ksb.get("limit_down"), 0),
              n(kqb.get("limit_up"), 0) + " / " + n(kqb.get("limit_down"), 0)),
    ]
    head = [TH("항목", "Measure", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
            TH("코스피", "KOSPI", "n"), TH("코스닥", "KOSDAQ", "n"),
            TH("검증", "Verified", "n opt")]
    return tbl("국내 지수 &mdash; " + DK(C["prev_kr"], True) + " 마감",
               "Korean indices &mdash; " + DE(C["prev_kr"], True) + " close",
               head, rows, cls="data compact",
               foot_ko="<strong>52주 최고는 네이버 지수 페이지 표기 그대로</strong>이며 최근 종가 흐름과 "
                       "차이가 큽니다 &mdash; 검증 노트를 보십시오 " + VF_N + ".",
               foot_en="<strong>The 52-week high is as published by Naver</strong> and sits far above recent "
                       "closes &mdash; see the verification notes " + VF_N + ".")


def _sector_kr_core(C, k=5):
    """핵심본용 국내 업종 상위&middot;하위 &mdash; **국내 지수표 밑의 빈자리를 채운다.**

    국내 지수표는 두 줄뿐이라 옆의 「시장의 폭」(네 줄)에 맞춰 늘어나면서 73px 이
    비었다. 업종 표는 전체 판에서 접힌 상세 안에 들어 있어 PDF 를 받는 쪽은 보지
    못했다 &mdash; 「지수가 아니라 무엇이 올랐나」에 가장 곧바로 답하는 표다.
    오른 셋&middot;내린 셋만 세 열로 세운다.
    """
    top, bot = C["sec_top"][:k], list(reversed(C["sec_bot"]))[:k]
    if not top and not bot:
        return ""
    head = [TH("업종", "Sector", "wrap"), TH("등락", "Chg %", "n"), TH("1주 누적", "1W", "n")]

    rows = []
    for label_ko, label_en, grp in (("오른 업종", "Leaders", top), ("내린 업종", "Laggards", bot)):
        if not grp:
            continue
        rows.append('      <tr class="grp"><th class="wrap" colspan="3">'
                    + L(label_ko, label_en) + '</th></tr>')
        rows += ['      <tr><th class="wrap">' + esc(x["name"]) + '</th>'
                 '<td class="n">' + pct(x["change_pct"]) + '</td>'
                 '<td class="n">' + pct((x.get("perf") or {}).get("w1")) + '</td></tr>' for x in grp]
    return tbl("업종 &mdash; " + DK(C["prev_kr"]), "Sectors &mdash; " + DE(C["prev_kr"]),
               head, rows, cls="data compact",
               foot_ko="「1주 누적」은 <strong>일간 등락률을 더한 값</strong>이지 지수 계열이 아닙니다 "
                       "&mdash; 네이버는 업종 지수를 주지 않습니다 " + VF_C + ".",
               foot_en="The weekly column <strong>sums daily moves</strong>; Naver publishes no sector "
                       "index series " + VF_C + ".")


def _cm_core(C):
    """핵심본용 원자재 — **좁게.** 읽는 법 열을 빼고 이름&middot;종가&middot;등락률 셋으로
    줄여 환율 옆에 세운다. 한 줄로 깔면 표 하나가 쪽 폭을 통째로 먹는다.
    은까지 넣는다 &mdash; 금만 있으면 「귀금속이 오른 것」인지 「금만 오른 것」인지
    가려지지 않는다."""
    I = C["I"]
    CM = [("brent", "브렌트유", "Brent", True), ("wti", "WTI", "WTI", False),
          ("gold", "금", "Gold", False), ("silver", "은", "Silver", False),
          ("copper", "구리", "Copper", False), ("natgas", "천연가스", "Nat gas", False),
          ("btc", "비트코인", "Bitcoin", False)]
    rows = []
    for k, ko, en, hl in CM:
        v = I.get(k)
        if not v:
            continue
        rows.append('      <tr' + (' class="hl"' if hl else '') + '>'
                    '<th class="wrap">' + L(ko, en) + '</th>'
                    '<td class="n">' + n(v["close"]) + '</td>' + _cell(v.get("change_pct")) + '</tr>')
    if not rows:
        return ""
    return tbl("원자재 &middot; 기타 &mdash; " + DK(C["prev_us"]),
               "Commodities &mdash; " + DE(C["prev_us"]),
               [TH("항목", "Item", "wrap"), TH("종가", "Close", "n"), TH("등락률", "Change %", "n")],
               rows, cls="data compact",
               foot_ko="유가는 <strong>야후 일봉 종가</strong>입니다 &mdash; 국내 보도가 쓰는 "
                       "<strong>선물 정산가</strong>와 폭이 다를 수 있습니다 " + VF_MD + ".",
               foot_en="Crude is the <strong>Yahoo daily close</strong>, which differs from the "
                       "<strong>futures settlement</strong> Korean coverage quotes " + VF_MD + ".")


def _earn_core(C, k=6):
    """핵심본용 실적 &mdash; 기사에서 옮긴 대목을 **한 줄로** 줄여 옆에 세운다.

    전체 판은 기사 본문을 220자까지 그대로 싣는다. 핵심본에서는 「누가 · 상회인가
    하회인가 · 컨콜이 있었나」만 있으면 고객 전화에 답할 수 있다. 인용 원문은
    전체 판에 그대로 있다.
    """
    E = (C["D"].get("earnings") or {})
    items = E.get("items") or []
    if not items:
        return ""
    VERD = {"beat": ('<span class="vf ok">상회</span>', '<span class="vf ok">BEAT</span>'),
            "miss": ('<span class="vf bad">하회</span>', '<span class="vf bad">MISS</span>')}
    head = [TH("기업", "Company", "wrap"), TH("기사에서", "From the article", "wrap"),
            TH("판정", "Verdict", "n"), TH("컨콜", "Call", "n")]
    rows = []
    for e in items[:k]:
        vk, ve = VERD.get(e.get("verdict"), ("&mdash;", "&mdash;"))
        px = C["price_of"](e["company"])
        rows.append('      <tr' + (' class="hl"' if e.get("has_call") else '') + '>'
                    '<th class="wrap">' + esc(e["company"])
                    + ('<span class="sub">' + px + '</span>' if px else '') + '</th>'
                    '<td class="wrap">' + esc(e["quotes"][0])[:170] + '</td>'
                    '<td class="n">' + L(vk, ve) + '</td>'
                    '<td class="n">' + ("&#9679;" if e.get("has_call") else "&mdash;") + '</td></tr>')
    return tbl("실적 &middot; 컨퍼런스콜 &mdash; 오늘 수집분",
               "Results and calls &mdash; today&rsquo;s collection", head, rows, cls="data compact",
               foot_ko="<strong>판정은 기사에 「상회」&middot;「하회」라고 적혀 있을 때만</strong> 답니다 &mdash; "
                       "컨센서스를 저희가 다시 계산한 것이 아닙니다. 인용 원문은 전체 판에 있습니다 " + VF_1 + ".",
               foot_en="<strong>A verdict appears only where the article says beat or miss</strong> &mdash; we do "
                       "not recompute consensus. The quotations are in the full edition " + VF_1 + ".")


def _holidays_core(C):
    """핵심본용 휴장일 — 표가 아니라 **촘촘한 목록**으로.

    전체 판의 휴장일 표는 넉 달치 서른두 줄이라 그것만으로 한 쪽 가까이 먹는다.
    핵심본은 「그날 어디가 닫혀 있나」만 알면 되므로 <날짜 · 시장 · 이름> 한 줄로
    줄여 3단으로 세운다. 조기마감도 함께 싣는다 &mdash; 주문 시각이 달라진다.
    """
    import json as _json
    path = ROOT + "/data/market/holidays.json"
    if not os.path.exists(path):
        return ""
    try:
        HJ = _json.load(io.open(path, encoding="utf-8"))
    except Exception:                                             # noqa: BLE001
        return ""
    today, out = C["today"], []
    horizon = today + datetime.timedelta(days=126)
    for m in HJ.get("markets", []):
        for day in m.get("days", []):
            try:
                dt = d(day["date"])
            except Exception:                                     # noqa: BLE001
                continue
            if dt < today or dt > horizon or day.get("kind") == "weekend":
                continue
            out.append((dt, m.get("name_ko", ""), m.get("name_en", ""),
                        day.get("ko", ""), day.get("en", ""), day.get("kind")))
    if not out:
        return ""
    out.sort(key=lambda r: r[0])
    items = []
    for dt, mk, me, ko, en, kind in out[:18]:
        mark = " <em>조기마감</em>" if kind == "early" else ""
        mark_en = " <em>early close</em>" if kind == "early" else ""
        items.append('  <li><b>' + DS(dt) + '</b> '
                     + L(mk.split(" (")[0] + " &middot; " + ko + mark,
                         me.split(" (")[0] + " &middot; " + en + mark_en) + '</li>')
    more = len(out) - len(items)
    tail = L("앞으로 넉 달 가운데 가까운 " + str(len(items)) + "건입니다"
             + ((" (나머지 " + str(more) + "건은 전체 판에)") if more > 0 else "")
             + ". <strong>거래소가 나중에 바꾸므로 주문 직전 다시 확인하십시오.</strong> " + VF_1,
             "The nearest " + str(len(items)) + " of the next four months"
             + ((", with " + str(more) + " more in the full edition") if more > 0 else "")
             + ". <strong>Exchanges revise these &mdash; reconfirm before acting.</strong> " + VF_1)
    return ('<ul class="hol">\n' + "\n".join(items) + '\n</ul>\n'
            + '<p class="tbl-foot">' + tail + '</p>')


def _stock_table(tko, ten, top, bot, why, foot_ko="", foot_en=""):
    """주도 여덟 · 부진 여덟만 싣는다. **표 하나에 마흔 줄을 싣지 않는다**(압축)."""
    head = [TH("종목", "Name", "wrap"), TH("핵심 &middot; 사유", "What it does / why", "note wrap"),
            TH("종가", "Close", "n"), TH("등락률", "Change %", "n"), THP(),
            TH("검증", "Verified", "n opt")]
    rows = []
    for label_ko, label_en, group in (("오른 쪽", "Gainers", _cut(top)), ("내린 쪽", "Losers", _cut(bot))):
        # colspan 은 **머리행에서 센다.** 9 로 박아 두면 핵심본처럼 열이 줄었을 때
        # 머리행과 어긋나 재검증기가 FAIL 을 낸다(실제로 났다).
        # colspan 은 **실제로 서는 머리 칸 수**에서 센다. 9 로 박아 두면 핵심본처럼
        # 열이 줄었을 때 어긋나고, len(head) 로 세면 빈 칸(THP() = "")까지 세어
        # 한 칸이 남는다. 둘 다 재검증기가 FAIL 로 잡았다.
        rows.append('      <tr class="grp"><th class="wrap" colspan="'
                    + str(_ncols(head))
                    + '">' + L(label_ko, label_en) + '</th></tr>')
        for name, v in group:
            nk = (v.get("note_ko") or "")
            ne = (v.get("note_en") or "")
            wk, we = why.get(name, ("", ""))
            if wk:
                nk += (" &mdash; " if nk else "") + '<span class="why">' + wk + '</span>'
                ne += (" &mdash; " if ne else "") + '<span class="why">' + we + '</span>'
            rows.append('      <tr><th class="wrap">' + esc(name) + '</th>'
                        '<td class="n note">' + L(nk or "&nbsp;", ne or "&nbsp;") + '</td>'
                        '<td class="n">' + n(v["close"]) + '</td>' + _cell(v.get("change_pct"))
                        + perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
    return tbl(tko, ten, head, rows, cls="data compact", foot_ko=foot_ko, foot_en=foot_en)


def build_supply(C):
    """매물대 근사 표 — 요건 8. 막대로 보이게 한다(요건 5)."""
    sb = (C["D"].get("supply_bands") or {}).get("kospi")
    if not sb:
        return None
    head = [TH("지수 구간", "Index band", "wrap"), TH("거래대금 비중", "Share of turnover", "n barcell"),
            TH("비중", "Share", "n"), TH("거래일", "Sessions", "n"), TH("검증", "Verified", "n opt")]
    last = sb["last_close"]
    rows = []
    for b in sorted(sb["bands"], key=lambda x: -x["low"]):
        here = b["low"] <= last <= b["high"]
        rows.append('      <tr' + (' class="hl"' if here else '') + '>'
                    '<th class="wrap">' + n(b["low"]) + ' ~ ' + n(b["high"])
                    + ('<span class="sub">현재가 이 구간</span>' if here else '') + '</th>'
                    '<td class="n barcell">' + bar(b["share_pct"]) + '</td>'
                    '<td class="n">' + n(b["share_pct"], 1) + '%</td>'
                    '<td class="n">' + n(b["days"], 0) + '</td>'
                    '<td class="n opt">' + VF_C + '</td></tr>')
    hv = sb["heaviest"]
    return tbl("매물대 근사 &mdash; 최근 " + str(sb["sessions"]) + "영업일 거래대금이 쌓인 자리",
               "Where turnover sat &mdash; last " + str(sb["sessions"]) + " sessions",
               head, rows, cls="data compact",
               foot_ko="<strong>가장 두꺼운 구간은 " + n(hv["low"]) + "~" + n(hv["high"]) + " 로 전체의 "
                       + n(hv["share_pct"], 1) + "%</strong> 이고, <strong>현재가 위쪽에 쌓인 비중은 "
                       + n(sb["overhead_share_pct"], 1) + "%</strong> 입니다 " + VF_C + ". 위쪽이 두꺼우면 "
                       "올라갈 때 <strong>본전에 팔려는 물량</strong>을 만납니다. "
                       "<strong>이것은 진짜 매물대가 아니라 근사입니다</strong> &mdash; 가격대별 거래량 분포는 "
                       "무료 원천이 없어, 일별 종가와 거래대금으로 만든 것입니다(검증 노트 (c)).",
               foot_en="<strong>The heaviest band is " + n(hv["low"]) + "&ndash;" + n(hv["high"]) + ", "
                       + n(hv["share_pct"], 1) + "% of the total</strong>, and <strong>"
                       + n(sb["overhead_share_pct"], 1) + "% sits above the current level</strong> " + VF_C + ". "
                       "A heavy band overhead means <strong>sellers waiting to get out at cost</strong>. "
                       "<strong>This is an approximation, not a true volume profile</strong> &mdash; see note (c).")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=None)
    ap.add_argument("--kind", default="morning", choices=("morning", "close", "global"))
    ap.add_argument("--out", default=None)
    ap.add_argument("--market", default=None,
                    help="시세 파일 경로 — 판을 다시 지을 때 그 시각의 스냅샷을 박는다")
    ap.add_argument("--core", action="store_true",
                    help="핵심본 — 같은 자료·같은 서술을 다섯 쪽으로")
    a = ap.parse_args()
    CORE[0] = a.core
    MARKET[0] = a.market

    now = datetime.datetime.now(KST)
    today = d(a.date) if a.date else now.date()
    D, H = load()
    N = Narrative(narrative_for(today, a.kind))

    C = prepare(D, H, N, today, now, a.kind)
    doc = Doc()
    doc.sec("today", "오늘의 결론", "The Bottom Line", sec_today(C))
    doc.sec("korea", "국내 증시", "Korean Equities", sec_korea(C))
    doc.sec("flows", "수급 &middot; 증시 주변자금", "Flows and Money Around the Market", sec_flows(C))
    doc.sec("global", "간밤 해외", "Overnight Overseas", sec_global(C))
    if not CORE[0]:
        doc.sec("earnings", "실적 &middot; 컨퍼런스콜", "Results and Calls", sec_earnings(C))
    else:
        # 핵심본은 절을 따로 세우지 않고 **실적 표를 심층 분석 절로 옮긴다**
        # (아래). 머리말만 04 뒤에 한 문단으로 남긴다.
        el = C["N"].get("earnings_lede", "", "")
        if el[0]:
            sid, tko, ten, body = doc.secs[-1]
            doc.secs[-1] = (sid, tko, ten, body + "\n" + P(el[0], el[1]))
    doc.sec("macro", "금리 &middot; 환율 &middot; 원자재", "Rates, FX and Commodities", sec_macro(C))
    deep = sec_deep(C)
    if CORE[0]:
        # 「주요 이슈·실적을 심층 분석해 달라」 — 핵심본에도 이 절을 둔다. 그날의
        # 심층 분석이 없으면 실적 표만으로 절을 세우고, 둘 다 없으면 절이 없다.
        et = _earn_core(C)
        if deep or et:
            tko, ten, body = (deep if deep else
                              ("주요 이슈 &middot; 실적", "Issues and Results", ""))
            doc.sec("deep", tko, ten, (body + ("\n" + et if et else "")).strip())
    elif deep:
        doc.sec("deep", deep[0], deep[1], deep[2])
    doc.sec("calendar", "일정 &middot; 체크포인트", "Calendar", sec_calendar(C))
    doc.sec("talking", "고객 응대", "Talking Points", sec_talking(C))
    doc.sec("verify", "데이터 &middot; 검증", "Data and Verification",
            sec_verify_core(C) if CORE[0] else sec_verify(C))

    kindko, kinden = KIND_NAME[a.kind]
    suffix_ko = " 핵심본" if CORE[0] else ""
    suffix_en = " (Core)" if CORE[0] else ""
    title = "%s%s · %d년 %s | 미래에셋증권 마포WM" % (kindko, suffix_ko, today.year, DK(today, True))
    title_en = ("%s%s · %s %d | Mirae Asset Securities Mapo WM"
                % (kinden, suffix_en, DE(today, True), today.year))
    html = assemble(ROOT + "/docs/briefing-chrome", doc, title, C["hero"], now,
                    title_en=title_en)
    if CORE[0]:
        # 이 판은 <head> 없는 아티팩트 본문이다. 껍데기 CSS 가 끝나는 자리
        # 바로 뒤에 붙여야 같은 우선순위에서 이긴다(지침 6절).
        i = html.find("</style>")
        assert i > 0, "껍데기 CSS 를 찾지 못했다"
        html = html[:i + 8] + "\n" + CORE_CSS + html[i + 8:]

    # 이제 모든 절이 서술을 다 꺼내 갔다. 그제서야 개수를 박는다.
    html = html.replace(NUSED, str(len(N.used))).replace(NFB, str(len(set(N.missing))))
    assert NUSED not in html and NFB not in html

    out = a.out or (ROOT + "/docs/briefings/%s-%s%s.html"
                    % (today.isoformat(), a.kind, "-core" if CORE[0] else ""))
    io.open(out, "w", encoding="utf-8").write(html)
    rep = N.report()
    print("만듦: %s (%d자, 절 %d개, 상세 %d개)"
          % (out, len(html), len(doc.secs), html.count('<details class="exp"')))
    print("  서술: 손으로 쓴 자리 %d · 자료에서 만든 자리 %d"
          % (len(rep["written"]), len(rep["fell_back"])))
    if rep["fell_back"]:
        print("  비어 있던 키: " + ", ".join(rep["fell_back"]))


if __name__ == "__main__":
    main()
