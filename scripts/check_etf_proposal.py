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
    "J": "연환산 분배율", "K": "분배이력", "L": "최근 분배기준일", "M": "채택", "N": "제외 사유",
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
    adopted = sorted(
        [x for x in data["items"] if x.get("adopted")],
        key=lambda x: -(x.get("distTtmRate") or 0),
    )

    wb = load_workbook(XLSX)
    for name in ("제안서", "ETF데이터", "사용법"):
        if name not in wb.sheetnames:
            fail(f"[{name}] 장이 없습니다.")
    if problems:
        print("\n".join(problems))
        return 1
    ws, ds = wb["제안서"], wb["ETF데이터"]

    # ── 1. 채택 구간 ──
    dn = wb.defined_names.get("채택종목")
    if dn is None:
        print("이름 '채택종목' 이 없습니다 — 콤보박스가 가리킬 데가 없습니다.")
        return 1
    m = re.search(r"\$A\$(\d+):\$A\$(\d+)", dn.attr_text)
    first, last = int(m.group(1)), int(m.group(2))
    n = last - first + 1
    if n != len(adopted):
        fail(f"채택 구간이 {n}행인데 원천의 채택 종목은 {len(adopted)}건입니다.")

    # ── 2. 콤보박스 ──
    dvs = [d for d in ws.data_validations.dataValidation if d.type == "list"]
    if not dvs:
        fail("[제안서] 에 목록형 데이터 유효성(콤보박스)이 없습니다.")
    else:
        dv = dvs[0]
        if "채택종목" not in (dv.formula1 or ""):
            fail(f"콤보박스가 채택종목을 가리키지 않습니다: {dv.formula1}")
        sel = ws[str(dv.sqref).split()[0].split(":")[0]]
        if not sel.value:
            fail(f"콤보박스 칸 {sel.coordinate} 이 비어 있습니다 — 열자마자 0원 제안서가 됩니다.")
        elif sel.value not in [x["name"] for x in adopted]:
            fail(f"미리 골라 둔 종목 '{sel.value}' 가 채택 목록에 없습니다.")
        else:
            notes.append(f"콤보박스 {sel.coordinate} · 기본 선택 '{sel.value}' · 후보 {n}종목")

    # ── 3. 수식 참조 ──
    ref_own = re.compile(r"(?<![!\w$])\$?([A-H])\$?(\d+)\b")
    # 범위 끝(`:$B$6`)까지 한 덩어리로 잡는다. 앞쪽만 떼어 내면 남은
    # `:$B$6` 가 제안서 자기 칸 참조처럼 보여 없는 문제를 만든다.
    ref_data = re.compile(r"'ETF데이터'!\$([A-N])\$(\d+)(?::\$([A-N])\$(\d+))?")
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
                if tgt.value in (None, "") and tgt.coordinate != c.coordinate:
                    fail(f"{c.coordinate}: 제안서 {col}{rw} 을 가리키는데 그 칸이 비어 있습니다. → {body}")
    notes.append(f"제안서 수식 {n_formula}개, 참조 대상이 모두 채워져 있습니다.")

    # ── 4. 비교표가 채택 종목을 하나씩 훑는가 ──
    seen = [
        int(re.search(r"\$A\$(\d+)", r[0].value).group(1))
        for r in ws.iter_rows(min_col=1, max_col=1)
        if isinstance(r[0].value, str) and r[0].value.startswith("='ETF데이터'!$A$")
    ]
    if seen and seen != list(range(first, last + 1)):
        fail(f"비교표가 채택 종목을 순서대로 훑지 않습니다: {seen}")
    elif seen:
        notes.append(f"비교표 {len(seen)}행이 채택 종목 {first}~{last} 행과 일대일로 맞습니다.")

    # ── 5. 시트 값이 원천과 같은가 ──
    for i, item in enumerate(adopted):
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
    notes.append(f"ETF데이터 {len(adopted)}행이 원천 json 과 일치합니다.")

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

    amount = ws[cell_of("투자금액 (원)")].value
    tax = ws[cell_of("배당소득세율")].value
    picked = ws[cell_of("투자 ETF (선택)")].value
    item = next((x for x in adopted if x["name"] == picked), None)
    if item is None:
        fail(f"고른 종목 '{picked}' 을 원천에서 못 찾았습니다.")
        return report()

    price, ttm, mon = item["price"], item["distTtmRate"] / 100, item["distMonthlyRate"] / 100
    qty = math.floor(amount / price)
    invested = qty * price
    expect = {
        "매수 가능 수량": qty,
        "실제 투자금액": invested,
        "미투자 잔액": amount - invested,
        "월 예상 분배금 (세전)": invested * ttm / 12,
        "월 예상 분배금 (세후)": invested * ttm / 12 * (1 - tax),
        "연 예상 분배금 (세전)": invested * ttm,
        "연 예상 분배금 (세후)": invested * ttm * (1 - tax),
        "직전 월 실적 기준 (세전)": invested * mon,
        "월 수익률 (세전)": ttm / 12,
        "연 수익률 (세전)": ttm,
        "연 수익률 (세후)": ttm * (1 - tax),
    }
    for labl, want in expect.items():
        ref = cell_of(labl)
        if ref is None:
            fail(f"'{labl}' 칸을 찾지 못했습니다.")
            continue
        got = val(ref)
        tol = 1e-9 if "수익률" in labl else 1.0
        if not near(got, want, tol):
            fail(f"'{labl}' ({ref}) 계산값 {got} ≠ 손계산 {want}")

    # 금액별 표 — 줄마다 다시 계산해 맞춰 본다.
    hdr, _ = find_label(ws, "투자금액", cols=(2,))
    checked = 0
    if hdr:
        rr = hdr + 1
        while isinstance(ws[f"B{rr}"].value, (int, float)):
            tier = ws[f"B{rr}"].value
            q = math.floor(tier / price)
            for col, want in [("C", q), ("D", q * price), ("E", q * price * ttm / 12),
                              ("F", q * price * ttm / 12 * (1 - tax)), ("G", q * price * ttm),
                              ("H", q * price * ttm * (1 - tax))]:
                got = val(f"{col}{rr}")
                if not near(got, want):
                    fail(f"금액별 표 {col}{rr} ({tier:,}원): {got} ≠ 손계산 {want:,.0f}")
            checked += 1
            rr += 1
    if checked:
        notes.append(f"금액별 표 {checked}줄을 줄마다 다시 계산해 맞췄습니다.")

    # 비교표 — 종목마다 1억 기준 월 분배금을 다시 계산한다.
    cmp_hdr, _ = find_label(ws, "종목명", cols=(1,))
    if cmp_hdr:
        for i, it in enumerate(adopted):
            rr = cmp_hdr + 1 + i
            q = math.floor(100_000_000 / it["price"])
            want = q * it["price"] * (it["distTtmRate"] / 100) / 12
            got = val(f"F{rr}")
            if not near(got, want):
                fail(f"비교표 F{rr} ({it['name']}): {got} ≠ 손계산 {want:,.0f}")
        notes.append(f"비교표 {len(adopted)}종목의 1억 기준 월 분배금을 다시 계산해 맞췄습니다.")

    if not problems:
        notes.append(
            f"검산 통과 — {picked}: {amount:,.0f}원 → {qty:,}주, "
            f"월 세전 {invested * ttm / 12:,.0f}원 / 연 {ttm:.2%}"
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
