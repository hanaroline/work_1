#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""은퇴자산 운용 제안서 v2 — 운용사 무관 최고 성과 ETF + 채권형 펀드 (기준일 2026-09-07)

v1 대비 달라진 점
 · 운용사 제약을 풀고 ETF를 성과 기준으로 재선별 (KODEX·ACE 편입)
 · ETF 외 채권형 펀드(국내 크레딧·단기채, 해외 이머징국공채·아시아하이일드)를 편입
 · 펀드는 반드시 **클래스 단위** 수익률·보수를 쓴다. 부모('운용') 레코드의 수익률은
   매수할 수 없는 계열이므로 쓰지 않는다 (iM에셋 하이일드: 부모 1년 9.58% vs 클래스 1.8~3.2%)
 · ETF 3년은 연율, 펀드 3년은 누적이므로 펀드는 연율로 환산해 비교한다
"""
from __future__ import annotations

import json
import pathlib

AS_OF = "2026-09-07"
_HERE = pathlib.Path(__file__).parent
DATA = json.loads((_HERE / "v2_data.json").read_text(encoding="utf-8"))
ETF, FUND = DATA["etfs"], DATA["funds"]

# ---------------------------------------------------------------- 자산·지출
ASSETS = [
    ("퇴직연금 DC (현금성 방치)", 6.40, True,  "본인"),
    ("개인 IRP",                  0.88, True,  "본인"),
    ("은행 5년 정기예금 (연 5%)", 3.70, False, "본인"),
    ("증권 현금",                 2.00, True,  "본인"),
    ("국내·해외주식 (유지)",       2.40, False, "본인"),
    ("배우자 보유자산",            4.00, True,  "배우자"),
]
TOTAL = sum(a[1] for a in ASSETS)
SELF_TOTAL = sum(a[1] for a in ASSETS if a[3] == "본인")
SPOUSE_TOTAL = sum(a[1] for a in ASSETS if a[3] == "배우자")
REALLOCABLE = sum(a[1] for a in ASSETS if a[2])
LOCKED = TOTAL - REALLOCABLE

LIVING_LOW, LIVING_HIGH = 600.0, 700.0
LIVING_BASE = (LIVING_LOW + LIVING_HIGH) / 2
PARENTS = 100.0
NEED_LOW, NEED_HIGH = LIVING_LOW + PARENTS, LIVING_HIGH + PARENTS
NEED_BASE = LIVING_BASE + PARENTS
SPOUSE_PENSION, NPS_SELF, WEDDING = 280.0, 250.0, 3.00

TARGET_RETURN = 7.00
TARGET_INCOME = TOTAL * TARGET_RETURN / 100
DEPOSIT_RATE, EQUITY_RATE, EQUITY_DIV = 5.00, 8.00, 1.50
deposit_income = 3.70 * DEPOSIT_RATE / 100
equity_income = 2.40 * EQUITY_RATE / 100
required_new = TARGET_INCOME - deposit_income - equity_income
required_rate = required_new / REALLOCABLE * 100

# ---------------------------------------------------------------- 기대수익률 가정
# 규칙: 3년 실측(ETF=연율, 펀드=누적→연율 환산)을 45~70% 수준으로 감액한다.
#       분배율을 기대수익률로 쓰지 않는다. 1년 총수익이 음수면 저수익으로 취급한다.
EXPECTED = {
    "441640": (8.9, "ETF 3년 연율 17.30% → 51% 감액"),
    "458760": (8.6, "ETF 3년 연율 12.63% → 68% 감액"),
    "441680": (9.4, "ETF 3년 연율 13.95% → 67% 감액"),
    "402970": (8.0, "ETF 3년 연율 16.32% → 49% 감액"),
    "329200": (6.0, "ETF 3년 연율 4.73% + 분배율 9.77% 절충"),
    "0008S0": (9.0, "3년 실측 없음. 1년 25.43%·분배율 11.75% → 보수 설정"),
    "459580": (3.1, "ETF 3년 연율 3.15% 그대로 (CD금리 연동)"),
    "SNB_SP": (6.5, "펀드 클래스 3년 연율 10.45% → 62% 감액"),
    "KORT_CP": (3.6, "펀드 클래스 3년 연율 4.18%·1년 3.31% → 보수 설정"),
    "KIM_SP": (3.8, "펀드 클래스 3년 연율 4.59% → 83% 감액"),
    "FID_AE": (6.0, "펀드 클래스 3년 연율 8.57% → 70% 감액"),
    "HANA_C": (6.5, "펀드 클래스 3년 연율 9.57% → 68% 감액"),
    "GIC": (3.0, "IRP 원리금보장 정기예금 금리 가정"),
}

# 현금 분배율: ETF 는 실측, 펀드는 월지급식이나 분배율 데이터가 없어 미확인
FUND_CASH_UNKNOWN = True

TRACK_A = [   # DC→IRP 7.28억 · 안전자산 30% 이상
    ("SNB_SP",  0.80, "안전"),
    ("KORT_CP", 0.50, "안전"),
    ("KIM_SP",  0.50, "안전"),
    ("GIC",     0.40, "안전"),
    ("441640",  1.40, "위험"),
    ("458760",  1.20, "위험"),
    ("441680",  1.00, "위험"),
    ("329200",  0.78, "위험"),
    ("402970",  0.70, "위험"),
]
TRACK_B = [   # 증권 일반계좌 2.00억
    ("441640",  0.60, "인컴"),
    ("FID_AE",  0.45, "채권"),
    ("0008S0",  0.35, "인컴"),
    ("329200",  0.30, "인컴"),
    ("459580",  0.30, "유동"),
]
TRACK_C = [   # 배우자 4.00억
    ("441640",  0.90, "인컴"),
    ("402970",  0.70, "배당"),
    ("458760",  0.70, "인컴"),
    ("HANA_C",  0.60, "채권"),
    ("441680",  0.55, "인컴"),
    ("329200",  0.35, "인컴"),
    ("459580",  0.20, "유동"),
]

GIC_META = {"name": "원리금보장 정기예금 (IRP 예금)", "kind": "예금", "ter": None,
            "aumEok": None, "dividendYield": None, "trY1": None, "trY3": None,
            "manager": None, "riskGrade": None}


def meta(code):
    if code == "GIC":
        return GIC_META
    if code in ETF:
        e = ETF[code]
        return {**e, "kind": "ETF", "riskGrade": None}
    f = FUND[code]
    return {"name": f["name"], "kind": "펀드", "ter": f["totalFee"], "aumEok": None,
            "dividendYield": None, "trY1": f["ret1y"], "trY3": f["ret3yAnn"],
            "manager": f["company"], "riskGrade": f["riskGrade"],
            "monthlyPay": f["monthlyPay"], "pensionClass": f["pensionClass"],
            "ret3yCum": f["ret3yCum"], "code": f["code"], "type": f["type"]}


def exp_ret(c):
    return EXPECTED[c][0]


def exp_basis(c):
    return EXPECTED[c][1]


def cash_yield(c):
    """현금 분배율. 펀드는 분배율 데이터가 없어 None (미확인)."""
    m = meta(c)
    return m["dividendYield"] if m["kind"] == "ETF" else None


def summarize(track):
    amt = sum(r[1] for r in track)
    inc = sum(r[1] * exp_ret(r[0]) / 100 for r in track)
    # 현금 인컴은 분배율이 확인된 ETF 분만 집계 (펀드·예금은 미확인 → 보수적으로 제외)
    known = [(c, a) for c, a, _ in track if cash_yield(c) is not None]
    cash = sum(a * cash_yield(c) / 100 for c, a in known)
    cash_base = sum(a for _, a in known)
    return amt, inc, inc / amt * 100, cash, cash_base


a_amt, a_inc, a_rate, a_cash, a_cbase = summarize(TRACK_A)
b_amt, b_inc, b_rate, b_cash, b_cbase = summarize(TRACK_B)
c_amt, c_inc, c_rate, c_cash, c_cbase = summarize(TRACK_C)

safe_amt = sum(r[1] for r in TRACK_A if r[2] == "안전")
safe_pct = safe_amt / a_amt * 100
safe_inc = sum(r[1] * exp_ret(r[0]) / 100 for r in TRACK_A if r[2] == "안전")
safe_rate = safe_inc / safe_amt * 100
risk_amt = a_amt - safe_amt
risk_rate = (a_inc - safe_inc) / risk_amt * 100
regCostPp = safe_amt * (risk_rate - safe_rate) / 100 / TOTAL * 100

new_amt = a_amt + b_amt + c_amt
new_inc = a_inc + b_inc + c_inc
new_rate = new_inc / new_amt * 100
port_income = deposit_income + equity_income + new_inc
port_rate = port_income / TOTAL * 100
gap_pp = port_rate - TARGET_RETURN

# 펀드·ETF 비중
fund_amt = sum(a for c, a, _ in TRACK_A + TRACK_B + TRACK_C if meta(c)["kind"] == "펀드")
etf_amt = sum(a for c, a, _ in TRACK_A + TRACK_B + TRACK_C if meta(c)["kind"] == "ETF")
gic_amt = sum(a for c, a, _ in TRACK_A + TRACK_B + TRACK_C if c == "GIC")

# 운용사 분산
managers: dict[str, float] = {}
for c, a, _ in TRACK_A + TRACK_B + TRACK_C:
    m = meta(c)
    key = (m["manager"] or "은행 예금").replace("자산운용", "")
    key = {"한국투신운용": "한국투자신탁운용", "케이비": "KB", "아이엠에셋": "iM에셋",
           "엔에이치아문디": "NH-Amundi", "디비": "DB"}.get(key, key)
    managers[key] = managers.get(key, 0) + a

# ---------------------------------------------------------------- 예금 만기
DEP_YEARS, INT_TAX = 5, 15.4
dep_interest_gross = 3.70 * DEPOSIT_RATE / 100 * DEP_YEARS
dep_interest_net = dep_interest_gross * (1 - INT_TAX / 100)
dep_maturity_net = 3.70 + dep_interest_net
dep_after_wedding = dep_maturity_net - WEDDING
p3_income_assets = new_amt + dep_after_wedding
p3_total = p3_income_assets + 2.40
p3_income = p3_income_assets * new_rate / 100 + equity_income
p3_rate = p3_income / p3_total * 100

CASH_PARK_RATE = 2.50
dc_gap_rate = a_rate - CASH_PARK_RATE
dc_cost_yr = 6.40 * dc_gap_rate / 100
MONTHS_TO_RETIRE = 34
dc_cost_total = dc_cost_yr * MONTHS_TO_RETIRE / 12


# ---------------------------------------------------------------- 현금흐름
def monthly(eok, rate):
    return eok * rate / 100 * 10000 / 12


# 확인된 분배율(ETF) 기준 현금 인컴 + 펀드는 기대수익률의 절반만 현금으로 가정(보수적)
FUND_CASH_SHARE = 0.5
def track_cash(track):
    tot = 0.0
    for c, a, _ in track:
        cy = cash_yield(c)
        if cy is not None:
            tot += a * cy / 100
        elif meta(c)["kind"] == "펀드":
            tot += a * exp_ret(c) * FUND_CASH_SHARE / 100
    return tot


b_cash_all = track_cash(TRACK_B)
c_cash_all = track_cash(TRACK_C)
a_cash_all = track_cash(TRACK_A)
m_general = b_cash_all * 10000 / 12
m_spouse = c_cash_all * 10000 / 12
m_equity = monthly(2.40, EQUITY_DIV)
m_reinv = dep_after_wedding * (c_cash_all / c_amt) * 10000 / 12
m_pension_cash = a_cash_all * 10000 / 12

phase1_income = m_spouse + m_general + m_equity
phase1_gap = NEED_BASE - SPOUSE_PENSION - phase1_income
phase3_income = phase1_income + m_reinv
phase3_gap = NEED_BASE - SPOUSE_PENSION - phase3_income
phase4_gap = NEED_BASE - SPOUSE_PENSION - NPS_SELF - phase3_income

FIN_INCOME_LIMIT, PENSION_SEP_LIMIT = 2000.0, 1500.0
self_fin = b_cash_all * 10000 + 2.40 * EQUITY_DIV / 100 * 10000
spouse_fin = c_cash_all * 10000
couple_fin = self_fin + spouse_fin
ISA_ANNUAL = 2000.0
isa_movable = ISA_ANNUAL * (MONTHS_TO_RETIRE / 12) * 2 / 10000
isa_shielded = isa_movable * ((b_cash_all + c_cash_all) / (b_amt + c_amt)) * 10000

# v1 대비 비교 (운용사 제약을 풀어 얻은 것)
V1_PORT_RATE = 6.82
V1_SAFE_RATE = 3.18

TRAP = ["476550", "481060", "473330", "484790", "453850", "476800", "451540"]


def line(ch="-", n=104):
    print(ch * n)


if __name__ == "__main__":
    print(f"은퇴자산 운용 제안서 v2 · 기준일 {AS_OF}")
    print(f"ETF {DATA['etfUniverse']}종 (수집 {DATA['etfCollectedAt'][:10]}) · "
          f"공모펀드 {DATA['fundUniverse']}종 (수집 {DATA['fundCollectedAt'][:10]}) · "
          f"수익률 기준일 {DATA['retAsOf']}")
    line("=")
    print("[1] 목표 요구조건")
    print(f"  목표 {TOTAL:.2f} x {TARGET_RETURN:.2f}% = {TARGET_INCOME:.4f}억 · "
          f"신규 {REALLOCABLE:.2f}억 요구수익률 {required_rate:.2f}%")

    line()
    print("[2] 트랙별 포트폴리오")
    for nm, tr, amt, rate in (("A. DC→IRP 연금", TRACK_A, a_amt, a_rate),
                              ("B. 증권 일반", TRACK_B, b_amt, b_rate),
                              ("C. 배우자", TRACK_C, c_amt, c_rate)):
        print(f"  {nm}: {amt:.2f}억 · 기대 {rate:.2f}%")
        for code, pamt, cls in tr:
            m = meta(code)
            dy = f"{m['dividendYield']:.2f}%" if m["dividendYield"] is not None else "미확인"
            t3 = f"{m['trY3']:.2f}%" if m["trY3"] is not None else "-"
            t1 = f"{m['trY1']:.2f}%" if m["trY1"] is not None else "-"
            fee = f"{m['ter']}%" if m["ter"] is not None else "-"
            print(f"      [{m['kind']:<3}] {m['name'][:46]:<48} {pamt:>4.2f}억 "
                  f"{pamt/amt*100:>5.1f}%  3년 {t3:>8} 1년 {t1:>8} 분배 {dy:>7} "
                  f"보수 {fee:>7} 기대 {exp_ret(code):>4.1f}% [{cls}]")
    print(f"  안전자산 {safe_amt:.2f}억 = {safe_pct:.1f}% "
          f"({'충족' if safe_pct >= 30 else '미달'}) · 안전 {safe_rate:.2f}% / 위험 {risk_rate:.2f}%")
    print(f"  신규 운용 {new_amt:.2f}억 · 가중 기대 {new_rate:.2f}% (요구 {required_rate:.2f}%)")

    line()
    print("[3] 전체 기대수익률")
    print(f"  {deposit_income:.4f} + {equity_income:.4f} + {new_inc:.4f} = "
          f"{port_income:.4f}억 / {TOTAL:.2f}억 = {port_rate:.2f}%  (목표 {gap_pp:+.2f}%p)")
    print(f"  예금 만기 후(2031~) {p3_income:.4f}억 / {p3_total:.2f}억 = {p3_rate:.2f}% "
          f"({p3_rate - TARGET_RETURN:+.2f}%p)")
    print(f"  v1 대비: 전체 {V1_PORT_RATE:.2f}% → {port_rate:.2f}% "
          f"({port_rate - V1_PORT_RATE:+.2f}%p) · 안전자산 슬리브 {V1_SAFE_RATE:.2f}% → "
          f"{safe_rate:.2f}% ({safe_rate - V1_SAFE_RATE:+.2f}%p)")
    print(f"  안전자산 30% 규제 비용 {regCostPp:.2f}%p")

    line()
    print("[4] 구성 / 운용사 분산")
    print(f"  ETF {etf_amt:.2f}억 ({etf_amt/new_amt*100:.1f}%) · "
          f"채권형 펀드 {fund_amt:.2f}억 ({fund_amt/new_amt*100:.1f}%) · "
          f"원리금보장 {gic_amt:.2f}억 ({gic_amt/new_amt*100:.1f}%)")
    for k, v in sorted(managers.items(), key=lambda x: -x[1]):
        print(f"    {k:<16} {v:>5.2f}억 {v/new_amt*100:>5.1f}%")

    line()
    print("[5] 단계별 월 현금흐름 (만원/월, 필요 750)")
    print(f"  증권일반 {m_general:.0f} / 배우자 {m_spouse:.0f} / 주식배당 {m_equity:.0f} / "
          f"예금만기 재투자 {m_reinv:.0f}  (연금계좌 내 {m_pension_cash:.0f} 재투자)")
    for nm, inflow, gap in (("P1 2029.7~2031", SPOUSE_PENSION + phase1_income, phase1_gap),
                            ("P3 2031~2034", SPOUSE_PENSION + phase3_income, phase3_gap),
                            ("P4 2034~", SPOUSE_PENSION + NPS_SELF + phase3_income, phase4_gap)):
        print(f"  {nm:<16} 유입 {inflow:>6.0f} → "
              f"{'부족' if gap > 0 else '여유'} {abs(gap):.0f}")

    line()
    print("[6] 세제")
    print(f"  본인 {self_fin:.0f} / 배우자 {spouse_fin:.0f} / 합산 {couple_fin:.0f}만원 "
          f"(기준 {FIN_INCOME_LIMIT:.0f}) · ISA {isa_movable:.2f}억 이전 → "
          f"{isa_shielded:.0f}만원 차단")
    line("=")


def export():
    import json as _j

    def rows(track, amt):
        out = []
        for code, pamt, cls in track:
            m = meta(code)
            out.append({
                "code": code, "ticker": m.get("code") if m["kind"] == "ETF" else None,
                "name": m["name"], "kind": m["kind"], "manager": m["manager"],
                "amt": round(pamt, 2), "w": round(pamt / amt * 100, 1), "cls": cls,
                "dy": m["dividendYield"], "trY1": m["trY1"], "trY3": m["trY3"],
                "ter": m["ter"], "aum": m["aumEok"], "exp": exp_ret(code),
                "basis": exp_basis(code), "risk": m.get("riskGrade"),
                "monthlyPay": m.get("monthlyPay", False),
            })
        return out

    masters = {}
    for tn, tr, amt in (("A", TRACK_A, a_amt), ("B", TRACK_B, b_amt), ("C", TRACK_C, c_amt)):
        for r in rows(tr, amt):
            k = r["code"]
            masters.setdefault(k, {**{x: r[x] for x in
                ("code", "ticker", "name", "kind", "manager", "dy", "trY1", "trY3",
                 "ter", "aum", "exp", "basis", "risk", "monthlyPay")},
                "A": 0.0, "B": 0.0, "C": 0.0, "cls": r["cls"]})
            masters[k][tn] += r["amt"]
    for v in masters.values():
        v["total"] = round(v["A"] + v["B"] + v["C"], 2)

    d = {
        "asOf": AS_OF,
        "meta": {"provider": DATA["provider"], "etfCollectedAt": DATA["etfCollectedAt"][:10],
                 "fundCollectedAt": DATA["fundCollectedAt"][:10], "retAsOf": DATA["retAsOf"],
                 "etfUniverse": DATA["etfUniverse"], "fundUniverse": DATA["fundUniverse"]},
        "total": round(TOTAL, 2), "self": round(SELF_TOTAL, 2), "spouse": round(SPOUSE_TOTAL, 2),
        "realloc": round(REALLOCABLE, 2), "locked": round(LOCKED, 2),
        "reallocPct": round(REALLOCABLE / TOTAL * 100, 1),
        "lockedPct": round(LOCKED / TOTAL * 100, 1),
        "needBase": NEED_BASE, "spousePension": SPOUSE_PENSION, "npsSelf": NPS_SELF,
        "wedding": WEDDING, "target": TARGET_RETURN,
        "depositRate": DEPOSIT_RATE, "equityRate": EQUITY_RATE,
        "depositIncome": round(deposit_income, 4), "equityIncome": round(equity_income, 4),
        "requiredRate": round(required_rate, 2),
        "trackA": round(a_amt, 2), "trackB": round(b_amt, 2), "trackC": round(c_amt, 2),
        "rateA": round(a_rate, 2), "rateB": round(b_rate, 2), "rateC": round(c_rate, 2),
        "safeAmt": round(safe_amt, 2), "safePct": round(safe_pct, 1),
        "safeRate": round(safe_rate, 2), "riskRate": round(risk_rate, 2),
        "regCostPp": round(regCostPp, 2),
        "newAmt": round(new_amt, 2), "newInc": round(new_inc, 4), "newRate": round(new_rate, 2),
        "portIncome": round(port_income, 4), "portRate": round(port_rate, 2),
        "gapPp": round(gap_pp, 2),
        "p3Rate": round(p3_rate, 2), "p3GapPp": round(p3_rate - TARGET_RETURN, 2),
        "p3Total": round(p3_total, 2), "p3Income": round(p3_income, 4),
        "v1PortRate": V1_PORT_RATE, "v1SafeRate": V1_SAFE_RATE,
        "dPortRate": round(port_rate - V1_PORT_RATE, 2),
        "dSafeRate": round(safe_rate - V1_SAFE_RATE, 2),
        "etfAmt": round(etf_amt, 2), "fundAmt": round(fund_amt, 2), "gicAmt": round(gic_amt, 2),
        "etfPct": round(etf_amt / new_amt * 100, 1), "fundPct": round(fund_amt / new_amt * 100, 1),
        "gicPct": round(gic_amt / new_amt * 100, 1),
        "managers": [{"name": k, "amt": round(v, 2), "pct": round(v / new_amt * 100, 1)}
                     for k, v in sorted(managers.items(), key=lambda x: -x[1])],
        "cashParkRate": CASH_PARK_RATE, "dcGapRate": round(dc_gap_rate, 2),
        "dcCostYr": round(dc_cost_yr * 10000), "dcCostTotal": round(dc_cost_total * 10000),
        "monthsToRetire": MONTHS_TO_RETIRE,
        "depMaturity": round(dep_maturity_net, 2), "depReinvest": round(dep_after_wedding, 2),
        "depInterestNet": round(dep_interest_net, 4),
        "mGeneral": round(m_general), "mSpouse": round(m_spouse), "mEquity": round(m_equity),
        "mReinv": round(m_reinv), "mPensionCash": round(m_pension_cash),
        "p1Income": round(phase1_income), "p1Gap": round(phase1_gap),
        "p3IncomeM": round(phase3_income), "p3Gap": round(phase3_gap), "p4Gap": round(phase4_gap),
        "p1Withdraw": round(phase1_gap * 12) if phase1_gap > 0 else 0,
        "selfFin": round(self_fin), "spouseFin": round(spouse_fin), "coupleFin": round(couple_fin),
        "isaMovable": round(isa_movable, 2), "isaShielded": round(isa_shielded),
        "finLimit": FIN_INCOME_LIMIT, "pensionSepLimit": PENSION_SEP_LIMIT,
        "fundCashShare": FUND_CASH_SHARE,
        "tracks": {"A": rows(TRACK_A, a_amt), "B": rows(TRACK_B, b_amt), "C": rows(TRACK_C, c_amt)},
        "masters": sorted(masters.values(), key=lambda x: -x["total"]),
        "trap": [{"code": c, "name": ETF[c]["name"], "dy": ETF[c]["dividendYield"],
                  "trY1": ETF[c]["trY1"], "trY3": ETF[c]["trY3"],
                  "used": c in {r[0] for r in TRACK_A + TRACK_B + TRACK_C}} for c in TRAP],
    }
    (_HERE / "v2_deck_data.json").write_text(
        _j.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("v2_deck_data.json 내보냄")


import sys as _sys
if "--export" in _sys.argv:
    export()
