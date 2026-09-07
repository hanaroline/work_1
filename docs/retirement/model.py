#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""은퇴자산 운용 제안서 재무 모델 (기준일 2026-09-07)

모든 금액 단위는 억원, 수익률은 연율 %.
슬라이드에 인쇄되는 모든 수치는 이 스크립트의 출력에서 가져온다.
"""
from __future__ import annotations

AS_OF = "2026-09-07"

# ---------------------------------------------------------------- 1. 자산 현황
# (라벨, 금액[억], 즉시운용가능 여부, 명의)
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
LIVING_LOW, LIVING_HIGH = 600.0, 700.0      # 만원/월
LIVING_BASE = (LIVING_LOW + LIVING_HIGH) / 2
PARENTS     = 100.0                          # 만원/월
NEED_LOW    = LIVING_LOW  + PARENTS
NEED_HIGH   = LIVING_HIGH + PARENTS
NEED_BASE   = LIVING_BASE + PARENTS

SPOUSE_PENSION = 280.0   # 만원/월, 2028년~
NPS_SELF       = 250.0   # 만원/월, 2034년~ (만 65세)
WEDDING        = 3.00    # 억, 2031년

# ---------------------------------------------------------------- 3. 목표수익률
TARGET_RETURN = 7.00                       # % (전체 자산 기준, 사용자 지정)
TARGET_INCOME = TOTAL * TARGET_RETURN / 100

DEPOSIT_RATE = 5.00                        # % 확정 (사용자 제공)
EQUITY_RATE  = 8.00                        # % 기대 (보유 주식 유지 가정)
EQUITY_DIV   = 1.50                        # % 현금배당 가정

deposit_income = 3.70 * DEPOSIT_RATE / 100
equity_income  = 2.40 * EQUITY_RATE  / 100
required_new   = TARGET_INCOME - deposit_income - equity_income
required_rate  = required_new / REALLOCABLE * 100

# ---------------------------------------------------------------- 4. 포트폴리오
# (상품명, 티커, 금액[억], 기대총수익률%, 현금분배율%, 분류)
TRACK_A = [  # DC→IRP 연금자산 7.28억 · 안전자산 30% 이상 의무
    ("TIGER 종합채권(AA-이상)액티브",        "451540", 1.00, 3.8,  3.3, "안전"),
    ("채권혼합형 커버드콜 ETF(주식 50% 미만)", "실행시 확정", 0.80, 6.5, 6.0, "안전"),
    ("원리금보장 정기예금(IRP 예금)",         "-",      0.40, 3.2,  0.0, "안전"),
    ("TIGER 미국배당다우존스타겟커버드콜2호", "458760", 1.70, 8.5,  8.5, "위험"),
    ("TIGER 미국30년국채커버드콜액티브(H)",   "476550", 1.40, 9.0, 12.0, "위험"),
    ("TIGER 미국나스닥100커버드콜(합성)",     "441680", 0.70, 9.5, 11.0, "위험"),
    ("TIGER 리츠부동산인프라",               "329200", 0.70, 8.0,  7.8, "위험"),
    ("TIGER 미국투자등급회사채액티브(H)",     "458260", 0.58, 5.5,  4.5, "위험"),
]
TRACK_B = [  # 증권 일반계좌 2.00억
    ("TIGER 미국배당다우존스타겟커버드콜2호", "458760", 0.60, 8.5,  8.5, "인컴"),
    ("TIGER 미국30년국채커버드콜액티브(H)",   "476550", 0.50, 9.0, 12.0, "인컴"),
    ("TIGER 미국나스닥100커버드콜(합성)",     "441680", 0.40, 9.5, 11.0, "인컴"),
    ("TIGER 리츠부동산인프라",               "329200", 0.20, 8.0,  7.8, "인컴"),
    ("파킹형 MMF·단기채 (유동성 버퍼)",       "-",      0.30, 3.2,  3.2, "유동"),
]
TRACK_C = [  # 배우자 4.00억
    ("TIGER 미국배당다우존스타겟커버드콜2호", "458760", 1.20, 8.5,  8.5, "인컴"),
    ("TIGER 미국30년국채커버드콜액티브(H)",   "476550", 0.65, 9.0, 12.0, "인컴"),
    ("TIGER 리츠부동산인프라",               "329200", 0.60, 8.0,  7.8, "인컴"),
    ("TIGER 미국배당다우존스",               "458730", 0.35, 7.5,  3.5, "배당"),
    ("TIGER 미국나스닥100커버드콜(합성)",     "441680", 0.30, 9.5, 11.0, "인컴"),
    ("TIGER 종합채권(AA-이상)액티브",        "451540", 0.40, 3.8,  3.3, "채권"),
    ("파킹형 MMF·단기채 (유동성 버퍼)",       "-",      0.50, 3.2,  3.2, "유동"),
]


def summarize(track):
    amt = sum(r[2] for r in track)
    inc = sum(r[2] * r[3] / 100 for r in track)
    cash = sum(r[2] * r[4] / 100 for r in track)
    return amt, inc, inc / amt * 100, cash, cash / amt * 100


a_amt, a_inc, a_rate, a_cash, a_cashr = summarize(TRACK_A)
b_amt, b_inc, b_rate, b_cash, b_cashr = summarize(TRACK_B)
c_amt, c_inc, c_rate, c_cash, c_cashr = summarize(TRACK_C)

safe_amt = sum(r[2] for r in TRACK_A if r[5] == "안전")
safe_pct = safe_amt / a_amt * 100

new_amt  = a_amt + b_amt + c_amt
new_inc  = a_inc + b_inc + c_inc
new_rate = new_inc / new_amt * 100

port_income = deposit_income + equity_income + new_inc
port_rate   = port_income / TOTAL * 100

# ---------------------------------------------------------------- 5. 자산군 집계
CLASS_MAP = {
    "451540": "국내 우량채권(AA-이상)",
    "458730": "미국 배당성장",
    "458260": "해외 투자등급 회사채",
    "476550": "미국 장기국채 커버드콜",
    "458760": "미국 배당+커버드콜",
    "441680": "나스닥100 커버드콜",
    "329200": "국내 리츠·인프라",
    "실행시 확정": "채권혼합 커버드콜",
    "-": "원리금보장·파킹",
}
classes: dict[str, float] = {}
for row in TRACK_A + TRACK_B + TRACK_C:
    classes[CLASS_MAP[row[1]]] = classes.get(CLASS_MAP[row[1]], 0) + row[2]
classes["은행 정기예금(만기보유)"] = 3.70
classes["기존 보유주식(유지)"] = 2.40

# ---------------------------------------------------------------- 6. DC 기회비용
CASH_PARK_RATE = 2.50   # % DC 대기성 현금 가정
dc_gap_rate = a_rate - CASH_PARK_RATE
dc_cost_yr  = 6.40 * dc_gap_rate / 100
MONTHS_TO_RETIRE = 34   # 2년 10개월
dc_cost_total = dc_cost_yr * MONTHS_TO_RETIRE / 12

# ---------------------------------------------------------------- 7. 예금 만기
DEP_YEARS = 5
dep_interest_gross = 3.70 * DEPOSIT_RATE / 100 * DEP_YEARS      # 단리 가정
INT_TAX = 15.4
dep_interest_net = dep_interest_gross * (1 - INT_TAX / 100)
dep_maturity_net = 3.70 + dep_interest_net
dep_after_wedding = dep_maturity_net - WEDDING

# ---------------------------------------------------------------- 8. 단계별 현금흐름
# 월 현금 인컴(만원): 억 * 현금분배율% / 100 * 10000 / 12
def monthly(amount_eok: float, cash_rate: float) -> float:
    return amount_eok * cash_rate / 100 * 10000 / 12


m_general = monthly(b_amt, b_cashr)                  # 증권 일반계좌
m_spouse  = monthly(c_amt, c_cashr)                  # 배우자
m_equity  = monthly(2.40, EQUITY_DIV)                # 보유주식 배당
m_reinv   = monthly(dep_after_wedding, new_rate)     # 예금 만기 잔액 재투자

phase1_income = m_spouse + m_general + m_equity
phase1_gap    = NEED_BASE - SPOUSE_PENSION - phase1_income
phase3_income = phase1_income + m_reinv
phase3_gap    = NEED_BASE - SPOUSE_PENSION - phase3_income
phase4_income = phase3_income
phase4_gap    = NEED_BASE - SPOUSE_PENSION - NPS_SELF - phase4_income

# ---------------------------------------------------------------- 9. 세제 점검
FIN_INCOME_LIMIT = 2000.0   # 만원/년, 금융소득종합과세 기준
self_fin_income   = b_cash * 10000 + 2.40 * EQUITY_DIV / 100 * 10000
spouse_fin_income = c_cash * 10000
PENSION_SEP_LIMIT = 1500.0  # 만원/년, 사적연금 분리과세 한도
ISA_ANNUAL = 2000.0         # 만원/년, ISA 납입한도 (1인)
ISA_TOTAL  = 10000.0        # 만원, ISA 총 납입한도 (1인)
HI_THRESHOLD = 1000.0       # 만원/년, 건보료 소득 반영 기준(금융소득)
# 은퇴 전 34개월(2026.9~2029.6) 동안 부부 ISA로 이전 가능한 금액
isa_years = MONTHS_TO_RETIRE / 12
isa_movable = min(ISA_ANNUAL * isa_years * 2, ISA_TOTAL * 2) / 10000  # 억
# 일반계좌 금융소득 중 ISA 이전으로 과세대상에서 빠지는 금액(평균 현금분배율 적용)
avg_general_cash = (b_cash + c_cash) / (b_amt + c_amt) * 100
isa_shielded = isa_movable * avg_general_cash / 100 * 10000  # 만원/년

# ---------------------------------------------------------------- 출력
def line(c="-", n=78):
    print(c * n)


if __name__ == "__main__":
    print(f"은퇴자산 운용 제안서 재무 모델 · 기준일 {AS_OF}")
    line("=")
    print("[1] 자산 현황 (억원)")
    for label, amt, movable, owner in ASSETS:
        tag = "즉시 재배치" if movable else "고정(만기/유지)"
        print(f"  {owner:<4} {label:<28} {amt:>5.2f}  {tag}")
    print(f"  본인 소계 {SELF_TOTAL:.2f} / 배우자 {SPOUSE_TOTAL:.2f} / 가구 합계 {TOTAL:.2f}")
    print(f"  즉시 재배치 가능 {REALLOCABLE:.2f} ({REALLOCABLE/TOTAL*100:.1f}%) / "
          f"고정 {LOCKED:.2f} ({LOCKED/TOTAL*100:.1f}%)")

    line()
    print("[2] 필요 지출 / 확보 연금 (만원/월)")
    print(f"  생활자금 {LIVING_LOW:.0f}~{LIVING_HIGH:.0f} + 부모님 {PARENTS:.0f}"
          f" = 필요 {NEED_LOW:.0f}~{NEED_HIGH:.0f} (기준 {NEED_BASE:.0f})")
    print(f"  배우자 연금 {SPOUSE_PENSION:.0f} (2028~) / 본인 국민연금 {NPS_SELF:.0f} (2034~)")
    print(f"  자녀 결혼자금 {WEDDING:.2f}억 (2031년)")

    line()
    print("[3] 목표 연 7% 요구조건")
    print(f"  목표 연간 수익 = {TOTAL:.2f}억 x {TARGET_RETURN:.2f}% = {TARGET_INCOME:.4f}억")
    print(f"  은행예금 기여 = 3.70 x {DEPOSIT_RATE:.2f}% = {deposit_income:.4f}억")
    print(f"  보유주식 기여 = 2.40 x {EQUITY_RATE:.2f}% = {equity_income:.4f}억")
    print(f"  신규 운용 {REALLOCABLE:.2f}억이 내야 할 수익 = {required_new:.4f}억"
          f" → 요구수익률 {required_rate:.2f}%")

    line()
    print("[4] 트랙별 포트폴리오")
    for name, track, amt, inc, rate, cashr in (
        ("A. DC→IRP 연금자산", TRACK_A, a_amt, a_inc, a_rate, a_cashr),
        ("B. 증권 일반계좌",   TRACK_B, b_amt, b_inc, b_rate, b_cashr),
        ("C. 배우자 자산",     TRACK_C, c_amt, c_inc, c_rate, c_cashr),
    ):
        print(f"  {name}: {amt:.2f}억 · 기대총수익 {rate:.2f}% · 현금분배 {cashr:.2f}%")
        for pname, tkr, pamt, prate, pcash, cls in track:
            print(f"      {pname:<40} {tkr:<12} {pamt:>4.2f}억"
                  f" {pamt/amt*100:>5.1f}%  총{prate:>4.1f}% 현금{pcash:>4.1f}% [{cls}]")
    print(f"  연금계좌 안전자산 {safe_amt:.2f}억 = {safe_pct:.1f}% (규정 30% 이상) "
          f"{'충족' if safe_pct >= 30 else '미달'}")
    print(f"  신규 운용 합계 {new_amt:.2f}억 · 가중 기대수익률 {new_rate:.2f}%"
          f" (요구 {required_rate:.2f}%)")

    line()
    print("[5] 전체 포트폴리오 기대수익률")
    print(f"  {deposit_income:.4f} + {equity_income:.4f} + {new_inc:.4f}"
          f" = {port_income:.4f}억 / {TOTAL:.2f}억 = {port_rate:.2f}%")
    print(f"  목표 {TARGET_RETURN:.2f}% 대비 {port_rate - TARGET_RETURN:+.2f}%p")

    line()
    print("[6] 자산군별 배분 (억원 / 전체 비중)")
    for k, v in sorted(classes.items(), key=lambda x: -x[1]):
        print(f"  {k:<28} {v:>5.2f}억  {v/TOTAL*100:>5.1f}%")
    print(f"  합계 {sum(classes.values()):.2f}억")
    eq_pct = 2.40 / TOTAL * 100
    print(f"  직접 주식 비중 = 기존 보유분 {eq_pct:.1f}% (신규 주식 편입 0)")

    line()
    print("[7] DC 현금성 방치 기회비용")
    print(f"  현금성 {CASH_PARK_RATE:.2f}% vs 제안 {a_rate:.2f}% → 격차 {dc_gap_rate:.2f}%p")
    print(f"  연 {dc_cost_yr:.4f}억 (={dc_cost_yr*10000:.0f}만원) · "
          f"은퇴까지 {MONTHS_TO_RETIRE}개월 누적 {dc_cost_total:.4f}억 (={dc_cost_total*10000:.0f}만원)")

    line()
    print("[8] 은행 예금 만기 (단리 가정)")
    print(f"  이자(세전) 3.70 x {DEPOSIT_RATE:.2f}% x {DEP_YEARS}년 = {dep_interest_gross:.4f}억")
    print(f"  이자소득세 {INT_TAX:.1f}% 차감 후 이자 {dep_interest_net:.4f}억")
    print(f"  만기 세후 원리금 {dep_maturity_net:.4f}억 → 결혼자금 {WEDDING:.2f}억 지출"
          f" → 인컴 재투자 {dep_after_wedding:.4f}억")

    line()
    print("[9] 단계별 월 현금흐름 (만원/월, 필요 기준 750)")
    print(f"  월 인컴: 증권일반 {m_general:.0f} / 배우자 {m_spouse:.0f} /"
          f" 보유주식 배당 {m_equity:.0f} / 예금만기 재투자 {m_reinv:.0f}")
    print(f"  P1 2029.7~2031 : 연금 {SPOUSE_PENSION:.0f} + 인컴 {phase1_income:.0f}"
          f" = {SPOUSE_PENSION+phase1_income:.0f} → 부족 {phase1_gap:.0f} (연금계좌 인출)")
    print(f"  P3 2031~2034   : 연금 {SPOUSE_PENSION:.0f} + 인컴 {phase3_income:.0f}"
          f" = {SPOUSE_PENSION+phase3_income:.0f} → 부족 {phase3_gap:.0f}")
    print(f"  P4 2034~       : 연금 {SPOUSE_PENSION+NPS_SELF:.0f} + 인컴 {phase4_income:.0f}"
          f" = {SPOUSE_PENSION+NPS_SELF+phase4_income:.0f} → 여유 {-phase4_gap:.0f}")
    print(f"  P1 연금계좌 연 인출액 {phase1_gap*12:.0f}만원"
          f" ({'1,500만원 이내' if phase1_gap*12 <= PENSION_SEP_LIMIT else '1,500만원 초과'})")

    line()
    print("[10] 세제 점검 (만원/년)")
    print(f"  본인 일반계좌 금융소득 {self_fin_income:.0f}"
          f" vs 종합과세 기준 {FIN_INCOME_LIMIT:.0f} → "
          f"{'초과' if self_fin_income > FIN_INCOME_LIMIT else '이내'}")
    print(f"  배우자 금융소득 {spouse_fin_income:.0f}"
          f" vs 종합과세 기준 {FIN_INCOME_LIMIT:.0f} → "
          f"{'초과 (대응 필요)' if spouse_fin_income > FIN_INCOME_LIMIT else '이내'}")
    over = spouse_fin_income - FIN_INCOME_LIMIT
    print(f"  배우자 초과분 {over:.0f}만원 → ISA·연금저축 이전으로 과세대상 축소 필요")
    couple_fin = self_fin_income + spouse_fin_income
    print(f"  부부 합산 일반계좌 금융소득 {couple_fin:.0f}만원"
          f" (건보료 소득반영 기준 {HI_THRESHOLD:.0f}만원 초과)")
    print(f"  ISA 이전 가능액: 부부 2인 x 연 {ISA_ANNUAL:.0f}만원 x {isa_years:.2f}년"
          f" = {isa_movable:.2f}억 → 과세대상 금융소득 약 {isa_shielded:.0f}만원 차단")
    print(f"  연금계좌 인출액은 건보료 부과대상 아님 → 생활비 재원을 연금계좌로 이전 시 유리")
    print(f"  잔여 과세대상 금융소득 {couple_fin - isa_shielded:.0f}만원")
    line("=")
    print("[11] 인쇄용 요약값")
    print(f"  TOTAL={TOTAL:.2f} SELF={SELF_TOTAL:.2f} SPOUSE={SPOUSE_TOTAL:.2f}")
    print(f"  REALLOC={REALLOCABLE:.2f} LOCKED={LOCKED:.2f}")
    print(f"  PORT_RATE={port_rate:.2f} NEW_RATE={new_rate:.2f} REQ_RATE={required_rate:.2f}")
    print(f"  A_RATE={a_rate:.2f} B_RATE={b_rate:.2f} C_RATE={c_rate:.2f} SAFE_PCT={safe_pct:.1f}")
    print(f"  DC_COST_YR={dc_cost_yr*10000:.0f}만원 DC_COST_TOTAL={dc_cost_total*10000:.0f}만원")
    print(f"  DEP_MATURITY={dep_maturity_net:.2f} DEP_REINVEST={dep_after_wedding:.2f}")
    print(f"  P1_INCOME={phase1_income:.0f} P1_GAP={phase1_gap:.0f}")
    print(f"  P3_INCOME={phase3_income:.0f} P3_SURPLUS={-phase3_gap:.0f}")
    print(f"  P4_SURPLUS={-phase4_gap:.0f}")
    print(f"  EQUITY_PCT={2.40/TOTAL*100:.1f}")
    line("=")
