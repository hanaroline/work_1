#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""claims_v2.json 생성기 — v2 제안서(전체 운용사 ETF + 채권형 펀드)의 주장 대장."""
from __future__ import annotations

import json
import pathlib

import model_v2 as M

HERE = pathlib.Path(__file__).parent
MT = M.DATA
CLIENT = "client-input:2026-09-07 고객 상담 자료"
ASSUMPTION = "assumption:제안자 설계 가정 (보장 아님)"
ETF_DS = "repo:hanaroline/work_1@claude/etf-holdings-lookup-tool-wwtz57:data/etf-kr.js"
FUND_DS = "repo:hanaroline/work_1@claude/fund-search-tool:data/fund-kr.js"

claims: list[dict] = []
derived: list[dict] = []


def add(**kw):
    claims.append(kw)


# ── 고객 제공 ───────────────────────────────────────────────────────────
for cid, text, val, unit, metric, pages, note in [
    ("A_DC", "퇴직연금 DC (현금성 자산으로 방치)", 6.40, "억원", "가구자산",
     ["p3-timeline", "p5-matrix"], None),
    ("A_IRP", "개인 IRP", 0.88, "억원", "가구자산", ["p5-matrix"], None),
    ("A_DEPOSIT", "은행 5년 장기 정기예금 (연 5%, 만기까지 인출 불가)", 3.70, "억원",
     "가구자산", ["p3-timeline", "p4-alloc"],
     "가입 시점 미확인. 자녀 결혼 시점과 만기가 일치한다는 고객 진술에 따라 2031년 만기로 가정"),
    ("A_CASH", "증권계좌 현금", 2.00, "억원", "가구자산", ["p5-matrix"], None),
    ("A_EQUITY", "국내·해외주식 (매도하지 않고 유지)", 2.40, "억원", "가구자산",
     ["p4-alloc"], None),
    ("A_SPOUSE", "배우자 보유자산", 4.00, "억원", "가구자산", ["p5-matrix"],
     "자산 구성 내역 미제공 — 전액 재배치 가능으로 가정"),
    ("E_WEDDING", "자녀 결혼자금 (2031년)", 3.00, "억원", "가구자산", ["p3-timeline"], None),
]:
    d = dict(id=cid, kind="client_balance", metric=metric, text=text, value=val, unit=unit,
             series="고객 제공 잔액 (2026-09-07 상담)", as_of="2026-09-07", tier=1,
             source_url=CLIENT, verdict="confirmed", render="assert", printed_on=pages)
    if note:
        d["note"] = note
    add(**d)

for cid, text, val, pages in [
    ("E_LIVING_LOW", "월 생활자금 필요액 (하한)", M.LIVING_LOW, ["p3-timeline"]),
    ("E_LIVING_HIGH", "월 생활자금 필요액 (상한)", M.LIVING_HIGH, ["p3-timeline"]),
    ("E_LIVING_BASE", "월 생활자금 설계 기준값", M.LIVING_BASE, ["p6-cashflow"]),
    ("E_PARENTS", "부모님 월 용돈", M.PARENTS, ["p6-cashflow"]),
    ("P_SPOUSE", "배우자 연금 수령액 (2028년~)", M.SPOUSE_PENSION, ["p3-timeline", "p6-cashflow"]),
    ("P_NPS", "본인 국민연금 수령액 (만 65세, 2034년~)", M.NPS_SELF, ["p3-timeline", "p6-cashflow"]),
]:
    add(id=cid, kind="client_expense", metric="월현금흐름", text=text, value=val,
        unit="만원/월", series="고객 제시 필요액 (세전, 만원/월)", as_of="2026-09-07",
        tier=1, source_url=CLIENT, verdict="confirmed", render="assert", printed_on=pages)

add(id="R_TARGET", kind="client_objective", metric="기대수익률",
    text="고객 지정 목표수익률 (예금·주식 포함 전체 자산 기준)", value=M.TARGET_RETURN,
    unit="%", series="제안자 설계 가정 (연율, 세전 총수익)", as_of="2026-09-07", tier=1,
    source_url=CLIENT, verdict="confirmed", render="assert",
    printed_on=["p1-cover", "p2-compare", "p4-alloc"])
add(id="R_DEPOSIT", kind="client_balance", metric="기대수익률",
    text="은행 정기예금 확정금리", value=M.DEPOSIT_RATE, unit="%",
    series="제안자 설계 가정 (연율, 세전 총수익)", as_of="2026-09-07", tier=1,
    source_url=CLIENT, verdict="confirmed", render="assert",
    note="고객 제공. 2026년 9월 신규 5년 정기예금 시장금리(3%대)보다 크게 높은 이례적 조건",
    printed_on=["p4-alloc"])

# ── 설계 가정 ───────────────────────────────────────────────────────────
def assume(cid, text, val, pages, note=None):
    d = dict(id=cid, kind="assumption", metric="기대수익률", text=text, value=val, unit="%",
             series="제안자 설계 가정 (연율, 세전 총수익)", as_of="2026-09-07", tier=1,
             source_url=ASSUMPTION, verdict="unverified", render="marked", printed_on=pages)
    if note:
        d["note"] = note
    add(**d)


assume("R_EQUITY", "보유 주식 기대 총수익률", M.EQUITY_RATE, ["p4-alloc"],
       "미래 수익률은 확인 불가 — 슬라이드에 '가정'으로 표기")
assume("R_EQUITY_DIV", "보유 주식 현금배당률", M.EQUITY_DIV, ["p6-cashflow"])
assume("R_TRACK_A", "트랙A 가중 기대수익률", round(M.a_rate, 2), ["p5-matrix"])
assume("R_TRACK_B", "트랙B 가중 기대수익률", round(M.b_rate, 2), ["p5-matrix"])
assume("R_TRACK_C", "트랙C 가중 기대수익률", round(M.c_rate, 2), ["p5-matrix"])
assume("R_NEW_PORT", "신규 운용자산 가중 기대수익률", round(M.new_rate, 2), ["p4-alloc"])
assume("R_SAFE", "연금계좌 안전자산 슬리브 기대수익률", round(M.safe_rate, 2),
       ["p2-compare", "p4-alloc"])
assume("R_RISK", "연금계좌 위험자산 슬리브 기대수익률", round(M.risk_rate, 2), ["p2-compare"])
assume("R_V1_PORT", "초판 전체 기대수익률 (비교용)", M.V1_PORT_RATE, ["p2-compare"],
       "초판 model.py 산출값 — 같은 방법으로 계산한 자체 산출치")
assume("R_V1_SAFE", "초판 안전자산 슬리브 기대수익률 (비교용)", M.V1_SAFE_RATE, ["p2-compare"])
for code, (val, basis) in M.EXPECTED.items():
    assume(f"EXP_{code}", f"{M.meta(code)['name']} 기대 총수익률", val, ["p5-matrix"], basis)

assume("R_FUND_CASH", "채권형 펀드 현금분배 비율 가정 (기대수익률 대비)",
       M.FUND_CASH_SHARE * 100, ["p6-cashflow"],
       "펀드 분배율이 데이터셋에 없어, 기대수익률의 50%만 현금으로 보는 보수적 가정")

# ── ETF 실측 ────────────────────────────────────────────────────────────
etf_base = dict(series="네이버 수집 ETF 데이터셋", as_of=MT["retAsOf"], tier=2,
                source_url=ETF_DS,
                note=f"수집 {MT['etfCollectedAt'][:10]} · 국내 상장 {MT['etfUniverse']}종 · "
                     f"수익률 기준일 {MT['retAsOf']} · 3년은 연율")
for code, e in M.ETF.items():
    add(id=f"T_{code}", kind="product_identity", metric="상품식별",
        text=f"{e['name']} 종목코드", value=code, unit="종목코드",
        verdict="confirmed", render="assert", printed_on=["p5-matrix"], **etf_base)
    add(id=f"DY_{code}", kind="product_yield", metric="ETF분배율",
        text=f"{e['name']} 분배율 (실측)", value=e["dividendYield"], unit="%",
        verdict="confirmed", render="assert", printed_on=["p5-matrix"], **etf_base)
    add(id=f"TER_{code}", kind="product_fee", metric="ETF보수",
        text=f"{e['name']} 총보수 (실측)", value=e["ter"], unit="%",
        verdict="confirmed", render="assert", printed_on=["p5-matrix"], **etf_base)
    for per, lab in (("trY1", "1년"), ("trY3", "3년(연율)")):
        if e[per] is None:
            continue
        add(id=f"{per.upper()}_{code}", kind="product_return", metric="ETF총수익",
            text=f"{e['name']} 총수익률 {lab} (실측, 분배금 재투자)", value=e[per], unit="%",
            verdict="confirmed", render="assert", printed_on=["p5-matrix", "p6-trap"],
            **etf_base)

# ── 펀드 실측 (클래스 단위) ─────────────────────────────────────────────
fund_base = dict(series="네이버 수집 공모펀드 데이터셋", as_of=MT["retAsOf"], tier=2,
                 source_url=FUND_DS,
                 note=f"수집 {MT['fundCollectedAt'][:10]} · 국내 설정 공모펀드 "
                      f"{MT['fundUniverse']}종 · 수익률 기준일 {MT['retAsOf']} · "
                      "매수 가능한 판매 클래스 기준 (모펀드 레코드 아님)")
for key, f in M.FUND.items():
    add(id=f"FC_{key}", kind="product_identity", metric="상품식별_펀드",
        text=f"{f['name']} 표준코드", value=f["code"], unit="표준코드",
        verdict="confirmed", render="assert", printed_on=["p5-matrix"], **fund_base)
    add(id=f"FFEE_{key}", kind="product_fee", metric="펀드보수",
        text=f"{f['name']} 총보수 (실측, 클래스 기준)", value=f["totalFee"], unit="%",
        verdict="confirmed", render="assert", printed_on=["p5-matrix"], **fund_base)
    add(id=f"FY1_{key}", kind="product_return", metric="펀드총수익",
        text=f"{f['name']} 1년 수익률 (실측, 클래스 기준)", value=f["ret1y"], unit="%",
        verdict="confirmed", render="assert", printed_on=["p5-matrix"], **fund_base)
    add(id=f"FY3C_{key}", kind="product_return", metric="펀드총수익",
        text=f"{f['name']} 3년 누적 수익률 (실측, 클래스 기준)", value=f["ret3yCum"],
        unit="%", verdict="confirmed", render="omit",
        note=fund_base["note"] + " · 누적 계열. 슬라이드에는 연율 환산값만 인쇄",
        series=fund_base["series"], as_of=fund_base["as_of"], tier=2,
        source_url=FUND_DS, printed_on=[])
    add(id=f"FY3A_{key}", kind="derived_return", metric="펀드총수익",
        text=f"{f['name']} 3년 연율 환산 (제안자 환산)", value=round(f["ret3yAnn"], 2),
        unit="%", verdict="confirmed", render="assert",
        note="누적 수익률을 (1+r)^(1/3)-1 로 연율 환산한 값. ETF 3년(연율)과 기준을 맞추기 위한 환산이며 "
             "환산식은 D_ANN_* 파생 항목에서 검산",
        series=fund_base["series"], as_of=fund_base["as_of"], tier=2,
        source_url=FUND_DS, printed_on=["p5-matrix"])

# 펀드 분배율 — 데이터 없음
add(id="FUND_DY", kind="access_blocked", metric="펀드확인필요",
    text="채권형 펀드의 분배율(월지급액)", value=0, unit="n/a",
    series="네이버 수집 공모펀드 데이터셋", as_of=MT["retAsOf"], tier=2,
    source_url=FUND_DS, verdict="unverified", render="marked",
    note="데이터셋에 분배 관련 필드가 없다. 슬라이드 분배율 칸에 '미확인'으로 표기하고, "
         "월 현금흐름은 기대수익률의 50%만 현금으로 보는 보수적 가정으로 산출했다",
    printed_on=["p5-matrix", "p6-cashflow"])

# 모펀드 레코드 함정 — 실제로 관측한 사실
add(id="PARENT_TRAP", kind="data_quality", metric="펀드데이터품질",
    text="모펀드('운용') 레코드와 판매 클래스의 1년 수익률 괴리 (iM에셋 월지급 미국달러하이일드)",
    value=9.58, unit="%", series="네이버 수집 공모펀드 데이터셋", as_of=MT["retAsOf"],
    tier=2, source_url=FUND_DS, verdict="confirmed", render="assert",
    note="모펀드 레코드 1년 9.58% vs 판매 클래스 A 2.18% / C 1.77% / C-e 1.88% / S 3.19%. "
         "모펀드는 매수할 수 없으므로 이 제안서는 전부 클래스 기준을 사용했다",
    printed_on=["p5-footnote"])

# ── 규제 ────────────────────────────────────────────────────────────────
add(id="REG_SAFE30", kind="regulation", metric="세제규정_비율",
    text="DC·IRP 위험자산 투자한도 70% (안전자산 30% 이상 편입 의무)", value=30.0, unit="%",
    series="2026년 시행 기준", as_of="2026-09-07", tier=2,
    source_url="https://securities.miraeasset.com/public/hks4412/011/DCIRP202412.pdf",
    corroborating_urls=["https://www.sedaily.com/article/14173945"],
    verdict="confirmed", render="assert",
    note="금융당국이 한도 폐지를 추진 중이나 2026-09-07 기준 시행 확정된 폐지안은 확인되지 않음",
    printed_on=["p4-alloc", "p5-matrix"])
add(id="REG_BOND_SAFE", kind="regulation", metric="세제규정_확인필요",
    text="채권형 펀드의 퇴직연금 안전자산 분류", value=0, unit="n/a",
    series="2026년 시행 기준", as_of="2026-09-07", tier=2,
    source_url="https://brunch.co.kr/@00b68069c88e4c0/94",
    corroborating_urls=["https://money-info.kr/32"],
    verdict="unverified", render="marked",
    note="채권형 펀드는 통상 안전자산으로 분류되나 세부 분류는 금융기관 내부기준에 따라 달라진다. "
         "특히 재간접형·이머징 채권은 분류가 갈릴 수 있어 매수 전 확인이 필요하다고 슬라이드에 표기",
    printed_on=["p5-matrix"])
for cid, text, val, metric, url, corro, note, pages in [
    ("REG_PENSION1500",
     "사적연금(세액공제분+운용수익) 연 1,500만원 초과 시 종합과세 또는 16.5% 분리과세 선택",
     1500.0, "세제규정_금액",
     "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6608&cntntsId=7888",
     ["https://brunch.co.kr/@noderesearch/39"],
     "이연퇴직소득에서 발생하는 연금소득은 이 한도와 무관하게 분리과세", ["p6-tax"]),
    ("REG_SEVERANCE",
     "이연퇴직소득 연금수령 시 연금소득세율은 퇴직소득세율의 70% (10년차까지)", 70.0,
     "세제규정_비율",
     "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6602&cntntsId=7882",
     ["https://www.pwc.com/kr/ko/insights/issue-brief/one-point-tax-01.html"],
     "11년차 이후는 60% — 일시금 대비 약 30~40% 절감", ["p6-tax"]),
    ("REG_SEVERANCE11", "이연퇴직소득 연금수령 11년차 이후 60%", 60.0, "세제규정_비율",
     "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6602&cntntsId=7882",
     ["https://kbthink.com/retirement-pension/tax.html"], None, ["p6-tax"]),
    ("REG_FIN2000", "금융소득종합과세 기준금액 연 2,000만원 (2026년 유지)", 2000.0,
     "세제규정_금액",
     "https://www.pwc.com/kr/ko/insights/issue-brief/one-point-tax-11.html",
     ["https://hometax-go.kr/financial-income-tax-threshold/"], None, ["p6-tax"]),
]:
    d = dict(id=cid, kind="regulation", metric=metric, text=text, value=val,
             unit="%" if metric.endswith("비율") else "만원", series="2026년 시행 기준",
             as_of="2026-09-07", tier=2, source_url=url, verdict="confirmed",
             render="assert", printed_on=pages)
    if corro:
        d["corroborating_urls"] = corro
    if note:
        d["note"] = note
    add(**d)

add(id="REG_ISA", kind="regulation", metric="세제규정_금액", text="ISA 연간 납입한도 (1인)",
    value=2000.0, unit="만원", series="2026년 시행 기준", as_of="2026-09-07", tier=2,
    source_url="https://www.pwc.com/kr/ko/insights/issue-brief/one-point-tax-11.html",
    verdict="unverified", render="marked",
    note="2026년 ISA 한도 개정 여부를 1차 출처에서 확인하지 못함 — 실행 전 확인 필요",
    printed_on=["p6-tax"])
add(id="REG_HI_PENSION", kind="access_blocked", metric="세제규정_확인필요",
    text="사적연금 인출액의 건강보험료 부과 여부", value=0, unit="n/a",
    series="2026년 시행 기준", as_of="2026-09-07", tier=1,
    source_url="unverified:1차 출처(국민건강보험공단) 확인 실패",
    verdict="unverified", render="omit",
    note="공단 1차 자료를 확인하지 못해 단정하지 않고, 건보료 영향 점검만 실행 항목으로 기재",
    printed_on=[])

# ── 파생 검산 ───────────────────────────────────────────────────────────
derived += [
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
    {"id": "S_SAFE_ASSET", "kind": "sum", "terms": [r[1] for r in M.TRACK_A if r[2] == "안전"],
     "printed": round(M.safe_amt, 2), "tolerance": 0.005},
    {"id": "RT_SAFE_PCT", "kind": "ratio", "numerator": round(M.safe_amt, 2),
     "denominator": round(M.a_amt, 2), "printed": round(M.safe_pct / 100, 4),
     "tolerance": 0.0005},
    {"id": "RT_P3_RATE", "kind": "ratio", "numerator": round(M.p3_income, 4),
     "denominator": round(M.p3_total, 2), "printed": round(M.p3_rate / 100, 4),
     "tolerance": 0.0002},
    {"id": "S_TYPE_MIX", "kind": "sum",
     "terms": [round(M.etf_amt, 2), round(M.fund_amt, 2), round(M.gic_amt, 2)],
     "printed": round(M.new_amt, 2), "tolerance": 0.005,
     "_설명": "ETF + 채권형 펀드 + 원리금보장 = 신규 운용자산"},
    {"id": "S_MGR_MIX", "kind": "sum", "terms": [round(v, 2) for v in M.managers.values()],
     "printed": round(M.new_amt, 2), "tolerance": 0.02,
     "_설명": "운용사별 배분 합계 = 신규 운용자산"},
    {"id": "D_GAIN_PORT", "kind": "sum",
     "terms": [round(M.port_rate, 2), -M.V1_PORT_RATE],
     "printed": round(M.port_rate - M.V1_PORT_RATE, 2), "tolerance": 0.02,
     "_설명": "초판 대비 전체 기대수익률 개선폭"},
    {"id": "D_GAIN_SAFE", "kind": "sum",
     "terms": [round(M.safe_rate, 2), -M.V1_SAFE_RATE],
     "printed": round(M.safe_rate - M.V1_SAFE_RATE, 2), "tolerance": 0.02,
     "_설명": "초판 대비 안전자산 슬리브 개선폭"},
]
# 펀드 3년 누적 → 연율 환산 검산
for key, f in M.FUND.items():
    derived.append({
        "id": f"D_ANN_{key}", "kind": "product",
        "a": round((1 + f["ret3yCum"] / 100) ** (1 / 3), 6), "b": 100,
        "printed": round(f["ret3yAnn"] + 100, 2), "tolerance": 0.02,
        "_설명": f"{f['name']} 3년 누적 {f['ret3yCum']:.2f}% → 연율 {f['ret3yAnn']:.2f}% 환산 검산",
    })

ledger = {
    "_설명": "은퇴자산 운용 제안서 v2 주장 대장. make_claims_v2.py 가 생성한다 — 직접 수정하지 말 것.",
    "deliverable": "은퇴자산 운용 제안서 v2 — 전체 운용사 ETF + 채권형 펀드 (6p PPT)",
    "as_of": "2026-09-07",
    "_series_policy": "ETF 3년은 연율, 펀드 3년은 누적. 펀드는 연율로 환산해 한 계열로 맞춘다. "
                      "펀드 지표는 모펀드가 아니라 매수 가능한 판매 클래스 기준.",
    "series_policy": {
        "가구자산": "고객 제공 잔액 (2026-09-07 상담)",
        "월현금흐름": "고객 제시 필요액 (세전, 만원/월)",
        "기대수익률": "제안자 설계 가정 (연율, 세전 총수익)",
        "상품식별": "네이버 수집 ETF 데이터셋",
        "상품식별_펀드": "네이버 수집 공모펀드 데이터셋",
        "ETF분배율": "네이버 수집 ETF 데이터셋",
        "ETF총수익": "네이버 수집 ETF 데이터셋",
        "ETF보수": "네이버 수집 ETF 데이터셋",
        "펀드총수익": "네이버 수집 공모펀드 데이터셋",
        "펀드보수": "네이버 수집 공모펀드 데이터셋",
        "펀드확인필요": "네이버 수집 공모펀드 데이터셋",
        "펀드데이터품질": "네이버 수집 공모펀드 데이터셋",
        "세제규정_비율": "2026년 시행 기준",
        "세제규정_금액": "2026년 시행 기준",
        "세제규정_확인필요": "2026년 시행 기준",
    },
    "claims": claims,
    "derived": derived,
    "unit_policy": {
        "가구자산": "억원", "월현금흐름": "만원/월", "기대수익률": "%",
        "상품식별": "종목코드", "상품식별_펀드": "표준코드",
        "ETF분배율": "%", "ETF총수익": "%", "ETF보수": "%",
        "펀드총수익": "%", "펀드보수": "%", "펀드확인필요": "n/a",
        "펀드데이터품질": "%",
        "세제규정_비율": "%", "세제규정_금액": "만원", "세제규정_확인필요": "n/a",
    },
}
(HERE / "claims_v2.json").write_text(
    json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"claims_v2.json 생성 — 주장 {len(claims)}건 / 파생 {len(derived)}건")
