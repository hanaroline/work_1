#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""자산배분 제안서 — 엑셀판.

화면(proposal.html)과 같은 규칙, 같은 자료를 쓴다. 다른 점은 **고객 앞에서
숫자를 바꿔 볼 수 있다**는 것이다. 투자금액·기간·성향을 고치면 배분과 금액이
수식으로 다시 셈된다.

스타일은 build_etf_proposal.py 에서 **가져다 쓴다.** 색·서체·섹션 룰을 여기
다시 적으면 두 엑셀이 언젠가 서로 다른 오렌지를 쓰게 된다.

셀 규칙 — 기존 제안서와 같다
    파란 글씨 + 옅은 칠  = 사람이 넣는 칸
    검은 글씨            = 수식
    회색 글씨            = 원천에서 받아 적은 값

수식은 Excel 2007 문법(INDEX/MATCH)만 쓴다. XLOOKUP 은 리브레오피스가 못 풀어
`#NAME?` 가 파일에 박힌 채로 고객에게 나간다.

**배분 규칙을 시트로 깔아 두는 까닭.** 비중을 제안서 시트에 값으로 박으면
성향을 바꿔도 숫자가 안 따라온다. 그래서 파이썬이 셈해 둔 20 가지 배분을
「배분규칙」시트에 깔고, 제안서는 INDEX/MATCH 로 집어 온다. 규칙 자체는
proposal_lib.py 한 곳에서만 정해진다 — 화면과 엑셀이 같은 것을 본다.

쓰는 법
  python3 scripts/build_proposal_xlsx.py
  python3 scripts/build_proposal_xlsx.py --out 고객제안서_자산배분.xlsx

산출물
  고객제안서_자산배분.xlsx
"""

import argparse
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from openpyxl import Workbook                                    # noqa: E402
from openpyxl.styles import Alignment, Border, Font, Side        # noqa: E402
from openpyxl.formatting.rule import FormulaRule                 # noqa: E402
from openpyxl.utils import get_column_letter                     # noqa: E402
from openpyxl.worksheet.datavalidation import DataValidation     # noqa: E402

import proposal_lib as P                                         # noqa: E402
import proposal_metrics as MET                                   # noqa: E402
# 색·서체·섹션 룰은 기존 제안서에서 가져다 쓴다. 여기 다시 적으면 두 엑셀이
# 언젠가 서로 다른 오렌지를 쓰게 된다.
from build_etf_proposal import (                                 # noqa: E402
    BOX, ERROR, FONT, HIGHLIGHT, INK, INPUT_FILL, INPUT_FONT, MUTED, ORANGE,
    SOFT_ORANGE, SURFACE, f, fill, rule_row, section)

ROOT = P.ROOT
DEFAULT_OUT = os.path.join(ROOT, "고객제안서_자산배분.xlsx")

HORIZONS = [(1, "1년 이내"), (3, "3년"), (5, "5년"), (10, "5년 초과")]
PER_CLASS = 25

# 조회 단추의 두 상태. 매크로 없이 쓸 수 있는 「단추」는 이것뿐이다.
GO_ON = "▶ 조회 실행"
GO_OFF = "… 조건 입력 중"

RIGHT = Alignment(horizontal="right")
LEFT = Alignment(horizontal="left", vertical="center")
CENTER = Alignment(horizontal="center", vertical="center")


def head(ws, row, cols, widths=None):
    for i, name in enumerate(cols, start=1):
        c = ws.cell(row=row, column=i, value=name)
        c.font = f(10, bold=True)
        c.fill = fill(SOFT_ORANGE)
        c.border = BOX
        c.alignment = CENTER
    if widths:
        for i, w in enumerate(widths, start=1):
            ws.column_dimensions[get_column_letter(i)].width = w


def put(ws, row, col, value, *, kind="src", fmt=None, bold=False):
    """kind: input(파란 글씨+칠) / formula(검은) / src(회색)"""
    c = ws.cell(row=row, column=col, value=value)
    c.border = BOX
    if kind == "input":
        c.font = f(10, bold=True, color=INPUT_FONT)
        c.fill = fill(INPUT_FILL)
    elif kind == "formula":
        c.font = f(10, bold=bold, color=INK)
    else:
        c.font = f(10, bold=bold, color=MUTED)
    if fmt:
        c.number_format = fmt
    if isinstance(value, (int, float)) or (isinstance(value, str) and value.startswith("=")):
        c.alignment = RIGHT
    return c


def note(ws, row, last_col, text):
    """표 위에 다는 설명 한 줄. 여러 칸을 합치고 줄바꿈을 켠다 — 안 그러면
    긴 설명이 옆 칸으로 흘러 표 머리를 덮는다(처음 판이 그랬다)."""
    c = ws.cell(row=row, column=1, value=text.replace("**", ""))
    c.font = f(9, color=MUTED)
    c.alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=last_col)
    ws.row_dimensions[row].height = 30
    return row + 1


def size_ko(v):
    """규모를 조·억으로. 원 단위 17 자리는 칸을 넘쳐 ######## 가 된다."""
    if not isinstance(v, (int, float)):
        return "—"
    if v >= 1e12:
        return "%s조원" % format(round(v / 1e12), ",")
    if v >= 1e8:
        return "%s억원" % format(round(v / 1e8), ",")
    return "%s원" % format(round(v), ",")


def sheet_rules(wb, plans, classes):
    """성향×기간 20 가지 배분. 제안서 시트가 INDEX/MATCH 로 집어 온다."""
    ws = wb.create_sheet("배분규칙")
    ws.sheet_state = "visible"
    ws["A1"] = "이 시트는 proposal_lib.py 가 셈한 배분입니다. 손으로 고치지 마십시오 — 고치면 화면(proposal.html)과 어긋납니다."
    ws["A1"].font = f(9, color=MUTED)
    cols = ["키", "성향", "기간"] + classes
    head(ws, 3, cols, [12, 8, 10] + [11] * len(classes))
    r = 4
    for risk in sorted(P.PROFILES):
        for years, label in HORIZONS:
            w = plans["%d|%d" % (risk, years)]["w"]
            put(ws, r, 1, "%d|%d" % (risk, years))
            put(ws, r, 2, risk)
            put(ws, r, 3, label)
            for i, cls in enumerate(classes, start=4):
                put(ws, r, i, round(w.get(cls, 0) / 100, 6), fmt="0.0%")
            r += 1
    return ws, 4, r - 1


def sheet_classes(wb, stats):
    ws = wb.create_sheet("자산군")
    r = section(ws, 1, "1", "자산군 실측치", 6)
    note(ws, r, 6,
         "아래는 원천에서 실제로 잰 값입니다. 미래 수익률이 아닙니다. "
         "빈칸(—)은 원천에 없어 셈하지 않은 것이며 만들어 넣지 않습니다.")
    r += 2
    head(ws, r, ["자산군", "종목수", "수익률 산출", "과거 1년(중앙)",
                 "변동성(중앙)", "최대낙폭(중앙)"], [14, 10, 13, 16, 15, 16])
    r += 1
    first_data = r
    for cls, st in stats.items():
        put(ws, r, 1, cls)
        put(ws, r, 2, st["종목수"])
        put(ws, r, 3, st["수익률산출가능"])
        for i, key in enumerate(["ret1y_중앙값", "vol_중앙값", "mdd_중앙값"], start=4):
            v = st.get(key)
            if isinstance(v, (int, float)):
                put(ws, r, i, v / 100, fmt="0.0%")
            else:
                put(ws, r, i, "—").alignment = RIGHT
        r += 1
    note(ws, r + 1, 6,
         "펀드는 달 간격 기준가로 셈합니다 — 일봉보다 거칠어 최대낙폭이 "
         "다소 얕게 나옵니다. 계열이 없는 펀드는 원천이 준 누적 수익률과 "
         "52주 표준편차를 쓰고, 최대낙폭은 비워 둡니다.")
    return ws, first_data, r - 1


# 무엇을 쟀는지 — 고객이 「연평균 3.4%」와 「과거 1해 152%」를 같은 무게로
# 읽으면 안 된다. 셋째는 시세가 없어 위험을 아예 못 잰 것이다(펀드).
TIER_KO = {1: "다년 실측", 2: "1해 실측", 3: "미측정"}
PROD_COLS = ["채택", "자산군", "상품", "유형", "운용/발행", "규모",
             "측정", "잰 기간", "연평균", "변동성", "최대낙폭", "보수",
             "고른 까닭"]
PROD_W = [7, 11, 40, 14, 20, 12, 10, 9, 10, 10, 10, 12, 62]
NCOL = len(PROD_COLS)


def sheet_products(wb, products):
    ws = wb.create_sheet("상품")
    r = section(ws, 1, "2", "자산군별 제안 상품", NCOL)
    note(ws, r, NCOL,
         "여러 해의 위험조정 성과로 고릅니다 — 1·3·5 해의 연평균 수익률, 연변동성, "
         "최대낙폭, 보수, 그리고 창이 바뀌어도 성과가 유지되는지를 함께 보아 "
         "점수를 냅니다. 지난해 수익률 순으로도, 규모 순으로도 고르지 않습니다 "
         "(규모는 문턱일 뿐입니다). 「측정」이 미측정인 상품은 시세가 없어 "
         "변동성·최대낙폭을 못 쟀습니다 — 잰 상품이 넉넉하면 후보에서 뺍니다. "
         "적힌 수치는 모두 지나간 실적이며 미래 수익률이 아닙니다. "
         "개별 주식은 종목 추천이 아닙니다.")
    ws.row_dimensions[r].height = 58
    r += 2
    head(ws, r, PROD_COLS, PROD_W)
    # 「채택」 머리는 사람이 넣는 칸이므로 파랗게 표시한다.
    ws.cell(row=r, column=1).fill = fill(INPUT_FILL)
    ws.cell(row=r, column=1).font = f(10, bold=True, color=INPUT_FONT)
    # **머리 줄 번호를 붙잡아 둔다.** 예전에는 아래에서 8·A7 로 박아 두었는데
    # 머리는 6 행이었다. 그래서 필터가 **우리금융지주를 머리로 잡고**, 틀
    # 고정은 첫 상품까지 함께 얼렸다. 설명 줄이 한 줄 늘거나 줄면 또 어긋난다.
    head_row = r
    r += 1
    for cls, items in products.items():
        for p in items:
            # **빼고 싶은 상품은 N 으로 바꾼다.** 줄을 지우면 수식·필터가
            # 어긋나므로 지우지 않고 표시만 바꾸게 한다. 자산군별로 몇 개를
            # 채택했는지는 아래 요약이 세어 준다.
            put(ws, r, 1, "Y", kind="input")
            ws.cell(row=r, column=1).alignment = CENTER
            put(ws, r, 2, cls)
            put(ws, r, 3, p.get("name") or p.get("code"))
            put(ws, r, 4, p.get("type") or "—")
            put(ws, r, 5, p.get("company") or "—")
            # **조·억으로 적는다.** 원 단위로 적으면 삼성전자가 17 자리가 되어
            # 칸을 넘치고 엑셀이 ######## 로 보여 준다. 실제로 그렇게 나갔다.
            put(ws, r, 6, size_ko(p.get("size")))
            ws.cell(row=r, column=6).alignment = RIGHT
            put(ws, r, 7, TIER_KO.get(p.get("측정등급"), "—"))
            ws.cell(row=r, column=7).alignment = CENTER

            # **몇 해를 잰 값인지 함께 적는다.** 「연평균 21.5%」만 적으면
            # 그것이 1 해인지 5 해인지 알 수 없는데 그 둘은 무게가 다르다.
            years, w = MET.longest(p.get("지표") or {})
            put(ws, r, 8, "%d해" % years if years else "—")
            ws.cell(row=r, column=8).alignment = CENTER
            for i, key, nf in ((9, "cagr", "0.0%"), (10, "vol", "0.0%"),
                               (11, "mdd", "0%")):
                v = (w or {}).get(key)
                put(ws, r, i, v / 100 if isinstance(v, (int, float)) else "—",
                    fmt=nf if isinstance(v, (int, float)) else None)
                ws.cell(row=r, column=i).alignment = RIGHT

            lo, hi = p.get("feeMin"), p.get("feeMax")
            if isinstance(lo, (int, float)) and isinstance(hi, (int, float)) and hi != lo:
                put(ws, r, 12, "%.2f~%.2f%%" % (lo, hi))
            elif isinstance(lo, (int, float)):
                put(ws, r, 12, lo / 100, fmt="0.00%")
            else:
                put(ws, r, 12, "—")
            ws.cell(row=r, column=12).alignment = RIGHT
            put(ws, r, 13, (p.get("점수근거") or "—").replace("**", ""))
            ws.cell(row=r, column=13).alignment = Alignment(
                wrap_text=True, vertical="center")

            if r % 2 == 0:
                for c in range(1, NCOL + 1):
                    cell = ws.cell(row=r, column=c)
                    rgb = cell.fill.fgColor.rgb
                    if not rgb or rgb == "00000000":
                        cell.fill = fill(SURFACE)
            r += 1
    ws.freeze_panes = ws.cell(row=head_row + 1, column=1).coordinate
    ws.auto_filter.ref = "A%d:%s%d" % (head_row, get_column_letter(NCOL), r - 1)
    return ws


def sheet_sources(wb, u):
    ws = wb.create_sheet("출처")
    r = section(ws, 1, "3", "자료 출처와 기준일", 5)
    head(ws, r, ["자산군", "원천", "종목", "기준일", "비고"],
         [12, 52, 8, 12, 80])
    r += 1
    for name, meta in u["원천"].items():
        if not isinstance(meta, dict):
            continue
        put(ws, r, 1, name)
        put(ws, r, 2, str(meta.get("src") or "—"))
        put(ws, r, 3, meta.get("count", "—"))
        put(ws, r, 4, meta.get("asOf") or "—")
        put(ws, r, 5, str(meta.get("note") or meta.get("error") or "")[:300])
        for c in (2, 5):
            ws.cell(row=r, column=c).alignment = Alignment(
                horizontal="left", vertical="top", wrap_text=True)
        ws.row_dimensions[r].height = 42
        r += 1

    r += 2
    ws.cell(row=r, column=1, value="이 자료가 지키는 규칙").font = f(11, bold=True)
    r += 1
    for k, v in u["정책"].items():
        ws.cell(row=r, column=1, value=k).font = f(10, bold=True)
        c = ws.cell(row=r, column=2, value=str(v).replace("**", ""))
        c.font = f(9, color=MUTED)
        c.alignment = Alignment(horizontal="left", vertical="top",
                                wrap_text=True)
        ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5)
        ws.row_dimensions[r].height = 46
        r += 1
    return ws


def sheet_proposal(wb, data, u, rule_first, rule_last, classes,
                   stat_first, stat_last, sleeve_er=None):
    ws = wb.create_sheet("제안서", 0)
    ws.sheet_view.showGridLines = False
    for i, w in enumerate([16, 14, 14, 15, 15, 14, 18], start=1):
        ws.column_dimensions[get_column_letter(i)].width = w
    # G·H 는 합계를 셈하려고 두는 숨은 도우미 열이다(아래 참고).
    for col in ("H", "I"):
        ws.column_dimensions[col].hidden = True

    t = ws.cell(row=1, column=1, value="자산배분 제안서")
    t.font = f(20, bold=True, color=ORANGE)
    ws.cell(row=2, column=1, value="미래에셋증권").font = f(10, color=MUTED)
    rule_row(ws, 3, 7)

    # ── 입력 ────────────────────────────────────────────────────────
    #
    # **section() 은 세 행을 쓰고 다음 빈 행을 돌려준다.** 그 반환값을 무시하고
    # 행 번호를 손으로 박았더니 제목 아래 6pt 여백행에 내용이 깔려 고객명 줄이
    # 납작하게 눌렸다. 이제 돌려주는 값만 쓴다.
    r = section(ws, 5, "1", "조회 조건", 7)
    first_input = r
    # **위험성향은 한 칸이다.** 번호 칸과 이름 칸을 따로 두었더니 같은 것을 두 번
    # 묻는 꼴이었다 — 이제 드롭다운 한 칸에 번호와 이름을 함께 담고, 번호는
    # 숨은 칸에서 떼어 쓴다.
    risk_items = ["%d %s" % (k, P.PROFILES[k]["name"]) for k in sorted(P.PROFILES)]
    labels = [("고객명", "", "text"),
              ("투자금액 (만원)", 10000, "num"),
              ("투자기간", "5년 초과", "horizon"),
              ("위험성향", risk_items[2], "risk"),
              # **목표 연수익률.** 이 칸이 없어서 「기대수익률 입력 항목이 왜
              # 없냐」는 말을 들었다. 자산군별 가정(G 열)과 다른 것이다 —
              # 이쪽은 고객이 바라는 수익률이고, 저쪽은 그것을 어떻게 벌
              # 작정인지에 대한 가정이다. 기본값은 두지 않는다.
              ("목표 연수익률 (%)", None, "target")]
    for label_text, default, kind in labels:
        ws.cell(row=r, column=1, value=label_text).font = f(10, bold=True)
        put(ws, r, 2, default, kind="input",
            fmt="#,##0" if kind == "num" else ("0.0%" if kind == "target" else None))
        r += 1
    amt_cell, yrs_cell, risk_cell, tgt_cell = (
        first_input + 1, first_input + 2, first_input + 3, first_input + 4)

    dv_h = DataValidation(type="list",
                          formula1='"%s"' % ",".join(l for _, l in HORIZONS),
                          allow_blank=False)
    ws.add_data_validation(dv_h)
    dv_h.add(ws.cell(row=yrs_cell, column=2))
    dv_r = DataValidation(type="list", formula1='"%s"' % ",".join(risk_items),
                          allow_blank=False)
    ws.add_data_validation(dv_r)
    dv_r.add(ws.cell(row=risk_cell, column=2))

    # ── 조회 단추 ──────────────────────────────────────────────────
    #
    # **매크로 없는 .xlsx 에는 누르는 단추를 넣을 수 없다.** .xlsm 으로 만들면
    # 넣을 수 있지만 회사 PC 에서 매크로는 대개 막혀 있어, 열자마자 「사용 안
    # 함」이 뜨는 파일을 고객 앞에 놓게 된다. 그래서 드롭다운으로 단추를
    # 만들었다 — 「조회 실행」을 고르면 배분이 나오고, 「조건 입력 중」으로
    # 두면 표가 비어 조건만 차분히 채울 수 있다.
    go_cell = r
    ws.cell(row=go_cell, column=1, value="조회").font = f(10, bold=True)
    gc = ws.cell(row=go_cell, column=2, value=GO_ON)
    gc.font = f(11, bold=True, color="FFFFFF")
    gc.fill = fill(ORANGE)
    gc.border = BOX
    gc.alignment = CENTER
    ws.row_dimensions[go_cell].height = 24
    dv_g = DataValidation(type="list", formula1='"%s,%s"' % (GO_ON, GO_OFF),
                          allow_blank=False)
    ws.add_data_validation(dv_g)
    dv_g.add(gc)
    c = ws.cell(row=go_cell, column=3,
                value="← 조건을 고친 뒤 이 칸에서 「%s」을 고르십시오. "
                      "「%s」로 두면 표가 비워집니다." % (GO_ON, GO_OFF))
    c.font = f(9, color=MUTED)
    c.alignment = LEFT
    ws.merge_cells(start_row=go_cell, start_column=3, end_row=go_cell, end_column=7)

    # 숨은 도우미 — 성향 번호와 조회 키. 예전에는 눈에 보이는 줄로 두었는데,
    # 고객에게 보여 줄 것이 아니라 셈에 쓰는 부속이다.
    years_list = ",".join(str(y) for y, _ in HORIZONS)
    ws["H1"] = "=IFERROR(VALUE(LEFT($B$%d,1)),3)" % risk_cell
    ws["H2"] = ('=IF($B$%d<>"%s","",$H$1&"|"&CHOOSE(MATCH($B$%d,{%s},0),%s))'
                % (go_cell, GO_ON, yrs_cell,
                   ",".join('"%s"' % l for _, l in HORIZONS), years_list))
    key_cell = go_cell

    # ── 배분 ────────────────────────────────────────────────────────
    r = section(ws, key_cell + 2, "2", "제안 배분", 7)
    head(ws, r, ["자산군", "제안 비중", "조정 비중", "쓰는 비중",
                 "금액(만원)", "과거 1년(중앙)", "기대수익률 (가정)"], None)
    for col in (3, 7):          # 사람이 넣는 두 칸은 머리부터 파랗게 표시한다
        ws.cell(row=r, column=col).fill = fill(INPUT_FILL)
        ws.cell(row=r, column=col).font = f(10, bold=True, color=INPUT_FONT)
    rng = "배분규칙!$D$%d:$%s$%d" % (rule_first,
                                     get_column_letter(3 + len(classes)),
                                     rule_last)
    key_rng = "배분규칙!$A$%d:$A$%d" % (rule_first, rule_last)
    hdr_rng = "배분규칙!$D$3:$%s$3" % get_column_letter(3 + len(classes))

    first = r + 1
    for i, cls in enumerate(classes):
        row = first + i
        put(ws, row, 1, cls)
        # B = 성향·기간이 정한 제안 비중(수식). 사람이 손대지 않는다.
        # 조회 키가 비면(=「조건 입력 중」) INDEX 가 오류를 내고, 그것을 빈칸으로
        # 받는다 — 표가 통째로 비어 조건만 차분히 채울 수 있다.
        put(ws, row, 2,
            '=IFERROR(INDEX(%s,MATCH($H$2,%s,0),MATCH($A%d,%s,0)),"")'
            % (rng, key_rng, row, hdr_rng),
            kind="formula", fmt="0.0%")
        # C = **조정 비중.** 비워 두면 제안값을 쓴다. 제안은 출발점이고
        # 조정이 실무의 본체라, 제안값을 덮어쓰지 않고 옆 칸에 적게 한다 —
        # 그래야 무엇을 얼마나 고쳤는지 나중에 보인다.
        put(ws, row, 3, None, kind="input", fmt="0.0%")
        # D = 실제로 쓰는 비중. B 가 빈칸(조회 전)이면 0 으로 받는다 —
        # 그냥 참조하면 금액 칸이 #VALUE! 로 물든다.
        put(ws, row, 4,
            '=IF($C%d="",IF(ISNUMBER($B%d),$B%d,0),$C%d)' % (row, row, row, row),
            kind="formula", fmt="0.0%")
        put(ws, row, 5, "=$B$%d*$D%d" % (amt_cell, row),
            kind="formula", fmt="#,##0")
        put(ws, row, 6,
            '=IFERROR(INDEX(자산군!$D$%d:$D$%d,'
            'MATCH($A%d,자산군!$A$%d:$A$%d,0)),"—")'
            % (stat_first, stat_last, row, stat_first, stat_last),
            kind="formula", fmt="0.0%")
        # **기대수익률에 값을 채우되, 그것이 어디서 온 가정인지 밝힌다.**
        # 예전에는 비워 두었다. 기본값이 근거 없이 박히는 것을 막으려던 것인데,
        # 그러면 목표수익률 견주기가 늘 「가정 미입력」으로 멈췄다. 이제는
        # 빌딩블록(무위험수익률 실측 + 리스크프리미엄 가정)으로 채우고,
        # 「기대수익률」시트에 근거와 두 방식 비교를 함께 싣는다.
        # 여전히 **사람이 고치는 칸**이다 — 파란 글씨로 둔다.
        er = (sleeve_er or {}).get(cls, (None, None))[0]
        put(ws, row, 7, er / 100 if isinstance(er, (int, float)) else None,
            kind="input", fmt="0.0%")

        # **숨은 도우미 열.** 표시 칸은 값이 없을 때 「—」라는 글자를 담는데,
        # SUMPRODUCT 는 글자를 만나면 #VALUE! 를 낸다 — IFERROR 는 오류만 잡지
        # 글자는 못 잡는다. 실제 엑셀에서 합계가 그렇게 깨져 나갔다.
        put(ws, row, 8, '=IF(ISNUMBER($F%d),$F%d,0)' % (row, row),
            kind="formula", fmt="0.0%")
        # I = 목표수익률 역산에 쓰는 기준 구성(위험중립형 비중). 가정을 넣은
        # 위험자산만 센다 — 가정이 없는 자산군까지 세면 위험자산 기대수익률이
        # 실제보다 낮게 나와 목표가 닿을 수 없는 것처럼 보인다.
        put(ws, row, 9,
            '=IF(AND($A%d<>"현금",ISNUMBER($G%d)),%s,0)'
            % (row, row, P.PROFILES[3]["w"].get(cls, 0)),
            kind="formula")
    last = first + len(classes) - 1
    cash_row = first + classes.index("현금") if "현금" in classes else last

    tr = last + 1
    put(ws, tr, 1, "합계", bold=True)
    put(ws, tr, 2, "=SUM($B%d:$B%d)" % (first, last), kind="formula",
        fmt="0.0%", bold=True)
    put(ws, tr, 3, '=IF(COUNT($C%d:$C%d)=0,"—",SUM($C%d:$C%d))'
        % (first, last, first, last), kind="formula", fmt="0.0%", bold=True)
    put(ws, tr, 4, "=SUM($D%d:$D%d)" % (first, last), kind="formula",
        fmt="0.0%", bold=True)
    put(ws, tr, 5, "=SUM($E%d:$E%d)" % (first, last), kind="formula",
        fmt="#,##0", bold=True)
    put(ws, tr, 6, "=SUMPRODUCT($D%d:$D%d,$H%d:$H%d)" % (first, last, first, last),
        kind="formula", fmt="0.0%", bold=True)
    # 기대수익률 합계 — 가정을 하나도 안 넣었으면 숫자를 내지 않는다.
    put(ws, tr, 7,
        '=IF(COUNT($G%d:$G%d)=0,"가정 미입력",SUMPRODUCT($D%d:$D%d,$G%d:$G%d))'
        % (first, last, first, last, first, last),
        kind="formula", fmt="0.0%", bold=True)
    for c in range(1, 8):
        ws.cell(row=tr, column=c).fill = fill(HIGHLIGHT)

    cov = tr + 1
    # **합계가 100% 가 아니면 크게 알린다.** 조정하다 보면 반드시 어긋나는데,
    # 그대로 고객에게 나가면 금액과 비중이 앞뒤가 안 맞는 문서가 된다.
    ws.cell(row=cov, column=1, value="점검").font = f(9, color=MUTED)
    c = ws.cell(row=cov, column=2,
                value='=IF($H$2="","조회 조건에서 「%s」을 고르시면 배분이 나옵니다",'
                      'IF(ABS($D%d-1)>0.0005,'
                      '"비중 합계가 100%% 가 아닙니다 — 조정 비중을 맞추십시오",'
                      '"비중 합계 100%% 입니다"))' % (GO_ON, tr))
    # **잘 됐을 때까지 빨갛게 쓰지 않는다.** 늘 빨간 줄은 곧 안 보이는 줄이 되고,
    # 정말 어긋난 날에도 눈에 안 띈다. 평소엔 회색, 어긋날 때만 빨강.
    c.font = f(10, bold=True, color=MUTED)
    c.alignment = LEFT
    ws.merge_cells(start_row=cov, start_column=2, end_row=cov, end_column=5)
    ws.conditional_formatting.add(
        "B%d" % cov,
        FormulaRule(formula=['AND($H$2<>"",ABS($D%d-1)>0.0005)' % tr],
                    font=Font(name=FONT, size=10, bold=True, color=ERROR)))
    c2 = ws.cell(row=cov, column=7,
                 value='=COUNT($G%d:$G%d)&" / %d 가정"' % (first, last, len(classes)))
    c2.font = f(9, color=MUTED)
    c2.alignment = RIGHT

    # ── 목표 수익률 견주기 ──────────────────────────────────────────
    #
    # 고객이 넣은 목표와, 자산군별 가정이 실제로 내놓는 수익률을 나란히 놓는다.
    # 역산(목표에 닿으려면 위험자산이 얼마나 필요한가)까지 보여 주되, 그것을
    # 「이렇게 하면 번다」로 읽지 않도록 경고를 붙인다 — proposal_lib 의
    # target_weights 가 같은 이유로 판정을 부르는 쪽에 넘긴다.
    ws["H3"] = ('=IF(SUM($I%d:$I%d)=0,"",SUMPRODUCT($I%d:$I%d,$G%d:$G%d)'
                '/SUM($I%d:$I%d))'
                % (first, last, first, last, first, last, first, last))
    ws["H4"] = '=IF(ISNUMBER($G%d),$G%d,0)' % (cash_row, cash_row)
    ws["H5"] = ('=IF(OR($H$3="",$B$%d="",$H$3<=$H$4),"",'
                'MEDIAN(0,($B$%d-$H$4)/($H$3-$H$4),1))' % (tgt_cell, tgt_cell))

    r = section(ws, cov + 2, "3", "목표 수익률 견주기", 7)
    tgt_rows = [
        ("고객 목표 (연)", '=IF($B$%d="","—",$B$%d)' % (tgt_cell, tgt_cell), "0.0%"),
        ("이 배분의 기대수익률 (가정 가중합)",
         '=IF(COUNT($G%d:$G%d)=0,"가정 미입력",$G%d)' % (first, last, tr), "0.0%"),
        ("차이 (기대 − 목표)",
         '=IF(OR($B$%d="",COUNT($G%d:$G%d)=0),"—",$G%d-$B$%d)'
         % (tgt_cell, first, last, tr, tgt_cell), "0.0%;-0.0%"),
        ("목표에 닿으려면 필요한 위험자산 비중",
         '=IF($H$5="","—",$H$5)', "0.0%"),
        ("지금 배분의 위험자산 비중",
         '=IF($H$2="","—",1-$D%d)' % cash_row, "0.0%"),
    ]
    for label_text, formula, fmt in tgt_rows:
        ws.cell(row=r, column=1, value=label_text).font = f(10, bold=True)
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=3)
        put(ws, r, 4, formula, kind="formula", fmt=fmt)
        r += 1

    verdict = ws.cell(row=r, column=1, value=(
        '=IF($B$%d="","목표 연수익률을 넣으시면 견주어 드립니다.",'
        'IF(COUNT($G%d:$G%d)=0,"자산군별 기대수익률 가정을 넣으셔야 견줄 수 있습니다.",'
        'IF($H$5="","가정한 위험자산 기대수익률이 현금보다 높지 않아 역산할 수 없습니다.",'
        'IF($H$5>=1,"목표는 현금을 0 으로 해도 닿지 않습니다 — 목표를 낮추거나 가정을 다시 보십시오.",'
        'IF($G%d>=$B$%d,"가정대로라면 목표를 웃돕니다.",'
        '"가정대로라면 목표에 모자랍니다 — 목표를 낮추거나 위험자산을 늘려야 합니다.")))))'
        % (tgt_cell, first, last, tr, tgt_cell)))
    verdict.font = f(10, bold=True, color=INK)
    verdict.alignment = LEFT
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7)
    r += 1
    r = note(ws, r, 7,
             "⚠ 역산은 「목표를 올리면 위험자산이 이만큼 늘어난다」는 산수일 뿐, "
             "그렇게 하면 목표를 번다는 뜻이 아닙니다. 위험자산 안의 구성은 "
             "위험중립형 비율을 그대로 씁니다 — 목표를 맞추려고 한 자산군에 "
             "몰아주면 분산이 깨집니다.")

    # ── 읽는 법 ─────────────────────────────────────────────────────
    r = section(ws, r + 1, "4", "이 표를 읽는 법", 7)
    for line in [
        "「기대수익률 (가정)」은 비어 있습니다. 사람이 넣는 칸이며 기본값을 두지 "
        "않았습니다 — 넣으실 때 근거를 함께 적어 두십시오.",
        "「과거 1년」을 「기대수익률」 칸에 복사해 넣지 마십시오. 「지난해처럼 오른다」고 "
        "가정하는 것이 됩니다.",
        "기대수익률 합계는 빈 칸을 0 으로 셈합니다. 일부만 넣으면 그만큼 낮게 나오므로 "
        "아래 「가정 넣은 자산군」 수를 함께 보십시오.",
        "「과거 1년」은 실제로 잰 값이며 미래 수익률이 아닙니다 — 최근 1년이 그랬다는 "
        "것과 앞으로 그러리라는 것은 다른 말입니다.",
        "변동성은 상관관계를 셈하지 않은 가중합이라 실제보다 높게 나옵니다. 낮게 "
        "보이게 만드는 것보다 안전합니다.",
        "펀드 변동성은 달 간격 기준가로 셈한 것이라 결이 다릅니다. 합계 변동성은 "
        "포트폴리오의 일부만 덮습니다 — 「자산군」 시트의 빈칸(—)이 그것입니다.",
        "「해외펀드」는 해외 설정 뮤추얼펀드가 아니라 해외에 투자하는 국내 설정 "
        "공모펀드입니다.",
        "이 자료는 참고용이며 투자 권유가 아닙니다. 제안 전 준법감시 검토를 받으십시오.",
    ]:
        c = ws.cell(row=r, column=1, value="· " + line)
        c.font = f(9, color=MUTED)
        c.alignment = Alignment(wrap_text=True, vertical="top")
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7)
        ws.row_dimensions[r].height = 28
        r += 1

    r += 1
    ws.cell(row=r, column=1,
            value="유니버스 %s · 문서 %s (KST)"
                  % (u.get("generated_at_kst", "—"),
                     datetime.now(P.KST).strftime("%Y-%m-%d %H:%M"))).font = \
        f(9, color=MUTED)
    return ws


def sheet_cma(wb, doc, sleeve_er):
    """기대수익률 **가정**을 밝혀 두는 시트.

    제안서 시트의 「기대수익률(가정)」 칸에 값을 채워 넣되, 그 값이 어디서
    왔는지를 여기 적는다. 숫자만 있고 근거가 없으면 반년 뒤에 아무도 그것이
    무엇이었는지 모른다.
    """
    ws = wb.create_sheet("기대수익률")
    r = section(ws, 1, "1", "자산군별 기대수익률 — 두 방식", 5)
    r = note(ws, r, 5,
             "기대수익률은 재는 것이 아니라 가정하는 것입니다. 서로 다른 두 길로 "
             "세워 보고 어긋나는 곳을 함께 적습니다.")
    r += 1
    head(ws, r, ["자산군", "① 빌딩블록", "② 장기실적(8년)", "차이", "비고"],
         [14, 14, 16, 10, 62])
    r += 1
    for row in doc.get("견주기", []):
        put(ws, r, 1, row["cls"])
        for i, k in enumerate(("빌딩블록", "장기실적"), start=2):
            v = row.get(k)
            put(ws, r, i, v / 100 if isinstance(v, (int, float)) else "—",
                fmt="0.00%" if isinstance(v, (int, float)) else None)
            ws.cell(row=r, column=i).alignment = RIGHT
        d = row.get("차이")
        put(ws, r, 4, d / 100 if isinstance(d, (int, float)) else "—",
            fmt="+0.0%;-0.0%" if isinstance(d, (int, float)) else None)
        ws.cell(row=r, column=4).alignment = RIGHT
        c = put(ws, r, 5, (row.get("장기_사유") or "").replace("**", "") or "")
        c.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
        ws.row_dimensions[r].height = 28
        r += 1

    bb = doc.get("빌딩블록_메타") or {}
    r += 1
    for line in [
        "① 무위험수익률 %s%% 는 짐작이 아니라 MMF %s종의 1년 수익률 중앙값(실측)입니다."
        % (bb.get("rf", "—"), bb.get("rf_n", "—")),
        "① 의 리스크프리미엄은 **가정**입니다. 회사 자산배분본부의 장기 기대수익률(CMA)이 "
        "있으면 scripts/proposal_cma.py 의 PREMIUM 을 그 값으로 바꾸십시오 — 화면과 "
        "엑셀이 함께 따라옵니다.",
        "② 를 기준선으로 쓰지 않는 까닭: 창(2018~2026)이 강세장 한 국면에 갇혀 있어 "
        "주식이 18%대로 나오고, 같은 국내주식인데 프록시에 따라 TIGER 200 19.8% · "
        "코스닥150 1.8% 로 20%p 가 갈립니다. 해외채권·대체는 5해를 채우는 원화 프록시가 "
        "없어 아예 덮지 못합니다.",
        "② 는 분배금이 빠진 가격 수익률이라 **실제보다 낮게** 나옵니다. 국내채권이 1.05%로 "
        "나오는 것이 그 편향입니다.",
        "달러 표시 ETF 로 장기 실적을 재지 않았습니다. 그 값은 환율이 빠진 달러 투자자의 "
        "수익률이지 한국 고객의 수익률이 아닙니다.",
    ]:
        c = ws.cell(row=r, column=1, value="· " + line.replace("**", ""))
        c.font = f(9, color=MUTED)
        c.alignment = Alignment(wrap_text=True, vertical="top")
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
        ws.row_dimensions[r].height = 30
        r += 1

    r = section(ws, r + 1, "2", "제안 자산군에 적용한 값", 5)
    r = note(ws, r, 5,
             "자산군(국내ETF·해외펀드…)은 포장지라 그 자체로 기대수익률이 없습니다. "
             "그 칸에 담긴 상품의 실제 노출로 위 ① 값을 섞어 낸 것입니다.")
    r += 1
    head(ws, r, ["자산군", "기대수익률(가정)", "섞은 노출", "", ""], None)
    r += 1
    for cls, (er, mix) in sleeve_er.items():
        put(ws, r, 1, cls)
        put(ws, r, 2, er / 100 if isinstance(er, (int, float)) else "—",
            fmt="0.00%" if isinstance(er, (int, float)) else None)
        ws.cell(row=r, column=2).alignment = RIGHT
        c = put(ws, r, 3, " · ".join("%s %.0f%%" % (k, v * 100)
                                     for k, v in sorted(mix.items(),
                                                        key=lambda kv: -kv[1])))
        c.alignment = LEFT
        ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=5)
        r += 1
    return ws


def sheet_howto(wb):
    ws = wb.create_sheet("사용법")
    ws.column_dimensions["A"].width = 4          # section() 이 번호를 놓는 칸
    ws.column_dimensions["B"].width = 104        # section() 이 제목을 놓는 칸
    r = section(ws, 1, "", "쓰는 법", 2)
    rows = [
        "1. 「제안서」 시트에서 파란 글씨 칸만 고칩니다 — 고객명·투자금액·투자기간·"
        "위험성향·목표 연수익률. 투자기간과 위험성향은 드롭다운입니다.",
        "1-1. 조건을 다 넣으셨으면 「조회」 칸에서 %s 을 고릅니다. "
        "%s 로 두면 표가 비워져 조건만 차분히 채울 수 있습니다. "
        "매크로 없는 .xlsx 에는 누르는 단추를 넣을 수 없어 드롭다운으로 만들었습니다 — "
        ".xlsm 으로 만들면 회사 PC 에서 매크로가 막혀 열자마자 「사용 안 함」이 뜹니다."
        % (GO_ON, GO_OFF),
        "1-2. 「목표 연수익률」은 고객이 바라는 수익률이고, 배분표의 "
        "「기대수익률 (가정)」은 그것을 어떻게 벌 작정인지에 대한 자산군별 가정입니다. "
        "둘은 다른 것이며, 3 번 섹션이 둘을 견주어 줍니다.",
        "2. 나머지 칸은 수식입니다. 손으로 덮어쓰면 다음에 값이 안 따라옵니다.",
        "3. 「배분규칙」 시트는 proposal_lib.py 가 셈한 것입니다. 고치지 마십시오 — "
        "고치면 화면(proposal.html)과 어긋납니다.",
        "4. 「기대수익률 (가정)」 칸은 비워 두었습니다. 사람이 넣는 가정이며 "
        "기본값을 두지 않았습니다 — 넣으실 때 근거를 함께 적어 두십시오.",
        "5. 자료를 새로 받으면 python3 scripts/build_proposal_universe.py 를 돌린 뒤 "
        "이 파일을 다시 만듭니다.",
        "",
        "셀 색 규칙 (기존 고객제안서와 같습니다)",
        "      파란 글씨 + 옅은 칠 = 사람이 넣는 칸",
        "      검은 글씨            = 수식",
        "      회색 글씨            = 원천에서 받아 적은 값",
        "",
        "숨은 H·I 열은 셈에 쓰는 도우미 칸입니다 — 합계용 숫자(표시 칸에 「—」라는 "
        "글자가 들어가면 합계가 깨집니다), 성향 번호, 조회 키, 목표 역산. "
        "지우지 마십시오.",
    ]
    for i, line in enumerate(rows):
        c = ws.cell(row=r + i, column=2, value=line)
        c.font = f(10, color=INK if not line.startswith("   ") else MUTED)
        c.alignment = Alignment(wrap_text=True, vertical="top")
        ws.row_dimensions[r + i].height = 18 if line else 8
    return ws


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=DEFAULT_OUT)
    args = ap.parse_args()

    u = P.load_universe()
    avail = {c for c, s in u["자산군"].items() if s.get("종목수")}
    classes = [c for c in P.CLASSES]

    plans = {}
    for risk in P.PROFILES:
        for years, _ in HORIZONS:
            w, _, notes = P.allocate(risk, years, avail)
            plans["%d|%d" % (risk, years)] = {"w": w, "notes": notes}

    products = {}
    for cls in classes:
        if cls == "현금":
            continue
        items = P.pick_products(u["상품"], cls, PER_CLASS)
        if items:
            products[cls] = items

    # 자산군은 포장지라 그 자체로 기대수익률이 없다. 제안에 담기는 다섯 종목의
    # **실제 노출**로 ①빌딩블록 값을 섞어 자산군별 가정을 낸다.
    import json as _json
    cma_doc = {}
    if os.path.exists(P.CMA_PATH):
        cma_doc = _json.load(open(P.CMA_PATH, encoding="utf-8"))
    table, _ = P.cma()
    sleeve_er = {}
    for cls in classes:
        if cls == "현금":
            sleeve_er[cls] = (table.get("현금성"), {"현금성": 1.0})
            continue
        mix = P.sleeve_exposure(P.pick_products(u["상품"], cls, 5))
        er, _cov = P.expected_from_exposure(
            {k: v * 100 for k, v in mix.items()}, table)
        sleeve_er[cls] = (er, mix)

    wb = Workbook()
    wb.remove(wb.active)
    _, rf, rl = sheet_rules(wb, plans, classes)
    _, stat_first, stat_last = sheet_classes(wb, u["자산군"])
    sheet_products(wb, products)
    sheet_sources(wb, u)
    if cma_doc:
        sheet_cma(wb, cma_doc, sleeve_er)
    sheet_howto(wb)
    sheet_proposal(wb, plans, u, rf, rl, classes, stat_first, stat_last,
                   sleeve_er)
    wb.move_sheet("제안서", offset=-len(wb.sheetnames) + 1)

    for ws in wb.worksheets:
        ws.page_setup.orientation = "landscape"
        ws.page_setup.fitToWidth = 1
        ws.page_setup.fitToHeight = 0
        ws.sheet_properties.pageSetUpPr.fitToPage = True
        ws.print_options.horizontalCentered = True

    wb.save(args.out)
    print("시트: %s" % " · ".join(wb.sheetnames))
    print("배분 %d 가지 · 상품 %d 종" % (len(plans),
                                        sum(len(v) for v in products.values())))
    print("%s (%.0f KB)" % (os.path.relpath(args.out, ROOT),
                            os.path.getsize(args.out) / 1024))


if __name__ == "__main__":
    main()
