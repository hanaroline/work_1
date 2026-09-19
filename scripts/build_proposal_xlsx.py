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
    BOX, FONT, HIGHLIGHT, INK, INPUT_FILL, INPUT_FONT, MUTED, ORANGE,
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
    section(ws, 1, "1", "자산군 실측치", 6)
    ws["A3"] = ("아래는 원천에서 **실제로 잰 값**입니다. 미래 수익률이 아닙니다. "
                "빈칸(—)은 원천에 없어 셈하지 않은 것이며 만들어 넣지 않습니다.")
    ws["A3"].font = f(9, color=MUTED)
    head(ws, 5, ["자산군", "종목수", "수익률 산출", "과거 1년(중앙)",
                 "변동성(중앙)", "최대낙폭(중앙)"], [14, 10, 12, 15, 14, 15])
    r = 6
    for cls, s in stats.items():
        put(ws, r, 1, cls)
        put(ws, r, 2, s["종목수"])
        put(ws, r, 3, s["수익률산출가능"])
        for i, key in enumerate(["ret1y_중앙값", "vol_중앙값", "mdd_중앙값"], start=4):
            v = s.get(key)
            if isinstance(v, (int, float)):
                put(ws, r, i, v / 100, fmt="0.0%")
            else:
                put(ws, r, i, "—").alignment = RIGHT
        r += 1
    ws["A%d" % (r + 1)] = ("펀드는 기준가 이력이 7 거래일뿐이라 변동성·최대낙폭을 "
                           "셈하지 않고 원천의 위험등급을 씁니다.")
    ws["A%d" % (r + 1)].font = f(9, color=MUTED)
    return ws


def sheet_products(wb, products):
    ws = wb.create_sheet("상품")
    section(ws, 1, "2", "자산군별 제안 상품", 8)
    ws["A3"] = ("규모와 보수로 고릅니다. 수익률 순으로 고르지 않습니다 — 지난해 제일 "
                "많이 오른 것을 권하는 습관이 고객에게 가장 비쌉니다. "
                "개별 주식은 시가총액 상위 종목이며 종목 추천이 아닙니다.")
    ws["A3"].font = f(9, color=MUTED)
    head(ws, 5, ["자산군", "상품", "유형", "운용/발행", "규모(원)",
                 "과거 1년", "변동성", "보수"],
         [11, 42, 16, 20, 16, 11, 11, 12])
    r = 6
    for cls, items in products.items():
        for p in items:
            put(ws, r, 1, cls)
            put(ws, r, 2, p.get("name") or p.get("code"))
            put(ws, r, 3, p.get("type") or "—")
            put(ws, r, 4, p.get("company") or "—")
            sz = p.get("size")
            put(ws, r, 5, sz if isinstance(sz, (int, float)) else "—",
                fmt="#,##0" if isinstance(sz, (int, float)) else None)
            for i, key in enumerate(["ret1y", "vol"], start=6):
                v = p.get(key)
                put(ws, r, i, v / 100 if isinstance(v, (int, float)) else "—",
                    fmt="0.0%" if isinstance(v, (int, float)) else None)
            lo, hi = p.get("feeMin"), p.get("feeMax")
            if isinstance(lo, (int, float)) and isinstance(hi, (int, float)) and hi != lo:
                put(ws, r, 8, "%.2f~%.2f%%" % (lo, hi))
            elif isinstance(lo, (int, float)):
                put(ws, r, 8, lo / 100, fmt="0.00%")
            else:
                put(ws, r, 8, "—")
            if r % 2 == 0:
                for c in range(1, 9):
                    if not ws.cell(row=r, column=c).fill.fgColor.rgb or \
                            ws.cell(row=r, column=c).fill.fgColor.rgb == "00000000":
                        ws.cell(row=r, column=c).fill = fill(SURFACE)
            r += 1
    ws.freeze_panes = "A6"
    return ws


def sheet_sources(wb, u):
    ws = wb.create_sheet("출처")
    section(ws, 1, "3", "자료 출처와 기준일", 5)
    head(ws, 3, ["자산군", "원천", "종목", "기준일", "비고"],
         [12, 46, 8, 12, 70])
    r = 4
    for name, meta in u["원천"].items():
        if not isinstance(meta, dict):
            continue
        put(ws, r, 1, name)
        put(ws, r, 2, str(meta.get("src") or "—"))
        put(ws, r, 3, meta.get("count", "—"))
        put(ws, r, 4, meta.get("asOf") or "—")
        put(ws, r, 5, str(meta.get("note") or meta.get("error") or "")[:200])
        ws.cell(row=r, column=5).alignment = LEFT
        r += 1
    r += 2
    for k, v in u["정책"].items():
        ws.cell(row=r, column=1, value=k).font = f(10, bold=True)
        c = ws.cell(row=r, column=2, value=str(v))
        c.font = f(9, color=MUTED)
        c.alignment = LEFT
        r += 1
    return ws


def sheet_proposal(wb, data, u, rule_first, rule_last, classes):
    ws = wb.create_sheet("제안서", 0)
    ws.sheet_view.showGridLines = False
    for i, w in enumerate([16, 15, 16, 15, 15, 15, 14], start=1):
        ws.column_dimensions[get_column_letter(i)].width = w

    # 머리
    t = ws.cell(row=1, column=1, value="자산배분 제안서")
    t.font = f(20, bold=True, color=ORANGE)
    ws.cell(row=2, column=1, value="미래에셋증권").font = f(10, color=MUTED)
    rule_row(ws, 3, 7)

    # ── 입력 ────────────────────────────────────────────────────────
    section(ws, 5, "1", "고객 정보", 7)
    labels = [("고객명", "", "text"), ("투자금액 (만원)", 10000, "num"),
              ("투자기간", "5년 초과", "horizon"), ("위험성향 (1~5)", 3, "risk")]
    r = 7
    for label, default, kind in labels:
        ws.cell(row=r, column=1, value=label).font = f(10, bold=True)
        put(ws, r, 2, default, kind="input",
            fmt="#,##0" if kind == "num" else None)
        r += 1

    dv_h = DataValidation(type="list",
                          formula1='"%s"' % ",".join(l for _, l in HORIZONS),
                          allow_blank=False)
    ws.add_data_validation(dv_h)
    dv_h.add(ws.cell(row=9, column=2))
    dv_r = DataValidation(type="whole", operator="between",
                          formula1=1, formula2=5, allow_blank=False)
    ws.add_data_validation(dv_r)
    dv_r.add(ws.cell(row=10, column=2))

    # 성향 이름과 조회 키 — 수식이다(입력이 바뀌면 따라 움직여야 한다).
    ws.cell(row=11, column=1, value="성향").font = f(10, bold=True)
    names = ",".join('"%s"' % P.PROFILES[k]["name"] for k in sorted(P.PROFILES))
    put(ws, 11, 2, "=CHOOSE($B$10,%s)" % names, kind="formula")
    ws.cell(row=12, column=1, value="조회 키").font = f(9, color=MUTED)
    years_list = ",".join(str(y) for y, _ in HORIZONS)
    put(ws, 12, 2,
        '=$B$10&"|"&CHOOSE(MATCH($B$9,{%s},0),%s)'
        % (",".join('"%s"' % l for _, l in HORIZONS), years_list),
        kind="formula")
    ws.cell(row=12, column=2).font = f(9, color=MUTED)

    # ── 배분 ────────────────────────────────────────────────────────
    section(ws, 14, "2", "제안 배분", 7)
    head(ws, 16, ["자산군", "비중", "금액(만원)", "과거 1년(중앙)",
                  "변동성(중앙)", "", ""], None)
    rng = "배분규칙!$D$%d:$%s$%d" % (rule_first,
                                     get_column_letter(3 + len(classes)),
                                     rule_last)
    key_rng = "배분규칙!$A$%d:$A$%d" % (rule_first, rule_last)
    hdr_rng = "배분규칙!$D$3:$%s$3" % get_column_letter(3 + len(classes))

    first = 17
    for i, cls in enumerate(classes):
        r = first + i
        put(ws, r, 1, cls)
        put(ws, r, 2,
            "=INDEX(%s,MATCH($B$12,%s,0),MATCH($A%d,%s,0))" % (rng, key_rng, r, hdr_rng),
            kind="formula", fmt="0.0%")
        put(ws, r, 3, "=$B$8*$B%d" % r, kind="formula", fmt="#,##0")
        # 자산군 실측치는 「자산군」 시트에서 집어 온다 — 값으로 박으면 자료를
        # 다시 만들었을 때 제안서만 옛 숫자를 들고 있게 된다.
        put(ws, r, 4, '=IFERROR(INDEX(자산군!$D$6:$D$%d,MATCH($A%d,자산군!$A$6:$A$%d,0)),"—")'
            % (5 + len(u["자산군"]), r, 5 + len(u["자산군"])), kind="formula", fmt="0.0%")
        put(ws, r, 5, '=IFERROR(INDEX(자산군!$E$6:$E$%d,MATCH($A%d,자산군!$A$6:$A$%d,0)),"—")'
            % (5 + len(u["자산군"]), r, 5 + len(u["자산군"])), kind="formula", fmt="0.0%")
    last = first + len(classes) - 1

    tr = last + 1
    put(ws, tr, 1, "합계", bold=True)
    put(ws, tr, 2, "=SUM($B%d:$B%d)" % (first, last), kind="formula",
        fmt="0.0%", bold=True)
    put(ws, tr, 3, "=SUM($C%d:$C%d)" % (first, last), kind="formula",
        fmt="#,##0", bold=True)
    put(ws, tr, 4,
        '=SUMPRODUCT($B%d:$B%d,IFERROR($D%d:$D%d,0))' % (first, last, first, last),
        kind="formula", fmt="0.0%", bold=True)
    put(ws, tr, 5,
        '=SUMPRODUCT($B%d:$B%d,IFERROR($E%d:$E%d,0))' % (first, last, first, last),
        kind="formula", fmt="0.0%", bold=True)
    for c in range(1, 6):
        ws.cell(row=tr, column=c).fill = fill(HIGHLIGHT)

    # ── 읽는 법 ─────────────────────────────────────────────────────
    r = tr + 2
    section(ws, r, "3", "이 표를 읽는 법", 7)
    r += 2
    for line in [
        "「과거 1년」은 유니버스에서 실제로 잰 값입니다. **미래 수익률이 아닙니다** — "
        "최근 1년이 그랬다는 것과 앞으로 그러리라는 것은 다른 말입니다.",
        "변동성은 자산군 사이 상관관계를 셈하지 않은 가중합입니다. 분산효과가 빠져 있어 "
        "실제보다 높게 나옵니다. 낮게 보이게 만드는 것보다 높게 두는 편이 안전합니다.",
        "펀드는 기준가 이력이 7 거래일뿐이라 변동성을 셈하지 않았습니다. 그래서 합계 "
        "변동성은 포트폴리오의 일부만 덮습니다 — 「자산군」 시트에서 빈칸(—)인 자산군이 "
        "그것입니다.",
        "「해외펀드」는 해외에 설정된 뮤추얼펀드가 아니라 해외에 투자하는 국내 설정 "
        "공모펀드입니다.",
        "이 자료는 참고용이며 투자 권유가 아닙니다. 실제 제안 전 준법감시 검토를 받으십시오.",
    ]:
        c = ws.cell(row=r, column=1, value="· " + line)
        c.font = f(9, color=MUTED)
        c.alignment = Alignment(wrap_text=True, vertical="top")
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7)
        ws.row_dimensions[r].height = 26
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
    section(ws, 1, "", "쓰는 법", 4)
    ws.column_dimensions["A"].width = 100
    rows = [
        "1. 「제안서」 시트에서 파란 글씨 칸만 고칩니다 — 고객명·투자금액·투자기간·위험성향.",
        "2. 나머지 칸은 수식입니다. 손으로 덮어쓰면 다음에 값이 안 따라옵니다.",
        "3. 「배분규칙」 시트는 proposal_lib.py 가 셈한 것입니다. 고치지 마십시오 — "
        "고치면 화면(proposal.html)·PPT 와 어긋납니다.",
        "4. 자료를 새로 받으면 python3 scripts/build_proposal_universe.py 를 돌린 뒤 "
        "이 파일을 다시 만듭니다.",
        "",
        "셀 색 규칙 (기존 고객제안서와 같습니다)",
        "    파란 글씨 + 옅은 칠 = 사람이 넣는 칸",
        "    검은 글씨           = 수식",
        "    회색 글씨           = 원천에서 받아 적은 값",
    ]
    for i, line in enumerate(rows):
        c = ws.cell(row=3 + i, column=1, value=line)
        c.font = f(10, color=INK if not line.startswith("    ") else MUTED)
        c.alignment = Alignment(wrap_text=True, vertical="top")
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
    sheet_classes(wb, u["자산군"])
    sheet_products(wb, products)
    sheet_sources(wb, u)
    sheet_howto(wb)
    sheet_proposal(wb, plans, u, rf, rl, classes)
    wb.move_sheet("제안서", offset=-len(wb.sheetnames) + 1)

    wb.save(args.out)
    print("시트: %s" % " · ".join(wb.sheetnames))
    print("배분 %d 가지 · 상품 %d 종" % (len(plans),
                                        sum(len(v) for v in products.values())))
    print("%s (%.0f KB)" % (os.path.relpath(args.out, ROOT),
                            os.path.getsize(args.out) / 1024))


if __name__ == "__main__":
    main()
