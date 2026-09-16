#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""월배당 ETF 고객제안서(엑셀)를 만든다.

원천은 `data/cc_etf.json` 하나다. 이 파일은 `scripts/collect_cc_etf.mjs` 가
ETFCHECK 에서 받아 적는다. **여기서는 어떤 수치도 만들어 내지 않는다.**
원천에 없는 값은 빈칸으로 두고, 파일이 없거나 채택 종목이 0건이면
엑셀을 만들지 않고 실패한다 — 그럴듯한 숫자가 박힌 제안서가 고객에게
나가는 것이 이 작업에서 제일 비싼 고장이다.

셀 규칙
    파란 글씨 + 노란 칠  = 사람이 넣는 칸 (고객명·투자금액·배분 방식·세율·포트폴리오)
    검은 글씨            = 수식
    회색 글씨            = 원천에서 받아 적은 값

수식은 전부 Excel 2007 문법(INDEX/MATCH)으로 쓴다. XLOOKUP 은 쓰지 않는다 —
리브레오피스가 못 풀어서 `#NAME?` 가 파일에 박힌 채로 나간다.
"""
from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parent.parent
# 시험할 때만 다른 파일을 물릴 수 있게 열어 둔다. 실제 갱신은 인자 없이 돈다.
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "data" / "cc_etf.json"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "고객제안서_월배당ETF.xlsx"

# ── 미래에셋 브랜드 (mas-design) ────────────────────────────────────────
ORANGE = "F58220"        # primary
BLUE = "043B72"          # secondary
SOFT_ORANGE = "FAB072"   # 표 머리
HIGHLIGHT = "D7D7D7"     # 합계·핵심 행
SURFACE = "F7F8FA"       # 제브라
HAIRLINE = "CDCECB"
INK = "1A1A1A"
MUTED = "6C6C6C"
INPUT_FILL = "FFF7E6"    # 입력 칸 — 오렌지 계열의 아주 옅은 톤
INPUT_FONT = "0000FF"    # 입력값은 파란 글씨 (금융모델 관례)
ERROR = "C62828"         # 배분이 어긋났을 때만 쓴다 (mas-design 의 의미색)

FONT = "Spoqa Han Sans Neo"  # 브랜드 지정 서체. 없으면 뷰어가 대체한다.

# 비교표에 싣는 종목 수. 채택 종목은 60개 가까이 되는데 그걸 다 실으면
# 고객이 받는 한 장이 표 하나로 덮인다. 콤보박스에는 전부 담기고, 남은
# 종목은 [ETF데이터] 장에 그대로 있다.
COMPARE_TOP = 12

WON = '#,##0"원"'
WON_PLAIN = "#,##0"
PCT = "0.00%"
PCT3 = "0.000%"
QTY = '#,##0"주"'
EOK = '#,##0"억원"'   # 순자산·거래대금은 원 단위로 적으면 자릿수를 세어야 읽힌다

thin = Side(style="thin", color=HAIRLINE)
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)


def f(size=10, bold=False, color=INK, italic=False):
    return Font(name=FONT, size=size, bold=bold, color=color, italic=italic)


def fill(hexcolor):
    return PatternFill("solid", fgColor=hexcolor)


def rule_row(ws, row, last_col):
    """섹션 머리 위의 1px 오렌지 가로줄 — 브랜드 시그니처."""
    for c in range(1, last_col + 1):
        ws.cell(row=row, column=c).border = Border(bottom=Side(style="thin", color=ORANGE))
    ws.row_dimensions[row].height = 4


def section(ws, row, title, last_col):
    rule_row(ws, row, last_col)
    c = ws.cell(row=row + 1, column=1, value=title)
    c.font = f(13, bold=True)
    ws.row_dimensions[row + 1].height = 24
    return row + 2


def label(ws, row, col, text, size=10, bold=False, color=INK):
    c = ws.cell(row=row, column=col, value=text)
    c.font = f(size, bold=bold, color=color)
    c.alignment = Alignment(vertical="center")
    return c


def put(ws, row, col, value, fmt=None, *, kind="formula", bold=False, size=10):
    """kind: input(파랑+노랑) / formula(검정) / source(회색)"""
    c = ws.cell(row=row, column=col, value=value)
    if kind == "input":
        c.font = f(size, bold=True, color=INPUT_FONT)
        c.fill = fill(INPUT_FILL)
    elif kind == "source":
        c.font = f(size, bold=bold, color=MUTED)
    else:
        c.font = f(size, bold=bold, color=INK)
    if fmt:
        c.number_format = fmt
    c.alignment = Alignment(vertical="center", horizontal="right" if fmt else "left")
    c.border = BOX
    return c


def load():
    if not SRC.exists():
        sys.exit(
            f"[중단] {SRC.relative_to(ROOT)} 가 없습니다.\n"
            "       먼저 `node scripts/collect_cc_etf.mjs` 로 ETFCHECK 에서 받아오십시오.\n"
            "       (클로드 세션에서는 etfcheck.co.kr 접속이 막혀 있어 러너에서만 됩니다.)"
        )
    d = json.loads(SRC.read_text(encoding="utf-8"))
    adopted = [x for x in d.get("items", []) if x.get("adopted")]
    if not adopted:
        sys.exit(
            "[중단] 채택된 ETF 가 0건입니다. 수집이 실패했거나 필터가 너무 좁습니다.\n"
            "       종목 없는 제안서를 만드는 것보다 여기서 멈추는 편이 낫습니다."
        )
    return d


# ══════════════════════════════════════════════════════════════════════
def vol_label(data, short=False):
    """변동성 칸에 붙일 이름.

    "1년" 이라고 박아 두면 원천이 한 해치를 주지 않은 달에 그 글자가 거짓이
    된다. 채택 종목이 실제로 몇 거래일치로 산출됐는지를 보고 이름을 정한다.
    """
    dd = [x.get("volatilityDays") for x in data["items"] if x.get("adopted")]
    dd = [d for d in dd if d]
    if dd and min(dd) >= 200:
        return "변동성(1년)" if short else "변동성 (1년, 연환산)"
    if dd:
        return f"변동성(연환산·최소 {min(dd)}일)" if short else f"변동성 (연환산, 최소 {min(dd)}거래일)"
    return "변동성(연환산)" if short else "변동성 (연환산)"


def build_data_sheet(wb, data):
    """수집 원본을 그대로 보여 주는 장. 제안서의 모든 수식이 여기를 본다."""
    ws = wb.create_sheet("ETF데이터")
    cols = [
        ("종목명", 34), ("종목코드", 11), ("운용사", 18), ("현재가", 12),
        ("순자산총액", 17), ("60일 평균거래대금", 19), ("총보수(연)", 11),
        (vol_label(data, short=True), 13), ("최근 월분배율", 13), ("연환산 분배율", 13),
        ("분배이력(개월)", 13), ("최근 분배기준일", 15), ("채택", 8), ("제외 사유", 30),
        # 기초지수는 맨 뒤에 붙인다. 가운데 끼워 넣으면 제안서 쪽 수식의
        # 열 글자가 한 칸씩 밀려 조용히 엉뚱한 칸을 가리키게 된다.
        ("기초지수", 34), ("유형", 11),
    ]
    ws.cell(row=1, column=1, value="ETFCHECK 수집 원본 — 이 장의 값은 손으로 고치지 마십시오. 매월 1일 수집기가 덮어씁니다.")
    ws.cell(row=1, column=1).font = f(10, bold=True, color=ORANGE)

    hr = 3
    for i, (name, width) in enumerate(cols, start=1):
        c = ws.cell(row=hr, column=i, value=name)
        c.font = f(10, bold=True)
        c.fill = fill(SOFT_ORANGE)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BOX
        ws.column_dimensions[get_column_letter(i)].width = width
    ws.row_dimensions[hr].height = 30

    # 채택 종목을 **먼저, 끊기지 않게** 적는다. 콤보박스가 이 구간을 그대로
    # 가리키기 때문이다. 중간에 제외 종목이 끼면 드롭다운에 제외 종목이 뜬다.
    items = data["items"]
    adopted = sorted(
        [x for x in items if x.get("adopted")],
        key=lambda x: (x.get("distTtmRate") or 0),
        reverse=True,
    )
    rejected = [x for x in items if not x.get("adopted")]

    r = hr + 1
    first_adopted = r
    for x in adopted + rejected:
        ok = bool(x.get("adopted"))
        vals = [
            x.get("name"), x.get("code"), x.get("manager"), x.get("price"),
            x.get("aum"), x.get("turnover60"),
            None if x.get("expenseRatio") is None else x["expenseRatio"] / 100,
            None if x.get("volatility") is None else x["volatility"] / 100,
            None if x.get("distMonthlyRate") is None else x["distMonthlyRate"] / 100,
            None if x.get("distTtmRate") is None else x["distTtmRate"] / 100,
            x.get("distMonths"), x.get("lastDistDate"),
            "채택" if ok else "제외", x.get("excludeReason") or "", x.get("index") or "",
            x.get("type") or "",
        ]
        fmts = [None, None, None, WON_PLAIN, WON_PLAIN, WON_PLAIN, PCT, PCT, PCT, PCT,
                "#,##0", None, None, None, None, None]
        for i, (v, fmt) in enumerate(zip(vals, fmts), start=1):
            c = ws.cell(row=r, column=i, value=v)
            c.font = f(10, color=INK if ok else MUTED)
            c.border = BOX
            if fmt:
                c.number_format = fmt
                c.alignment = Alignment(horizontal="right")
            if not ok:
                c.fill = fill(SURFACE)
        r += 1
    last_adopted = first_adopted + len(adopted) - 1

    ws.freeze_panes = f"A{hr + 1}"
    return ws, first_adopted, last_adopted, len(adopted), len(rejected)


# ══════════════════════════════════════════════════════════════════════
# ══════════════════════════════════════════════════════════════════════
# 포트폴리오에 담을 수 있는 종목 수. 다섯 줄이면 한 고객 제안에 충분하고,
# 더 늘리면 한 장에 안 들어간다. 비워 둔 줄은 계산에서 빠진다.
SLOTS = 5


def build_proposal(wb, data, first_adopted, last_adopted):
    ws = wb.create_sheet("제안서", 0)
    LAST = 8  # A..H
    # A 는 왼쪽 여백이다. 표는 전부 B 부터 시작한다 — 미리보기 PDF 를 보고
    # 알았는데, 비교표를 A 부터 그렸더니 종목명이 3칸짜리 여백 열에 들어가
    # "SOL0040Y0" 처럼 잘린 이름과 코드가 붙어 찍혔다.
    widths = [3, 30, 18, 17, 13, 16, 16, 16]
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.sheet_view.showGridLines = False

    # ── 머리띠 (hero-orange) ──
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=LAST)
    t = ws.cell(row=1, column=1, value="   월배당 ETF 투자 제안서")
    t.font = Font(name=FONT, size=20, bold=True, color="FFFFFF")
    t.alignment = Alignment(vertical="center")
    ws.row_dimensions[1].height = 44
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=LAST)
    s = ws.cell(row=2, column=1, value="   Monthly Distribution ETF Portfolio — 미래에셋증권")
    s.font = Font(name=FONT, size=10, color="FFFFFF")
    s.alignment = Alignment(vertical="center")
    ws.row_dimensions[2].height = 20
    for row in (1, 2):
        for c in range(1, LAST + 1):
            ws.cell(row=row, column=c).fill = fill(ORANGE)

    asof = data.get("asOf") or data.get("collectedAt", "")[:10]
    ws.merge_cells(start_row=3, start_column=1, end_row=3, end_column=LAST)
    m = ws.cell(row=3, column=1, value=f"   자료: ETFCHECK · 기준일 {asof} · 매월 1일 갱신")
    m.font = f(9, color=MUTED)
    ws.row_dimensions[3].height = 18

    D = "ETF데이터"
    adopted_rows = last_adopted - first_adopted + 1

    def rng(col):
        return f"'{D}'!${col}${first_adopted}:${col}${last_adopted}"

    # ── 1. 고객 정보 ──
    r = section(ws, 5, "1. 고객 정보 및 투자 조건", LAST)
    cust_row = r
    rows_in = [
        ("고객명", "홍길동", None),
        ("총 투자금액 (원)", 100_000_000, WON),
        ("배분 방식", "비율", None),
        ("배당소득세율", 0.154, PCT),
        ("제안일", date.today().strftime("%Y-%m-%d"), None),
    ]
    for i, (lab, val, fmt) in enumerate(rows_in):
        rr = r + i
        label(ws, rr, 2, lab, bold=True)
        put(ws, rr, 3, val, fmt, kind="input")
        ws.row_dimensions[rr].height = 22
    C_NAME = f"$C${cust_row}"
    C_AMT = f"$C${cust_row + 1}"
    C_MODE = f"$C${cust_row + 2}"
    C_TAX = f"$C${cust_row + 3}"

    # 배분 방식 콤보박스. "비율" 이면 아래 표의 배분 칸은 %, "금액" 이면 원이다.
    dv_mode = DataValidation(type="list", formula1='"비율,금액"', allow_blank=False, showDropDown=False)
    dv_mode.error = "비율 또는 금액 중에서 고르십시오."
    dv_mode.errorTitle = "배분 방식"
    dv_mode.prompt = "비율(%) 로 나눌지, 금액(원) 으로 나눌지 고르십시오."
    dv_mode.promptTitle = "배분 방식"
    ws.add_data_validation(dv_mode)
    dv_mode.add(ws.cell(row=cust_row + 2, column=3))

    label(ws, cust_row + 2, 5, "비율 = 총 투자금액을 %로 나눔 · 금액 = 종목별 금액을 직접 입력", size=9, color=MUTED)
    label(ws, cust_row + 3, 5, "국내 상장 ETF 분배금 기준 15.4% (지방소득세 포함)", size=9, color=MUTED)

    # ── 계산 보조 (숨김) ──
    # MATCH 를 수식마다 되풀이하면 한 군데를 고칠 때 스무 군데를 같이 고쳐야
    # 한다. 줄마다 한 칸에 모은다.
    ws["J1"] = "계산 보조 (수정하지 마십시오)"
    ws["J1"].font = f(9, color=MUTED)
    ws.column_dimensions["J"].hidden = True
    ws.column_dimensions["K"].hidden = True

    # ── 2. 포트폴리오 ──
    r = section(ws, cust_row + 5, "2. 투자 포트폴리오 (ETF 를 여러 개 고를 수 있습니다)", LAST)
    hdr = r
    # 배분 칸의 이름은 위에서 고른 방식을 따라간다. "배분" 이라고만 적어 두면
    # 25 라는 값이 25% 인지 25원인지 알 수 없다.
    heads = [
        None,  # B 는 아래에서 수식으로 넣는다
        f'=IF({C_MODE}="비율","배분 비율 (%)","배분 금액 (원)")',
        "배정 금액",
        "매수 수량",
        "실투자금액",
        "월 분배금(세전)",
        "월 분배금(세후)",
    ]
    hc = ws.cell(row=hdr, column=2, value="투자 ETF")
    hc.font = f(10, bold=True)
    hc.fill = fill(SOFT_ORANGE)
    hc.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    hc.border = BOX
    for i, h in enumerate(heads[1:], start=3):
        c = ws.cell(row=hdr, column=i, value=h)
        c.font = f(10, bold=True)
        c.fill = fill(SOFT_ORANGE)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BOX
    ws.row_dimensions[hdr].height = 30

    p_first = hdr + 1
    p_last = hdr + SLOTS

    # ETF 콤보박스 — 채택 종목 구간만 가리킨다. 빈 줄을 허용해야 다섯 개를
    # 다 채우지 않아도 된다.
    dv = DataValidation(type="list", formula1="=채택종목", allow_blank=True, showDropDown=False)
    dv.error = "목록에 있는 ETF 중에서 고르십시오. 유동성·변동성 기준을 통과한 종목만 담겨 있습니다."
    dv.errorTitle = "선택할 수 없는 종목"
    dv.prompt = "▼ 를 눌러 ETF 를 고르십시오. 비워 두면 그 줄은 계산에서 빠집니다."
    dv.promptTitle = "ETF 선택"
    ws.add_data_validation(dv)
    dv.add(f"C{p_first}:C{p_first}")  # 자리만 잡아 두고 아래에서 다시 건다

    for i in range(SLOTS):
        rr = p_first + i
        # B: ETF 이름 (입력)
        cell = put(ws, rr, 2, None, None, kind="input")
        cell.alignment = Alignment(vertical="center", horizontal="left")
        # C: 배분 (입력)
        put(ws, rr, 3, None, "#,##0.##", kind="input")
        # K: 그 종목이 ETF데이터 몇 번째 줄인지
        ws[f"K{rr}"] = f'=IF($B{rr}="",0,IFERROR(MATCH($B{rr},채택종목,0),0))'
        ws[f"K{rr}"].font = f(9, color=MUTED)
        # D: 배정 금액 — 방식에 따라 총액의 몇 % 이거나, 적어 넣은 금액 그대로
        put(ws, rr, 4,
            f'=IF($K{rr}=0,0,IF({C_MODE}="비율",ROUND({C_AMT}*$C{rr}/100,0),$C{rr}))', WON)
        # E: 매수 수량 — 정수 매수만 가능하므로 내림
        put(ws, rr, 5,
            f"=IF($K{rr}=0,0,ROUNDDOWN($D{rr}/INDEX({rng('D')},$K{rr}),0))", QTY)
        # F: 실제 투자금액
        put(ws, rr, 6, f"=IF($K{rr}=0,0,$E{rr}*INDEX({rng('D')},$K{rr}))", WON)
        # G: 월 분배금(세전) = 실투자금 × 연 분배율 ÷ 12
        put(ws, rr, 7, f"=IF($K{rr}=0,0,$F{rr}*INDEX({rng('J')},$K{rr})/12)", WON)
        # H: 월 분배금(세후)
        put(ws, rr, 8, f"=$G{rr}*(1-{C_TAX})", WON)
        if i % 2 == 1:
            for c in range(4, 9):
                ws.cell(row=rr, column=c).fill = fill(SURFACE)
        ws.row_dimensions[rr].height = 20

    # 콤보박스를 다섯 줄 전체에 건다.
    dv.sqref = f"B{p_first}:B{p_last}"

    # 합계 줄
    tot = p_last + 1
    label(ws, tot, 2, "합계", bold=True)
    ws.cell(row=tot, column=2).fill = fill(HIGHLIGHT)
    ws.cell(row=tot, column=2).border = BOX
    for col, letter, fmt in [
        (3, "C", "#,##0.##"), (4, "D", WON), (6, "F", WON), (7, "G", WON), (8, "H", WON),
    ]:
        c = put(ws, tot, col, f"=SUM({letter}{p_first}:{letter}{p_last})", fmt, bold=True)
        c.fill = fill(HIGHLIGHT)
    # 수량 합계는 뜻이 없다(종목마다 단가가 다르다). 빈칸으로 둔다.
    ec = ws.cell(row=tot, column=5)
    ec.fill = fill(HIGHLIGHT)
    ec.border = BOX

    # 배분이 어긋나면 말해 준다. 비율 합이 100 이 아니거나 금액 합이 총액을
    # 넘으면 아래 숫자가 전부 어긋나는데, 색만으로는 눈에 안 띈다.
    warn = tot + 1
    ws.merge_cells(start_row=warn, start_column=2, end_row=warn, end_column=LAST)
    wc = ws.cell(
        row=warn,
        column=2,
        value=(
            f'=IF({C_MODE}="비율",'
            f'IF(ABS($C{tot}-100)>0.01,"※ 배분 비율 합계가 100%가 아닙니다. 위 배분 칸을 확인하십시오.",'
            f'""),'
            f'IF($D{tot}>{C_AMT},"※ 배분 금액 합계가 총 투자금액을 넘습니다.",""))'
        ),
    )
    wc.font = f(10, bold=True, color=ERROR)
    ws.row_dimensions[warn].height = 18

    note = warn + 1
    ws.merge_cells(start_row=note, start_column=2, end_row=note, end_column=LAST)
    nc = ws.cell(
        row=note,
        column=2,
        value="빈 줄은 계산에서 빠집니다. 한 종목만 담으려면 첫 줄에만 넣고 배분을 100 으로 두십시오.",
    )
    nc.font = f(9, color=MUTED)

    TOT_INVEST = f"$F${tot}"
    TOT_M_PRE = f"$G${tot}"
    TOT_M_POST = f"$H${tot}"

    # ── 3. 요약 ──
    r = section(ws, note + 2, "3. 예상 분배금 요약", LAST)
    left = [
        ("총 투자금액", f"={C_AMT}", WON),
        ("실제 투자금액", f"={TOT_INVEST}", WON),
        ("미투자 잔액", f"={C_AMT}-{TOT_INVEST}", WON),
        # 빈 줄을 세지 않으려면 이름 칸이 아니라 보조 칸(K)을 본다. COUNTIF 로
        # 글자 있는 칸을 세면 비어 있는 줄까지 세어 다섯이 나온다.
        ("담은 종목 수", f'=COUNTIF($K${p_first}:$K${p_last},">0")', '#,##0"종목"'),
    ]
    for i, (lab, formula, fmt) in enumerate(left):
        rr = r + i
        label(ws, rr, 2, lab, bold=True)
        put(ws, rr, 3, formula, fmt)
        ws.row_dimensions[rr].height = 20

    right = [
        ("월 예상 분배금 (세전)", f"={TOT_M_PRE}", WON),
        ("월 예상 분배금 (세후)", f"={TOT_M_POST}", WON),
        ("연 예상 분배금 (세전)", f"={TOT_M_PRE}*12", WON),
        ("연 예상 분배금 (세후)", f"={TOT_M_POST}*12", WON),
    ]
    for i, (lab, formula, fmt) in enumerate(right):
        rr = r + i
        label(ws, rr, 6, lab, bold=True)
        c = put(ws, rr, 7, formula, fmt, bold=(i == 0), size=11 if i == 0 else 10)
        if i == 0:
            c.fill = fill(HIGHLIGHT)
    r += 4

    # 가중평균 수익률 — 포트폴리오 전체를 하나로 봤을 때의 수익률이다.
    W_ANN = f"$C${r}"
    rate = [
        ("연 수익률 (세전, 가중평균)", f"=IF({TOT_INVEST}=0,0,{TOT_M_PRE}*12/{TOT_INVEST})", PCT),
        ("연 수익률 (세후, 가중평균)", f"=IF({TOT_INVEST}=0,0,{TOT_M_POST}*12/{TOT_INVEST})", PCT),
    ]
    for i, (lab, formula, fmt) in enumerate(rate):
        rr = r + i
        label(ws, rr, 2, lab, bold=True)
        put(ws, rr, 3, formula, fmt)
        ws.row_dimensions[rr].height = 20
    rate2 = [
        ("월 수익률 (세전)", f"=IF({TOT_INVEST}=0,0,{TOT_M_PRE}/{TOT_INVEST})", PCT3),
        ("월 수익률 (세후)", f"=IF({TOT_INVEST}=0,0,{TOT_M_POST}/{TOT_INVEST})", PCT3),
    ]
    for i, (lab, formula, fmt) in enumerate(rate2):
        rr = r + i
        label(ws, rr, 6, lab, bold=True)
        put(ws, rr, 7, formula, fmt)
    r += 2

    label(ws, r, 2,
          "연 수익률은 담은 종목들의 최근 12개월 실제 분배금을 투자 비중으로 가중한 값입니다. "
          "확정 수익률이 아니며 매월 달라집니다.",
          size=9, color=MUTED)
    r += 2

    # ── 4. 금액별 표 ──
    r = section(ws, r, "4. 총 투자금액별 예상 분배금 (위 포트폴리오 구성을 그대로 두고 금액만 바꿨을 때)", LAST)
    heads4 = ["투자금액 구간", "월 분배금(세전)", "월 분배금(세후)", "연 분배금(세전)", "연 분배금(세후)"]
    for i, h in enumerate(heads4, start=2):
        c = ws.cell(row=r, column=i, value=h)
        c.font = f(10, bold=True)
        c.fill = fill(SOFT_ORANGE)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BOX
    ws.row_dimensions[r].height = 28
    r += 1

    tiers = [10_000_000, 30_000_000, 50_000_000, 100_000_000,
             200_000_000, 300_000_000, 500_000_000, 1_000_000_000]
    for i, amt in enumerate(tiers):
        rr = r + i
        a = put(ws, rr, 2, amt, WON, kind="source")
        a.font = f(10, bold=True)
        put(ws, rr, 3, f"=$B{rr}*{W_ANN}/12", WON)
        put(ws, rr, 4, f"=$C{rr}*(1-{C_TAX})", WON)
        put(ws, rr, 5, f"=$B{rr}*{W_ANN}", WON)
        put(ws, rr, 6, f"=$E{rr}*(1-{C_TAX})", WON)
        if i % 2 == 1:
            for c in range(2, 7):
                ws.cell(row=rr, column=c).fill = fill(SURFACE)
    r += len(tiers)
    label(ws, r, 2,
          "※ 위 표는 2. 의 포트폴리오 구성(종목과 비중)을 그대로 두고 금액만 바꾼 값입니다. "
          "단주 절사는 반영하지 않은 근사치라 2·3. 의 값과 몇 천 원 차이가 날 수 있습니다.",
          size=9, color=MUTED)
    r += 2

    # ── 5. 채택 종목 비교 ──
    shown = min(adopted_rows, COMPARE_TOP)
    title5 = "5. 채택 ETF 비교 (1억원 단독 투자 기준)"
    if shown < adopted_rows:
        title5 += f" — 연 분배율 상위 {shown}종목 / 전체 {adopted_rows}종목"
    r = section(ws, r, title5, LAST)
    # 종목코드는 뺐다. B 부터 시작하면 여덟 칸이 안 나오는데, 고객이 보는
    # 자리에서는 코드보다 이름·분배율·변동성이 먼저다. 코드는 [ETF데이터] 에 있다.
    heads2 = ["종목명", "현재가", "연 분배율", "월 분배율",
              "월 분배금(세전)", "월 분배금(세후)", vol_label(data, short=True)]
    for i, h in enumerate(heads2, start=2):
        c = ws.cell(row=r, column=i, value=h)
        c.font = f(10, bold=True)
        c.fill = fill(SOFT_ORANGE)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BOX
    ws.row_dimensions[r].height = 30
    r += 1

    for i in range(shown):
        rr = r + i
        src = first_adopted + i
        put(ws, rr, 2, f"='{D}'!$A${src}", None, kind="source")
        put(ws, rr, 3, f"='{D}'!$D${src}", WON)
        put(ws, rr, 4, f"='{D}'!$J${src}", PCT)
        put(ws, rr, 5, f"='{D}'!$J${src}/12", PCT3)
        # 1억을 그 종목 현재가로 나눈 수량 기준. 금액을 그냥 곱하면 단주를
        # 살 수 있다는 뜻이 되어, 위 표들과 숫자가 어긋난다.
        put(ws, rr, 6, f"=IF($C{rr}=0,0,ROUNDDOWN(100000000/$C{rr},0)*$C{rr}*$D{rr}/12)", WON)
        put(ws, rr, 7, f"=$F{rr}*(1-{C_TAX})", WON)
        put(ws, rr, 8, f"='{D}'!$H${src}", PCT)
        if i % 2 == 1:
            for c in range(2, 9):
                ws.cell(row=rr, column=c).fill = fill(SURFACE)
    r += shown

    rules = data.get("rules", {})
    label(ws, r + 1, 2,
          "※ 유동성·변동성 기준을 통과한 종목만 실었습니다. 제외 종목과 사유는 [ETF데이터] 장에 있습니다.",
          size=9, color=MUTED)
    r += 3

    # ── 6. 유의사항 ──
    r = section(ws, r, "6. 유의사항", LAST)
    notes = [
        "이 자료는 투자 권유가 아니라 참고 자료입니다. 최종 투자 판단과 그 결과는 투자자 본인에게 귀속됩니다.",
        "ETF 는 예금자보호법의 보호를 받지 않으며, 원금 손실이 발생할 수 있습니다.",
        "분배금은 확정되지 않습니다. 커버드콜 ETF 의 분배 재원은 옵션 프리미엄이므로, 시장 변동성이 낮아지면 분배금도 함께 줄어듭니다.",
        "분배금의 일부가 원금에서 지급될 수 있습니다(자본 환급). 이 경우 기준가가 그만큼 낮아집니다.",
        "표시된 연 분배율은 최근 12개월 실제 분배금 합계를 현재가로 나눈 값(사후 수치)이며, 앞으로의 수익률을 보장하지 않습니다.",
        "세율은 국내 상장 ETF 분배금 기준 15.4%(배당소득세 14% + 지방소득세 1.4%)를 적용했습니다. 금융소득종합과세 대상자는 실효세율이 달라집니다.",
        "매매수수료·거래세·환율 변동은 반영하지 않았습니다. 총보수는 분배율에 이미 반영되어 있습니다(기준가 차감).",
        "수량은 정수 매수를 가정해 내림 처리했습니다. 남는 금액은 '미투자 잔액'에 표시됩니다.",
        "여러 종목에 나눠 담아도 분배 시기는 종목마다 다릅니다. 매월 같은 날 한꺼번에 들어오지 않습니다.",
    ]
    for i, t in enumerate(notes):
        ws.merge_cells(start_row=r + i, start_column=1, end_row=r + i, end_column=LAST)
        c = ws.cell(row=r + i, column=1, value=f"  · {t}")
        c.font = f(9, color=INK if i < 2 else MUTED)
        c.alignment = Alignment(vertical="center", wrap_text=False)
        ws.row_dimensions[r + i].height = 17
    r += len(notes) + 1

    src_line = (
        f"  자료 출처: ETFCHECK (www.etfcheck.co.kr) · 수집 시각 {data.get('collectedAt', '')} · "
        f"대상: 국내 상장 월배당 ETF · 채택 기준: 순자산 {rules.get('minAum', 0)/1e8:,.0f}억원 이상, "
        f"60일 평균거래대금 {rules.get('minTurnover', 0)/1e8:,.0f}억원 이상, "
        # "1년 변동성" 이라고 박지 않는다. 원천이 한 해치를 주지 않은 달에
        # 그 글자가 거짓이 된다. 정확한 창은 [ETF데이터] 장 머리와 원천 json 에 있다.
        f"연환산 변동성 {rules.get('maxVol', 0):g}% 이하, 분배 이력 {rules.get('minTrackMonths', 0)}개월 이상"
    )
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=LAST)
    c = ws.cell(row=r, column=1, value=src_line)
    c.font = f(9, color=MUTED)

    ws.freeze_panes = "A4"

    # 인쇄. 이 장은 고객에게 건네는 한 장이라 대개 인쇄하거나 PDF 로 저장한다.
    # 기본값으로 두면 A4 에 넘쳐 표가 두 쪽으로 갈라진다.
    ws.page_setup.orientation = "portrait"
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0  # 세로는 넘치면 다음 장으로
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_options.horizontalCentered = True
    ws.page_margins.left = ws.page_margins.right = 0.4
    ws.page_margins.top = ws.page_margins.bottom = 0.5
    ws.print_area = f"A1:H{r}"
    # 표가 다음 장으로 넘어가도 머리글이 따라가게 한다.
    ws.print_title_rows = "1:3"
    return ws, p_first, p_last


def build_guide(wb, data, n_adopted, n_rejected):
    ws = wb.create_sheet("사용법")
    ws.column_dimensions["A"].width = 3
    ws.column_dimensions["B"].width = 100
    ws.sheet_view.showGridLines = False
    ws.cell(row=1, column=2, value="이 파일을 쓰는 법").font = f(16, bold=True, color=ORANGE)
    body = [
        "",
        "1. [제안서] 장의 노란 칸만 고치면 됩니다.",
        "     · 고객명 — 그대로 인쇄됩니다.",
        "     · 총 투자금액 — 원 단위로 넣으십시오. 예: 100000000",
        "     · 배분 방식 — '비율' 또는 '금액'. 아래 표의 배분 칸 뜻이 이것에 따라 바뀝니다.",
        "     · 배당소득세율 — 기본 15.4%. 금융소득종합과세 대상자면 여기만 바꾸십시오.",
        "",
        "2. 포트폴리오는 다섯 줄까지 담을 수 있습니다.",
        "     · 투자 ETF 칸을 누르면 ▼ 가 나옵니다. 목록에서 고르십시오.",
        "     · 배분 방식이 '비율' 이면 배분 칸에 %를 넣습니다. 합이 100 이 되어야 합니다.",
        "       예) 50 / 30 / 20 → 총 투자금액을 5:3:2 로 나눕니다.",
        "     · 배분 방식이 '금액' 이면 배분 칸에 원 단위 금액을 직접 넣습니다.",
        "       예) 60000000 / 25000000 / 15000000",
        "     · 한 종목만 담으려면 첫 줄에만 넣고 배분을 100 으로 두십시오.",
        "     · 빈 줄은 계산에서 빠집니다. 줄을 지울 필요가 없습니다.",
        "     · 배분이 어긋나면(비율 합이 100 이 아니거나 금액 합이 총액을 넘으면)",
        "       합계 줄 아래에 빨간 글씨로 알려 줍니다.",
        "",
        "3. 나머지 칸은 전부 수식입니다. 손으로 고치면 다음 갱신 때 되돌아갑니다.",
        "",
        "4. 목록에 담긴 ETF",
        f"     · 채택 {n_adopted}종목 — 유동성·변동성 기준을 통과한 국내 상장 월배당 ETF",
        f"     · 제외 {n_rejected}종목 — 사유는 [ETF데이터] 장 '제외 사유' 칸에 적혀 있습니다.",
        "     · 커버드콜인지 아닌지는 [ETF데이터] 장 맨 오른쪽 '유형' 칸에 있습니다.",
        "",
        "5. 갱신",
        "     매월 1일 오전(KST)에 ETFCHECK 에서 월분배율을 다시 받아 이 파일을 새로 만듭니다.",
        "     고객명·투자금액·포트폴리오는 갱신 때 초기값으로 돌아가므로,",
        "     고객별 사본은 따로 저장해 두십시오.",
        "",
        "6. 값이 이상해 보이면",
        "     [ETF데이터] 장을 먼저 보십시오. 그 장이 원천이고, [제안서] 장은 그 장을 가리킬 뿐입니다.",
        "     그 장의 값이 ETFCHECK 화면과 다르면 수집이 어긋난 것이니 알려 주십시오.",
    ]
    for i, line in enumerate(body, start=2):
        c = ws.cell(row=i, column=2, value=line)
        c.font = f(11, bold=line[:2].strip().endswith("."), color=INK)
        ws.row_dimensions[i].height = 19
    return ws


def main():
    data = load()
    wb = Workbook()
    wb.remove(wb.active)

    ds, first, last, n_ok, n_no = build_data_sheet(wb, data)
    # 콤보박스가 가리킬 이름. 종목 수가 달라져도 이름만 다시 잡으면 된다.
    wb.defined_names.add(
        DefinedName("채택종목", attr_text=f"'ETF데이터'!$A${first}:$A${last}")
    )
    ws, p_first, p_last = build_proposal(wb, data, first, last)
    build_guide(wb, data, n_ok, n_no)

    # 첫 줄에 종목 하나를 미리 넣어 둔다. 다섯 줄을 전부 비워 두면 열자마자
    # 0원짜리 제안서가 뜬다.
    #
    # 분배율이 제일 높은 종목을 기본값으로 두지 않는다. 그 자리는 대개 한
    # 종목에 몰아 넣은 커버드콜이 차지하는데, 아무 손도 대지 않고 인쇄한
    # 제안서가 그 종목을 권하는 꼴이 된다. 순자산이 가장 큰 종목 —
    # 가장 무난한 것 — 을 한 줄만 넣고, 나머지 네 줄은 비워 둔다. 무엇을
    # 어떻게 섞을지는 사람이 정할 일이지 이 파일이 정할 일이 아니다.
    default = max(
        [x for x in data["items"] if x.get("adopted")],
        key=lambda x: (x.get("aum") or 0),
    )
    ws.cell(row=p_first, column=2).value = default["name"]
    ws.cell(row=p_first, column=3).value = 100   # 비율 방식이므로 100%

    wb.active = wb["제안서"]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    print(f"만들었습니다: {OUT}  (채택 {n_ok}종목 / 제외 {n_no}종목)")


if __name__ == "__main__":
    main()
