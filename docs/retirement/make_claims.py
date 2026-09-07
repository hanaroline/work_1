#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""claims.json 생성기.

model.py 의 계산값과 etf_data.json 의 실측치를 읽어 주장 대장을 만든다.
손으로 대장을 고치면 슬라이드와 어긋나므로, 대장은 항상 이 스크립트로 생성한다.
"""
from __future__ import annotations

import json
import pathlib

import model as M

HERE = pathlib.Path(__file__).parent
ETF_SRC = M.ETF["source"]
COLLECTED = M.ETF["collectedAt"][:10]
RET_AS_OF = M.ETF["retAsOf"]
CLIENT = "client-input:2026-09-07 고객 상담 자료"
ASSUMPTION = "assumption:제안자 설계 가정 (보장 아님)"
DATASET = (
    "repo:hanaroline/work_1@claude/etf-holdings-lookup-tool-wwtz57:data/etf-kr.js"
)

claims: list[dict] = []
derived: list[dict] = []


def add(**kw):
    claims.append(kw)


def client(cid, text, value, unit, metric, pages, note=None):
    add(id=cid, kind="client_balance", metric=metric, text=text, value=value,
        unit=unit, series="고객 제공 잔액 (2026-09-07 상담)", as_of="2026-09-07",
        tier=1, source_url=CLIENT, verdict="confirmed", render="assert",
        printed_on=pages, **({"note": note} if note else {}))


def assume(cid, text, value, pages, note=None):
    add(id=cid, kind="assumption", metric="기대수익률", text=text, value=value,
        unit="%", series="제안자 설계 가정 (연율, 세전 총수익)", as_of="2026-09-07",
        tier=1, source_url=ASSUMPTION, verdict="unverified", render="marked",
        printed_on=pages, **({"note": note} if note else {}))


# ── 1. 고객 제공 자산·지출·연금 ─────────────────────────────────────────
client("A_DC", "퇴직연금 DC (현금성 자산으로 방치)", 6.40, "억원", "가구자산",
       ["p2-asset-table", "p3-timeline", "p5-matrix"])
client("A_IRP", "개인 IRP", 0.88, "억원", "가구자산", ["p2-asset-table", "p5-matrix"])
client("A_DEPOSIT", "은행 5년 장기 정기예금 (연 5%, 만기까지 인출 불가)", 3.70, "억원",
       "가구자산", ["p2-asset-table", "p3-timeline", "p4-alloc"],
       "가입 시점 미확인. 자녀 결혼 시점(5년 후)과 만기가 일치한다는 고객 진술에 따라 2031년 만기로 가정")
client("A_CASH", "증권계좌 현금", 2.00, "억원", "가구자산", ["p2-asset-table", "p5-matrix"])
client("A_EQUITY", "국내·해외주식 (매도하지 않고 계속 유지)", 2.40, "억원", "가구자산",
       ["p2-asset-table", "p4-alloc"])
client("A_SPOUSE", "배우자 보유자산", 4.00, "억원", "가구자산",
       ["p2-asset-table", "p5-matrix"], "자산 구성 내역 미제공 — 전액 재배치 가능으로 가정")

for cid, text, val, pages in [
    ("E_LIVING_LOW", "월 생활자금 필요액 (하한)", M.LIVING_LOW, ["p2-need"]),
    ("E_LIVING_HIGH", "월 생활자금 필요액 (상한)", M.LIVING_HIGH, ["p2-need"]),
    ("E_LIVING_BASE", "월 생활자금 설계 기준값 (600~700 중간값)", M.LIVING_BASE,
     ["p2-need", "p6-cashflow"]),
    ("E_PARENTS", "부모님 월 용돈", M.PARENTS, ["p2-need", "p6-cashflow"]),
    ("P_SPOUSE", "배우자 연금 수령액 (2028년~)", M.SPOUSE_PENSION,
     ["p3-timeline", "p6-cashflow"]),
    ("P_NPS", "본인 국민연금 수령액 (만 65세, 2034년~)", M.NPS_SELF,
     ["p3-timeline", "p6-cashflow"]),
]:
    add(id=cid, kind="client_expense", metric="월현금흐름", text=text, value=val,
        unit="만원/월", series="고객 제시 필요액 (세전, 만원/월)", as_of="2026-09-07",
        tier=1, source_url=CLIENT, verdict="confirmed", render="assert", printed_on=pages)

client("E_WEDDING", "자녀 결혼자금 (2031년, 현재 자산에서 충당)", M.WEDDING, "억원",
       "가구자산", ["p2-need", "p3-timeline"])

add(id="R_TARGET", kind="client_objective", metric="기대수익률",
    text="고객 지정 목표수익률 (예금·주식 포함 전체 자산 기준)", value=M.TARGET_RETURN,
    unit="%", series="제안자 설계 가정 (연율, 세전 총수익)", as_of="2026-09-07", tier=1,
    source_url=CLIENT, verdict="confirmed", render="assert",
    printed_on=["p1-cover", "p2-need", "p4-alloc"])
add(id="R_DEPOSIT", kind="client_balance", metric="기대수익률",
    text="은행 정기예금 확정금리", value=M.DEPOSIT_RATE, unit="%",
    series="제안자 설계 가정 (연율, 세전 총수익)", as_of="2026-09-07", tier=1,
    source_url=CLIENT, verdict="confirmed", render="assert",
    note="고객 제공. 2026년 9월 신규 5년 정기예금 시장금리(3%대)보다 크게 높은 이례적 조건으로, "
         "기존 가입 상품의 확정금리로만 유효",
    printed_on=["p2-asset-table", "p4-alloc"])

# ── 2. 설계 가정 ────────────────────────────────────────────────────────
assume("R_EQUITY", "보유 주식 기대 총수익률 — 설계 가정", M.EQUITY_RATE, ["p4-alloc"],
       "미래 수익률은 확인 불가. 슬라이드에 '가정'으로 표기")
assume("R_EQUITY_DIV", "보유 주식 현금배당률 — 설계 가정", M.EQUITY_DIV, ["p6-cashflow"])
assume("R_CASH_PARK", "DC 대기성 현금 운용수익률 — 설계 가정", M.CASH_PARK_RATE, ["p2-issue"])
assume("R_GIC", "IRP 원리금보장 정기예금 금리 — 설계 가정", M.GIC_RATE[0], ["p5-matrix"])
assume("R_TRACK_A", "트랙A 연금자산 가중 기대수익률 — 설계 가정", round(M.a_rate, 2),
       ["p5-matrix"])
assume("R_TRACK_B", "트랙B 증권 일반계좌 가중 기대수익률 — 설계 가정", round(M.b_rate, 2),
       ["p5-matrix"])
assume("R_TRACK_C", "트랙C 배우자 자산 가중 기대수익률 — 설계 가정", round(M.c_rate, 2),
       ["p5-matrix"])
assume("R_NEW_PORT", "신규 운용자산 가중 기대수익률 — 설계 가정", round(M.new_rate, 2),
       ["p2-issue", "p4-alloc"])
assume("R_SAFE", "연금계좌 안전자산 슬리브 기대수익률 — 설계 가정", round(M.safe_rate, 2),
       ["p4-gap"])
assume("R_RISK", "연금계좌 위험자산 슬리브 기대수익률 — 설계 가정", round(M.risk_rate, 2),
       ["p4-gap"])

# 상품별 기대수익률 가정 (근거를 note 에 남긴다)
for code, (val, basis) in M.EXPECTED.items():
    assume(f"EXP_{code}", f"{M.E[code]['name']} 기대 총수익률 — 설계 가정", val,
           ["p5-matrix"], basis)

# ── 3. ETF 실측치 ───────────────────────────────────────────────────────
for code, m in M.E.items():
    base = dict(
        series="네이버 수집 ETF 데이터셋", as_of=RET_AS_OF, tier=2,
        source_url=DATASET,
        note=f"{ETF_SRC} · 수집 {COLLECTED} · 국내 상장 {M.ETF['universeCount']}종 · "
             f"수익률 기준일 {RET_AS_OF}",
    )
    add(id=f"T_{code}", kind="product_identity", metric="상품식별",
        text=f"{m['name']} 종목코드", value=int(code, 36) if not code.isdigit() else int(code),
        unit="종목코드", verdict="confirmed", render="assert",
        printed_on=["p5-matrix"], **base)
    add(id=f"DY_{code}", kind="product_yield", metric="ETF분배율",
        text=f"{m['name']} 분배율 (실측)", value=m["dividendYield"], unit="%",
        verdict="confirmed", render="assert", printed_on=["p5-matrix"], **base)
    add(id=f"TER_{code}", kind="product_fee", metric="ETF보수",
        text=f"{m['name']} 총보수 (실측)", value=m["ter"], unit="%",
        verdict="confirmed", render="assert", printed_on=["p5-matrix"], **base)
    add(id=f"AUM_{code}", kind="product_size", metric="ETF순자산",
        text=f"{m['name']} 순자산 (실측)", value=m["aumEok"], unit="억원",
        verdict="confirmed", render="assert", printed_on=["p5-matrix"], **base)
    for per in ("trY1", "trY3"):
        if m[per] is None:
            continue
        add(id=f"{per.upper()}_{code}", kind="product_return", metric="ETF총수익",
            text=f"{m['name']} 총수익률 {per[2:]} (실측, 분배금 재투자 기준)",
            value=m[per], unit="%", verdict="confirmed", render="assert",
            printed_on=["p5-matrix", "p6-trap"], **base)

# 룩스루 불가 사유 — 인쇄하지 않는 항목
add(id="LOOKTHRU", kind="access_blocked", metric="룩스루확인필요",
    text="포트폴리오 실질 주식 익스포저(룩스루) 비중", value=0, unit="n/a",
    series="네이버 수집 ETF 데이터셋", as_of=RET_AS_OF, tier=2, source_url=DATASET,
    verdict="unverified", render="omit",
    note="데이터셋의 assets 필드는 기초 ETF·리츠를 EQUITY 로 분류한다. 미국30년국채 커버드콜"
         "(476550)이 EQUITY 80.15% 로 잡히는 등 경제적 익스포저와 어긋나므로 룩스루 주식비중을"
         " 수치로 인쇄하지 않고, 직접 주식 보유분과 순수 채권·현금성 비중만 표기했다",
    printed_on=[])

# ── 4. 세제·규제 ────────────────────────────────────────────────────────
REG = [
    ("REG_SAFE30", "DC·IRP 위험자산 투자한도 70% (안전자산 30% 이상 편입 의무)", 30.0,
     "세제규정_비율",
     "https://securities.miraeasset.com/public/hks4412/011/DCIRP202412.pdf",
     ["https://www.sedaily.com/article/14173945",
      "https://marketin.edaily.co.kr/News/ReadE?newsId=03712966642298152"],
     "confirmed", "assert",
     "금융당국이 한도 폐지를 추진 중이나 2026-09-07 기준 시행 확정된 폐지안은 확인되지 않음",
     ["p4-gap", "p5-matrix"]),
    ("REG_PENSION1500",
     "사적연금(세액공제분+운용수익) 연 1,500만원 초과 시 종합과세 또는 16.5% 분리과세 선택",
     1500.0, "세제규정_금액",
     "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6608&cntntsId=7888",
     ["https://brunch.co.kr/@noderesearch/39"], "confirmed", "assert",
     "이연퇴직소득(DC 퇴직급여 원본)에서 발생하는 연금소득은 이 한도와 무관하게 분리과세",
     ["p6-tax"]),
    ("REG_SEVERANCE",
     "이연퇴직소득 연금수령 시 연금소득세율은 퇴직소득세율의 70% (연금수령 10년차까지)",
     70.0, "세제규정_비율",
     "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6602&cntntsId=7882",
     ["https://www.pwc.com/kr/ko/insights/issue-brief/one-point-tax-01.html"],
     "confirmed", "assert", "11년차 이후는 60% 적용 — 일시금 대비 약 30~40% 절감", ["p6-tax"]),
    ("REG_SEVERANCE11",
     "이연퇴직소득 연금수령 11년차 이후 연금소득세율은 퇴직소득세율의 60%", 60.0,
     "세제규정_비율",
     "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6602&cntntsId=7882",
     ["https://kbthink.com/retirement-pension/tax.html"], "confirmed", "assert", None,
     ["p6-tax"]),
    ("REG_FIN2000", "금융소득종합과세 기준금액 연 2,000만원 (2026년 기준금액 유지)", 2000.0,
     "세제규정_금액",
     "https://www.pwc.com/kr/ko/insights/issue-brief/one-point-tax-11.html",
     ["https://hometax-go.kr/financial-income-tax-threshold/"], "confirmed", "assert",
     "2026년부터 고배당기업 배당소득 분리과세 특례가 신설되었으나 ETF 분배금 적용 여부는 미확인 — "
     "제안서에서 언급하지 않음", ["p6-tax"]),
    ("REG_ISA", "ISA 연간 납입한도 (1인)", 2000.0, "세제규정_금액",
     "https://www.pwc.com/kr/ko/insights/issue-brief/one-point-tax-11.html", None,
     "unverified", "marked",
     "2026년 ISA 한도 개정 여부를 1차 출처에서 확인하지 못함 — 실행 전 확인 필요", ["p6-tax"]),
    ("REG_DCRULE2026",
     "퇴직연금감독규정 개정안 금융위 의결 (2026-08-31) — 100% 편입 가능 상품 범위 확대",
     100.0, "세제규정_비율", "https://www.fsc.go.kr/po010101/73294",
     ["https://www.hankyung.com/article/202609033126i"], "unverified", "marked",
     "금융위 보도자료·기사 본문 모두 egress 차단으로 확인 실패. 시행일과 대상 상품 범위 미확인 — "
     "단정하지 않고 확인 필요로 표기", ["p6-checklist"]),
]
for cid, text, val, metric, url, corro, verdict, render, note, pages in REG:
    d = dict(id=cid, kind="regulation", metric=metric, text=text, value=val,
             unit="%" if metric.endswith("비율") else "만원", series="2026년 시행 기준",
             as_of="2026-09-07", tier=2, source_url=url, verdict=verdict,
             render=render, printed_on=pages)
    if corro:
        d["corroborating_urls"] = corro
    if note:
        d["note"] = note
    add(**d)

add(id="REG_HI_PENSION", kind="access_blocked", metric="세제규정_확인필요",
    text="사적연금(IRP·연금저축) 인출액의 건강보험료 부과 여부", value=0, unit="n/a",
    series="2026년 시행 기준", as_of="2026-09-07", tier=1,
    source_url="unverified:1차 출처(국민건강보험공단) 확인 실패",
    verdict="unverified", render="omit",
    note="'사적연금은 건보료 부과대상이 아니다'는 통설이나 공단 1차 자료를 확인하지 못했다. "
         "부정 단정으로 쓸 수 없어 제안서에서 제외하고 '건보료 영향 사전 점검'만 실행 항목으로 기재",
    printed_on=[])

add(id="MATURITY2031", kind="access_blocked", metric="룩스루확인필요",
    text="2031년 만기 만기매칭형 채권 ETF의 국내 상장 여부", value=0, unit="n/a",
    series="네이버 수집 ETF 데이터셋", as_of=RET_AS_OF, tier=2, source_url=DATASET,
    verdict="unverified", render="marked",
    note=f"{COLLECTED} 수집 국내 상장 ETF {M.ETF['universeCount']}종에서는 만기 2028-12 가 최장으로, "
         "2031년 만기 상품이 확인되지 않았다. 데이터셋 미수록 가능성이 있어 '확인되지 않음'으로 표기하고 "
         "'존재하지 않는다'로 단정하지 않는다",
    printed_on=["p3-footnote"])

# ── 5. 파생 검산 ────────────────────────────────────────────────────────
derived += [
    {"id": "S_SELF", "kind": "sum",
     "terms": ["A_DC", "A_IRP", "A_DEPOSIT", "A_CASH", "A_EQUITY"],
     "printed": round(M.SELF_TOTAL, 2), "tolerance": 0.005},
    {"id": "S_TOTAL", "kind": "sum",
     "terms": ["A_DC", "A_IRP", "A_DEPOSIT", "A_CASH", "A_EQUITY", "A_SPOUSE"],
     "printed": round(M.TOTAL, 2), "tolerance": 0.005},
    {"id": "S_REALLOC", "kind": "sum", "terms": ["A_DC", "A_IRP", "A_CASH", "A_SPOUSE"],
     "printed": round(M.REALLOCABLE, 2), "tolerance": 0.005},
    {"id": "S_LOCKED", "kind": "sum", "terms": ["A_DEPOSIT", "A_EQUITY"],
     "printed": round(M.LOCKED, 2), "tolerance": 0.005},
    {"id": "S_TRACK_A", "kind": "sum", "terms": ["A_DC", "A_IRP"],
     "printed": round(M.a_amt, 2), "tolerance": 0.005},
    {"id": "S_NEED_BASE", "kind": "sum", "terms": ["E_LIVING_BASE", "E_PARENTS"],
     "printed": M.NEED_BASE, "tolerance": 0.5},
    {"id": "S_NEED_LOW", "kind": "sum", "terms": ["E_LIVING_LOW", "E_PARENTS"],
     "printed": M.NEED_LOW, "tolerance": 0.5},
    {"id": "S_NEED_HIGH", "kind": "sum", "terms": ["E_LIVING_HIGH", "E_PARENTS"],
     "printed": M.NEED_HIGH, "tolerance": 0.5},
    {"id": "S_PENSION_P4", "kind": "sum", "terms": ["P_SPOUSE", "P_NPS"],
     "printed": M.SPOUSE_PENSION + M.NPS_SELF, "tolerance": 0.5},
    {"id": "P_TARGET_INCOME", "kind": "product", "a": round(M.TOTAL, 2), "b": 0.07,
     "printed": round(M.TARGET_INCOME, 4), "tolerance": 0.0005},
    {"id": "P_DEPOSIT_INCOME", "kind": "product", "a": "A_DEPOSIT", "b": 0.05,
     "printed": round(M.deposit_income, 4), "tolerance": 0.0005},
    {"id": "P_EQUITY_INCOME", "kind": "product", "a": "A_EQUITY", "b": 0.08,
     "printed": round(M.equity_income, 4), "tolerance": 0.0005},
    {"id": "P_NEW_INCOME", "kind": "product", "a": round(M.new_amt, 2),
     "b": round(M.new_rate / 100, 6), "printed": round(M.new_inc, 4), "tolerance": 0.001},
    {"id": "S_PORT_INCOME", "kind": "sum",
     "terms": [round(M.deposit_income, 4), round(M.equity_income, 4), round(M.new_inc, 4)],
     "printed": round(M.port_income, 4), "tolerance": 0.001},
    {"id": "RT_PORT_RATE", "kind": "ratio", "numerator": round(M.port_income, 4),
     "denominator": round(M.TOTAL, 2), "printed": round(M.port_rate / 100, 4),
     "tolerance": 0.0002},
    {"id": "RT_REQUIRED", "kind": "ratio", "numerator": round(M.required_new, 4),
     "denominator": round(M.REALLOCABLE, 2), "printed": round(M.required_rate / 100, 4),
     "tolerance": 0.0002},
    {"id": "S_SAFE_ASSET", "kind": "sum",
     "terms": [r[1] for r in M.TRACK_A if r[2] == "안전"],
     "printed": round(M.safe_amt, 2), "tolerance": 0.005},
    {"id": "RT_SAFE_PCT", "kind": "ratio", "numerator": round(M.safe_amt, 2),
     "denominator": round(M.a_amt, 2), "printed": round(M.safe_pct / 100, 4),
     "tolerance": 0.0005},
    {"id": "RT_EQUITY_PCT", "kind": "ratio", "numerator": "A_EQUITY",
     "denominator": round(M.TOTAL, 2), "printed": round(2.40 / M.TOTAL, 4),
     "tolerance": 0.0005},
    {"id": "P_DC_COST_YR", "kind": "product", "a": "A_DC",
     "b": round(M.dc_gap_rate / 100, 6), "printed": round(M.dc_cost_yr, 4),
     "tolerance": 0.001},
    {"id": "P_DC_COST_TOTAL", "kind": "product", "a": round(M.dc_cost_yr, 4),
     "b": round(M.MONTHS_TO_RETIRE / 12, 4), "printed": round(M.dc_cost_total, 4),
     "tolerance": 0.002},
    {"id": "P_DEP_INTEREST_GROSS", "kind": "product", "a": "A_DEPOSIT", "b": 0.25,
     "printed": round(M.dep_interest_gross, 4), "tolerance": 0.001},
    {"id": "P_DEP_INTEREST_NET", "kind": "product",
     "a": round(M.dep_interest_gross, 4), "b": 0.846,
     "printed": round(M.dep_interest_net, 4), "tolerance": 0.001},
    {"id": "S_DEP_MATURITY", "kind": "sum",
     "terms": ["A_DEPOSIT", round(M.dep_interest_net, 4)],
     "printed": round(M.dep_maturity_net, 4), "tolerance": 0.002},
    {"id": "S_DEP_REINVEST", "kind": "sum",
     "terms": [round(M.dep_maturity_net, 4), -3.00],
     "printed": round(M.dep_after_wedding, 4), "tolerance": 0.002},
    {"id": "RT_P3_RATE", "kind": "ratio", "numerator": round(M.p3_income, 4),
     "denominator": round(M.p3_total, 2), "printed": round(M.p3_rate / 100, 4),
     "tolerance": 0.0002,
     "_설명": "예금 만기 후 전체 기대수익률 — 목표 7% 초과 시점의 근거"},
    {"id": "S_P1_INFLOW", "kind": "sum",
     "terms": ["P_SPOUSE", round(M.phase1_income, 0)],
     "printed": round(M.SPOUSE_PENSION + M.phase1_income, 0), "tolerance": 1.0},
    {"id": "S_P3_INFLOW", "kind": "sum",
     "terms": ["P_SPOUSE", round(M.phase3_income, 0)],
     "printed": round(M.SPOUSE_PENSION + M.phase3_income, 0), "tolerance": 1.0},
    {"id": "S_P4_INFLOW", "kind": "sum",
     "terms": ["P_SPOUSE", "P_NPS", round(M.phase3_income, 0)],
     "printed": round(M.SPOUSE_PENSION + M.NPS_SELF + M.phase3_income, 0),
     "tolerance": 1.0},
    {"id": "S_COUPLE_FIN", "kind": "sum",
     "terms": [round(M.self_fin_income, 0), round(M.spouse_fin_income, 0)],
     "printed": round(M.couple_fin, 0), "tolerance": 1.0,
     "_설명": "부부 합산 일반계좌 과세대상 금융소득"},
]

ledger = {
    "_설명": "은퇴자산 운용 제안서(6p PPT) 주장 대장. make_claims.py 가 생성한다 — 직접 수정하지 말 것.",
    "deliverable": "은퇴자산 운용 제안서 — 인컴 중심 노후 현금흐름 설계 (6p PPT)",
    "as_of": "2026-09-07",
    "_series_policy": "금액은 억원, 월 현금흐름은 만원/월, 수익률은 연율%. "
                      "상품 지표는 네이버 수집 데이터셋 한 계열로 통일.",
    "series_policy": {
        "가구자산": "고객 제공 잔액 (2026-09-07 상담)",
        "월현금흐름": "고객 제시 필요액 (세전, 만원/월)",
        "기대수익률": "제안자 설계 가정 (연율, 세전 총수익)",
        "ETF분배율": "네이버 수집 ETF 데이터셋",
        "ETF총수익": "네이버 수집 ETF 데이터셋",
        "ETF보수": "네이버 수집 ETF 데이터셋",
        "ETF순자산": "네이버 수집 ETF 데이터셋",
        "상품식별": "네이버 수집 ETF 데이터셋",
        "세제규정_비율": "2026년 시행 기준",
        "세제규정_금액": "2026년 시행 기준",
        "세제규정_확인필요": "2026년 시행 기준",
        "룩스루확인필요": "네이버 수집 ETF 데이터셋",
    },
    "claims": claims,
    "derived": derived,
    "_unit_policy": "metric 별 기대 단위.",
    "unit_policy": {
        "가구자산": "억원", "월현금흐름": "만원/월", "기대수익률": "%",
        "상품식별": "종목코드", "ETF분배율": "%", "ETF총수익": "%",
        "ETF보수": "%", "ETF순자산": "억원",
        "세제규정_비율": "%", "세제규정_금액": "만원",
        "세제규정_확인필요": "n/a", "룩스루확인필요": "n/a",
    },
}

(HERE / "claims.json").write_text(
    json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"claims.json 생성 — 주장 {len(claims)}건 / 파생 {len(derived)}건")
