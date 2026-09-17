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
  7. [종목조회] 가 조건 조합마다 손으로 고른 것과 같은 종목을 내놓는가

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
    "J": "연환산 분배율", "K": "분배 기록수", "L": "최근 분배기준일", "M": "채택", "N": "제외 사유", "O": "기초지수", "P": "유형", "Q": "자산군",
    "R": "지급주기", "S": "연 지급횟수",
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
    # 콤보박스가 가리키는 이름이 바뀌었다 — 검색으로 좁힌 목록(검색결과)을 본다.
    # 계산이 쓰는 목록은 여전히 선택가능종목이고, 그쪽은 아래에서 따로 본다.
    dv_etf = next((d for d in dvs if "검색결과" in (d.formula1 or "")), None)
    dv_mode = next((d for d in dvs if "비율" in (d.formula1 or "")), None)
    if dv_etf is None:
        fail("[제안서] 에 ETF 목록 콤보박스(검색결과)가 없습니다.")
    else:
        cells = str(dv_etf.sqref)
        sel = ws[cells.split()[0].split(":")[0]]
        # 첫 줄은 이제 '담긴수=0 이면 기본 종목' 수식이다. 수식 글자에서
        # 기본 종목 이름을 꺼내 본다(따옴표 안의 첫 글자 뭉치).
        sel_name = sel.value
        if isinstance(sel_name, str) and sel_name.startswith("="):
            m = re.search(r'"((?:[^"]|"")+)"', sel_name)
            sel_name = m.group(1).replace('""', '"') if m else None
        sel = type("C", (), {"value": sel_name, "coordinate": sel.coordinate})()
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
    # 비교표는 이제 **연 분배율 상위 + 순자산 상위** 를 합쳐 뽑으므로 줄이
    # 이어지지 않는다. 그러니 "차례대로인가" 가 아니라 "채택 구간 안인가,
    # 겹치지 않는가" 를 본다.
    if seen:
        if len(set(seen)) != len(seen):
            dup = [x for x in set(seen) if seen.count(x) > 1]
            fail(f"비교표에 같은 종목이 두 번 실렸습니다 (ETF데이터 {dup}행).")
        out = [x for x in seen if not (first <= x <= last_adopted)]
        if out:
            fail(f"비교표가 채택 구간({first}~{last_adopted}행) 밖을 가리킵니다: {out}")
        if not problems:
            notes.append(f"비교표 {len(seen)}행이 채택 {len(adopted)}종목 안을 겹치지 않고 가리킵니다.")

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
        # 종목 칸은 이제 [종목조회] 의 '담기' 를 받아 오는 수식이다. 칸에 적힌
        # 글자(수식)가 아니라 **계산해서 나온 값**을 봐야 한다.
        name = val(f"B{rr}")
        if isinstance(name, str):
            name = name.strip()
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
    # 줄마다 **그 줄이 가리키는** 종목으로 계산한다. 예전처럼 adopted[i] 를
    # 쓰면 비교표를 다르게 뽑는 순간 엉뚱한 종목과 맞춰 보게 된다.
    cmp_hdr, _ = find_label(ws, "종목명", cols=(2,))
    if cmp_hdr and seen:
        for i, src in enumerate(seen):
            it = selectable[src - first]
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

    check_lookup(selectable, first, last)
    check_pick_and_search(selectable)

    # HTML 판이 같은 값을 내는지 맞춰 볼 수 있게, 엑셀을 **실제로 계산해서 나온**
    # 값을 적어 둔다. scripts/check_etf_html.mjs 가 이 파일을 읽어 브라우저에
    # 찍힌 값과 견준다. 두 구현이 서로 다른 언어로 따로 계산한 값이 맞아떨어져야
    # 통과다 — 같은 자료로 두 벌을 만들면서 둘이 어긋나면 하나만 있는 것보다 나쁘다.
    if not problems:
        pick = val(f"B{p_hdr0 + 1}")
        if isinstance(pick, str):
            pick = pick.strip()
        it0 = next((x for x in selectable if x["name"] == pick), None)
        exp = {
            "defaultName": pick,
            "defaultFreq": (it0 or {}).get("payoutFreq") or "",
            "amount": amount,
            "invest": round(tot_invest),
            "pre": round(tot_pre),
            "post": round(tot_pre * (1 - tax)),
            "annRate": round(w_ann * 100, 2),
            "compareCount": len(seen),
        }
        out = ROOT / "discovery" / "etf-expected.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(exp, ensure_ascii=False, indent=2), encoding="utf-8")
        notes.append(f"엑셀 검산값을 {out.relative_to(ROOT)} 에 적었습니다 (HTML 대조용).")

    return report()


# ── [종목조회] 검산 ────────────────────────────────────────────────────
def check_pick_and_search(selectable) -> None:
    """'담기' 와 '종목 검색' 이 실제로 도는지 본다.

    둘 다 **다른 장에 값을 옮기는** 기능이라, 칸 주소가 한 칸만 밀려도 조용히
    아무 일도 일어나지 않는다. 오류 표시도 안 뜬다 — O 를 넣었는데 제안서가
    그대로인 것을 사람이 알아채야 한다. 그래서 기계가 본다.

    파일을 손대지 않고, 사본에 O 를 넣고 검색어를 넣어 **다시 계산해서** 본다.
    """
    import tempfile

    wb = load_workbook(XLSX)
    lk, ws = wb["종목조회"], wb["제안서"]

    first = None
    for row in lk.iter_rows(min_col=2, max_col=2):
        for c in row:
            if isinstance(c.value, str) and c.value.startswith("=IF($K"):
                first = c.row
                break
        if first:
            break
    if first is None:
        fail("[종목조회] 결과 표를 못 찾아 '담기' 를 시험하지 못했습니다.")
        return

    scell = None
    for row in ws.iter_rows(min_col=4, max_col=4):
        for c in row:
            if isinstance(c.value, str) and c.value.strip() == "종목 검색":
                scell = f"E{c.row}"
                break
        if scell:
            break
    if scell is None:
        fail("[제안서] 에서 '종목 검색' 칸을 못 찾았습니다.")
        return

    # 1번째·3번째 줄을 담고, 검색어를 넣는다. 한 번만 계산해 둘 다 본다.
    lk.cell(first, 10).value = "O"
    lk.cell(first + 2, 10).value = "O"
    ws[scell] = TERM = "커버드콜"
    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tf:
        tmp = Path(tf.name)
    wb.save(tmp)
    v2 = evaluate(tmp)
    tmp.unlink(missing_ok=True)
    if v2 is None:
        return

    g = lambda sh, ref: v2.get((sh, ref))  # noqa: E731

    # ── 담기 → 제안서 ──
    n1, n3 = g("종목조회", f"B{first}"), g("종목조회", f"B{first + 2}")
    b20, b21, b22 = g("제안서", "B20"), g("제안서", "B21"), g("제안서", "B22")
    if b20 != n1:
        fail(f"'담기' 가 안 먹습니다 — 1번째로 담은 '{n1}' 대신 제안서 B20 에 '{b20}' 이 있습니다.")
    elif b21 != n3:
        fail(f"'담기' 두 번째가 안 먹습니다 — '{n3}' 대신 B21 에 '{b21}' 이 있습니다.")
    elif b22 not in ("", None):
        fail(f"두 종목만 담았는데 B22 에 '{b22}' 이 남아 있습니다.")
    else:
        notes.append(f"'담기' 두 종목이 [제안서] 에 그대로 올라옵니다 ('{n1}' 외 1).")

    # ── 검색 → 목록 좁히기 ──
    # X 칸에 위에서부터 걸린 종목만 빈칸 없이 쌓여야 한다.
    got = []
    r = 4
    while True:
        x = g("ETF데이터", f"X{r}")
        if x is None or x == "":
            break
        got.append(x)
        r += 1
    want = [x["name"] for x in selectable if TERM in x["name"]]
    off = [x for x in got if TERM not in x]
    if off:
        fail(f"'{TERM}' 검색에 엉뚱한 종목이 섞였습니다: {off[:3]}")
    elif len(got) != len(want):
        fail(f"'{TERM}' 검색 결과가 {len(got)}종목인데 원천에는 {len(want)}종목입니다.")
    else:
        notes.append(f"'종목 검색' 이 '{TERM}' 로 {len(got)}종목까지 목록을 좁힙니다.")


def check_lookup(selectable, first_sel, last_sel) -> None:  # noqa: ARG001
    """조건을 바꿔 가며 실제로 계산시키고, 손으로 고른 것과 맞춰 본다.

    이 장은 눈으로 봐서는 맞는지 알 수 없다. 조건을 걸면 종목이 몇 줄 나오는데
    그것이 **정말 그 조건에 맞는 종목인지**는 데이터 장 900줄을 손으로 훑어야
    알 수 있고, 매월 1일 자동으로 다시 만들어지므로 사람이 매번 그럴 수도 없다.
    그래서 조건 조합마다 기계가 직접 골라 보고 맞춰 본다.

    한 줄 어긋난 참조는 여기서 특히 위험하다. 조회 결과가 조용히 한 칸씩
    밀리면, 담당자는 "분기배당 5% 이상" 을 걸어 놓고 월배당 2% 짜리를
    분기배당이라 믿고 고르게 된다.
    """
    import shutil
    import tempfile

    from openpyxl import load_workbook as _load

    wb = _load(XLSX)
    if "종목조회" not in wb.sheetnames:
        fail("[종목조회] 장이 없습니다.")
        return
    lk = wb["종목조회"]
    cond_row, _ = find_label(lk, "지급주기", cols=(2,))
    if not cond_row:
        fail("[종목조회] 에서 '지급주기' 조건 칸을 못 찾았습니다.")
        return
    first_hit = None
    for row in lk.iter_rows(min_col=2, max_col=2):
        for c in row:
            if isinstance(c.value, str) and c.value.startswith("=IF($K"):
                first_hit = c.row
                break
        if first_hit:
            break
    if not first_hit:
        fail("[종목조회] 에서 결과 표의 첫 줄을 못 찾았습니다.")
        return

    # 손으로 고르는 쪽. 데이터 장의 차례(채택 먼저, 그 안에서 연 분배율 높은
    # 순)를 그대로 따른다 — 조회 결과도 그 차례로 나오기 때문이다.
    def expect(freq, lo, hi):
        out = []
        for x in selectable:
            r = x.get("distTtmRate")
            if r is None:
                continue
            f = x.get("payoutFreq") or ""
            f = "판정 불가" if f.startswith("판정 불가") else f
            if freq != "전체" and f != freq:
                continue
            if not (lo - 1e-9 <= r / 100 <= hi + 1e-9):
                continue
            out.append(x["name"])
        return out

    # 주기 3가지 × 분배율 구간 3가지. 자료에 실제로 있는 주기로 고른다 —
    # 한 종목도 없는 조건만 시험하면 "빈 칸이 나온다" 만 확인하게 된다.
    have = []
    for x in selectable:
        f = x.get("payoutFreq") or ""
        f = "판정 불가" if f.startswith("판정 불가") else f
        if f and f not in have:
            have.append(f)
    freqs = ["전체"] + have[:3]
    bands = [(0.0, 1.0), (0.05, 1.0), (0.0, 0.03)]

    combos = [(f, lo, hi) for f in freqs for lo, hi in bands]
    tmpdir = Path(tempfile.mkdtemp())
    try:
        checked = 0
        nonempty = 0
        widest = 0
        for freq, lo, hi in combos:
            lk.cell(row=cond_row, column=3).value = freq
            lk.cell(row=cond_row + 1, column=3).value = lo
            lk.cell(row=cond_row + 2, column=3).value = hi
            probe = tmpdir / f"lk_{checked}.xlsx"
            wb.save(probe)
            cells = evaluate(probe)
            if cells is None:
                return
            want = expect(freq, lo, hi)
            got = []
            for k in range(LOOKUP_ROWS_MAX):
                v = cells.get(("종목조회", f"B{first_hit + k}"))
                if v in (None, "", 0):
                    break
                got.append(v)
            label = f"{freq} / {lo:.0%}~{hi:.0%}"
            # 결과 줄 수에 상한이 있으므로, 조건에 맞는 것이 더 많으면
            # 앞에서부터 그만큼만 나오는 것이 맞다.
            want_cut = want[:LOOKUP_ROWS_MAX]
            if got != want_cut:
                fail(
                    f"[종목조회] {label}: {len(got)}종목이 나왔는데 손으로 고르면 "
                    f"{len(want_cut)}종목입니다. "
                    f"처음 다른 자리 — 나온 값 {got[:3]} / 손계산 {want_cut[:3]}"
                )
                return
            # 개수 칸도 함께 본다. 표는 60줄에서 잘리지만 개수는 전부 세야 한다.
            n_cell = cells.get(("종목조회", f"C{cond_row + 3}"))
            if n_cell is not None and not near(n_cell, len(want), tol=0.5):
                fail(f"[종목조회] {label}: 개수 칸 {n_cell} ≠ 손계산 {len(want)}")
                return
            checked += 1
            if got:
                nonempty += 1
                widest = max(widest, len(got))
        # 아홉 조합이 전부 빈 결과였어도 "다 맞았다" 가 된다. 빈 것끼리 맞춰
        # 놓고 검증했다고 할 수는 없다. 적어도 몇 조합은 실제로 종목을
        # 내놓아야 이 검사가 무언가를 본 것이다.
        if nonempty < 3:
            fail(
                f"[종목조회] 조건 {checked}조합 중 종목이 나온 것이 {nonempty}개뿐입니다 — "
                "빈 결과끼리 맞춘 것이라 검사가 아무것도 보지 못했습니다."
            )
            return
        notes.append(
            f"[종목조회] 조건 {checked}조합을 실제로 계산해 손계산과 맞췄습니다 "
            f"(종목이 나온 조합 {nonempty}개, 가장 많이 나온 조합 {widest}종목)."
        )
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


# build_etf_proposal.py 의 LOOKUP_ROWS 와 같아야 한다.
LOOKUP_ROWS_MAX = 60


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
