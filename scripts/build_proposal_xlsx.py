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
proposal_lib.py 한 곳에서만 정해진다 — 화면·엑셀·PPT 가 같은 것을 본다.

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
from openpyxl.styles import Alignment, Border, Side              # noqa: E402
from openpyxl.utils import get_column_letter                     # noqa: E402
from openpyxl.worksheet.datavalidation import DataValidation     # noqa: E402

import proposal_lib as P                                         # noqa: E402
# 색·서체·섹션 룰은 기존 제안서에서 가져다 쓴다. 여기 다시 적으면 두 엑셀이
# 언젠가 서로 다른 오렌지를 쓰게 된다.
from build_etf_proposal import (                                 # noqa: E402
    BOX, ERROR, FONT, HIGHLIGHT, INK, INPUT_FILL, INPUT_FONT, MUTED, ORANGE,
    SOFT_ORANGE, SURFACE, f, fill, rule_row, section)

ROOT = P.ROOT
DEFAULT_OUT = os.path.join(ROOT, "고객제안서_자산배분.xlsx")

HORIZONS = [(1, "1년 이내"), (3, "3년"), (5, "5년"), (10, "5년 초과")]
PER_CLASS = 25

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
    ws["A1"] = "이 시트는 proposal_lib.py 가 셈한 배분입니다. 손으로 고치지 마십시오 — 고치면 화면·PPT 와 어긋납니다."
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
         "펀드는 기준가 이력이 7 거래일뿐이라 변동성·최대낙폭을 셈하지 않고 "
         "원천의 위험등급을 씁니다.")
    return ws, first_data, r - 1


def sheet_products(wb, products):
    ws = wb.create_sheet("상품")
    r = section(ws, 1, "2", "자산군별 제안 상품", 8)
    note(ws, r, 8,
         "규모와 보수로 고릅니다. 수익률 순으로 고르지 않습니다 — 지난해 제일 많이 "
         "오른 것을 권하는 습관이 고객에게 가장 비쌉니다. 개별 주식은 시가총액 상위 "
         "종목이며 종목 추천이 아닙니다.")
    r += 2
    head(ws, r, ["채택", "자산군", "상품", "유형", "운용/발행", "규모",
                 "과거 1년", "변동성", "보수"],
         [7, 11, 44, 16, 22, 13, 11, 11, 13])
    # 「채택」 머리는 사람이 넣는 칸이므로 파랗게 표시한다.
    ws.cell(row=r, column=1).fill = fill(INPUT_FILL)
    ws.cell(row=r, column=1).font = f(10, bold=True, color=INPUT_FONT)
    head_row = r
    r += 1
    first_prod = r
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
            for i, key in enumerate(["ret1y", "vol"], start=7):
                v = p.get(key)
                put(ws, r, i, v / 100 if isinstance(v, (int, float)) else "—",
                    fmt="0.0%" if isinstance(v, (int, float)) else None)
                ws.cell(row=r, column=i).alignment = RIGHT
            lo, hi = p.get("feeMin"), p.get("feeMax")
            if isinstance(lo, (int, float)) and isinstance(hi, (int, float)) and hi != lo:
                put(ws, r, 8, "%.2f~%.2f%%" % (lo, hi))
            elif isinstance(lo, (int, float)):
                put(ws, r, 8, lo / 100, fmt="0.00%")
            else:
                put(ws, r, 8, "—")
            ws.cell(row=r, column=8).alignment = RIGHT
            if r % 2 == 0:
                for c in range(1, 9):
                    cell = ws.cell(row=r, column=c)
                    rgb = cell.fill.fgColor.rgb
                    if not rgb or rgb == "00000000":
                        cell.fill = fill(SURFACE)
            r += 1
    ws.freeze_panes = ws.cell(row=8, column=1).coordinate
    ws.auto_filter.ref = "A7:H%d" % (r - 1)
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
                   stat_first, stat_last):
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
    r = section(ws, 5, "1", "고객 정보", 7)
    first_input = r
    labels = [("고객명", "", "text"), ("투자금액 (만원)", 10000, "num"),
              ("투자기간", "5년 초과", "horizon"), ("위험성향 (1~5)", 3, "risk")]
    for label_text, default, kind in labels:
        ws.cell(row=r, column=1, value=label_text).font = f(10, bold=True)
        put(ws, r, 2, default, kind="input",
            fmt="#,##0" if kind == "num" else None)
        r += 1
    amt_cell, yrs_cell, risk_cell = (first_input + 1, first_input + 2,
                                     first_input + 3)

    dv_h = DataValidation(type="list",
                          formula1='"%s"' % ",".join(l for _, l in HORIZONS),
                          allow_blank=False)
    ws.add_data_validation(dv_h)
    dv_h.add(ws.cell(row=yrs_cell, column=2))
    dv_r = DataValidation(type="whole", operator="between",
                          formula1=1, formula2=5, allow_blank=False)
    ws.add_data_validation(dv_r)
    dv_r.add(ws.cell(row=risk_cell, column=2))

    ws.cell(row=r, column=1, value="성향").font = f(10, bold=True)
    names = ",".join('"%s"' % P.PROFILES[k]["name"] for k in sorted(P.PROFILES))
    put(ws, r, 2, "=CHOOSE($B$%d,%s)" % (risk_cell, names), kind="formula")
    key_cell = r + 1
    ws.cell(row=key_cell, column=1, value="조회 키").font = f(9, color=MUTED)
    years_list = ",".join(str(y) for y, _ in HORIZONS)
    put(ws, key_cell, 2,
        '=$B$%d&"|"&CHOOSE(MATCH($B$%d,{%s},0),%s)'
        % (risk_cell, yrs_cell,
           ",".join('"%s"' % l for _, l in HORIZONS), years_list),
        kind="formula")
    ws.cell(row=key_cell, column=2).font = f(9, color=MUTED)

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
        put(ws, row, 2,
            "=INDEX(%s,MATCH($B$%d,%s,0),MATCH($A%d,%s,0))"
            % (rng, key_cell, key_rng, row, hdr_rng),
            kind="formula", fmt="0.0%")
        # C = **조정 비중.** 비워 두면 제안값을 쓴다. 제안은 출발점이고
        # 조정이 실무의 본체라, 제안값을 덮어쓰지 않고 옆 칸에 적게 한다 —
        # 그래야 무엇을 얼마나 고쳤는지 나중에 보인다.
        put(ws, row, 3, None, kind="input", fmt="0.0%")
        # D = 실제로 쓰는 비중
        put(ws, row, 4, '=IF($C%d="",$B%d,$C%d)' % (row, row, row),
            kind="formula", fmt="0.0%")
        put(ws, row, 5, "=$B$%d*$D%d" % (amt_cell, row),
            kind="formula", fmt="#,##0")
        put(ws, row, 6,
            '=IFERROR(INDEX(자산군!$D$%d:$D$%d,'
            'MATCH($A%d,자산군!$A$%d:$A$%d,0)),"—")'
            % (stat_first, stat_last, row, stat_first, stat_last),
            kind="formula", fmt="0.0%")
        # **기대수익률은 비워 둔다.** 사람이 넣는 가정이므로 기본값을 몰래
        # 넣지 않는다. 과거 실적을 여기 복사해 넣는 것도 하지 않는다 —
        # 그것은 「지난해처럼 오른다」고 가정하는 셈이다.
        put(ws, row, 7, None, kind="input", fmt="0.0%")

        # **숨은 도우미 열.** 표시 칸은 값이 없을 때 「—」라는 글자를 담는데,
        # SUMPRODUCT 는 글자를 만나면 #VALUE! 를 낸다 — IFERROR 는 오류만 잡지
        # 글자는 못 잡는다. 실제 엑셀에서 합계가 그렇게 깨져 나갔다.
        put(ws, row, 8, '=IF(ISNUMBER($F%d),$F%d,0)' % (row, row),
            kind="formula", fmt="0.0%")
    last = first + len(classes) - 1

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
                value='=IF(ABS($D%d-1)>0.0005,'
                      '"비중 합계가 100%% 가 아닙니다 — 조정 비중을 맞추십시오",'
                      '"비중 합계 100%% 입니다")' % tr)
    c.font = f(10, bold=True, color=ERROR)
    c.alignment = LEFT
    ws.merge_cells(start_row=cov, start_column=2, end_row=cov, end_column=5)
    c2 = ws.cell(row=cov, column=7,
                 value='=COUNT($G%d:$G%d)&" / %d 가정"' % (first, last, len(classes)))
    c2.font = f(9, color=MUTED)
    c2.alignment = RIGHT

    # ── 읽는 법 ─────────────────────────────────────────────────────
    r = section(ws, cov + 2, "3", "이 표를 읽는 법", 7)
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
        "펀드는 이력이 7 거래일뿐이라 변동성을 셈하지 않았습니다. 합계 변동성은 "
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


def sheet_howto(wb):
    ws = wb.create_sheet("사용법")
    ws.column_dimensions["A"].width = 4          # section() 이 번호를 놓는 칸
    ws.column_dimensions["B"].width = 104        # section() 이 제목을 놓는 칸
    r = section(ws, 1, "", "쓰는 법", 2)
    rows = [
        "1. 「제안서」 시트에서 파란 글씨 칸만 고칩니다 — 고객명·투자금액·투자기간·위험성향.",
        "2. 나머지 칸은 수식입니다. 손으로 덮어쓰면 다음에 값이 안 따라옵니다.",
        "3. 「배분규칙」 시트는 proposal_lib.py 가 셈한 것입니다. 고치지 마십시오 — "
        "고치면 화면(proposal.html)·PPT 와 어긋납니다.",
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
        "숨은 G·H 열은 합계를 셈하려고 둔 도우미 칸입니다. 표시 칸에 「—」라는 글자가 "
        "들어가면 합계가 깨지기 때문입니다. 지우지 마십시오.",
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

    wb = Workbook()
    wb.remove(wb.active)
    _, rf, rl = sheet_rules(wb, plans, classes)
    _, stat_first, stat_last = sheet_classes(wb, u["자산군"])
    sheet_products(wb, products)
    sheet_sources(wb, u)
    sheet_howto(wb)
    sheet_proposal(wb, plans, u, rf, rl, classes, stat_first, stat_last)
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
