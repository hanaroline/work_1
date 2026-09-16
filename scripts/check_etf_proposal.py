#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""만들어 낸 제안서 엑셀이 **제대로 된 칸을 가리키고 제대로 된 값을 내는지** 본다.

수식이 도는 것과 맞는 것은 다르다. 한 줄 어긋난 참조는 오류 표시 없이
빈 칸을 가리키고, 그 칸은 0 으로 계산된다. 제안서에서는 "월 0원" 이 되어
나가는데, 열어 본 사람은 그 종목이 원래 분배를 안 하나 보다 하고 넘긴다.
매월 1일 자동으로 다시 만들기 때문에 사람이 매번 열어 볼 수도 없다.
그래서 기계가 본다.

보는 것
  1. 제안서의 모든 수식 참조가 빈 칸을 가리키지 않는가
  2. ETF데이터 참조가 채택 구간 안을 가리키고, INDEX 범위가 구간 전체인가
  3. 비교표가 채택 종목을 한 줄씩 빠짐없이, 겹치지 않고 가리키는가
  4. 콤보박스가 살아 있고 채택 구간을 가리키는가
  5. 시트 값이 data/cc_etf.json 과 한 글자도 다르지 않은가
  6. 수식을 실제로 계산했을 때 손계산과 같은 값이 나오는가

왜 리브레오피스를 안 쓰나
  처음에는 리브레오피스로 다시 계산시켰다. 그런데 `--convert-to xlsx` 는
  수식을 옮겨 적기만 하고 계산하지 않는다. 그 빈 값을 읽고 "오류 칸 없음"
  이라며 초록불을 켰다 — 아무것도 계산하지 않고 통과시킨 것이다.
  매크로로 calculateAll() 을 부르는 길은 이 환경에서 멈춰 버린다.
  `formulas` 는 파이썬만으로 수식을 풀어 주고, 결과가 결정적이다.

쓰기: python scripts/check_etf_proposal.py [엑셀] [원천json]
"""
from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parent.parent
XLSX = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "고객제안서_월배당ETF.xlsx"
SRC = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "data" / "cc_etf.json"

# ETF데이터 장의 열 뜻. build_etf_proposal.py 의 열 차례와 반드시 같아야 한다.
DATA_COLS = {
    "A": "종목명", "B": "종목코드", "C": "운용사", "D": "현재가", "E": "순자산총액",
    "F": "60일 평균거래대금", "G": "총보수", "H": "변동성", "I": "최근 월분배율",
    "J": "연환산 분배율", "K": "분배이력", "L": "최근 분배기준일", "M": "채택", "N": "제외 사유", "O": "기초지수", "P": "유형", "Q": "자산군",
}

problems: list[str] = []
notes: list[str] = []


def fail(msg: str) -> None:
    problems.append(msg)


def near(got, want, tol=1.0) -> bool:
    if got is None or isinstance(got, str):
        return False
    return abs(float(got) - float(want)) <= tol


# ── 수식 계산 ──────────────────────────────────────────────────────────
def evaluate(path: Path):
    """워크북의 모든 수식을 실제로 계산해 {('장','A1'): 값} 으로 돌려준다."""
    import warnings

    warnings.filterwarnings("ignore")
    try:
        import formulas
    except ImportError:
        fail("`formulas` 가 없어 계산 검산을 못 했습니다. `pip install formulas` 하십시오.")
        return None
    sol = formulas.ExcelModel().loads(str(path)).finish().calculate()
    out = {}
    key = re.compile(r"'\[[^\]]+\](.+)'!([A-Z]+\d+)$")
    for k, v in sol.items():
        m = key.match(k)
        if not m:
            continue
        try:
            v = v.value[0, 0]
        except Exception:  # noqa: BLE001
            pass
        out[(m.group(1), m.group(2))] = v
    return out


def find_label(ws, text, cols=(1, 2, 5)):
    """라벨로 칸을 찾는다. 줄 번호를 박아 두면 표를 한 줄 늘리는 순간
    검사기가 엉뚱한 칸을 본다."""
    for row in ws.iter_rows(max_col=max(cols)):
        for c in row:
            if c.column in cols and isinstance(c.value, str) and c.value.strip() == text:
                return c.row, c.column + 1
    return None, None


def main() -> int:  # noqa: PLR0915
    if not XLSX.exists():
        print(f"[중단] {XLSX} 가 없습니다.")
        return 1
    data = json.loads(SRC.read_text(encoding="utf-8"))
    items = data["items"]
    by_yield = lambda x: -(x.get("distTtmRate") or 0)  # noqa: E731
    adopted = sorted([x for x in items if x.get("adopted")], key=by_yield)
    # 드롭다운은 채택 + 기준 미달(값이 온전한 것)을 담는다. 기준은 우리가
    # 정한 선일 뿐이라 그 밖의 종목도 고를 수 있게 열어 두었다.
    usable_rejected = sorted(
        [x for x in items
         # 연 분배율이 없는 종목은 뺀다. 이 문서가 내놓는 값이 전부
         # "실투자금 × 연 분배율 ÷ 12" 이라, 그 값이 없으면 담아도 0원이
         # 나온다. 0원을 보여 주는 것은 "분배를 안 한다" 는 거짓말이 된다.
         # 분배 이력이 열두 달을 못 채운 종목이 대부분이고, 사유는
         # [ETF데이터] 장에 그대로 남는다.
         if not x.get("adopted") and x.get("dataComplete") is not False
         and (x.get("price") or 0) > 0 and x.get("distTtmRate") is not None],
        key=by_yield,
    )
    selectable = adopted + usable_rejected

    wb = load_workbook(XLSX)
    for name in ("제안서", "ETF데이터", "사용법"):
        if name not in wb.sheetnames:
            fail(f"[{name}] 장이 없습니다.")
    if problems:
        print("\n".join(problems))
        return 1
    ws, ds = wb["제안서"], wb["ETF데이터"]

    # ── 1. 채택 구간 ──
    dn = wb.defined_names.get("선택가능종목")
    if dn is None:
        print("이름 '선택가능종목' 이 없습니다 — 콤보박스가 가리킬 데가 없습니다.")
        return 1
    m = re.search(r"\$A\$(\d+):\$A\$(\d+)", dn.attr_text)
    first, last = int(m.group(1)), int(m.group(2))
    n = last - first + 1
    if n != len(selectable):
        fail(f"선택 구간이 {n}행인데 고를 수 있는 종목은 {len(selectable)}건입니다.")
    # 채택 종목은 그 구간의 **앞쪽**에 끊기지 않게 있어야 한다. 비교표가
    # 거기를 그대로 훑기 때문이다.
    last_adopted = first + len(adopted) - 1

    # ── 2. 콤보박스 ──
    # 콤보박스는 둘이다 — ETF 목록과 배분 방식. 순서를 믿지 말고 무엇을
    # 가리키는지로 고른다.
    dvs = [d for d in ws.data_validations.dataValidation if d.type == "list"]
    dv_etf = next((d for d in dvs if "선택가능종목" in (d.formula1 or "")), None)
    dv_mode = next((d for d in dvs if "비율" in (d.formula1 or "")), None)
    if dv_etf is None:
        fail("[제안서] 에 ETF 목록 콤보박스(선택가능종목)가 없습니다.")
    else:
        cells = str(dv_etf.sqref)
        sel = ws[cells.split()[0].split(":")[0]]
        if not sel.value:
            fail(f"콤보박스 첫 줄 {sel.coordinate} 이 비어 있습니다 — 열자마자 0원 제안서가 됩니다.")
        elif sel.value not in [x["name"] for x in selectable]:
            fail(f"미리 넣어 둔 종목 '{sel.value}' 가 선택 목록에 없습니다.")
        elif sel.value not in [x["name"] for x in adopted]:
            fail(f"미리 넣어 둔 종목 '{sel.value}' 가 기준 미달 종목입니다 — 기본값은 채택 종목이어야 합니다.")
        else:
            notes.append(f"ETF 콤보박스 {cells} · 첫 줄 '{sel.value}' · 후보 {n}종목")
    if dv_mode is None:
        fail("[제안서] 에 배분 방식(비율/금액) 콤보박스가 없습니다.")
    else:
        notes.append(f"배분 방식 콤보박스 {dv_mode.sqref}")

    # ── 3. 수식 참조 ──
    # 포트폴리오의 ETF·배분 칸(B·C)은 **비어 있는 것이 정상**이다. 다섯 줄을
    # 다 채우지 않아도 되게 만든 자리라, 빈 칸을 가리킨다고 나무라면 안 된다.
    # 나머지 칸은 그대로 본다 — 빈 칸을 가리키는 수식은 여전히 고장이다.
    p_hdr0, _ = find_label(ws, "투자 ETF", cols=(2,))
    blank_ok = set()
    if p_hdr0:
        rr0 = p_hdr0 + 1
        while rr0 <= p_hdr0 + 40:
            v = ws[f"B{rr0}"].value
            if isinstance(v, str) and v.strip() == "합계":
                break
            blank_ok.add(f"B{rr0}")
            blank_ok.add(f"C{rr0}")
            rr0 += 1

    ref_own = re.compile(r"(?<![!\w$])\$?([A-H])\$?(\d+)\b")
    # 범위 끝(`:$B$6`)까지 한 덩어리로 잡는다. 앞쪽만 떼어 내면 남은
    # `:$B$6` 가 제안서 자기 칸 참조처럼 보여 없는 문제를 만든다.
    ref_data = re.compile(r"'ETF데이터'!\$([A-Q])\$(\d+)(?::\$([A-Q])\$(\d+))?")
    n_formula = 0
    for row in ws.iter_rows():
        for c in row:
            if not (isinstance(c.value, str) and c.value.startswith("=")):
                continue
            n_formula += 1
            body = c.value
            for col, rw, col2, rw2 in ref_data.findall(body):
                ends = [(col, int(rw))] + ([(col2, int(rw2))] if rw2 else [])
                for cc, rr in ends:
                    if not (first <= rr <= last):
                        fail(f"{c.coordinate}: ETF데이터 {cc}{rr} 는 채택 구간({first}~{last}) 밖입니다.")
                    elif ds[f"{cc}{rr}"].value in (None, ""):
                        fail(f"{c.coordinate}: ETF데이터 {cc}{rr} ({DATA_COLS.get(cc)}) 가 빈 칸입니다.")
                if rw2 and (col != col2 or int(rw) != first or int(rw2) != last):
                    fail(f"{c.coordinate}: INDEX 범위 {col}{rw}:{col2}{rw2} 가 채택 구간 전체가 아닙니다.")
            # INDEX 의 범위 인자는 빈 칸 검사를 하면 안 된다(범위 전체를 준다).
            for col, rw in ref_own.findall(ref_data.sub("", body)):
                tgt = ws[f"{col}{int(rw)}"]
                if tgt.coordinate in blank_ok:
                    continue
                if tgt.value in (None, "") and tgt.coordinate != c.coordinate:
                    fail(f"{c.coordinate}: 제안서 {col}{rw} 을 가리키는데 그 칸이 비어 있습니다. → {body}")
    notes.append(f"제안서 수식 {n_formula}개, 참조 대상이 모두 채워져 있습니다.")

    # ── 4. 비교표가 채택 종목을 하나씩 훑는가 ──
    # 비교표의 종목명은 B 열에 있다. A 는 왼쪽 여백이라 3칸뿐이어서, 거기
    # 종목명을 두었더니 미리보기 PDF 에 "SOL0040Y0" 처럼 잘려 찍혔다.
    seen = [
        int(re.search(r"\$A\$(\d+)", r[0].value).group(1))
        for r in ws.iter_rows(min_col=2, max_col=2)
        if isinstance(r[0].value, str) and r[0].value.startswith("='ETF데이터'!$A$")
    ]
    # 비교표는 채택 종목을 다 싣지 않는다 — 스무 종목이 넘으면 고객이 받는
    # 한 장이 표 하나로 덮인다. 연 분배율 위에서부터 자르므로, 검사도
    # "전부" 가 아니라 "위에서부터 끊기지 않고" 를 본다.
    if seen and seen != list(range(first, first + len(seen))):
        fail(f"비교표가 채택 종목을 위에서부터 순서대로 훑지 않습니다: {seen}")
    elif seen and seen[-1] > last_adopted:
        fail(f"비교표가 채택 구간(~{last_adopted}행)을 넘어 기준 미달 종목까지 싣고 있습니다.")
    elif seen:
        notes.append(f"비교표 {len(seen)}행이 채택 {len(adopted)}종목 중 위 {len(seen)}개와 맞습니다.")

    # ── 5. 시트 값이 원천과 같은가 ──
    for i, item in enumerate(selectable):
        rw = first + i
        for col, key, div in [
            ("A", "name", None), ("B", "code", None), ("C", "manager", None),
            ("D", "price", 1), ("E", "aum", 1), ("F", "turnover60", 1),
            ("G", "expenseRatio", 100), ("H", "volatility", 100),
            ("I", "distMonthlyRate", 100), ("J", "distTtmRate", 100),
        ]:
            got, want = ds[f"{col}{rw}"].value, item.get(key)
            if want is None:
                continue
            if div:
                if got is None or abs(got - want / div) > 1e-9:
                    fail(f"ETF데이터 {col}{rw} ({DATA_COLS[col]}): 시트 {got} ≠ 원천 {want}/{div}")
            elif got != want:
                fail(f"ETF데이터 {col}{rw} ({DATA_COLS[col]}): 시트 '{got}' ≠ 원천 '{want}'")
    notes.append(f"ETF데이터 {len(selectable)}행(채택 {len(adopted)} + 기준 미달 {len(usable_rejected)})이 원천 json 과 일치합니다.")

    # ── 6. 실제로 계산해 손계산과 맞춰 본다 ──
    v = evaluate(XLSX)
    if v is None:
        return report()

    errs = [f"{s}!{ref}" for (s, ref), val in v.items()
            if isinstance(val, str) and val.startswith("#")]
    if errs:
        fail(f"계산 오류 {len(errs)}칸: {', '.join(errs[:20])}")

    def val(ref):
        return v.get(("제안서", ref))

    def cell_of(text, cols=(1, 2, 5)):
        r, c = find_label(ws, text, cols)
        return None if r is None else f"{chr(64 + c)}{r}"

    amount = ws[cell_of("총 투자금액 (원)")].value
    tax = ws[cell_of("배당소득세율")].value
    mode = ws[cell_of("배분 방식")].value

    # ── 포트폴리오 줄마다 손으로 계산해 맞춘다 ──
    # 한 종목만 고르던 때와 달리, 이제 다섯 줄이 각자 수량·실투자금·분배금을
    # 낸다. 한 줄이라도 다른 줄의 값을 가리키면 합계는 그럴듯한데 내역이
    # 틀린 제안서가 된다 — 합계만 보면 안 잡힌다.
    p_hdr, _ = find_label(ws, "투자 ETF", cols=(2,))
    if p_hdr is None:
        fail("포트폴리오 표(머리글 '투자 ETF')를 찾지 못했습니다.")
        return report()
    by_name = {x["name"]: x for x in selectable}
    # 합계 줄은 **라벨로** 찾는다. 줄 수를 박아 두었더니 담을 수 있는 칸을
    # 다섯에서 열로 늘린 순간 빈 줄에서 멈춰 엉뚱한 줄을 합계로 봤다.
    slots = []
    rr = p_hdr + 1
    while rr <= p_hdr + 60:
        head = ws[f"B{rr}"].value          # `v` 는 계산 결과 사전이다. 덮어쓰면 안 된다.
        if isinstance(head, str) and head.strip() == "합계":
            break
        slots.append(rr)
        rr += 1
    tot_row = rr

    tot_invest = tot_pre = 0.0
    filled = 0
    for rr in slots:
        name = ws[f"B{rr}"].value
        alloc = ws[f"C{rr}"].value
        if not name:
            for col in ("D", "E", "F", "G", "H"):
                if not near(val(f"{col}{rr}"), 0, 1e-6):
                    fail(f"포트폴리오 {col}{rr}: 빈 줄인데 {val(f'{col}{rr}')} 이 나옵니다.")
            continue
        it = by_name.get(name)
        if it is None:
            fail(f"포트폴리오 {rr}행의 '{name}' 이 선택 목록에 없습니다.")
            continue
        filled += 1
        alloc_amt = round(amount * alloc / 100) if mode == "비율" else alloc
        q = math.floor(alloc_amt / it["price"])
        inv = q * it["price"]
        pre = inv * (it["distTtmRate"] / 100) / 12
        tot_invest += inv
        tot_pre += pre
        for col, want in [("D", alloc_amt), ("E", q), ("F", inv), ("G", pre), ("H", pre * (1 - tax))]:
            got = val(f"{col}{rr}")
            if not near(got, want):
                fail(f"포트폴리오 {col}{rr} ({name}): {got} ≠ 손계산 {want:,.2f}")
    if not filled:
        fail("포트폴리오에 담긴 종목이 하나도 없습니다 — 열자마자 0원짜리 제안서가 됩니다.")
        return report()

    # 합계 줄
    for col, want in [("F", tot_invest), ("G", tot_pre), ("H", tot_pre * (1 - tax))]:
        got = val(f"{col}{tot_row}")
        if not near(got, want):
            fail(f"합계 {col}{tot_row}: {got} ≠ 손계산 {want:,.2f}")

    # ── 요약 ──
    w_ann = tot_pre * 12 / tot_invest if tot_invest else 0
    expect = {
        "실제 투자금액": tot_invest,
        "미투자 잔액": amount - tot_invest,
        "담은 종목 수": filled,
        "월 예상 분배금 (세전)": tot_pre,
        "월 예상 분배금 (세후)": tot_pre * (1 - tax),
        "연 예상 분배금 (세전)": tot_pre * 12,
        "연 예상 분배금 (세후)": tot_pre * 12 * (1 - tax),
        "연 수익률 (세전, 가중평균)": w_ann,
        "연 수익률 (세후, 가중평균)": w_ann * (1 - tax),
    }
    for labl, want in expect.items():
        ref = cell_of(labl, cols=(1, 2, 6))
        if ref is None:
            fail(f"'{labl}' 칸을 찾지 못했습니다.")
            continue
        got = val(ref)
        tol = 1e-9 if "수익률" in labl else 1.0
        if not near(got, want, tol):
            fail(f"'{labl}' ({ref}) 계산값 {got} ≠ 손계산 {want}")

    # ── 금액별 표 — 가중평균 분배율을 그대로 적용한 근사치 ──
    hdr, _ = find_label(ws, "투자금액 구간", cols=(2,))
    checked = 0
    if hdr:
        rr = hdr + 1
        while isinstance(ws[f"B{rr}"].value, (int, float)):
            tier = ws[f"B{rr}"].value
            for col, want in [("C", tier * w_ann / 12), ("D", tier * w_ann / 12 * (1 - tax)),
                              ("E", tier * w_ann), ("F", tier * w_ann * (1 - tax))]:
                got = val(f"{col}{rr}")
                if not near(got, want):
                    fail(f"금액별 표 {col}{rr} ({tier:,}원): {got} ≠ 손계산 {want:,.0f}")
            checked += 1
            rr += 1
    if checked:
        notes.append(f"금액별 표 {checked}줄을 줄마다 다시 계산해 맞췄습니다.")

    # ── 비교표 — 종목마다 1억 기준 월 분배금 ──
    cmp_hdr, _ = find_label(ws, "종목명", cols=(2,))
    if cmp_hdr and seen:
        for i in range(len(seen)):
            it = adopted[i]
            rr = cmp_hdr + 1 + i
            q = math.floor(100_000_000 / it["price"])
            want = q * it["price"] * (it["distTtmRate"] / 100) / 12
            got = val(f"F{rr}")
            if not near(got, want):
                fail(f"비교표 F{rr} ({it['name']}): {got} ≠ 손계산 {want:,.0f}")
        notes.append(f"비교표 {len(seen)}종목의 1억 기준 월 분배금을 다시 계산해 맞췄습니다.")

    if not problems:
        notes.append(
            f"검산 통과 — {filled}종목 포트폴리오({mode} 배분): "
            f"{amount:,.0f}원 중 {tot_invest:,.0f}원 투자, "
            f"월 세전 {tot_pre:,.0f}원 / 연 {w_ann:.2%}"
        )
    return report()


def report() -> int:
    for s in notes:
        print(f"  · {s}")
    if problems:
        print(f"\n[문제 {len(problems)}건]")
        for p in problems:
            print(f"  ✗ {p}")
        return 1
    print("\n이상 없습니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
