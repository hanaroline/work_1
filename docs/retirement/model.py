#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""은퇴자산 운용 제안서 재무 모델 (기준일 2026-09-07)

금액 단위는 억원, 수익률은 연율 %.
상품별 분배율·총수익(TR)·보수·순자산은 etf_data.json 에서 읽는다 (실측치).
기대 총수익률만 설계 가정이며, 아래 EXPECTED 에 근거와 함께 명시한다.
슬라이드에 인쇄되는 모든 수치는 이 스크립트의 출력에서 가져온다.
"""
from __future__ import annotations

import json
import pathlib

AS_OF = "2026-09-07"
_HERE = pathlib.Path(__file__).parent
ETF = json.loads((_HERE / "etf_data.json").read_text(encoding="utf-8"))
E = ETF["etfs"]

# ---------------------------------------------------------------- 1. 자산 현황
ASSETS = [
    ("퇴직연금 DC (현금성 방치)", 6.40, True,  "본인"),
    ("개인 IRP",                  0.88, True,  "본인"),
    ("은행 5년 정기예금 (연 5%)", 3.70, False, "본인"),
    ("증권 현금",                 2.00, True,  "본인"),
    ("국내·해외주식 (유지)",       2.40, False, "본인"),
    ("배우자 보유자산",            4.00, True,  "배우자"),
]
TOTAL        = sum(a[1] for a in ASSETS)
SELF_TOTAL   = sum(a[1] for a in ASSETS if a[3] == "본인")
SPOUSE_TOTAL = sum(a[1] for a in ASSETS if a[3] == "배우자")
REALLOCABLE  = sum(a[1] for a in ASSETS if a[2])
LOCKED       = TOTAL - REALLOCABLE

# ---------------------------------------------------------------- 2. 지출 / 연금
LIVING_LOW, LIVING_HIGH = 600.0, 700.0
LIVING_BASE = (LIVING_LOW + LIVING_HIGH) / 2
PARENTS     = 100.0
NEED_LOW    = LIVING_LOW + PARENTS
NEED_HIGH   = LIVING_HIGH + PARENTS
NEED_BASE   = LIVING_BASE + PARENTS
SPOUSE_PENSION = 280.0
NPS_SELF       = 250.0
WEDDING        = 3.00

# ---------------------------------------------------------------- 3. 목표
TARGET_RETURN = 7.00
TARGET_INCOME = TOTAL * TARGET_RETURN / 100
DEPOSIT_RATE = 5.00     # 확정 (고객 제공)
EQUITY_RATE  = 8.00     # 가정
EQUITY_DIV   = 1.50     # 가정

deposit_income = 3.70 * DEPOSIT_RATE / 100
equity_income  = 2.40 * EQUITY_RATE / 100
required_new   = TARGET_INCOME - deposit_income - equity_income
required_rate  = required_new / REALLOCABLE * 100

# ---------------------------------------------------------------- 4. 기대수익률 가정
# 규칙: 분배율을 기대수익률로 쓰지 않는다.
#  · 3년 실측 TR 이 있는 상품 → 그 값의 55~65% 수준으로 감액 적용
#  · 3년 실측이 없는 상품     → 1년 실측 TR 과 분배율을 함께 보고 보수적으로 설정
#  · 1년 TR 이 음수인 상품    → 분배율과 무관하게 저수익 자산으로 취급
EXPECTED = {
    "458760": (8.6, "3년 실측 TR 12.63% → 68% 감액 적용"),
    "441640": (8.9, "3년 실측 TR 17.30% → 51% 감액 적용"),
    "441680": (9.4, "3년 실측 TR 13.95% → 67% 감액 적용"),
    "458730": (8.0, "3년 실측 TR 16.29% → 49% 감액 적용"),
    "329200": (6.0, "3년 실측 TR 4.73% + 분배율 9.77% 절충"),
    "0008S0": (9.0, "3년 실측 없음. 1년 TR 25.43%·분배율 11.75% → 보수 설정"),
    "486290": (9.5, "3년 실측 없음. 1년 TR 21.27%·분배율 15.86% → 보수 설정"),
    "476550": (3.5, "1년 TR -2.26%. 분배율 13.35%는 원금 반환분 포함 → 저수익 취급"),
    "0043B0": (3.1, "1년 실측 TR 3.13% 그대로 적용"),
    "0119H0": (3.4, "만기(2028-12) 보유 전제. YTM 미확인 — 확인 필요"),
}
GIC_RATE = (3.0, "IRP 원리금보장 정기예금 금리 가정")

# ---------------------------------------------------------------- 5. 포트폴리오
# (코드, 금액[억], 분류)  — 이름·분배율·보수는 etf_data.json 에서 조회
TRACK_A = [   # DC→IRP 7.28억 · 안전자산 30% 이상 의무
    ("0043B0", 0.80, "안전"),
    ("0119H0", 0.80, "안전"),
    ("GIC",    0.60, "안전"),
    ("458760", 1.40, "위험"),
    ("441640", 1.30, "위험"),
    ("441680", 1.10, "위험"),
    ("329200", 0.68, "위험"),
    ("476550", 0.60, "위험"),
]
TRACK_B = [   # 증권 일반계좌 2.00억
    ("0008S0", 0.55, "인컴"),
    ("441640", 0.50, "인컴"),
    ("486290", 0.40, "인컴"),
    ("329200", 0.25, "인컴"),
    ("0043B0", 0.30, "유동"),
]
TRACK_C = [   # 배우자 4.00억
    ("458760", 1.00, "인컴"),
    ("441640", 0.90, "인컴"),
    ("441680", 0.70, "인컴"),
    ("458730", 0.60, "배당"),
    ("329200", 0.40, "인컴"),
    ("0043B0", 0.40, "유동"),
]

GIC_META = {"name": "원리금보장 정기예금 (IRP 예금)", "ter": None, "aumEok": None,
            "dividendYield": 0.0, "trY1": None, "trY3": None}


def meta(code):
    return GIC_META if code == "GIC" else E[code]


def exp_ret(code):
    return GIC_RATE[0] if code == "GIC" else EXPECTED[code][0]


def exp_basis(code):
    return GIC_RATE[1] if code == "GIC" else EXPECTED[code][1]


def cash_yield(code):
    return meta(code)["dividendYield"] or 0.0


def summarize(track):
    amt = sum(r[1] for r in track)
    inc = sum(r[1] * exp_ret(r[0]) / 100 for r in track)
    cash = sum(r[1] * cash_yield(r[0]) / 100 for r in track)
    return amt, inc, inc / amt * 100, cash, cash / amt * 100


a_amt, a_inc, a_rate, a_cash, a_cashr = summarize(TRACK_A)
b_amt, b_inc, b_rate, b_cash, b_cashr = summarize(TRACK_B)
c_amt, c_inc, c_rate, c_cash, c_cashr = summarize(TRACK_C)

safe_amt = sum(r[1] for r in TRACK_A if r[2] == "안전")
safe_pct = safe_amt / a_amt * 100
safe_inc = sum(r[1] * exp_ret(r[0]) / 100 for r in TRACK_A if r[2] == "안전")
safe_rate = safe_inc / safe_amt * 100
risk_amt = a_amt - safe_amt
risk_rate = (a_inc - safe_inc) / risk_amt * 100

new_amt  = a_amt + b_amt + c_amt
new_inc  = a_inc + b_inc + c_inc
new_rate = new_inc / new_amt * 100
port_income = deposit_income + equity_income + new_inc
port_rate   = port_income / TOTAL * 100
gap_pp      = port_rate - TARGET_RETURN

# ---------------------------------------------------------------- 6. 자산군 집계
CLASS_MAP = {
    "458760": "미국 배당+커버드콜", "0008S0": "미국 배당+커버드콜",
    "441640": "미국 배당+커버드콜",
    "441680": "나스닥100 커버드콜", "486290": "나스닥100 커버드콜",
    "329200": "국내 리츠·인프라",
    "458730": "미국 배당성장",
    "476550": "미국 장기국채 커버드콜",
    "0043B0": "머니마켓·파킹", "0119H0": "만기매칭 회사채", "GIC": "원리금보장",
}
classes: dict[str, float] = {}
for code, amt, _ in TRACK_A + TRACK_B + TRACK_C:
    k = CLASS_MAP[code]
    classes[k] = classes.get(k, 0) + amt
classes["은행 정기예금(만기보유)"] = 3.70
classes["기존 보유주식(유지)"] = 2.40

# ---------------------------------------------------------------- 7. DC 기회비용
CASH_PARK_RATE = 2.50
dc_gap_rate = a_rate - CASH_PARK_RATE
dc_cost_yr  = 6.40 * dc_gap_rate / 100
MONTHS_TO_RETIRE = 34
dc_cost_total = dc_cost_yr * MONTHS_TO_RETIRE / 12

# ---------------------------------------------------------------- 8. 예금 만기
DEP_YEARS, INT_TAX = 5, 15.4
dep_interest_gross = 3.70 * DEPOSIT_RATE / 100 * DEP_YEARS
dep_interest_net = dep_interest_gross * (1 - INT_TAX / 100)
dep_maturity_net = 3.70 + dep_interest_net
dep_after_wedding = dep_maturity_net - WEDDING

# 예금 만기 후(Phase 3~) 전체 기대수익률
p3_income_assets = new_amt + dep_after_wedding
p3_total = p3_income_assets + 2.40
p3_income = p3_income_assets * new_rate / 100 + equity_income
p3_rate = p3_income / p3_total * 100

# ---------------------------------------------------------------- 9. 단계별 현금흐름
def monthly(amount_eok, rate):
    return amount_eok * rate / 100 * 10000 / 12


m_general = monthly(b_amt, b_cashr)
m_spouse  = monthly(c_amt, c_cashr)
m_equity  = monthly(2.40, EQUITY_DIV)
m_reinv   = monthly(dep_after_wedding, c_cashr)

phase1_income = m_spouse + m_general + m_equity
phase1_gap    = NEED_BASE - SPOUSE_PENSION - phase1_income
phase3_income = phase1_income + m_reinv
phase3_gap    = NEED_BASE - SPOUSE_PENSION - phase3_income
phase4_gap    = NEED_BASE - SPOUSE_PENSION - NPS_SELF - phase3_income

# 연금계좌 인컴(계좌 내 재투자분)
m_pension_cash = monthly(a_amt, a_cashr)

# ---------------------------------------------------------------- 10. 세제
FIN_INCOME_LIMIT, PENSION_SEP_LIMIT = 2000.0, 1500.0
self_fin_income   = b_cash * 10000 + 2.40 * EQUITY_DIV / 100 * 10000
spouse_fin_income = c_cash * 10000
couple_fin = self_fin_income + spouse_fin_income
ISA_ANNUAL = 2000.0
isa_years = MONTHS_TO_RETIRE / 12
isa_movable = ISA_ANNUAL * isa_years * 2 / 10000
avg_general_cash = (b_cash + c_cash) / (b_amt + c_amt) * 100
isa_shielded = isa_movable * avg_general_cash / 100 * 10000

# ---------------------------------------------------------------- 11. 분배율 함정
TRAP = ["476550", "481060", "473330", "484790", "453850", "476800", "451540"]


def line(c="-", n=100):
    print(c * n)


if __name__ == "__main__":
    print(f"은퇴자산 운용 제안서 재무 모델 · 기준일 {AS_OF}")
    print(f"ETF 실측 데이터: {ETF['provider']} 수집 {ETF['collectedAt'][:10]} · "
          f"수익률 기준일 {ETF['retAsOf']} · 국내 상장 {ETF['universeCount']}종")
    line("=")

    print("[1] 자산 현황 (억원)")
    for label, amt, movable, owner in ASSETS:
        print(f"  {owner:<4} {label:<28} {amt:>5.2f}  "
              f"{'즉시 재배치' if movable else '고정(만기/유지)'}")
    print(f"  본인 {SELF_TOTAL:.2f} / 배우자 {SPOUSE_TOTAL:.2f} / 가구 {TOTAL:.2f}")
    print(f"  즉시 재배치 {REALLOCABLE:.2f} ({REALLOCABLE/TOTAL*100:.1f}%) / "
          f"고정 {LOCKED:.2f} ({LOCKED/TOTAL*100:.1f}%)")

    line()
    print("[2] 목표 연 7% 요구조건")
    print(f"  목표 수익 {TOTAL:.2f} x {TARGET_RETURN:.2f}% = {TARGET_INCOME:.4f}억")
    print(f"  예금 {deposit_income:.4f} + 주식 {equity_income:.4f} 기여 제외 → "
          f"신규 {REALLOCABLE:.2f}억이 {required_new:.4f}억 = {required_rate:.2f}% 필요")

    line()
    print("[3] 트랙별 포트폴리오 (분배율·TR·보수·순자산 = 실측)")
    for nm, tr, amt, rate, cashr in (
        ("A. DC→IRP 연금자산", TRACK_A, a_amt, a_rate, a_cashr),
        ("B. 증권 일반계좌",   TRACK_B, b_amt, b_rate, b_cashr),
        ("C. 배우자 자산",     TRACK_C, c_amt, c_rate, c_cashr),
    ):
        print(f"  {nm}: {amt:.2f}억 · 기대총수익 {rate:.2f}% · 실측분배율 {cashr:.2f}%")
        print(f"      {'상품':<38} {'코드':<7} {'금액':>5} {'비중':>6} "
              f"{'분배율':>7} {'TR1Y':>7} {'TR3Y':>7} {'보수':>5} {'기대':>6}")
        for code, pamt, cls in tr:
            m = meta(code)
            print(f"      {m['name'][:37]:<38} {code:<7} {pamt:>5.2f} "
                  f"{pamt/amt*100:>5.1f}% {m['dividendYield']:>6.2f}% "
                  f"{(f'{m[chr(116)+chr(114)+chr(89)+chr(49)]:.2f}%' if m['trY1'] is not None else '-'):>7} "
                  f"{(f'{m[chr(116)+chr(114)+chr(89)+chr(51)]:.2f}%' if m['trY3'] is not None else '-'):>7} "
                  f"{(f'{m[chr(116)+chr(101)+chr(114)]}' if m['ter'] is not None else '-'):>5} "
                  f"{exp_ret(code):>5.1f}% [{cls}]")
    print(f"  연금계좌 안전자산 {safe_amt:.2f}억 = {safe_pct:.1f}% (규정 30% 이상) "
          f"{'충족' if safe_pct >= 30 else '미달'} · 안전 {safe_rate:.2f}% / 위험 {risk_rate:.2f}%")
    print(f"  신규 운용 {new_amt:.2f}억 · 가중 기대수익률 {new_rate:.2f}% (요구 {required_rate:.2f}%)")

    line()
    print("[4] 전체 포트폴리오 기대수익률")
    print(f"  {deposit_income:.4f} + {equity_income:.4f} + {new_inc:.4f} = "
          f"{port_income:.4f}억 / {TOTAL:.2f}억 = {port_rate:.2f}%")
    print(f"  목표 {TARGET_RETURN:.2f}% 대비 {gap_pp:+.2f}%p")
    print(f"  예금 만기 후(2031~) 재투자 시: {p3_income:.4f}억 / {p3_total:.2f}억 = "
          f"{p3_rate:.2f}%  → 목표 {p3_rate - TARGET_RETURN:+.2f}%p")
    print(f"  ※ 갭의 원인: 안전자산 30% 의무 {safe_amt:.2f}억이 {safe_rate:.2f}%에 묶임 "
          f"(위험자산 수준 {risk_rate:.2f}% 적용 시 +{safe_amt*(risk_rate-safe_rate)/100/TOTAL*100:.2f}%p)")

    line()
    print("[5] 자산군별 배분")
    for k, v in sorted(classes.items(), key=lambda x: -x[1]):
        print(f"  {k:<26} {v:>5.2f}억  {v/TOTAL*100:>5.1f}%")
    print(f"  합계 {sum(classes.values()):.2f}억 · 직접 주식 {2.40/TOTAL*100:.1f}% (신규 편입 0)")

    line()
    print("[6] DC 기회비용 / 예금 만기")
    print(f"  현금성 {CASH_PARK_RATE:.2f}% vs 제안 {a_rate:.2f}% → 격차 {dc_gap_rate:.2f}%p")
    print(f"  연 {dc_cost_yr*10000:.0f}만원 · {MONTHS_TO_RETIRE}개월 누적 {dc_cost_total*10000:.0f}만원")
    print(f"  예금 만기 세후 원리금 {dep_maturity_net:.4f}억 → 결혼 {WEDDING:.2f}억 → "
          f"재투자 {dep_after_wedding:.4f}억")

    line()
    print("[7] 단계별 월 현금흐름 (만원/월, 필요 750)")
    print(f"  월 인컴: 증권일반 {m_general:.0f} / 배우자 {m_spouse:.0f} / "
          f"주식배당 {m_equity:.0f} / 예금만기 재투자 {m_reinv:.0f}")
    print(f"  (참고) 연금계좌 내 분배금 {m_pension_cash:.0f} — 계좌 내 재투자, 생활비 재원 아님")
    print(f"  P1 2029.7~2031 : {SPOUSE_PENSION:.0f} + {phase1_income:.0f} = "
          f"{SPOUSE_PENSION+phase1_income:.0f} → "
          f"{'부족' if phase1_gap>0 else '여유'} {abs(phase1_gap):.0f}")
    print(f"  P3 2031~2034   : {SPOUSE_PENSION:.0f} + {phase3_income:.0f} = "
          f"{SPOUSE_PENSION+phase3_income:.0f} → "
          f"{'부족' if phase3_gap>0 else '여유'} {abs(phase3_gap):.0f}")
    print(f"  P4 2034~       : {SPOUSE_PENSION+NPS_SELF:.0f} + {phase3_income:.0f} = "
          f"{SPOUSE_PENSION+NPS_SELF+phase3_income:.0f} → 여유 {-phase4_gap:.0f}")
    if phase1_gap > 0:
        print(f"  P1 연금계좌 연 인출 {phase1_gap*12:.0f}만원 "
              f"({'1,500만원 이내' if phase1_gap*12 <= PENSION_SEP_LIMIT else '1,500만원 초과'})")

    line()
    print("[8] 세제 점검 (만원/년)")
    print(f"  본인 일반계좌 금융소득 {self_fin_income:.0f} vs 기준 {FIN_INCOME_LIMIT:.0f} → "
          f"{'초과' if self_fin_income > FIN_INCOME_LIMIT else '이내'}")
    print(f"  배우자 금융소득 {spouse_fin_income:.0f} vs 기준 {FIN_INCOME_LIMIT:.0f} → "
          f"{'초과' if spouse_fin_income > FIN_INCOME_LIMIT else '이내'}")
    print(f"  부부 합산 {couple_fin:.0f} · ISA 이전가능 {isa_movable:.2f}억 → "
          f"약 {isa_shielded:.0f}만원 차단 → 잔여 {couple_fin - isa_shielded:.0f}만원")

    line()
    print("[9] 분배율 함정 점검 — 고분배 대비 총수익 (실측)")
    print(f"  {'상품':<40} {'코드':<7} {'분배율':>7} {'TR1Y':>8} {'TR3Y':>8}  판정")
    for code in TRAP:
        m = E[code]
        y1 = m["trY1"]
        verdict = "제외/축소 — 분배가 원금 잠식" if (y1 is not None and y1 < 0) else "채택 가능"
        print(f"  {m['name'][:39]:<40} {code:<7} {m['dividendYield']:>6.2f}% "
              f"{(f'{y1:.2f}%' if y1 is not None else '-'):>8} "
              f"{(f'{m[chr(116)+chr(114)+chr(89)+chr(51)]:.2f}%' if m['trY3'] is not None else '-'):>8}  {verdict}")
    line("=")


def export():
    """빌드용 값 내보내기 — build_deck.js 가 이 파일을 읽는다."""
    import json as _j

    def rows(track, amt):
        out = []
        for code, pamt, cls in track:
            m = meta(code)
            out.append({
                "code": code, "name": m["name"], "amt": round(pamt, 2),
                "w": round(pamt / amt * 100, 1), "cls": cls,
                "dy": m["dividendYield"], "trY1": m["trY1"], "trY3": m["trY3"],
                "ter": m["ter"], "aum": m["aumEok"], "exp": exp_ret(code),
                "basis": exp_basis(code),
            })
        return out

    masters = {}
    for tname, track, amt in (("A", TRACK_A, a_amt), ("B", TRACK_B, b_amt),
                              ("C", TRACK_C, c_amt)):
        for r in rows(track, amt):
            k = r["code"]
            masters.setdefault(k, {**{x: r[x] for x in
                ("code", "name", "dy", "trY1", "trY3", "ter", "aum", "exp", "basis")},
                "A": 0.0, "B": 0.0, "C": 0.0, "cls": r["cls"]})
            masters[k][tname] += r["amt"]
    for k, v in masters.items():
        v["total"] = round(v["A"] + v["B"] + v["C"], 2)

    d = {
        "asOf": AS_OF, "etfMeta": {"provider": ETF["provider"],
            "collectedAt": ETF["collectedAt"][:10], "retAsOf": ETF["retAsOf"],
            "universeCount": ETF["universeCount"], "source": ETF["source"]},
        "total": round(TOTAL, 2), "self": round(SELF_TOTAL, 2),
        "spouse": round(SPOUSE_TOTAL, 2), "realloc": round(REALLOCABLE, 2),
        "locked": round(LOCKED, 2),
        "reallocPct": round(REALLOCABLE / TOTAL * 100, 1),
        "lockedPct": round(LOCKED / TOTAL * 100, 1),
        "needBase": NEED_BASE, "needLow": NEED_LOW, "needHigh": NEED_HIGH,
        "spousePension": SPOUSE_PENSION, "npsSelf": NPS_SELF, "wedding": WEDDING,
        "target": TARGET_RETURN, "targetIncome": round(TARGET_INCOME, 4),
        "depositRate": DEPOSIT_RATE, "equityRate": EQUITY_RATE,
        "depositIncome": round(deposit_income, 4), "equityIncome": round(equity_income, 4),
        "requiredRate": round(required_rate, 2),
        "trackA": round(a_amt, 2), "trackB": round(b_amt, 2), "trackC": round(c_amt, 2),
        "rateA": round(a_rate, 2), "rateB": round(b_rate, 2), "rateC": round(c_rate, 2),
        "cashA": round(a_cashr, 2), "cashB": round(b_cashr, 2), "cashC": round(c_cashr, 2),
        "safeAmt": round(safe_amt, 2), "safePct": round(safe_pct, 1),
        "safeRate": round(safe_rate, 2), "riskRate": round(risk_rate, 2),
        "regCostPp": round(safe_amt * (risk_rate - safe_rate) / 100 / TOTAL * 100, 2),
        "newAmt": round(new_amt, 2), "newInc": round(new_inc, 4),
        "newRate": round(new_rate, 2),
        "portIncome": round(port_income, 4), "portRate": round(port_rate, 2),
        "gapPp": round(gap_pp, 2),
        "p3Rate": round(p3_rate, 2), "p3GapPp": round(p3_rate - TARGET_RETURN, 2),
        "p3Total": round(p3_total, 2), "p3Income": round(p3_income, 4),
        "cashParkRate": CASH_PARK_RATE, "dcGapRate": round(dc_gap_rate, 2),
        "dcCostYr": round(dc_cost_yr * 10000), "dcCostTotal": round(dc_cost_total * 10000),
        "monthsToRetire": MONTHS_TO_RETIRE,
        "depMaturity": round(dep_maturity_net, 2),
        "depReinvest": round(dep_after_wedding, 2),
        "depInterestNet": round(dep_interest_net, 4),
        "mGeneral": round(m_general), "mSpouse": round(m_spouse),
        "mEquity": round(m_equity), "mReinv": round(m_reinv),
        "mPensionCash": round(m_pension_cash),
        "p1Income": round(phase1_income), "p1Gap": round(phase1_gap),
        "p3Income": round(phase3_income), "p3Gap": round(phase3_gap),
        "p4Gap": round(phase4_gap),
        "selfFin": round(self_fin_income), "spouseFin": round(spouse_fin_income),
        "coupleFin": round(couple_fin), "isaMovable": round(isa_movable, 2),
        "isaShielded": round(isa_shielded), "finLimit": FIN_INCOME_LIMIT,
        "pensionSepLimit": PENSION_SEP_LIMIT,
        "classes": [{"name": k, "amt": round(v, 2), "pct": round(v / TOTAL * 100, 1)}
                    for k, v in sorted(classes.items(), key=lambda x: -x[1])],
        "equityPct": round(2.40 / TOTAL * 100, 1),
        "tracks": {"A": rows(TRACK_A, a_amt), "B": rows(TRACK_B, b_amt),
                   "C": rows(TRACK_C, c_amt)},
        "masters": sorted(masters.values(), key=lambda x: -x["total"]),
        "trap": [{"code": c, "name": E[c]["name"], "dy": E[c]["dividendYield"],
                  "trY1": E[c]["trY1"], "trY3": E[c]["trY3"],
                  "used": c in {r[0] for r in TRACK_A + TRACK_B + TRACK_C}}
                 for c in TRAP],
    }
    (_HERE / "deck_data.json").write_text(
        _j.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("deck_data.json 내보냄")


import sys as _sys
if "--export" in _sys.argv:
    export()
