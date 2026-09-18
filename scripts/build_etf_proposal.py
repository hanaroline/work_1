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
WARNING = "D4A017"       # 기준 미달 종목을 담았을 때
SURFACE_SOFT = "ECEFF4"  # 큰 수치 칸 배경
HAIRLINE_SOFT = "E5E4E1" # 표 안쪽 선
LINE_DARK = "49535B"     # 합계 줄 위의 선

FONT = "Spoqa Han Sans Neo"  # 브랜드 지정 서체. 없으면 뷰어가 대체한다.

# 비교표에 싣는 종목 수. 채택 종목이 일흔이 넘어 다 실으면 고객이 받는 장이
# 표 하나로 덮인다. 두 갈래로 뽑아 합친다 — 많이 주는 쪽과 큰 쪽.
COMPARE_YIELD = 8   # 연 분배율 상위
COMPARE_AUM = 6     # 순자산 상위 (파킹형 제외)

WON = '#,##0"원"'
WON_PLAIN = "#,##0"
PCT = "0.00%"
PCT3 = "0.000%"
QTY = '#,##0"주"'
# 순자산·거래대금은 원 단위로 적으면 자릿수를 세어야 읽힌다.
#
# **이 서식은 글자만 붙인다. 나누지 않는다.** 엑셀의 표시 서식으로는 1억을
# 나눌 수 없다(쉼표 하나가 1,000 씩이라 억은 떨어지지 않는다). 그래서 이 서식을
# 쓰는 칸은 **수식에서 미리 1e8 로 나눠 두어야 한다.**
#
# 그러지 않아서 [종목조회] 의 순자산이 68,374억원 대신 6,837,352,830,000억원
# 으로 찍히고 있었다. 1억 배다. 칸이 좁아 ###### 으로 보였을 뿐 값 자체가
# 틀려 있었다. HTML 판은 aum/1e8 로 제대로 나누고 있어서 두 판이 어긋났다.
EOK = '#,##0"억원"'
EOK_DIV = 100_000_000  # EOK 서식을 쓰는 수식은 이 값으로 나눈다

# 날짜는 원천이 20260828 같은 여덟 자리 숫자로 준다. 그대로 두면 칸에
# "20260828" 로 찍혀 사람이 자리를 세어 읽어야 한다.
#
# 진짜 날짜값으로 바꾸지 않고 **표시 서식만** 바꾼다. 값은 숫자로 남으므로
# 자동 필터의 정렬이 그대로 맞고(여덟 자리 숫자는 크기 순이 곧 날짜 순이다),
# 이 칸을 보는 수식이 생기더라도 뜻이 달라지지 않는다.
DATE8 = "0000-00-00"
# 0 을 빈칸으로 찍는 판. 포트폴리오의 안 채운 줄에 쓴다 — 고객이 받는 장에
# "0원 0주 0원" 이 아홉 줄 깔리면 표가 아니라 잡음이 된다. 세 번째 구획이
# 0 일 때의 표시이고, 비워 두면 아무것도 찍히지 않는다.
WON_Z = '#,##0"원";-#,##0"원";""'
QTY_Z = '#,##0"주";-#,##0"주";""' 

thin = Side(style="thin", color=HAIRLINE_SOFT)
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


def section(ws, row, number, title, last_col):
    """1px 오렌지 룰 + 그 아래 좌측 정렬 제목. 브랜드 레이아웃 시그니처다.

    번호만 오렌지로 세우고 제목은 먹색으로 둔다. 제목까지 오렌지로 칠하면
    한 장에 오렌지가 예닐곱 번 나와 강조가 강조를 잡아먹는다.
    """
    rule_row(ws, row, last_col)
    n = ws.cell(row=row + 1, column=1, value=number)
    n.font = f(13, bold=True, color=ORANGE)
    n.alignment = Alignment(horizontal="right", vertical="center")
    c = ws.cell(row=row + 1, column=2, value=title)
    c.font = f(13, bold=True)
    c.alignment = Alignment(vertical="center")
    ws.row_dimensions[row + 1].height = 26
    ws.row_dimensions[row + 2].height = 6
    return row + 3


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


def freq_label(x):
    """[종목조회] 의 콤보박스에 그대로 쓸 짧은 이름.

    원천은 '판정 불가(상장 1년 미만)' 처럼 까닭까지 달고 오는데, 콤보박스에
    담을 값과 칸에 적히는 값이 한 글자라도 다르면 조회가 아무것도 못 찾는다.
    까닭은 [ETF데이터] 장의 '제외 사유' 에 그대로 남으므로 여기서는 짧게 적는다.
    """
    f = x.get("payoutFreq")
    if not f:
        return ""
    return "판정 불가" if f.startswith("판정 불가") else f


# [종목조회] 콤보박스에 담을 지급주기. '전체' 가 맨 앞이다.
FREQ_CHOICES = ["전체", "월배당", "분기배당", "반기배당", "연배당", "주배당", "비정기", "판정 불가"]


def build_data_sheet(wb, data):
    """수집 원본을 그대로 보여 주는 장. 제안서의 모든 수식이 여기를 본다."""
    ws = wb.create_sheet("ETF데이터")
    cols = [
        ("종목명", 34), ("종목코드", 11), ("운용사", 18), ("현재가", 12),
        ("순자산총액", 17), ("60일 평균거래대금", 19), ("총보수(연)", 11),
        (vol_label(data, short=True), 13), ("최근 월분배율", 13), ("연환산 분배율", 13),
        # '분배이력(개월)' 이었는데 건수로 고쳐 적는다. 월배당만 담을 때는 건수가
        # 곧 개월수여서 같은 말이었지만, 분기배당 종목은 2년을 분배해도 건수가
        # 여덟이라 "이력 8개월" 로 읽히면 거짓이 된다.
        ("분배 기록수", 12), ("최근 분배기준일", 15), ("채택", 8), ("제외 사유", 30),
        # 기초지수는 맨 뒤에 붙인다. 가운데 끼워 넣으면 제안서 쪽 수식의
        # 열 글자가 한 칸씩 밀려 조용히 엉뚱한 칸을 가리키게 된다.
        ("기초지수", 34), ("유형", 11), ("자산군", 14),
        ("지급주기", 12), ("연 지급횟수", 12),
        # 과세비율도 **맨 뒤에** 붙인다. 가운데 끼우면 제안서 쪽 수식의 열
        # 글자가 한 칸씩 밀려 조용히 엉뚱한 칸을 가리킨다(기초지수 때와 같다).
        ("과세비율", 11),
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

    # 차례가 곧 드롭다운의 차례다. 세 덩이로 나눠 적는다.
    #
    #   1) 채택 — 기준을 통과한 종목, 연 분배율 높은 순
    #   2) 기준 미달 — 통과하지 못했지만 값이 온전한 종목
    #   3) 고를 수 없는 것 — 연 분배율이 없거나 수집이 실패한 종목.
    #
    # 드롭다운은 1)+2) 를 가리킨다. 처음에는 1) 만 담았는데, 기준은 우리가
    # 정한 선일 뿐이고 그 선 밖의 종목을 담을지는 담당자가 판단할 일이다.
    # 다만 기준 미달 종목을 담으면 제안서에서 노란 글씨로 알려 준다.
    # 3) 은 뺀다 — 담아도 0원이 나오고, 0원은 "분배를 안 한다" 는 거짓말이 된다.
    items = data["items"]
    by_yield = lambda x: (x.get("distTtmRate") or 0)  # noqa: E731
    adopted = sorted([x for x in items if x.get("adopted")], key=by_yield, reverse=True)
    usable_rejected = sorted(
        [x for x in items
         # 연 분배율이 없는 종목은 뺀다. 이 문서가 내놓는 값이 전부
         # "실투자금 × 연 분배율 ÷ 12" 이라, 그 값이 없으면 담아도 0원이
         # 나온다. 0원을 보여 주는 것은 "분배를 안 한다" 는 거짓말이 된다.
         # 분배 이력이 열두 달을 못 채운 종목이 대부분이고, 사유는
         # [ETF데이터] 장에 그대로 남는다.
         if not x.get("adopted") and x.get("dataComplete") is not False
         and (x.get("price") or 0) > 0 and x.get("distTtmRate") is not None],
        key=by_yield, reverse=True,
    )
    picked_codes = {x["code"] for x in adopted} | {x["code"] for x in usable_rejected}
    unusable = [x for x in items if x["code"] not in picked_codes]

    r = hr + 1
    first_adopted = r
    for x in adopted + usable_rejected + unusable:
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
            x.get("type") or "", x.get("assetClass") or "",
            freq_label(x), x.get("payoutCount12m"),
            # 과세비율. 못 구한 종목은 **비워 둔다.** 1 로 적으면 '실제로 전액
            # 과세되는 종목' 과 '확인하지 못한 종목' 이 화면에서 똑같이 100% 로
            # 보여, 모르는 것이 사실로 둔갑한다. 계산 쪽에서는 빈칸을 1 로 읽어
            # 전액 과세로 셈한다(세금을 적게 매기는 쪽으로 기울지 않는다).
            x.get("taxableRatio"),
        ]
        fmts = [None, None, None, WON_PLAIN, WON_PLAIN, WON_PLAIN, PCT, PCT, PCT, PCT,
                "#,##0", DATE8, None, None, None, None, None, None, "#,##0", PCT]
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
    last_sel = first_adopted + len(adopted) + len(usable_rejected) - 1

    # ── [종목조회] 가 쓰는 숨긴 계산 칸 ────────────────────────────────
    #
    # 엑셀의 콤보박스(데이터 유효성 검사)는 다른 칸 값에 따라 목록이 저절로
    # 줄어들지 않는다. FILTER 같은 배열 수식은 이 문서가 구버전 엑셀에서도
    # 열려야 해서 못 쓰고, VBA 는 매크로 파일(.xlsm)이 되어 사내 배포에서
    # 막힐 수 있다. 그래서 고전적인 방법을 쓴다 —
    #
    #   T: 조건에 맞으면 1
    #   U: 맞은 것에 1,2,3… 차례를 매긴다(위에서부터 누적 개수)
    #
    # [종목조회] 는 "U 에서 k 를 찾아라"(MATCH) 로 k번째 종목을 집어낸다.
    # 배열 수식도 VBA 도 없이 조건 조회가 된다.
    #
    # 칸은 드롭다운이 가리키는 구간(채택 + 기준 미달)에만 넣는다. 그 아래
    # '고를 수 없는' 종목은 조회 결과에 나와도 담을 수 없으니 뜻이 없다.
    c_match = len(cols) + 1        # T
    c_rank = len(cols) + 2         # U
    # 열 글자는 **이름으로** 찾는다. 자리로 세면(len(cols)-1 같은 식) 칸을
    # 하나 붙이는 순간 조용히 옆 칸을 가리킨다. 과세비율을 붙이면서 실제로
    # 그럴 뻔했다.
    def col_of(title):
        for i, (t, _w) in enumerate(cols, start=1):
            if t == title:
                return get_column_letter(i)
        raise KeyError(f"[ETF데이터] 에 '{title}' 칸이 없습니다.")

    col_freq = col_of("지급주기")
    col_ttm = col_of("연환산 분배율")
    col_tax = col_of("과세비율")
    tl = get_column_letter(c_match)
    tl2 = get_column_letter(c_rank)
    for rr in range(first_adopted, last_sel + 1):
        # 조건 셋을 모두 만족해야 1. 연 분배율이 빈 칸인 종목은 애초에 이
        # 구간에 없지만, 빈 칸은 엑셀에서 0 으로 읽혀 "최소 0%" 에 걸리므로
        # 그래도 명시해 둔다 — 빈 값이 0% 짜리 종목 행세를 하면 안 된다.
        ws.cell(row=rr, column=c_match).value = (
            f'=IF(AND(${col_ttm}{rr}<>"",'
            f'OR(조회_주기="전체",${col_freq}{rr}=조회_주기),'
            f"${col_ttm}{rr}>=조회_최소,${col_ttm}{rr}<=조회_최대),1,0)"
        )
        # 누적 개수는 **바로 윗줄에 1을 더하는** 식으로 센다.
        #
        # 처음에는 COUNTIF 로 위쪽 전체를 매번 다시 셌는데, 줄이 늘면 그게
        # n² 이 된다. 모집단이 892종목이 되면 80만 번짜리 계산이라 검산기가
        # 조합마다 몇 분씩 걸린다. 윗줄 + 1 이면 한 번씩만 보면 된다.
        #
        # 조건에 안 맞는 줄은 윗줄 값을 그대로 물려받아 같은 수가 이어지는데,
        # MATCH 는 **처음 나오는 자리**를 돌려주므로 k 를 찾으면 정확히 k번째로
        # 맞은 줄이 나온다.
        prev = "0" if rr == first_adopted else f"${tl2}{rr - 1}"
        ws.cell(row=rr, column=c_rank).value = f"=IF(${tl}{rr}=1,{prev}+1,{prev})"

    # ── [제안서] 의 종목 검색이 쓰는 숨긴 계산 칸 ──────────────────────
    #
    # 콤보박스에 514종목이 한 줄로 들어 있으면 원하는 것을 찾기가 어렵다.
    # 글자 몇 개로 목록을 좁힐 수 있어야 한다. 방법은 위와 같다 —
    #
    #   V: 검색어가 종목명에 들어 있으면 1
    #   W: 맞은 것에 차례를 매긴다
    #   X: k번째로 맞은 **종목명 자체**를 뽑아 붙인다(빈칸 없이 위에서부터)
    #
    # 콤보박스는 X 를 가리키되, 높이를 맞은 개수만큼만 잡는다(OFFSET). 그래야
    # 목록 끝에 빈 줄이 줄줄이 달리지 않는다.
    #
    # **계산이 보는 목록은 바꾸지 않는다.** 담긴 종목을 찾는 K 칸은 여전히
    # 전체 목록(선택가능종목)을 본다. 검색어를 바꿨다고 이미 담아 둔 종목이
    # 목록 밖으로 나가면서 계산이 0원이 되면 안 되기 때문이다. 좁히는 것은
    # **고르는 목록**뿐이고, 이미 고른 것은 검색어와 무관하게 그대로 있다.
    c_smatch = len(cols) + 3       # V
    c_srank = len(cols) + 4        # W
    c_slist = len(cols) + 5        # X
    vl, wl, xl = (get_column_letter(c) for c in (c_smatch, c_srank, c_slist))
    for rr in range(first_adopted, last_sel + 1):
        # 검색어가 비면 전부 통과. 빈 칸을 그대로 SEARCH 에 넣으면 엑셀이 0
        # 으로 읽어 "0" 이라는 글자를 찾으러 간다 — 그러면 아무것도 안 나온다.
        ws.cell(row=rr, column=c_smatch).value = (
            f'=IF(검색어="",1,IF(ISNUMBER(SEARCH(검색어,$A{rr})),1,0))'
        )
        prev = "0" if rr == first_adopted else f"${wl}{rr - 1}"
        ws.cell(row=rr, column=c_srank).value = f"=IF(${vl}{rr}=1,{prev}+1,{prev})"
        k = rr - first_adopted + 1
        ws.cell(row=rr, column=c_slist).value = (
            f"=IFERROR(INDEX($A${first_adopted}:$A${last_sel},"
            f"MATCH({k},${wl}${first_adopted}:${wl}${last_sel},0)),\"\")"
        )

    for c in (c_match, c_rank, c_smatch, c_srank, c_slist):
        ws.column_dimensions[get_column_letter(c)].hidden = True

    ws.freeze_panes = f"A{hr + 1}"
    ws.auto_filter.ref = f"A{hr}:{get_column_letter(len(cols))}{r - 1}"
    # 검색용 칸의 글자를 그대로 돌려준다. 여기 글자를 main 에 박아 두면 칸을
    # 하나 늘리는 순간 이름이 조용히 엉뚱한 칸을 가리킨다.
    return (ws, first_adopted, last_adopted, last_sel,
            len(adopted), len(usable_rejected), len(unusable), vl, xl, tl2, col_tax)


# ══════════════════════════════════════════════════════════════════════
# ══════════════════════════════════════════════════════════════════════
# 포트폴리오에 담을 수 있는 줄 수. 다섯 줄로 시작했다가 열 줄로 늘렸다.
# 빈 줄은 계산에서 빠지므로 남겨 두어도 값이 흐트러지지 않는다.
SLOTS = 10


def box(ws, r1, c1, r2, c2):
    """표 바깥 테두리를 한 겹 두른다.

    안쪽은 얇은 선(E5E4E1), 바깥은 한 톤 진한 선(CDCECB). 표가 배경에서
    떨어져 보이게 하는 것은 이 한 겹이다 — 안팎을 같은 선으로 두르면
    표가 아니라 격자로 보인다.
    """
    edge = Side(style="thin", color=HAIRLINE)
    for c in range(c1, c2 + 1):
        top = ws.cell(row=r1, column=c)
        bot = ws.cell(row=r2, column=c)
        top.border = Border(
            left=top.border.left, right=top.border.right, bottom=top.border.bottom, top=edge
        )
        bot.border = Border(
            left=bot.border.left, right=bot.border.right, top=bot.border.top, bottom=edge
        )
    for r in range(r1, r2 + 1):
        lf = ws.cell(row=r, column=c1)
        rt = ws.cell(row=r, column=c2)
        lf.border = Border(top=lf.border.top, bottom=lf.border.bottom, right=lf.border.right, left=edge)
        rt.border = Border(top=rt.border.top, bottom=rt.border.bottom, left=rt.border.left, right=edge)


def table_head(ws, row, texts, start_col, height=30):
    """표 머리 — FAB072 채움 + 굵게. 브랜드 시그니처다."""
    for i, t in enumerate(texts, start=start_col):
        c = ws.cell(row=row, column=i, value=t)
        c.font = f(10, bold=True, color=INK)
        c.fill = fill(SOFT_ORANGE)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BOX
    ws.row_dimensions[row].height = height


def header_band(ws, last_col, title, subtitle, asof_line):
    """모든 장이 같은 머리띠를 쓴다 — 오렌지 풀블리드 + 블루 실선 한 줄."""
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=last_col)
    tag = ws.cell(row=1, column=1, value="   사내한 · Confidential")
    tag.font = Font(name=FONT, size=9, color="FFFFFF")
    tag.alignment = Alignment(vertical="center")
    ws.row_dimensions[1].height = 16

    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=last_col)
    t = ws.cell(row=2, column=1, value=f"   {title}")
    t.font = Font(name=FONT, size=22, bold=True, color="FFFFFF")
    t.alignment = Alignment(vertical="center")
    ws.row_dimensions[2].height = 40

    ws.merge_cells(start_row=3, start_column=1, end_row=3, end_column=last_col)
    s = ws.cell(row=3, column=1, value=f"   {subtitle}")
    s.font = Font(name=FONT, size=10, color="FFFFFF")
    s.alignment = Alignment(vertical="center")
    ws.row_dimensions[3].height = 22

    for row in (1, 2, 3):
        for c in range(1, last_col + 1):
            ws.cell(row=row, column=c).fill = fill(ORANGE)
    for c in range(1, last_col + 1):
        ws.cell(row=4, column=c).fill = fill(BLUE)
    ws.row_dimensions[4].height = 3

    ws.merge_cells(start_row=5, start_column=1, end_row=5, end_column=last_col)
    m = ws.cell(row=5, column=1, value=f"   {asof_line}")
    m.font = f(9, color=MUTED)
    m.alignment = Alignment(vertical="center")
    ws.row_dimensions[5].height = 20


# [종목조회] 에 싣는 줄 수. 조건에 맞는 종목이 이보다 많으면 위에서부터
# 이만큼만 나오고, 몇 종목이 걸렸는지는 개수로 따로 알려 준다.
LOOKUP_ROWS = 60


def build_lookup_sheet(wb, data, first_sel, last_sel, rank_col="U"):
    """지급주기·연 분배율로 종목을 골라 보는 장.

    왜 [제안서] 의 콤보박스를 줄이지 않고 장을 따로 두나
    ────────────────────────────────────────────────────────────────
    엑셀의 콤보박스는 다른 칸 값에 따라 목록이 저절로 줄어들지 않는다.
    OFFSET 으로 동적 이름을 만들어 목록 자체를 줄일 수는 있지만, 그러면
    조건을 한 번 건드리는 순간 **이미 담아 둔 종목이 목록에서 빠지면서
    계산이 0원이 된다.** 고객 앞에 낼 문서가 그래서는 안 된다.

    그래서 [제안서] 의 콤보박스는 전체 목록을 그대로 두고, 고르는 일을
    돕는 장을 따로 둔다. 여기서 조건을 걸어 찾은 종목명을 [제안서] 에서
    고르면 된다.
    """
    ws = wb.create_sheet("종목조회", 1)
    LAST = 9
    widths = [2.5, 34, 13, 14, 14, 13, 15, 13, 9]
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.sheet_view.showGridLines = False

    D = "ETF데이터"
    asof = data.get("asOf") or data.get("collectedAt", "")[:10]
    header_band(
        ws, LAST, "ETF 종목 조회", "ETF Screener",
        f"자료 ETFCHECK · 기준일 {asof} · 지급주기와 연 분배율로 고릅니다",
    )

    # ── 1. 조회 조건 ──
    r = section(ws, 7, "1", "조회 조건", LAST)
    conds = [
        ("지급주기", "전체", None, "조회_주기"),
        ("연 분배율 최소", 0.0, PCT, "조회_최소"),
        ("연 분배율 최대", 1.0, PCT, "조회_최대"),
    ]
    first_cond = r
    for label_text, val, fmt, _name in conds:
        label(ws, r, 2, label_text)
        put(ws, r, 3, val, fmt, kind="input", bold=True)
        r += 1

    # 지급주기 콤보박스. 값은 [ETF데이터] 장의 '지급주기' 칸과 **글자까지
    # 똑같아야** 한다 — 한 글자만 달라도 조회가 아무것도 못 찾는다.
    dv = DataValidation(
        type="list", formula1=f'"{",".join(FREQ_CHOICES)}"', allow_blank=False, showDropDown=False
    )
    ws.add_data_validation(dv)
    dv.add(ws.cell(row=first_cond, column=3))

    label(ws, first_cond, 5,
          "분배율은 백분율로 넣으십시오 (예: 5%). 최소·최대 사이에 드는 종목만 나옵니다.",
          size=9, color=MUTED)
    label(ws, first_cond + 1, 5,
          "'판정 불가' 는 상장 1년이 안 돼 주기를 말할 수 없는 종목입니다. 빼지 않고 그대로 담았습니다.",
          size=9, color=MUTED)
    label(ws, first_cond + 2, 5,
          "결과는 기준을 통과한 종목이 먼저, 그 안에서 연 분배율 높은 순입니다.",
          size=9, color=MUTED)

    r += 1
    cnt_row = r
    label(ws, r, 2, "조건에 맞는 종목", bold=True)
    hit = ws.cell(row=r, column=3)
    hit.value = f"=COUNTIF('{D}'!$T${first_sel}:$T${last_sel},1)"
    hit.font = f(14, bold=True, color=ORANGE)
    hit.number_format = '#,##0"종목"'
    hit.alignment = Alignment(horizontal="right", vertical="center")
    # 앞에 '=' 를 두지 않는다. 엑셀도 검산기도 '=' 로 시작하는 글자를 수식으로
    # 읽어 버린다 — 실제로 검산기가 여기서 멈췄다.
    ws.cell(row=r, column=4).value = f"전체 {last_sel - first_sel + 1}종목 중"
    ws.cell(row=r, column=4).font = f(9, color=MUTED)
    ws.row_dimensions[r].height = 22
    r += 2

    # ── 2. 조회 결과 ──
    r = section(ws, r, "2", f"조회 결과 (최대 {LOOKUP_ROWS}종목)", LAST)
    head = ["종목명", "지급주기", "연 분배율", "월 환산", "현재가", "변동성", "순자산", "채택", "담기"]
    table_head(ws, r, head, 2)
    r += 1
    first_row = r

    # 숨긴 칸 K 에 "몇 번째 줄인가" 를 담고, 나머지 칸은 그 값으로 집어 온다.
    # 줄마다 MATCH 를 여덟 번 돌리지 않으려는 것이기도 하고, 집어 오는 칸이
    # 늘어나도 한 군데만 고치면 되기 때문이기도 하다.
    # (J 였는데 '담기' 칸이 10번 자리를 쓰게 되어 K 로 옮겼다.)
    def pick(col, rr):
        return (
            f'=IF($K{rr}=0,"",'
            f"INDEX('{D}'!${col}${first_sel}:${col}${last_sel},$K{rr}))"
        )

    for k in range(LOOKUP_ROWS):
        rr = first_row + k
        ws.cell(row=rr, column=11).value = (
            f"=IFERROR(MATCH({k + 1},'{D}'!${rank_col}${first_sel}:${rank_col}${last_sel},0),0)"
        )
        cells = [
            (2, pick("A", rr), None),                    # 종목명
            (3, pick("R", rr), None),                    # 지급주기
            (4, pick("J", rr), PCT),                     # 연 분배율
            (5, f'=IF($K{rr}=0,"",$D{rr}/12)', PCT3),    # 월 환산
            (6, pick("D", rr), WON),                     # 현재가
            (7, pick("H", rr), PCT),                     # 변동성
            # 순자산. 억원으로 적으므로 여기서 1억을 나눈다 — 서식은 글자만
            # 붙일 뿐 나누지 못한다(EOK 주석 참고).
            (8, f'=IF($K{rr}=0,"",INDEX(\'{D}\'!$E${first_sel}:$E${last_sel},$K{rr})/{EOK_DIV})', EOK),
            (9, pick("M", rr), None),                    # 채택
        ]
        for c, v, fmt in cells:
            cell = ws.cell(row=rr, column=c, value=v)
            cell.font = f(10)
            cell.border = BOX
            if fmt:
                cell.number_format = fmt
                cell.alignment = Alignment(horizontal="right")
            else:
                cell.alignment = Alignment(
                    horizontal="center" if c in (3, 9) else "left", vertical="center"
                )
            if k % 2:
                cell.fill = fill(SURFACE)

        # ── 담기 ──────────────────────────────────────────────────────
        # 여기에 'O' 를 넣으면 [제안서] 의 포트폴리오에 그 종목이 올라간다.
        # 엑셀 파일(.xlsx)에서는 단추를 눌러 다른 장에 값을 쓸 수 없다 —
        # 그건 매크로(VBA)가 하는 일이고, 매크로 파일은 사내 배포에서 막힌다.
        # 그래서 '누르는' 대신 '표시하는' 방식으로 같은 일을 한다. 콤보박스를
        # 달아 두었으므로 ▼ 를 눌러 O 를 고르면 된다.
        mk = put(ws, rr, 10, None, None, kind="input")
        mk.alignment = Alignment(horizontal="center", vertical="center")

    # 담기 칸의 콤보박스. 아무 글자나 넣어도 담기지만, 고를 수 있게 해 두면
    # 무엇을 넣어야 하는지 물어볼 일이 없다.
    dv_mark = DataValidation(type="list", formula1='"O"', allow_blank=True, showDropDown=False)
    dv_mark.prompt = "▼ 를 눌러 O 를 고르면 [제안서] 포트폴리오에 올라갑니다. 지우면 내려갑니다."
    dv_mark.promptTitle = "담기"
    ws.add_data_validation(dv_mark)
    dv_mark.sqref = f"J{first_row}:J{first_row + LOOKUP_ROWS - 1}"

    # ── 담은 종목을 차례대로 뽑아 두는 숨긴 칸 ─────────────────────────
    # [ETF데이터] 의 조회 칸과 같은 방식이다. L 은 담겼는지, M 은 몇 번째로
    # 담겼는지, N 은 그 차례의 종목명이다. [제안서] 는 N 만 본다.
    for k in range(LOOKUP_ROWS):
        rr = first_row + k
        ws.cell(row=rr, column=12).value = f'=IF(AND($B{rr}<>"",$J{rr}<>""),1,0)'
        prev = "0" if k == 0 else f"$M{rr - 1}"
        ws.cell(row=rr, column=13).value = f"=IF($L{rr}=1,{prev}+1,{prev})"
        ws.cell(row=rr, column=14).value = (
            f"=IFERROR(INDEX($B${first_row}:$B${first_row + LOOKUP_ROWS - 1},"
            f"MATCH({k + 1},$M${first_row}:$M${first_row + LOOKUP_ROWS - 1},0)),\"\")"
        )
    for _h in ("K", "L", "M", "N"):
        ws.column_dimensions[_h].hidden = True
    box(ws, first_row - 1, 2, first_row + LOOKUP_ROWS - 1, 10)
    last_row = first_row + LOOKUP_ROWS - 1

    r = last_row + 2
    label(ws, r, 2,
          f"※ 조건에 맞는 종목이 {LOOKUP_ROWS}개를 넘으면 위에서부터 {LOOKUP_ROWS}개만 나옵니다. "
          "조건을 좁혀 보십시오.", size=9, color=MUTED)
    label(ws, r + 1, 2,
          "※ 담고 싶은 종목의 '담기' 칸에 O 를 넣으십시오. [제안서] 의 포트폴리오에 "
          "위에서부터 차례로 올라갑니다. 지우면 내려갑니다. 배분 비율은 제안서에서 직접 넣으십시오.",
          size=9, color=MUTED)
    # 이 경고를 빼면 안 된다. '담기' 표시는 종목이 아니라 **줄**에 붙기 때문에,
    # 조건을 바꿔 그 줄에 다른 종목이 오면 표시는 그대로 남은 채 담긴 종목만
    # 바뀐다. 조용히 바뀌는 것이 제일 나쁘다.
    label(ws, r + 2, 2,
          "※ '담기' 표시는 종목이 아니라 그 줄에 붙습니다. 담은 뒤에 위의 조회 조건을 바꾸면 "
          "그 줄에 다른 종목이 올라오면서 담긴 종목도 함께 바뀝니다. 조건을 먼저 정하고 담으십시오.",
          size=9, color=WARNING)
    label(ws, r + 3, 2,
          "※ [제안서] 에서 직접 고르셔도 됩니다. 그 장의 콤보박스는 조건과 상관없이 전체 목록을 "
          "담고 있습니다 — 조건을 바꿨다고 이미 담아 둔 종목이 빠지면 안 되기 때문입니다.",
          size=9, color=MUTED)

    ws.freeze_panes = f"A{first_row}"
    return ws, first_cond, first_row, last_row


def build_proposal(wb, data, first_sel, last_sel, first_adopted, last_adopted, tax_col="T"):
    TAXCOL = tax_col
    ws = wb.create_sheet("제안서", 0)
    LAST = 8  # A..H
    # A 는 왼쪽 여백이다. 표는 전부 B 부터 시작한다 — 비교표를 A 부터 그렸더니
    # 종목명이 3칸짜리 여백 열에 들어가 "SOL0040Y0" 처럼 잘려 찍혔다.
    widths = [2.5, 32, 16, 15, 13, 16, 17, 17]
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.sheet_view.showGridLines = False

    D = "ETF데이터"

    def rng(col, a=first_sel, b=last_sel):
        return f"'{D}'!${col}${a}:${col}${b}"

    # ── 머리띠 ────────────────────────────────────────────────────────
    # 오렌지 풀블리드 + 좌상단 분류 태그. 로고나 워드마크는 흉내 내지 않는다.
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=LAST)
    tag = ws.cell(row=1, column=1, value="   사내한 · Confidential")
    tag.font = Font(name=FONT, size=9, color="FFFFFF")
    tag.alignment = Alignment(vertical="center")
    ws.row_dimensions[1].height = 16

    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=LAST)
    t = ws.cell(row=2, column=1, value="   월배당 ETF 투자 제안서")
    t.font = Font(name=FONT, size=22, bold=True, color="FFFFFF")
    t.alignment = Alignment(vertical="center")
    ws.row_dimensions[2].height = 40

    ws.merge_cells(start_row=3, start_column=1, end_row=3, end_column=LAST)
    s = ws.cell(row=3, column=1, value="   Monthly Distribution ETF Portfolio")
    s.font = Font(name=FONT, size=10, color="FFFFFF")
    s.alignment = Alignment(vertical="center")
    ws.row_dimensions[3].height = 22

    for row in (1, 2, 3):
        for c in range(1, LAST + 1):
            ws.cell(row=row, column=c).fill = fill(ORANGE)
    # 머리띠 아래 블루 실선 한 줄. 오렌지 단색으로 끝내는 것보다 문서가
    # 단단해 보인다 — 브랜드 짝색(secondary)을 여기 한 번만 쓴다.
    for c in range(1, LAST + 1):
        ws.cell(row=4, column=c).fill = fill(BLUE)
    ws.row_dimensions[4].height = 3

    asof = data.get("asOf") or data.get("collectedAt", "")[:10]
    ws.merge_cells(start_row=5, start_column=1, end_row=5, end_column=LAST)
    m = ws.cell(row=5, column=1, value=f"   자료 ETFCHECK · 기준일 {asof} · 매월 1일 자동 갱신")
    m.font = f(9, color=MUTED)
    m.alignment = Alignment(vertical="center")
    ws.row_dimensions[5].height = 20

    # ── 1. 고객 정보 ──
    r = section(ws, 7, "1", "고객 정보 및 투자 조건", LAST)
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
        ws.row_dimensions[rr].height = 21
    box(ws, r, 3, r + len(rows_in) - 1, 3)
    C_AMT = f"$C${cust_row + 1}"
    C_MODE = f"$C${cust_row + 2}"
    C_TAX = f"$C${cust_row + 3}"

    dv_mode = DataValidation(type="list", formula1='"비율,금액"', allow_blank=False, showDropDown=False)
    dv_mode.error = "비율 또는 금액 중에서 고르십시오."
    dv_mode.errorTitle = "배분 방식"
    dv_mode.prompt = "비율(%) 로 나눌지, 금액(원) 으로 나눌지 고르십시오."
    dv_mode.promptTitle = "배분 방식"
    ws.add_data_validation(dv_mode)
    dv_mode.add(ws.cell(row=cust_row + 2, column=3))

    label(ws, cust_row + 2, 5, "비율 = 총액을 %로 나눔 · 금액 = 종목별 금액 직접 입력", size=9, color=MUTED)
    label(ws, cust_row + 3, 5, "국내 상장 ETF 분배금 기준 15.4% (지방소득세 포함)", size=9, color=MUTED)

    ws["J1"] = "계산 보조 (수정하지 마십시오)"
    ws["J1"].font = f(9, color=MUTED)
    for _h in ("J", "K", "L", "M", "N", "O", "P"):
        ws.column_dimensions[_h].hidden = True

    # ── 2. 포트폴리오 ──
    r = section(ws, cust_row + 6, "2", f"투자 포트폴리오  (최대 {SLOTS}종목)", LAST)
    hdr = r

    # ── 종목 검색 ──────────────────────────────────────────────────────
    # 콤보박스에 514종목이 한 줄로 들어 있으면 원하는 것을 찾기가 어렵다.
    # 여기에 글자 몇 개를 넣으면 아래 콤보박스 목록이 그만큼만 남는다.
    # 대소문자는 가리지 않고, 이름 가운데 들어 있어도 걸린다.
    #
    # 좁아지는 것은 **고르는 목록**뿐이다. 이미 담아 둔 종목은 검색어와
    # 상관없이 그대로 있고 계산도 그대로다. ([ETF데이터] 의 주석 참고)
    srch_row = cust_row + 7
    label(ws, srch_row, 4, "종목 검색", size=10, bold=True)
    srch = put(ws, srch_row, 5, None, None, kind="input")
    srch.alignment = Alignment(vertical="center", horizontal="left")
    label(ws, srch_row, 6,
          "← 글자 일부를 넣으면 아래 ▼ 목록이 그만큼만 남습니다 (예: 커버드콜). 비우면 전체.",
          size=9, color=MUTED)
    SEARCH_CELL = f"$E${srch_row}"
    table_head(
        ws, hdr,
        ["투자 ETF",
         f'=IF({C_MODE}="비율","배분 비율 (%)","배분 금액 (원)")',
         "배정 금액", "매수 수량", "실투자금액", "월 분배금(세전)", "월 분배금(세후)"],
        2,
    )
    p_first, p_last = hdr + 1, hdr + SLOTS

    # 목록은 '검색결과' 를 본다 — 위 검색 칸이 비어 있으면 전체와 같다.
    # 계산이 종목을 찾을 때 쓰는 목록(K 칸의 선택가능종목)은 그대로 전체다.
    dv = DataValidation(type="list", formula1="=검색결과", allow_blank=True, showDropDown=False)
    dv.error = "목록에 있는 ETF 중에서 고르십시오. 검색 칸을 비우면 전체 목록이 나옵니다."
    dv.errorTitle = "선택할 수 없는 종목"
    dv.prompt = "▼ 를 눌러 고르십시오. 위 '종목 검색' 으로 목록을 좁힐 수 있습니다."
    dv.promptTitle = "ETF 선택"
    ws.add_data_validation(dv)

    for i in range(SLOTS):
        rr = p_first + i
        cell = put(ws, rr, 2, None, None, kind="input")
        cell.alignment = Alignment(vertical="center", horizontal="left")
        # 배분도 [종목조회] 에서 담은 만큼 **고르게 나눠 미리 채운다.**
        #
        # 이름만 채우고 배분을 비워 뒀더니, 세 종목을 담아도 배정금액이 0원이라
        # 두 줄이 빈칸으로 보였다. 0원을 빈칸으로 찍는 서식이라 담당자 눈에는
        # "한 개만 담겼다" 로 보인다. 실제로 더 나빴던 것은, 첫 줄이 100% 를
        # 그대로 들고 있어서 **세 종목을 담았는데 돈은 전부 첫 종목에 들어가고**
        # 합계는 멀쩡해 보여 경고도 뜨지 않았다는 점이다.
        #
        # 나누어떨어지지 않는 몫은 마지막 줄이 받는다. 100/3 을 33.33 씩 세 번
        # 넣으면 99.99 가 되어 "합계가 100%가 아닙니다" 경고가 늘 떠 있게 된다.
        #
        # 손으로 고치고 싶으면 그냥 덮어쓰면 된다 — 종목 칸과 같다.
        n = f"MAX(담긴수,1)"
        i1 = i + 1
        even_pct = f"IF({i1}<{n},ROUND(100/{n},2),100-ROUND(100/{n},2)*({n}-1))"
        even_amt = (
            f"IF({i1}<{n},ROUNDDOWN({C_AMT}/{n},0),"
            f"{C_AMT}-ROUNDDOWN({C_AMT}/{n},0)*({n}-1))"
        )
        put(ws, rr, 3,
            f'=IF($B{rr}="","",IF({C_MODE}="비율",{even_pct},{even_amt}))',
            "#,##0.##", kind="input")
        ws[f"K{rr}"] = f'=IF($B{rr}="",0,IFERROR(MATCH($B{rr},선택가능종목,0),0))'
        ws[f"K{rr}"].font = f(9, color=MUTED)
        # 그 종목이 채택인지 기준 미달인지. 기준 미달도 고를 수 있게 했으므로
        # 담겼는지 아닌지를 아래에서 알려 줘야 한다.
        ws[f"L{rr}"] = f'=IF($K{rr}=0,"",INDEX({rng("M")},$K{rr}))'
        ws[f"L{rr}"].font = f(9, color=MUTED)
        # 그 종목의 지급주기. 이 문서의 모든 숫자가 "연 분배율 ÷ 12" 라서,
        # 분기·연배당 종목을 담으면 '월 예상 분배금' 은 실제로 매달 들어오는
        # 돈이 아니라 **월 환산액**이 된다. 말하지 않으면 고객은 매달 그
        # 금액이 들어온다고 읽는다. 담는 것을 막지는 않되 반드시 말한다.
        ws[f"M{rr}"] = f'=IF($K{rr}=0,"",INDEX({rng("R")},$K{rr}))'
        ws[f"M{rr}"].font = f(9, color=MUTED)
        ws[f"N{rr}"] = f'=IF(OR($M{rr}="",$M{rr}="월배당"),0,1)'
        ws[f"N{rr}"].font = f(9, color=MUTED)
        # 그 종목의 과세비율. 분배금 전액에 세금을 매기는 것은 틀린 셈이라
        # (자세한 까닭은 6. 유의사항) 종목마다 다른 값을 쓴다. 못 구한 종목은
        # [ETF데이터] 에 1 로 적혀 있어 예전과 같은 셈이 된다.
        ws[f"O{rr}"] = (
            f'=IF($K{rr}=0,1,IF(INDEX({rng(TAXCOL)},$K{rr})="",1,INDEX({rng(TAXCOL)},$K{rr})))'
        )
        ws[f"O{rr}"].font = f(9, color=MUTED)
        # 과세비율을 **확인하지 못한** 종목인가. 위의 O 는 그런 종목도 1 로
        # 셈하므로, 그 사실을 따로 들고 있어야 아래에서 말해 줄 수 있다.
        ws[f"P{rr}"] = f'=IF($K{rr}=0,0,IF(INDEX({rng(TAXCOL)},$K{rr})="",1,0))'
        ws[f"P{rr}"].font = f(9, color=MUTED)
        put(ws, rr, 4,
            f'=IF($K{rr}=0,0,IF({C_MODE}="비율",ROUND({C_AMT}*$C{rr}/100,0),$C{rr}))', WON_Z)
        put(ws, rr, 5, f"=IF($K{rr}=0,0,ROUNDDOWN($D{rr}/INDEX({rng('D')},$K{rr}),0))", QTY_Z)
        put(ws, rr, 6, f"=IF($K{rr}=0,0,$E{rr}*INDEX({rng('D')},$K{rr}))", WON_Z)
        put(ws, rr, 7, f"=IF($K{rr}=0,0,$F{rr}*INDEX({rng('J')},$K{rr})/12)", WON_Z)
        put(ws, rr, 8, f"=$G{rr}*(1-{C_TAX}*$O{rr})", WON_Z)
        if i % 2 == 1:
            for c in range(4, 9):
                ws.cell(row=rr, column=c).fill = fill(SURFACE)
        ws.row_dimensions[rr].height = 19
    dv.sqref = f"B{p_first}:B{p_last}"

    tot = p_last + 1
    # 금액 구간표가 쓸 **실효** 세후 비율. 종목마다 과세비율이 달라서 하나의
    # 세율로는 낼 수 없으므로, 지금 담은 구성이 실제로 내는 비율(세후 합 ÷
    # 세전 합)을 그대로 쓴다. 아무것도 안 담았으면 전액 과세로 둔다.
    NET_RATIO = f'IF($G${tot}=0,1-{C_TAX},$H${tot}/$G${tot})'
    label(ws, tot, 2, "합계", bold=True)
    for col, letter, fmt in [
        (3, "C", "#,##0.##"), (4, "D", WON), (6, "F", WON), (7, "G", WON), (8, "H", WON),
    ]:
        put(ws, tot, col, f"=SUM({letter}{p_first}:{letter}{p_last})", fmt, bold=True)
    for c in range(2, 9):
        cell = ws.cell(row=tot, column=c)
        cell.fill = fill(HIGHLIGHT)
        cell.border = Border(
            left=cell.border.left, right=cell.border.right, bottom=cell.border.bottom,
            top=Side(style="thin", color=LINE_DARK),
        )
    ws.row_dimensions[tot].height = 21
    box(ws, hdr, 2, tot, 8)

    # 배분이 어긋나거나 기준 미달 종목이 담기면 말해 준다. 색만으로는
    # 눈에 안 띄고, 아래 숫자가 전부 그 영향을 받는다.
    warn = tot + 1
    ws.merge_cells(start_row=warn, start_column=2, end_row=warn, end_column=LAST)
    wc = ws.cell(
        row=warn,
        column=2,
        value=(
            f'=IF({C_MODE}="비율",IF(ABS($C{tot}-100)>0.01,'
            f'"※ 배분 비율 합계가 100%가 아닙니다. 배분 칸을 확인하십시오.",""),'
            f'IF($D{tot}>{C_AMT},"※ 배분 금액 합계가 총 투자금액을 넘습니다.",""))'
        ),
    )
    wc.font = f(10, bold=True, color=ERROR)
    ws.row_dimensions[warn].height = 17

    warn2 = warn + 1
    ws.merge_cells(start_row=warn2, start_column=2, end_row=warn2, end_column=LAST)
    wc2 = ws.cell(
        row=warn2,
        column=2,
        value=(
            f'=IF(COUNTIF($L${p_first}:$L${p_last},"제외")>0,'
            f'"※ 유동성·변동성 기준에 미달한 종목이 담겨 있습니다. [ETF데이터] 장의 제외 사유를 확인하십시오.","")'
        ),
    )
    wc2.font = f(10, bold=True, color=WARNING)
    ws.row_dimensions[warn2].height = 17

    warn3 = warn2 + 1
    ws.merge_cells(start_row=warn3, start_column=2, end_row=warn3, end_column=LAST)
    wc3 = ws.cell(
        row=warn3,
        column=2,
        value=(
            f'=IF(SUM($N${p_first}:$N${p_last})>0,'
            f'"※ 월배당이 아닌 종목이 담겨 있습니다. 위의 \'월 예상 분배금\' 은 연 분배금을 12로 나눈 '
            f'월 환산액이며, 실제 지급은 그 종목의 주기(분기·연 등)를 따릅니다.","")'
        ),
    )
    wc3.font = f(10, bold=True, color=WARNING)
    ws.row_dimensions[warn3].height = 17

    warn4 = warn3 + 1
    ws.merge_cells(start_row=warn4, start_column=2, end_row=warn4, end_column=LAST)
    wc4 = ws.cell(
        row=warn4,
        column=2,
        value=(
            f'=IF(SUM($P${p_first}:$P${p_last})>0,'
            f'"※ 과세표준을 확인하지 못한 종목이 담겨 있습니다. 그 종목은 분배금 전액에 세율을 적용해 '
            f'계산했으므로, 실제 세후 수령액은 표시된 금액보다 많을 수 있습니다.","")'
        ),
    )
    wc4.font = f(10, bold=True, color=WARNING)
    ws.row_dimensions[warn4].height = 17

    note = warn4 + 1
    ws.merge_cells(start_row=note, start_column=2, end_row=note, end_column=LAST)
    nc = ws.cell(
        row=note,
        column=2,
        value="빈 줄은 계산에서 빠집니다. 한 종목만 담으려면 첫 줄에만 넣고 배분을 100 으로 두십시오.",
    )
    nc.font = f(9, color=MUTED)

    TOT_INVEST, TOT_M_PRE, TOT_M_POST = f"$F${tot}", f"$G${tot}", f"$H${tot}"

    # ── 3. 요약 ──
    r = section(ws, note + 2, "3", "예상 분배금 요약", LAST)

    # 왼쪽: 투자금 갈래. 오른쪽: 받는 돈. 받는 돈 쪽 첫 줄만 크게 키운다 —
    # 이 문서에서 고객이 제일 먼저 보는 숫자가 그것이다.
    left = [
        ("총 투자금액", f"={C_AMT}", WON),
        ("실제 투자금액", f"={TOT_INVEST}", WON),
        ("미투자 잔액", f"={C_AMT}-{TOT_INVEST}", WON),
        ("담은 종목 수", f'=COUNTIF($K${p_first}:$K${p_last},">0")', '#,##0"종목"'),
    ]
    for i, (lab, formula, fmt) in enumerate(left):
        rr = r + i
        label(ws, rr, 2, lab, bold=True)
        put(ws, rr, 3, formula, fmt)
        ws.row_dimensions[rr].height = 20
    box(ws, r, 3, r + len(left) - 1, 3)

    # 큰 수치 한 칸 (stat-callout). 라벨은 작게 위에, 수치는 크게.
    label(ws, r, 6, "월 예상 분배금 (세전)", size=10, bold=True)
    kpi = put(ws, r, 7, f"={TOT_M_PRE}", WON, bold=True, size=18)
    kpi.font = f(18, bold=True, color=ORANGE)
    for c in (6, 7, 8):
        cell = ws.cell(row=r, column=c)
        cell.fill = fill(SURFACE_SOFT)
    ws.merge_cells(start_row=r, start_column=7, end_row=r, end_column=8)
    ws.row_dimensions[r].height = 34
    box(ws, r, 6, r, 8)

    right = [
        ("월 예상 분배금 (세후)", f"={TOT_M_POST}", WON),
        ("연 예상 분배금 (세전)", f"={TOT_M_PRE}*12", WON),
        ("연 예상 분배금 (세후)", f"={TOT_M_POST}*12", WON),
    ]
    for i, (lab, formula, fmt) in enumerate(right, start=1):
        rr = r + i
        label(ws, rr, 6, lab, bold=True)
        put(ws, rr, 7, formula, fmt)
        ws.row_dimensions[rr].height = 20
    box(ws, r + 1, 7, r + 3, 7)
    r += 4

    W_ANN = f"$C${r}"
    for i, (lab, formula, fmt) in enumerate([
        ("연 수익률 (세전, 가중평균)", f"=IF({TOT_INVEST}=0,0,{TOT_M_PRE}*12/{TOT_INVEST})", PCT),
        ("연 수익률 (세후, 가중평균)", f"=IF({TOT_INVEST}=0,0,{TOT_M_POST}*12/{TOT_INVEST})", PCT),
    ]):
        rr = r + i
        label(ws, rr, 2, lab, bold=True)
        c = put(ws, rr, 3, formula, fmt, bold=(i == 0))
        if i == 0:
            c.font = f(11, bold=True, color=BLUE)
        ws.row_dimensions[rr].height = 20
    box(ws, r, 3, r + 1, 3)
    for i, (lab, formula, fmt) in enumerate([
        ("월 수익률 (세전)", f"=IF({TOT_INVEST}=0,0,{TOT_M_PRE}/{TOT_INVEST})", PCT3),
        ("월 수익률 (세후)", f"=IF({TOT_INVEST}=0,0,{TOT_M_POST}/{TOT_INVEST})", PCT3),
    ]):
        rr = r + i
        label(ws, rr, 6, lab, bold=True)
        put(ws, rr, 7, formula, fmt)
    box(ws, r, 7, r + 1, 7)
    r += 2

    label(ws, r, 2,
          "연 수익률은 담은 종목들의 최근 12개월 실제 분배금을 투자 비중으로 가중한 값입니다. "
          "확정 수익률이 아니며 매월 달라집니다.",
          size=9, color=MUTED)
    r += 2

    # ── 4. 금액별 표 ──
    r = section(ws, r, "4", "총 투자금액별 예상 분배금  (위 구성을 그대로 두고 금액만 바꿨을 때)", LAST)
    table_head(ws, r,
               ["투자금액 구간", "월 분배금(세전)", "월 분배금(세후)", "연 분배금(세전)", "연 분배금(세후)"],
               2, height=28)
    r += 1
    tiers = [10_000_000, 30_000_000, 50_000_000, 100_000_000,
             200_000_000, 300_000_000, 500_000_000, 1_000_000_000]
    for i, amt in enumerate(tiers):
        rr = r + i
        a = put(ws, rr, 2, amt, WON, kind="source")
        a.font = f(10, bold=True, color=INK)
        put(ws, rr, 3, f"=$B{rr}*{W_ANN}/12", WON)
        put(ws, rr, 4, f"=$C{rr}*{NET_RATIO}", WON)
        put(ws, rr, 5, f"=$B{rr}*{W_ANN}", WON)
        put(ws, rr, 6, f"=$E{rr}*{NET_RATIO}", WON)
        if i % 2 == 1:
            for c in range(2, 7):
                ws.cell(row=rr, column=c).fill = fill(SURFACE)
        ws.row_dimensions[rr].height = 19
    box(ws, r - 1, 2, r + len(tiers) - 1, 6)
    r += len(tiers)
    label(ws, r, 2,
          "※ 단주 절사를 반영하지 않은 근사치라 2·3. 의 값과 몇 천 원 차이가 날 수 있습니다.",
          size=9, color=MUTED)
    r += 2

    # ── 5. 종목 비교 ──
    #
    # 연 분배율 상위만 싣던 판을 버렸다. 그렇게 뽑으면 열두 줄이 전부
    # 커버드콜(16~28%)이 되고, 정작 기본으로 골라 둔 TIGER 미국배당다우존스
    # 같은 정통 배당 ETF 가 표에 없다. 담당자가 제안서를 펼치면 공격적인
    # 종목만 보이는 셈이다.
    #
    # 그래서 두 갈래로 뽑아 합친다 — 많이 주는 쪽(연 분배율 상위)과 큰 쪽
    # (순자산 상위). 고객이 실제로 고르는 축이 그 둘이다. 순자산 쪽에서는
    # 파킹형을 뺀다. 안 빼면 CD금리·KOFR 이 상위 여덟 중 셋을 차지하는데,
    # 월마다 돈이 나오기는 해도 비교표에 올릴 상품이 아니다.
    # 2026-09 에 모집단을 892종목으로 넓히면서 한 가지를 더 걸어야 했다.
    # 이제 채택 목록에 KODEX 200(24.8조)처럼 연 1회 배당하는 대형 지수 ETF 가
    # 들어온다. 순자산 축으로 뽑으면 비교표가 그런 종목으로 채워지는데, 이
    # 문서는 "월배당 ETF 투자 제안서" 다. 월 얼마를 받는지 견주라고 만든 표에
    # 연 1회 배당을 올리면 표가 제 뜻을 잃는다.
    #
    # 그래서 비교표는 **월배당으로 한정한다.** 다른 주기를 보고 싶으면
    # [종목조회] 장에서 주기를 골라 보면 된다 — 그러라고 만든 장이다.
    # 드롭다운은 그대로 전부 담고 있으므로 담는 데는 아무 제약이 없다.
    adopted_items = sorted(
        [x for x in data["items"] if x.get("adopted")],
        key=lambda x: -(x.get("distTtmRate") or 0),
    )
    row_of = {x["code"]: first_adopted + i for i, x in enumerate(adopted_items)}
    monthly_items = [x for x in adopted_items if (x.get("payoutFreq") or "") == "월배당"]
    # 주기를 아직 안 실은 자료로도 돌아야 한다. 월배당이 한 종목도 없으면
    # 예전처럼 채택 전체에서 뽑는다 — 빈 표를 내놓는 것보다 낫다.
    pool_cmp = monthly_items or adopted_items
    by_yield = pool_cmp[:COMPARE_YIELD]
    by_aum = sorted(
        [x for x in pool_cmp if (x.get("assetClassCode") or "") != "0108"],
        key=lambda x: -(x.get("aum") or 0),
    )[:COMPARE_AUM]
    seen_codes, compare = set(), []
    for x in by_yield + by_aum:
        if x["code"] not in seen_codes:
            seen_codes.add(x["code"])
            compare.append(x)
    compare.sort(key=lambda x: -(x.get("distTtmRate") or 0))

    r = section(ws, r, "5",
                f"월배당 ETF 비교  (1억원 단독 투자 기준 · 연 분배율 상위 {COMPARE_YIELD} + "
                f"순자산 상위 {COMPARE_AUM}, 파킹형 제외 · 채택 월배당 {len(pool_cmp)}종목 중)",
                LAST)
    # 월 분배율은 뺐다 — 연 분배율 ÷ 12 라 한 칸을 차지할 값이 아니다.
    # 그 자리에 유형을 넣는다. 같은 표에 커버드콜과 리츠·채권형이 섞여
    # 있으므로 무엇인지가 분배율만큼 중요하다.
    table_head(ws, r,
               ["종목명", "유형", "현재가", "연 분배율",
                "월 분배금(세전)", "월 분배금(세후)", vol_label(data, short=True)], 2)
    r += 1
    for i, it in enumerate(compare):
        rr, src = r + i, row_of[it["code"]]
        put(ws, rr, 2, f"='{D}'!$A${src}", None, kind="source")
        ws.cell(row=rr, column=2).font = f(10, color=INK)
        c = put(ws, rr, 3, f"='{D}'!$P${src}", None, kind="source")
        c.alignment = Alignment(vertical="center", horizontal="center")
        put(ws, rr, 4, f"='{D}'!$D${src}", WON)
        put(ws, rr, 5, f"='{D}'!$J${src}", PCT)
        put(ws, rr, 6, f"=IF($D{rr}=0,0,ROUNDDOWN(100000000/$D{rr},0)*$D{rr}*$E{rr}/12)", WON)
        put(ws, rr, 7, f"=$F{rr}*(1-{C_TAX}*'{D}'!${TAXCOL}${src})", WON)
        put(ws, rr, 8, f"='{D}'!$H${src}", PCT)
        if i % 2 == 1:
            for c2 in range(2, 9):
                ws.cell(row=rr, column=c2).fill = fill(SURFACE)
        ws.row_dimensions[rr].height = 19
    box(ws, r - 1, 2, r + len(compare) - 1, 8)
    r += len(compare)
    label(ws, r, 2,
          "※ 드롭다운에는 기준 미달 종목까지 전부 담겨 있습니다. 위 표에는 기준을 통과한 종목만 실었습니다.",
          size=9, color=MUTED)
    r += 2

    # ── 6. 유의사항 ──
    rules = data.get("rules", {})

    # 세금 문구는 **실제로 확보된 만큼만** 말한다.
    #
    # 과세비율을 한 종목도 못 구했는데 "종목마다 다른 비율을 적용했습니다" 라고
    # 적으면 그 자체가 거짓말이 된다. 실제로 그런 판이 한 번 나갔다 — 곳간이
    # 옛 판이라 661종목 중 3종목만 값이 있었는데 문구는 그대로였다.
    _sel = [x for x in data["items"]
            if x.get("dataComplete") is not False and (x.get("price") or 0) > 0
            and x.get("distTtmRate") is not None]
    _have = [x for x in _sel if x.get("taxableRatio") is not None]
    _cov = (len(_have) / len(_sel)) if _sel else 0

    _TAX_HOW = (
        "과세비율은 최근 12개월에 실제로 매겨진 과세표준액을 같은 기간 분배금으로 나눈 값입니다. 지나간 실적이므로 "
        "앞으로도 같다는 뜻은 아닙니다 — 분배 재원(배당·이자·매매차익·파생손익)의 구성이 바뀌면 비율도 함께 바뀌고, "
        "실제로 한 종목 안에서도 회차마다 0%에서 17%까지 움직인 사례가 있습니다. 실제 세액은 지급 시점의 과세표준으로 "
        "확정되므로 이 표와 다를 수 있습니다."
    )
    _TAX_WHY = (
        "세금은 분배금 전액이 아니라 과세표준액에만 붙습니다. 국내주식 매매차익과 장내파생 손익은 과세표준에 들어가지 "
        "않으므로, 그 재원으로 분배하는 종목은 분배금의 상당 부분이 비과세입니다."
    )
    if _cov >= 0.5:
        TAX_NOTES = [
            _TAX_WHY + f" 그래서 종목마다 다른 과세비율을 적용했습니다(고를 수 있는 {len(_sel)}종목 중 {len(_have)}종목). "
            "비율은 [ETF데이터] 장의 '과세비율' 칸에 있습니다.",
            _TAX_HOW + " 과세비율을 확인하지 못한 종목은 그 칸이 비어 있고, 분배금 전액에 세율을 적용해 "
            "보수적으로 계산했으므로 실제 세후 수령액이 표시된 금액보다 많을 수 있습니다.",
        ]
    elif _have:
        TAX_NOTES = [
            _TAX_WHY,
            f"다만 이번 자료에서는 고를 수 있는 {len(_sel)}종목 중 {len(_have)}종목만 과세표준을 확인할 수 있었습니다. "
            "나머지 종목은 정확한 과세표준을 확인하지 못해 부득이 분배금 전액에 15.4%를 적용했습니다. "
            "그 종목들의 실제 세후 수령액은 표시된 금액보다 많을 수 있습니다. "
            "확인된 종목은 [ETF데이터] 장의 '과세비율' 칸에 값이 적혀 있고, 확인하지 못한 종목은 그 칸이 비어 있습니다.",
            _TAX_HOW,
        ]
    else:
        TAX_NOTES = [
            _TAX_WHY,
            "다만 이번 자료에서는 종목별 과세표준을 확인하지 못했습니다. 그래서 부득이 모든 종목의 분배금 전액에 "
            "15.4%를 적용해 계산했습니다. 이는 세금을 가장 많이 매기는 가정이므로, 실제 세후 수령액은 이 문서에 "
            "표시된 금액보다 많을 수 있습니다. 특히 국내주식형 커버드콜처럼 매매차익·파생손익으로 분배하는 종목은 "
            "차이가 큽니다.",
        ]
    r = section(ws, r, "6", "유의사항", LAST)
    notes = [
        "이 자료는 투자 권유가 아니라 참고 자료입니다. 최종 투자 판단과 그 결과는 투자자 본인에게 귀속됩니다.",
        "ETF 는 예금자보호법의 보호를 받지 않으며, 원금 손실이 발생할 수 있습니다.",
        "분배금은 확정되지 않습니다. 커버드콜 ETF 의 분배 재원은 옵션 프리미엄이므로, 시장 변동성이 낮아지면 분배금도 함께 줄어듭니다.",
        "분배금의 일부가 원금에서 지급될 수 있습니다(자본 환급). 이 경우 기준가가 그만큼 낮아집니다.",
        "표시된 연 분배율은 최근 12개월 실제 분배금 합계를 현재가로 나눈 값(사후 수치)이며, 앞으로의 수익률을 보장하지 않습니다.",
        "세율은 국내 상장 ETF 분배금 기준 15.4%(배당소득세 14% + 지방소득세 1.4%)를 적용했습니다. 금융소득종합과세 대상자는 실효세율이 달라집니다.",
        *TAX_NOTES,
        "세무 상담이 필요한 사안은 이 문서로 갈음하지 마시고 세무 전문가의 확인을 받으십시오.",
        "매매수수료·거래세·환율 변동은 반영하지 않았습니다. 총보수는 분배율에 이미 반영되어 있습니다(기준가 차감).",
        "수량은 정수 매수를 가정해 내림 처리했습니다. 남는 금액은 '미투자 잔액'에 표시됩니다.",
        "여러 종목에 나눠 담아도 분배 시기는 종목마다 다릅니다. 매월 같은 날 한꺼번에 들어오지 않습니다.",
        "목록에는 커버드콜뿐 아니라 리츠·채권형·배당주·파킹형 월배당 ETF 가 함께 있습니다. 분배 재원과 위험이 서로 다르므로 [ETF데이터] 장의 '유형'·'자산군' 칸을 확인하십시오.",
        "드롭다운에는 유동성·변동성 기준에 미달한 종목도 담겨 있습니다. 담으면 2. 아래에 안내가 뜹니다.",
    ]
    for i, t in enumerate(notes):
        ws.merge_cells(start_row=r + i, start_column=2, end_row=r + i, end_column=LAST)
        c = ws.cell(row=r + i, column=2, value=f"· {t}")
        c.font = f(9, color=INK if i < 2 else MUTED)
        c.alignment = Alignment(vertical="center")
        ws.row_dimensions[r + i].height = 16
    r += len(notes) + 1

    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=LAST)
    c = ws.cell(
        row=r,
        column=2,
        value=(
            f"자료 출처 ETFCHECK (www.etfcheck.co.kr) · 수집 {data.get('collectedAt', '')} · "
            f"대상 국내 상장 월배당 ETF · 채택 기준 순자산 {rules.get('minAum', 0)/1e8:,.0f}억원 이상, "
            f"60일 평균거래대금 {rules.get('minTurnover', 0)/1e8:,.0f}억원 이상, "
            f"연환산 변동성 {rules.get('maxVol', 0):g}% 이하, 분배 이력 {rules.get('minTrackMonths', 0)}개월 이상"
        ),
    )
    c.font = f(8.5, color=MUTED)
    ws.row_dimensions[r].height = 15

    ws.freeze_panes = "A6"
    ws.page_setup.orientation = "portrait"
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_options.horizontalCentered = True
    ws.page_margins.left = ws.page_margins.right = 0.35
    ws.page_margins.top = ws.page_margins.bottom = 0.45
    ws.print_area = f"A1:H{r}"
    ws.print_title_rows = "1:5"
    ws.oddFooter.right.text = "&P / &N"
    ws.oddFooter.right.size = 8
    ws.oddFooter.right.color = "6C6C6C"
    return ws, p_first, p_last, SEARCH_CELL


def build_guide(wb, data, n_adopted, n_rejected, n_bad):
    ws = wb.create_sheet("사용법")
    ws.column_dimensions["A"].width = 2.5
    ws.column_dimensions["B"].width = 104
    ws.sheet_view.showGridLines = False

    for c in range(1, 3):
        ws.cell(row=1, column=c).fill = fill(ORANGE)
    t = ws.cell(row=1, column=2, value="이 파일을 쓰는 법")
    t.font = Font(name=FONT, size=16, bold=True, color="FFFFFF")
    t.alignment = Alignment(vertical="center")
    ws.row_dimensions[1].height = 34
    for c in range(1, 3):
        ws.cell(row=2, column=c).fill = fill(BLUE)
    ws.row_dimensions[2].height = 3

    body = [
        "",
        ("1. [제안서] 장의 노란 칸만 고치면 됩니다.", "h"),
        "     · 고객명 — 그대로 인쇄됩니다.",
        "     · 총 투자금액 — 원 단위로 넣으십시오. 예: 100000000",
        "     · 배분 방식 — '비율' 또는 '금액'. 포트폴리오 표의 배분 칸 뜻이 이것에 따라 바뀝니다.",
        "     · 배당소득세율 — 기본 15.4%. 금융소득종합과세 대상자면 여기만 바꾸십시오.",
        "",
        (f"2. 포트폴리오는 {SLOTS}줄까지 담을 수 있습니다.", "h"),
        "     · 투자 ETF 칸을 누르면 ▼ 가 나옵니다. 목록에서 고르십시오.",
        "     · 종목이 많아 찾기 어려우면 표 위의 '종목 검색' 에 글자 일부를 넣으십시오"
        " (예: 커버드콜). ▼ 목록이 그만큼만 남고, 비우면 전체로 돌아옵니다.",
        "     · [종목조회] 장에서 '담기' 칸에 O 를 넣으면 이 표에 자동으로 올라옵니다."
        " 담은 순서대로 채워지고, O 를 지우면 내려갑니다. 배분 비율은 직접 넣으십시오.",
        "     · 손으로 ▼ 로 고르면 그 줄은 손으로 고른 값이 남습니다(그 줄만"
        " [종목조회] 를 따라가지 않습니다). 다음 달 파일에서는 다시 연결됩니다.",
        "     · '비율' 이면 배분 칸에 %를 넣습니다. 합이 100 이 되어야 합니다.",
        "       예) 50 / 30 / 20 → 총 투자금액을 5:3:2 로 나눕니다.",
        "     · '금액' 이면 배분 칸에 원 단위 금액을 직접 넣습니다.",
        "       예) 60000000 / 25000000 / 15000000",
        "     · 한 종목만 담으려면 첫 줄에만 넣고 배분을 100 으로 두십시오.",
        "     · 빈 줄은 계산에서 빠집니다. 줄을 지울 필요가 없습니다.",
        "     · 배분이 어긋나면(비율 합 ≠ 100, 금액 합 > 총액) 합계 줄 아래에 빨간 글씨로 알려 줍니다.",
        "",
        ("3. 드롭다운에는 고를 수 있는 종목이 전부 담겨 있습니다.", "h"),
        f"     · 채택 {n_adopted}종목 — 유동성·변동성·분배이력 기준을 통과한 종목",
        f"     · 기준 미달 {n_rejected}종목 — 통과하지 못했지만 고를 수는 있습니다.",
        "       담으면 합계 줄 아래에 노란 글씨로 알려 주고, 사유는 [ETF데이터] 장 '제외 사유' 칸에 있습니다.",
        f"     · 선택 불가 {n_bad}종목 — 연 분배율을 낼 수 없는 종목이라 드롭다운에 없습니다.",
        "       (분배 이력이 열두 달을 못 채웠거나 수집이 실패한 종목입니다. 사유는 [ETF데이터] 장에 있습니다.)",
        "     · 커버드콜인지, 무슨 자산군인지는 [ETF데이터] 장의 '유형'·'자산군' 칸에 있습니다.",
        "",
        ("4. 나머지 칸은 전부 수식입니다.", "h"),
        "     손으로 고치면 다음 갱신 때 되돌아갑니다.",
        "",
        ("5. 갱신", "h"),
        "     매월 1일 오전(KST)에 ETFCHECK 에서 분배율을 다시 받아 이 파일을 새로 만듭니다.",
        "     고객명·투자금액·포트폴리오는 갱신 때 초기값으로 돌아가므로, 고객별 사본은 따로 저장해 두십시오.",
        "",
        ("6. 값이 이상해 보이면", "h"),
        "     [ETF데이터] 장을 먼저 보십시오. 그 장이 원천이고, [제안서] 장은 그 장을 가리킬 뿐입니다.",
        "     그 장의 값이 ETFCHECK 화면과 다르면 수집이 어긋난 것이니 알려 주십시오.",
    ]
    r = 4
    for line in body:
        text, kind = line if isinstance(line, tuple) else (line, "")
        c = ws.cell(row=r, column=2, value=text)
        if kind == "h":
            c.font = f(11, bold=True, color=BLUE)
            ws.row_dimensions[r].height = 24
        else:
            c.font = f(10, color=INK if text.strip() else MUTED)
            ws.row_dimensions[r].height = 18
        c.alignment = Alignment(vertical="center")
        r += 1
    return ws


def main():
    data = load()
    wb = Workbook()
    wb.remove(wb.active)

    (ds, first_adopted, last_adopted, last_sel,
     n_ok, n_rej, n_bad, col_smatch, col_slist, col_rank, col_tax) = build_data_sheet(wb, data)
    # 드롭다운이 가리킬 이름. 채택 + 기준 미달(값이 온전한 것)까지 담는다.
    # 수집 실패 종목은 그 뒤에 있어 이 구간에 들어오지 않는다.
    #
    # **계산이 보는 목록은 늘 이것이다.** 검색으로 좁아지는 것은 고르는 목록
    # (아래 '검색결과')뿐이라, 검색어를 바꿔도 이미 담아 둔 종목은 그대로다.
    wb.defined_names.add(
        DefinedName("선택가능종목", attr_text=f"'ETF데이터'!$A${first_adopted}:$A${last_sel}")
    )
    ws, p_first, p_last, search_cell = build_proposal(
        wb, data, first_adopted, last_sel, first_adopted, last_adopted, col_tax)
    lk, cond_row, lk_first, lk_last = build_lookup_sheet(wb, data, first_adopted, last_sel, col_rank)

    # 검색 칸과, 그 검색에 걸린 종목만 담은 목록.
    #
    # 높이를 걸린 개수만큼만 잡는다(OFFSET). 구간을 통째로 가리키면 목록
    # 끝에 빈 줄이 수백 개 달려 ▼ 를 눌렀을 때 아래가 허옇게 비어 보인다.
    # 하나도 안 걸렸을 때를 대비해 최소 1로 둔다 — 높이가 0이면 엑셀이
    # 이름 자체를 오류로 본다.
    wb.defined_names.add(DefinedName("검색어", attr_text=f"'제안서'!{search_cell}"))
    wb.defined_names.add(DefinedName("검색결과", attr_text=(
        f"OFFSET('ETF데이터'!${col_slist}${first_adopted},0,0,"
        f"MAX(1,COUNTIF('ETF데이터'!${col_smatch}${first_adopted}:"
        f"${col_smatch}${last_sel},1)),1)"
    )))
    # [종목조회] 에서 'O' 로 담은 종목을 차례대로 담은 목록과 그 개수.
    wb.defined_names.add(
        DefinedName("담긴목록", attr_text=f"'종목조회'!$N${lk_first}:$N${lk_last}"))
    wb.defined_names.add(
        DefinedName("담긴수", attr_text=f"'종목조회'!$M${lk_last}"))
    # 조회 조건 세 칸에 이름을 붙인다. [ETF데이터] 장의 숨긴 계산 칸이 이
    # 이름들을 본다 — 칸 주소를 그대로 박아 두면 줄이 하나 밀리는 순간
    # 조회가 엉뚱한 칸을 조건으로 읽는다.
    for i, name in enumerate(["조회_주기", "조회_최소", "조회_최대"]):
        wb.defined_names.add(DefinedName(name, attr_text=f"'종목조회'!$C${cond_row + i}"))
    build_guide(wb, data, n_ok, n_rej, n_bad)

    # 첫 줄에 종목 하나를 미리 넣어 둔다. 열 줄을 전부 비워 두면 열자마자
    # 0원짜리 제안서가 뜬다.
    #
    # 분배율 1위를 기본값으로 두지 않는다. 그 자리는 대개 한 종목에 몰아 넣은
    # 커버드콜이 차지하는데, 아무 손도 대지 않고 인쇄한 제안서가 그 종목을
    # 권하는 꼴이 된다. 파킹형(단기자금, 분류 0108)도 뺀다 — 순자산이 6조를
    # 넘어 "순자산 최대" 로 고르면 언제나 CD금리 펀드가 뽑힌다.
    # 남은 것 중 순자산 최대, 곧 가장 무난한 것 하나만 넣고 나머지는 비워 둔다.
    # 무엇을 어떻게 섞을지는 사람이 정할 일이지 이 파일이 정할 일이 아니다.
    # 2026-09: 모집단을 넓히면서 **월배당을 먼저 고른다** 는 조건이 하나 더
    # 필요해졌다. 안 걸면 "순자산 최대" 가 KODEX 200(24.8조)을 뽑는데, 그것은
    # 연 1회 배당이다. 아무 손도 대지 않고 인쇄한 "월배당 ETF 투자 제안서" 가
    # 연 1회 배당하는 코스피200 ETF 를 권하는 꼴이 된다.
    pool = [x for x in data["items"] if x.get("adopted")]
    monthly = [x for x in pool if (x.get("payoutFreq") or "") == "월배당"]
    not_parking = [x for x in (monthly or pool) if (x.get("assetClassCode") or "") != "0108"]
    default = max(not_parking or monthly or pool, key=lambda x: (x.get("aum") or 0))

    # 종목 칸은 [종목조회] 에서 'O' 로 담은 것을 차례대로 받아 온다.
    #
    # 아무것도 담지 않았으면 첫 줄만 기본 종목을 보여 주고 나머지는 비운다 —
    # 열 줄이 전부 비면 열자마자 0원짜리 제안서가 뜨기 때문이다. 하나라도
    # 담기면 기본 종목은 물러나고 담은 것만 올라온다.
    #
    # 손으로 고르고 싶으면 그냥 ▼ 로 고르면 된다. 그러면 그 줄의 수식이
    # 지워지고 고른 값이 남는다 — 그 줄만 손으로 잡히고 나머지 줄은 계속
    # [종목조회] 를 따라간다. 다음 달 파일에서는 다시 수식으로 돌아온다.
    esc = default["name"].replace('"', '""')
    for i in range(SLOTS):
        rr = p_first + i
        fallback = f'"{esc}"' if i == 0 else '""'
        ws.cell(row=rr, column=2).value = (
            f'=IF(담긴수=0,{fallback},IFERROR(INDEX(담긴목록,{i + 1}),""))'
        )
    # 배분 칸은 build_proposal 에서 '담은 만큼 고르게 나누는' 수식으로 채웠다.
    # 아무것도 안 담았으면 담긴수=0 이라 MAX(담긴수,1)=1 이 되어 첫 줄이 100%
    # 가 된다 — 예전에 여기서 100 을 박아 넣던 것과 같은 결과다.

    wb.active = wb["제안서"]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    print(
        f"만들었습니다: {OUT}  "
        f"(채택 {n_ok} / 기준 미달 {n_rej} / 선택 불가 {n_bad}, 드롭다운 {n_ok + n_rej}종목)"
    )


if __name__ == "__main__":
    main()
