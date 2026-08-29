# -*- coding: utf-8 -*-
"""마포WM 브리핑을 짓는다 — 10절 구조.

  python3 scripts/build_briefing.py [--date YYYY-MM-DD] [--kind morning|close|global]

**판을 물려 짓지 않는다.** 어제 파일을 복사해 고치는 방식이 글을 굳게 만들었으므로
(지침 7-2-1), 표와 날짜 이름표와 파생 수치는 전부 이 파일이 시세 자료에서 만들고,
그날의 서술만 `data/briefing/narrative-<날짜>.json` 에서 받는다.

서술 파일이 없거나 어떤 키가 비면 **어제 문장이 남는 것이 아니라** 자료에서 계산한
한 줄이 대신 나가고, 어느 키가 비었는지 검증 노트에 적힌다. 굳을 자리를 없앤 것이다.

절 열 개(지침 7절):
  01 today     오늘의 결론
  02 korea     국내 증시
  03 flows     수급 · 증시 주변자금
  04 global    간밤 해외
  05 earnings  실적 · 컨퍼런스콜
  06 macro     금리 · 환율 · 원자재
  07 deep      심층 분석            ← 조건부
  08 calendar  일정 · 체크포인트
  09 talking   고객 응대
  10 verify    데이터 · 검증
"""
import argparse
import datetime
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from briefing_lib import (  # noqa: E402
    KST, WD, VF_OK, VF_MD, VF_C, VF_1, VF_N,
    d, DK, DE, DD, DS, n, pct, bp, eok, jo, esc,
    L, TH, THP, perf_cells, tbl, exp, P, lede, stat, card, callout,
    sparkline, bar, Doc, Narrative, assemble)
from briefing_prepare import prepare, KIND_NAME  # noqa: E402


# ══════════════════════════════════════════════════════════════════
# 자료
# ══════════════════════════════════════════════════════════════════
def load():
    D = json.load(io.open(ROOT + "/data/market/latest.json", encoding="utf-8"))
    try:
        H = json.load(io.open(ROOT + "/data/market/history.json", encoding="utf-8"))
    except Exception:                                             # noqa: BLE001
        H = {"rows": []}
    return D, H


def narrative_for(day, kind="morning"):
    """그날의 서술 파일을 읽는다 — **판 이름을 붙인 것을 먼저 본다.**

    예전에는 `narrative-<날짜>.json` 하나뿐이었다. 그런데 모닝과 장마감은
    서로 다른 예약이 서로 다른 창에서 돌고, 같은 날 둘 다 나온다. 2026-08-28
    에 실제로 장마감 판의 서술이 모닝 판의 서술 파일을 덮어썼다 — 같은
    이름이었기 때문이다. 발행된 판은 이미 만들어진 뒤라 무사했지만, 그날
    아침에 무엇을 썼는지는 저장소에서 사라졌다.

    이제 `narrative-<날짜>-<판>.json` 을 먼저 찾고, 없으면 옛 이름으로
    떨어진다(지난 판들이 그 이름으로 남아 있다).
    """
    base = ROOT + "/data/briefing/narrative-%s" % day.isoformat()
    for p in ("%s-%s.json" % (base, kind), "%s.json" % base):
        if os.path.exists(p):
            return json.load(io.open(p, encoding="utf-8"))
    return {}


# ══════════════════════════════════════════════════════════════════
# 절
# ══════════════════════════════════════════════════════════════════
def sec_today(C):
    """01 오늘의 결론 — 카드 여섯 + 세 줄.

    **여기서 쓴 숫자를 뒤에서 다시 적지 않는다**(지침 7-2-1 ①). 뒤 절은 표가
    말하게 두고, 이 절만 「그래서 무엇을 할 것인가」를 말한다.
    """
    I, KS, KQ, ksb, kqb, kf = C["I"], C["KS"], C["KQ"], C["ksb"], C["kqb"], C["kf"]
    N, ru, S = C["N"], C["ru"], C["S"]
    ten = C["adv_per_ten"]

    cards = [
        stat("코스피 (" + DS(C["prev_kr"]) + ")", "KOSPI (" + DE(C["prev_kr"]) + ")",
             n(KS["close"]), pct(KS["change_pct"]),
             "상승 " + n(ksb["advancing"], 0) + " 대 하락 " + n(ksb["declining"], 0)
             + " &mdash; 열에 " + n(ten, 0),
             n(ksb["advancing"], 0) + " up, " + n(ksb["declining"], 0) + " down"),
        stat("코스닥", "KOSDAQ", n(KQ["close"]), pct(KQ["change_pct"]),
             "상승 " + n(kqb["advancing"], 0) + " 대 하락 " + n(kqb["declining"], 0),
             n(kqb["advancing"], 0) + " up, " + n(kqb["declining"], 0) + " down"),
        stat("거래대금", "Turnover", n(C["turnover"][0][1]) + "조", C["turnover_word"],
             C["turnover_trail"], C["turnover_trail_en"]),
        stat("외국인 순매수", "Foreign net", eok(kf["foreign"]), "",
             "기관 " + eok(kf["institution"]) + " &middot; 개인 " + eok(kf["retail"]),
             "Institutions " + eok(kf["institution"]) + ", retail " + eok(kf["retail"])),
        stat("미 10년물", "US 10-year", n(ru["curve"]["ust10y"], 3) + "%",
             bp(ru["change_bp"]["ust10y"]),
             "2년 " + bp(ru["change_bp"]["ust2y"]) + " &middot; 30년 " + bp(ru["change_bp"]["ust30y"]),
             "2y " + bp(ru["change_bp"]["ust2y"]) + ", 30y " + bp(ru["change_bp"]["ust30y"])),
        stat("원/달러", "USD/KRW", n(C["usdkrw"]["close"], 2), pct(C["usdkrw"]["change_pct"]),
             "달러인덱스 " + pct(I["dxy"]["change_pct"]),
             "Dollar index " + pct(I["dxy"]["change_pct"])),
    ]

    paras = []
    for i, key in enumerate(("today_1", "today_2", "today_3")):
        fb_ko, fb_en = C["fallback_today"][i]
        a, b = N.get(key, fb_ko, fb_en)
        paras.append(P(a, b))

    return ('<div class="stat-grid six">\n' + "\n".join(cards) + '\n</div>\n'
            + callout("오늘 09시 개장에 들고 갈 것",
                      "What to carry into the 09:00 open", paras))


def sec_korea(C):
    """02 국내 증시 — 지수·폭·종목. 종목표는 **주도와 부진 여덟씩**으로 줄인다."""
    I, KS, KQ, ksb, kqb, N, S = C["I"], C["KS"], C["KQ"], C["ksb"], C["kqb"], C["N"], C["S"]
    idx_head = [TH("지수", "Index", "wrap"), TH("설명", "What it says", "note wrap"),
                TH("종가", "Close", "n"), TH("등락률", "Change %", "n"), THP(),
                TH("검증", "Verified", "n opt")]
    rows = []
    for k, ko, en, nk, ne in (
            ("kospi", "코스피", "KOSPI", "대형주 중심. 삼성전자·SK하이닉스가 절반 가까이",
             "Large caps; two chipmakers are nearly half of it"),
            ("kosdaq", "코스닥", "KOSDAQ", "중소형·성장주 중심",
             "Small and mid-cap growth")):
        v = I[k]
        rows.append('      <tr><th class="wrap">' + L(ko, en) + '</th>'
                    '<td class="n note">' + L(nk, ne) + '</td>'
                    '<td class="n">' + n(v["close"]) + '</td>' + _cell(v["change_pct"])
                    + perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
    kr_idx = tbl("국내 지수 &mdash; " + DK(C["prev_kr"], True) + " 마감",
                 "Korean indices &mdash; " + DE(C["prev_kr"], True) + " close",
                 idx_head, rows, cls="data compact",
                 foot_ko=C["kr_idx_foot_ko"], foot_en=C["kr_idx_foot_en"])

    # 폭 · 52주 위치 — 한 표로 합쳐 절 수를 줄인다
    br_head = [TH("항목", "Measure", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
               TH("코스피", "KOSPI", "n"), TH("코스닥", "KOSDAQ", "n"),
               TH("검증", "Verified", "n opt")]
    br_rows = [
        _brow("상승 / 하락 종목", "Advancing / declining",
              "지수 방향과 어긋나면 대형주 몇 개가 지수를 움직인 것입니다",
              "If it disagrees with the index, a few heavyweights moved it",
              n(ksb["advancing"], 0) + " / " + n(ksb["declining"], 0),
              n(kqb["advancing"], 0) + " / " + n(kqb["declining"], 0), True),
        _brow("오른 종목 비율", "Share advancing",
              "열 종목 가운데 몇 개가 올랐는지",
              "How many in ten rose",
              "열에 " + n(C["adv_per_ten"], 0), "열에 " + n(C["adv_per_ten_q"], 0)),
        _brow("52주 구간 내 위치", "Position in the 52-week range",
              "(종가 &minus; 저) &divide; (고 &minus; 저). 지금이 비싼 자리인지",
              "(close &minus; low) / (high &minus; low)",
              n(C["pos52_ks"], 1) + "%", n(C["pos52_kq"], 1) + "%"),
        _brow("상한 / 하한", "Limit up / down", "&nbsp;", "&nbsp;",
              n(ksb.get("limit_up"), 0) + " / " + n(ksb.get("limit_down"), 0),
              n(kqb.get("limit_up"), 0) + " / " + n(kqb.get("limit_down"), 0)),
    ]
    breadth = tbl("시장의 폭 &mdash; " + DK(C["prev_kr"]), "Market breadth &mdash; " + DE(C["prev_kr"]),
                  br_head, br_rows, cls="data compact",
                  foot_ko="<strong>52주 최고는 네이버 지수 페이지 표기 그대로</strong>이며 최근 종가 흐름과 "
                          "차이가 큽니다 &mdash; 검증 노트를 보십시오 " + VF_N + ".",
                  foot_en="<strong>The 52-week high is as published by Naver</strong> and sits far above recent "
                          "closes &mdash; see the verification notes " + VF_N + ".")

    kr_stk = _stock_table("국내 주요 종목 &mdash; " + DK(C["prev_kr"]) + " 마감, 단위 원",
                          "Korean stocks &mdash; " + DE(C["prev_kr"]) + " close, in won",
                          C["kr_top"], C["kr_bot"], C["why"],
                          foot_ko=C["kr_stk_foot_ko"], foot_en=C["kr_stk_foot_en"])

    a, b = N.get("korea_lede", C["fb_korea"][0], C["fb_korea"][1])
    return (lede(a, b) + "\n" + kr_idx + "\n" + breadth + "\n" + kr_stk + "\n"
            + exp("업종 상위·하위와 등락 종목 수 추이",
                  "Sector leaders and laggards, and breadth over time",
                  C["sector_tbl"] + "\n" + C["breadth_trend"]))


def sec_flows(C):
    """03 수급 · 증시 주변자금 — 요건 8. 외국인/기관/개인 · 예탁금 · 신용 · 매물대."""
    N, kf, qf, KSI, mfl = C["N"], C["kf"], C["qf"], C["KSI"], C["mfl"]
    head = [TH("주체 &middot; 항목", "Who / what", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
            TH("코스피", "KOSPI", "n"), TH("코스닥", "KOSDAQ", "n"), TH("검증", "Verified", "n opt")]
    rows = [
        _brow("외국인 순매수", "Foreign net buying",
              "방향보다 <strong>전날 대비 변화</strong>가 큽니다 &mdash; 팔던 손이 멎는 것만으로 지수가 움직입니다",
              "The change matters more than the level",
              eok(kf["foreign"]), eok(qf["foreign"]), True),
        _brow("기관 순매수", "Institutions", "연기금·투신·보험", "Pensions, funds, insurers",
              eok(kf["institution"]), eok(qf["institution"])),
        _brow("개인 순매수", "Retail", "외국인·기관이 판 것을 누가 받았는지",
              "Who absorbed what the others sold", eok(kf["retail"]), eok(qf["retail"])),
        _brow("프로그램 비차익", "Non-arb programme",
              "크게 마이너스면 <strong>바스켓 매도</strong>가 지수를 눌렀다는 신호입니다",
              "Deeply negative means basket selling weighed on the index",
              eok(KSI["program_trading"]["non_arb"]),
              eok(C["KQI"]["program_trading"]["non_arb"])),
    ]
    flow_tbl = tbl("투자자별 순매수 &mdash; " + DK(C["prev_kr"]) + ", 단위 원",
                   "Net buying by investor type &mdash; " + DE(C["prev_kr"]),
                   head, rows, cls="data compact",
                   foot_ko=C["flow_foot_ko"], foot_en=C["flow_foot_en"])

    # 증시 주변자금 — 예탁금·신용·펀드. **증감은 *_delta 를 쓴다**(지침 1절).
    mh = [TH("항목", "Item", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
          TH("잔액", "Level", "n"), TH("전일 대비", "Change", "n"),
          TH("10영업일 흐름", "10 sessions", "n sparkcell"), TH("검증", "Verified", "n opt")]
    ser = (C["D"].get("money_flow") or {}).get("series") or []

    def _sp(key):
        vals = [r.get(key) for r in ser if r.get(key) is not None]
        return sparkline(vals[::-1] if vals else [])

    mrows = [
        _mrow("고객예탁금", "Customer deposits",
              "<strong>증시로 들어와 대기 중인 돈</strong>입니다. 늘면 살 힘이 붙습니다",
              "Cash parked and waiting to buy",
              jo(mfl.get("deposit")) + "원", eok(mfl.get("deposit_delta")), _sp("deposit"), True),
        _mrow("신용융자 잔고", "Margin loans",
              "<strong>빌려서 산 돈</strong>입니다. 늘면 오를 때도 내릴 때도 폭이 커집니다",
              "Money borrowed to buy; it amplifies both directions",
              jo(mfl.get("credit_balance")) + "원", eok(mfl.get("credit_balance_delta")),
              _sp("credit_balance")),
        _mrow("주식형 펀드", "Equity funds", "간접 투자 쪽 자금", "Indirect flows",
              jo(mfl.get("fund_equity")) + "원", eok(mfl.get("fund_equity_delta")),
              _sp("fund_equity")),
        _mrow("채권형 펀드", "Bond funds", "위험을 덜 때 이쪽이 늡니다",
              "This grows when risk comes off",
              jo(mfl.get("fund_bond")) + "원", eok(mfl.get("fund_bond_delta")),
              _sp("fund_bond")),
    ]
    money_tbl = tbl("증시 주변자금 &mdash; " + DK(d(mfl["date"])) + " 기준",
                    "Money around the market &mdash; as of " + DE(d(mfl["date"])),
                    mh, mrows, cls="data compact",
                    foot_ko="<strong>신용융자와 예탁금은 결제일 기준</strong>이라 종가일보다 1~2영업일 "
                            "늦습니다 " + VF_MD + ". 증감은 네이버가 주는 부호 없는 값이 아니라 "
                            "<strong>계열에서 계산한 실제 증감</strong>입니다 " + VF_C + ". "
                            "스파크라인의 세로 축은 <strong>줄마다 따로 맞췄으므로 높이를 줄끼리 견주지 마십시오.</strong>",
                    foot_en="<strong>Deposits and margin balances are on a settlement basis</strong>, one to two "
                            "sessions behind the close " + VF_MD + ". Changes are computed from the series, not "
                            "taken from the unsigned figure Naver publishes " + VF_C + ". "
                            "<strong>Each sparkline is scaled to its own row</strong> &mdash; do not compare heights.")

    body = lede(*N.get("flows_lede", C["fb_flows"][0], C["fb_flows"][1]))
    body += "\n" + flow_tbl + "\n" + money_tbl
    if C["supply_tbl"]:
        body += "\n" + C["supply_tbl"]
    body += "\n" + exp("투자자별 순매수 추이 &mdash; 최근 10거래일",
                       "Net buying by investor type &mdash; last 10 sessions", C["inv_trend"])
    return body


def sec_global(C):
    """04 간밤 해외 — 미국·유럽·아시아를 **한 절에** 넣는다(지침 7절 압축)."""
    I, N = C["I"], C["N"]
    idx_head = [TH("지수", "Index", "wrap"), TH("지역", "Region", "wrap"),
                TH("종가", "Close", "n"), TH("등락률", "Change %", "n"), THP(),
                TH("검증", "Verified", "n opt")]
    SPEC = [("dow", "다우", "Dow", "미국", "US"), ("sp500", "S&amp;P 500", "S&amp;P 500", "미국", "US"),
            ("nasdaq", "나스닥", "NASDAQ", "미국", "US"), ("sox", "SOX (반도체)", "SOX", "미국", "US"),
            ("vix", "VIX", "VIX", "미국", "US"),
            ("stoxx600", "STOXX 600", "STOXX 600", "유럽", "Europe"),
            ("dax", "DAX", "DAX", "유럽", "Europe"), ("ftse", "FTSE 100", "FTSE 100", "유럽", "Europe"),
            ("nikkei", "니케이", "Nikkei", "아시아", "Asia"),
            ("hangseng", "항셍", "Hang Seng", "아시아", "Asia"),
            ("shanghai", "상하이", "Shanghai", "아시아", "Asia"),
            ("taiwan", "가권", "Taiwan", "아시아", "Asia")]
    rows = []
    for k, ko, en, rk, re_ in SPEC:
        v = I.get(k)
        if not v:
            continue
        hl = ' class="hl"' if k in ("sox", "taiwan") else ''
        rows.append('      <tr' + hl + '><th class="wrap">' + L(ko, en) + '</th>'
                    '<td class="wrap">' + L(rk, re_) + '</td>'
                    '<td class="n">' + n(v["close"]) + '</td>' + _cell(v["change_pct"])
                    + perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
    gidx = tbl("해외 지수 &mdash; " + DK(C["prev_us"]) + " 현지 마감",
               "Overseas indices &mdash; local close, " + DE(C["prev_us"]),
               idx_head, rows, cls="data compact",
               foot_ko="<strong>아시아는 미국보다 먼저 닫습니다</strong> &mdash; 같은 날짜라도 아시아는 "
                       "미국 장중에 나온 소식을 모르는 채 거래를 끝냅니다 " + VF_C + ". "
                       "<strong>가권은 TSMC 비중이 커 반도체 투심의 대리 지표</strong>로 봅니다.",
               foot_en="<strong>Asia closes before New York</strong> &mdash; on the same date, Asia trades without "
                       "knowing what the US session brings " + VF_C + ". <strong>Taiwan, TSMC-heavy, reads as a "
                       "proxy for semiconductor sentiment.</strong>")

    us_stk = _stock_table("미국 주요 종목 &mdash; " + DK(C["prev_us"]) + ", 단위 달러",
                          "US stocks &mdash; " + DE(C["prev_us"]) + ", in dollars",
                          C["us_top"], C["us_bot"], C["why"],
                          foot_ko=C["us_stk_foot_ko"], foot_en=C["us_stk_foot_en"])

    a, b = N.get("global_lede", C["fb_global"][0], C["fb_global"][1])
    return (lede(a, b) + "\n" + gidx + "\n" + us_stk + "\n"
            + exp("미국 업종 ETF &middot; 유럽 &middot; 일본 &middot; 중국 개별 종목",
                  "US sector ETFs, and single stocks in Europe, Japan and China",
                  C["us_sec_tbl"] + "\n" + C["eu_tbl"] + "\n" + C["jp_tbl"] + "\n" + C["cn_tbl"]))


def sec_earnings(C):
    """05 실적 · 컨퍼런스콜 — 요건 3. **기사 원문 그대로** 싣는다."""
    N = C["N"]
    E = (C["D"].get("earnings") or {})
    items = E.get("items") or []
    a, b = N.get("earnings_lede",
                 ("오늘 수집분에서 실적&middot;컨퍼런스콜을 다룬 대목이 <strong>" + str(len(items))
                  + "건</strong> 나왔습니다"
                  + ("(컨퍼런스콜 언급 " + str(E.get("with_call", 0)) + "건)." if items else ".")
                  + " 아래는 <strong>기사 본문을 그대로</strong> 옮긴 것입니다 " + VF_1 + "."
                  if items else
                  "<strong>오늘 수집분에는 실적&middot;컨퍼런스콜을 다룬 기사가 없습니다</strong> " + VF_N
                  + " &mdash; 지어내지 않고 비워 둡니다."),
                 ("Today&rsquo;s collection contains <strong>" + str(len(items))
                  + "</strong> passages on results and calls; the text below is quoted verbatim " + VF_1 + "."
                  if items else
                  "<strong>No article in today&rsquo;s collection covers results or calls</strong> " + VF_N + "."))
    if not items:
        return lede(a, b)

    VERD = {"beat": ("<span class=\"vf ok\">상회</span>", "<span class=\"vf ok\">BEAT</span>"),
            "miss": ("<span class=\"vf bad\">하회</span>", "<span class=\"vf bad\">MISS</span>")}
    head = [TH("기업", "Company", "wrap"), TH("기사에서", "From the article", "wrap"),
            TH("판정", "Verdict", "n"), TH("컨콜", "Call", "n"), TH("검증", "Verified", "n opt")]
    rows = []
    for e in items[:8]:
        vk, ve = VERD.get(e.get("verdict"), ("&mdash;", "&mdash;"))
        px = C["price_of"](e["company"])
        rows.append('      <tr' + (' class="hl"' if e.get("has_call") else '') + '>'
                    '<th class="wrap">' + esc(e["company"])
                    + ('<span class="sub">' + px + '</span>' if px else '') + '</th>'
                    '<td class="wrap">' + esc(e["quotes"][0])[:220] + '</td>'
                    '<td class="n">' + L(vk, ve) + '</td>'
                    '<td class="n">' + ("&#9679;" if e.get("has_call") else "&mdash;") + '</td>'
                    '<td class="n opt">' + VF_1 + '</td></tr>')
    t = tbl("실적 &middot; 컨퍼런스콜 &mdash; 오늘 수집분",
            "Results and calls &mdash; from today&rsquo;s collection", head, rows,
            cls="data compact",
            foot_ko="<strong>판정은 기사에 「상회」·「하회」라고 적혀 있을 때만</strong> 답니다 &mdash; "
                    "컨센서스를 저희가 다시 계산한 것이 아닙니다 " + VF_1 + ". 「컨콜」 표시는 그 기사에 "
                    "컨퍼런스콜 발언이 인용된 경우입니다. <strong>이름 밑 숫자는 그 종목의 직전 마감</strong>입니다.",
            foot_en="<strong>A verdict appears only where the article itself says beat or miss</strong> &mdash; we do "
                    "not recompute consensus " + VF_1 + ". The call marker means the article quotes the earnings "
                    "call. <strong>The figure under each name is that stock&rsquo;s last close.</strong>")

    calls = [e for e in items if e.get("call_quotes")]
    body = lede(a, b) + "\n" + t
    if calls:
        cc = "\n".join(
            card(e["company"] + " &mdash; 컨퍼런스콜", e["company"] + " &mdash; earnings call",
                 " ".join(esc(q) for q in e["call_quotes"][:2])[:420] + " " + VF_1,
                 " ".join(esc(q) for q in e["call_quotes"][:2])[:420] + " " + VF_1)
            for e in calls[:3])
        body += '\n<div class="soft-grid">\n' + cc + '\n</div>'
    return body


def sec_macro(C):
    """06 금리 · 환율 · 원자재 — 세 절이던 것을 하나로(지침 7절 압축)."""
    I, ru, N, ec, rk = C["I"], C["ru"], C["N"], C["ec"], C["rk"]
    h = [TH("항목", "Item", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
         TH("현재", "Level", "n"), TH("전일 대비", "Change", "n"),
         TH("검증", "Verified", "n opt")]
    rows = [
        _brow("미 국채 2년", "US 2-year",
              "<strong>정책금리 기대</strong>가 가장 먼저 붙는 만기입니다",
              "Where policy expectations show up first",
              n(ru["curve"]["ust2y"], 3) + "%", bp(ru["change_bp"]["ust2y"]), True),
        _brow("미 국채 10년", "US 10-year",
              "국내 성장주&middot;반도체의 <strong>할인율</strong>입니다",
              "The discount rate on Korean growth and semis",
              n(ru["curve"]["ust10y"], 3) + "%", bp(ru["change_bp"]["ust10y"]), True),
        _brow("미 국채 30년", "US 30-year", "재정과 기간 프리미엄이 붙는 자리",
              "Where fiscal risk and term premium sit",
              n(ru["curve"]["ust30y"], 3) + "%", bp(ru["change_bp"]["ust30y"])),
        _brow("10년 &minus; 2년", "10s minus 2s",
              "<strong>기울기</strong>. 가팔라지면 성장&middot;물가 쪽, 눌리면 정책 쪽입니다",
              "The slope &mdash; steepening is growth, flattening is policy",
              bp(ru.get("spread_10y_2y_bp"), 0), "&mdash;"),
        _brow("국고채 10년", "Korea 10-year", "한미 금리차가 원화 방향과 직결됩니다",
              "The Korea&ndash;US gap drives the won",
              n((ec.get("ktb10y") or {}).get("value"), 3) + "%",
              bp(((rk.get("perf") or {}).get("ktb10y") or {}).get("w1"))),
        _brow("한미 10년 금리차", "Korea minus US, 10-year",
              "마이너스면 <strong>국내 금리가 미국보다 낮다</strong>는 뜻이고 원화에 부담입니다",
              "Negative means Korean yields sit below US yields",
              bp(C["kr_us_gap"], 1), "&mdash;"),
        _brow("COFIX (신규취급액)", "COFIX, new loans",
              "<strong>고객 대출금리에 직결</strong>됩니다", "Feeds directly into retail loan rates",
              n(rk.get("cofix_new"), 2) + "%", "&mdash;"),
        _brow("MOVE", "MOVE", "채권판 VIX. 금리가 움직여도 이게 죽어 있으면 안도입니다",
              "The VIX of bonds", n(I["move"]["close"]), pct(I["move"]["change_pct"])),
    ]
    rates = tbl("금리 &mdash; " + DK(C["prev_us"]) + " 확정",
                "Rates &mdash; official fixings, " + DE(C["prev_us"]), h, rows,
                cls="data compact",
                foot_ko="미 국채는 <strong>재무부 확정 고시</strong>이고 " + VF_OK + ", 국고채는 한국은행 "
                        "ECOS 입니다. <strong>한미 금리차는 같은 만기끼리 뺀 값</strong>입니다 " + VF_C + ". "
                        "만기 열한 개 전부는 아래 상세에 있습니다.",
                foot_en="US yields are <strong>Treasury official fixings</strong> " + VF_OK + "; Korean yields come "
                        "from ECOS. <strong>The gap is same-maturity subtraction</strong> " + VF_C + ". "
                        "The full eleven-point curve is in the detail below.")

    a, b = N.get("macro_lede", C["fb_macro"][0], C["fb_macro"][1])
    return (lede(a, b) + "\n" + rates + "\n" + C["fx_tbl"] + "\n" + C["cm_tbl"] + "\n"
            + exp("미 재무부 곡선 만기 11개 &middot; 달러 상대 통화",
                  "The full US curve and the dollar crosses",
                  C["curve_tbl"] + "\n" + C["usdfx_tbl"]))


def sec_deep(C):
    """07 심층 분석 — 요건 6. **큰 이벤트가 있는 날만** 실린다."""
    N = C["N"]
    dp = N.d.get("deep")
    if not isinstance(dp, dict) or not dp.get("title_ko"):
        return None
    N.used.add("deep")
    blocks = [lede(dp.get("lede_ko", ""), dp.get("lede_en", ""))]
    for row in dp.get("blocks", []):
        blocks.append(card(row.get("q_ko", ""), row.get("q_en", ""),
                           row.get("a_ko", ""), row.get("a_en", "")))
    body = blocks[0] + '\n<div class="soft-grid">\n' + "\n".join(blocks[1:]) + '\n</div>'
    if dp.get("table"):
        body += "\n" + dp["table"]
    return (dp["title_ko"], dp.get("title_en", dp["title_ko"]), body)


def sec_calendar(C):
    """08 일정 — **지난 줄은 스스로 빠진다**(지침 7-2-1 ③)."""
    N, today = C["N"], C["today"]
    rows_in = N.d.get("calendar") or []
    head = [TH("일시 (KST)", "When", "wrap"), TH("왜 보는가", "Why it matters", "note wrap"),
            TH("구분", "Type", "wrap"), TH("일정", "Event", "wrap"), TH("검증", "Verified", "n opt")]
    kept, dropped = [], 0
    for r in rows_in:
        last = _cal_last(r.get("when_ko", ""), today.year)
        if last and last < today:
            dropped += 1
            continue
        kept.append('      <tr' + (' class="hl"' if r.get("hl") else '') + '>'
                    '<th class="wrap">' + r.get("when_ko", "") + '</th>'
                    '<td class="n note">' + L(r.get("why_ko", "&nbsp;"), r.get("why_en", "&nbsp;")) + '</td>'
                    '<td class="wrap">' + L(r.get("type_ko", ""), r.get("type_en", "")) + '</td>'
                    '<td class="wrap">' + L(r.get("what_ko", ""), r.get("what_en", "")) + '</td>'
                    '<td class="n opt">' + VF_1 + '</td></tr>')
    C["cal_dropped"] = dropped
    if not kept:
        return lede("<strong>오늘 실을 예정 일정이 서술 파일에 없습니다</strong> " + VF_N
                    + " &mdash; 지어내지 않고 비워 둡니다.",
                    "<strong>No forward calendar was supplied for today</strong> " + VF_N + ".")
    t = tbl("예정 일정 &mdash; " + DK(today) + " 이후 (한국시간)",
            "Scheduled events from " + DE(today) + ", KST", head, kept, cls="data compact",
            foot_ko="<strong>지난 줄은 스스로 빠집니다</strong> &mdash; 오늘 " + str(dropped) + "줄을 걷어냈습니다 "
                    + VF_C + ". <strong>컨센서스와 전망은 결과가 아닙니다.</strong> 거래소가 일정을 바꾸므로 "
                            "주문 직전 다시 확인하십시오.",
            foot_en="<strong>Elapsed rows drop out on their own</strong> &mdash; " + str(dropped)
                    + " removed today " + VF_C + ". <strong>Forecasts are not results.</strong> Exchanges move "
                      "dates; reconfirm before acting.")
    a, b = N.get("calendar_lede",
                 "앞으로 2주 이상을 봅니다. <strong>날짜가 정해져 있고 시장을 움직일 수 있는 것</strong>만 "
                 "넣었습니다 &mdash; 매일 같은 시각에 열리는 개장&middot;마감은 넣지 않습니다.",
                 "Two weeks or more ahead. <strong>Only dated events that can move the market</strong> &mdash; "
                 "recurring opens and closes are left out.")
    body = lede(a, b) + "\n" + t
    # 휴장일은 **자료 파일**에서 온다(지침 7-3절). 이 절 안에 접어서 둔다.
    if C.get("holiday_tbl"):
        body += "\n" + exp("휴장일 &mdash; 국내&middot;해외 앞으로 넉 달",
                           "Market holidays &mdash; Korea and overseas, next four months",
                           C["holiday_tbl"])
    return body


def sec_talking(C):
    """09 고객 응대 — 질문 넷. **이 판의 표에서 나온 숫자로만** 답한다."""
    N = C["N"]
    qs = N.d.get("talking") or []
    if qs:
        N.used.add("talking")
    else:
        qs = C["fb_talking"]
    cards = "\n".join(card("Q. " + q.get("q_ko", ""), "Q. " + q.get("q_en", ""),
                           q.get("a_ko", ""), q.get("a_en", "")) for q in qs[:4])
    a, b = N.get("talking_lede",
                 "아래 답변은 <strong>모두 이 판의 표에서 나온 숫자로만</strong> 만들었습니다. "
                 "<strong>확정된 투자 판단이 아닙니다.</strong>",
                 "Every answer below is built only from the tables in this edition. "
                 "<strong>None of it is a settled investment judgement.</strong>")
    return lede(a, b) + '\n<div class="soft-grid">\n' + cards + '\n</div>'


# 서술 슬롯 개수는 **판을 다 짓고 나서** 채운다. 검증 절 안에서 바로 세면
# 그 절 자신의 서술(verify_lede)이 아직 비기 전이라 하나 적게 나온다 —
# 실제로 「자료에서 만든 자리 2곳」이라 적고 3곳이 나갔다.
NUSED, NFB = "<!--n-used-->", "<!--n-fb-->"


def sec_verify(C):
    """10 데이터 · 검증 — **대부분 접는다**(지침 7절 압축)."""
    N, D = C["N"], C["D"]
    notes = N.d.get("verify") or []
    if notes:
        N.used.add("verify")
    fixed = [
        ("(a) 묶음마다 기준일이 다릅니다", "(a) The basis date differs by group",
         "<strong>오늘 09시 개장 전이라 「오늘 시세」는 아직 없습니다.</strong> 국내&middot;해외 지수와 종목, "
         "업종 ETF, 미 국채 곡선, 원자재는 모두 <strong>" + DK(C["prev_us"], True) + " 마감</strong>이고, "
         "<strong>환율만 24시간 시장이라 오늘 아침(" + DK(C["today"]) + ") 값</strong>입니다 " + VF_MD + ". "
         "예탁금&middot;신용융자는 결제일 기준이라 <strong>" + DK(d(C["mfl"]["date"])) + "</strong>입니다. "
         "<strong>기준일이 다른 값을 섞어 읽지 마십시오</strong> &mdash; 표마다 날짜를 달아 두었습니다.",
         "<strong>Korea has not opened, so there is no &lsquo;today&rsquo; price.</strong> Indices, single stocks, "
         "sector ETFs, the Treasury curve and commodities are all at the <strong>" + DE(C["prev_us"], True)
         + " close</strong>; <strong>only FX, a 24-hour market, is as of this morning</strong> " + VF_MD + ". "
         "Deposits and margin balances are on a settlement basis. <strong>Do not mix bases</strong> &mdash; every "
         "table carries its date."),
        ("(b) 서술은 날마다 새로 씁니다", "(b) The prose is written fresh each day",
         "이 판은 <strong>어제 파일을 복사해 만들지 않습니다.</strong> 표&middot;날짜 이름표&middot;비율&middot;"
         "개수는 전부 <code>build_briefing.py</code> 가 시세 자료에서 만들고, 그날의 서술만 따로 받습니다. "
         "오늘 <strong>손으로 쓴 자리가 " + NUSED + "곳</strong>, <strong>자료에서 만든 문장이 대신 "
         "나간 자리가 " + NFB + "곳</strong>입니다 " + VF_C + ". "
         "<strong>비면 어제 문장이 남는 것이 아니라 자료에서 계산한 한 줄이 나갑니다</strong> &mdash; 굳을 자리를 "
         "없앤 것입니다(지침 7-2-1).",
         "This edition is <strong>not built by copying yesterday&rsquo;s file.</strong> Tables, date labels, ratios "
         "and counts are all derived from the market data by <code>build_briefing.py</code>; only the day&rsquo;s "
         "prose is supplied separately. Today <strong>" + NUSED + " passages were written by hand</strong> "
         "and <strong>" + NFB + " fell back to a data-derived line</strong> " + VF_C + ". "
         "<strong>A gap yields a computed sentence, never yesterday&rsquo;s</strong>."),
        ("(c) 매물대는 근사입니다", "(c) The supply bands are an approximation",
         "가격대별 거래량 분포를 주는 무료 원천이 없습니다. 그래서 <strong>일별 (종가, 거래대금)을 지수대로 "
         "묶어</strong> 「최근 어느 구간에서 손이 바뀌었나」를 냅니다 " + VF_C + ". "
         "<strong>진짜 매물대가 아니므로 「몇 주가 물려 있다」로 읽지 마십시오</strong> &mdash; "
         "「거래가 어디에 쌓였나」까지만 말합니다.",
         "No free source publishes volume by price. We <strong>bucket daily (close, turnover) into price "
         "bands</strong> to show where trading concentrated " + VF_C + ". <strong>This is not a true volume "
         "profile</strong> &mdash; read it as where turnover sat, not as trapped supply."),
        ("(d) 확인하지 못한 것", "(d) What we could not verify",
         "VKOSPI(KRX 인증키 없음 &mdash; VIX 로 대용), 미수금&middot;반대매매 금액(금투협 웹방화벽 &mdash; "
         "신용잔고로 대용), 한국은행 기준금리(ECOS 샘플키가 0행을 돌려줌). "
         "<strong>셋 다 지어내지 않고 비워 두었습니다</strong> " + VF_N + ".",
         "VKOSPI (no KRX key &mdash; VIX used instead), forced-liquidation amounts (KOFIA firewall &mdash; margin "
         "balances used instead) and the Bank of Korea policy rate (the ECOS sample key returns no rows). "
         "<strong>All three are left blank rather than filled in</strong> " + VF_N + "."),
    ]
    all_notes = [(x.get("t_ko"), x.get("t_en"), x.get("b_ko"), x.get("b_en")) for x in notes] + fixed
    cards = "\n".join(card(a, b, c, e) for a, b, c, e in all_notes)
    ok = sum(1 for s in D["sources"].values() if s.get("ok"))
    a, b = N.get("verify_lede",
                 "시세는 <strong>" + D["generated_at_kst"][:16] + " 수집분</strong>이고, 원천 "
                 + str(len(D["sources"])) + "곳 가운데 <strong>" + str(ok) + "곳</strong>이 응답했습니다 "
                 + VF_MD + ". 아래는 <strong>이 판이 무엇을 알고 무엇을 모르는지</strong>입니다.",
                 "Prices were collected at <strong>" + D["generated_at_kst"][:16] + "</strong>; <strong>"
                 + str(ok) + "</strong> of " + str(len(D["sources"])) + " sources responded " + VF_MD + ". "
                 "Below is <strong>what this edition knows and what it does not</strong>.")
    return (lede(a, b) + "\n"
            + exp("검증 노트 &mdash; " + str(len(all_notes)) + "건",
                  "Verification notes &mdash; " + str(len(all_notes)) + " items",
                  '<div class="soft-grid">\n' + cards + '\n</div>')
            + exp("데이터 계보 &mdash; 어느 숫자가 어디서 왔나",
                  "Data lineage &mdash; where each number came from", C["lineage"]))


# ══════════════════════════════════════════════════════════════════
# 조각
# ══════════════════════════════════════════════════════════════════
def _cell(v):
    return '<td class="n">' + pct(v) + '</td>'


def _brow(ko, en, nk, ne, a, b, hl=False):
    return ('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(ko, en) + '</th>'
            '<td class="n note">' + L(nk, ne) + '</td>'
            '<td class="n">' + a + '</td><td class="n">' + b + '</td>'
            '<td class="n opt">' + VF_MD + '</td></tr>')


def _mrow(ko, en, nk, ne, lvl, chg, spark, hl=False):
    return ('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(ko, en) + '</th>'
            '<td class="n note">' + L(nk, ne) + '</td>'
            '<td class="n">' + lvl + '</td><td class="n">' + chg + '</td>'
            '<td class="n sparkcell">' + spark + '</td>'
            '<td class="n opt">' + VF_MD + '</td></tr>')


def _cal_last(txt, year):
    import re as _re
    days = []
    for mm, dd in _re.findall(r"(\d{1,2})/(\d{1,2})", txt or ""):
        try:
            days.append(datetime.date(year, int(mm), int(dd)))
        except ValueError:
            pass
    return max(days) if days else None


def _stock_table(tko, ten, top, bot, why, foot_ko="", foot_en=""):
    """주도 여덟 · 부진 여덟만 싣는다. **표 하나에 마흔 줄을 싣지 않는다**(압축)."""
    head = [TH("종목", "Name", "wrap"), TH("핵심 &middot; 사유", "What it does / why", "note wrap"),
            TH("종가", "Close", "n"), TH("등락률", "Change %", "n"), THP(),
            TH("검증", "Verified", "n opt")]
    rows = []
    for label_ko, label_en, group in (("오른 쪽", "Gainers", top), ("내린 쪽", "Losers", bot)):
        rows.append('      <tr class="grp"><th class="wrap" colspan="9">' + L(label_ko, label_en) + '</th></tr>')
        for name, v in group:
            nk = (v.get("note_ko") or "")
            ne = (v.get("note_en") or "")
            wk, we = why.get(name, ("", ""))
            if wk:
                nk += (" &mdash; " if nk else "") + '<span class="why">' + wk + '</span>'
                ne += (" &mdash; " if ne else "") + '<span class="why">' + we + '</span>'
            rows.append('      <tr><th class="wrap">' + esc(name) + '</th>'
                        '<td class="n note">' + L(nk or "&nbsp;", ne or "&nbsp;") + '</td>'
                        '<td class="n">' + n(v["close"]) + '</td>' + _cell(v.get("change_pct"))
                        + perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
    return tbl(tko, ten, head, rows, cls="data compact", foot_ko=foot_ko, foot_en=foot_en)


def build_supply(C):
    """매물대 근사 표 — 요건 8. 막대로 보이게 한다(요건 5)."""
    sb = (C["D"].get("supply_bands") or {}).get("kospi")
    if not sb:
        return None
    head = [TH("지수 구간", "Index band", "wrap"), TH("거래대금 비중", "Share of turnover", "n barcell"),
            TH("비중", "Share", "n"), TH("거래일", "Sessions", "n"), TH("검증", "Verified", "n opt")]
    last = sb["last_close"]
    rows = []
    for b in sorted(sb["bands"], key=lambda x: -x["low"]):
        here = b["low"] <= last <= b["high"]
        rows.append('      <tr' + (' class="hl"' if here else '') + '>'
                    '<th class="wrap">' + n(b["low"]) + ' ~ ' + n(b["high"])
                    + ('<span class="sub">현재가 이 구간</span>' if here else '') + '</th>'
                    '<td class="n barcell">' + bar(b["share_pct"]) + '</td>'
                    '<td class="n">' + n(b["share_pct"], 1) + '%</td>'
                    '<td class="n">' + n(b["days"], 0) + '</td>'
                    '<td class="n opt">' + VF_C + '</td></tr>')
    hv = sb["heaviest"]
    return tbl("매물대 근사 &mdash; 최근 " + str(sb["sessions"]) + "영업일 거래대금이 쌓인 자리",
               "Where turnover sat &mdash; last " + str(sb["sessions"]) + " sessions",
               head, rows, cls="data compact",
               foot_ko="<strong>가장 두꺼운 구간은 " + n(hv["low"]) + "~" + n(hv["high"]) + " 로 전체의 "
                       + n(hv["share_pct"], 1) + "%</strong> 이고, <strong>현재가 위쪽에 쌓인 비중은 "
                       + n(sb["overhead_share_pct"], 1) + "%</strong> 입니다 " + VF_C + ". 위쪽이 두꺼우면 "
                       "올라갈 때 <strong>본전에 팔려는 물량</strong>을 만납니다. "
                       "<strong>이것은 진짜 매물대가 아니라 근사입니다</strong> &mdash; 가격대별 거래량 분포는 "
                       "무료 원천이 없어, 일별 종가와 거래대금으로 만든 것입니다(검증 노트 (c)).",
               foot_en="<strong>The heaviest band is " + n(hv["low"]) + "&ndash;" + n(hv["high"]) + ", "
                       + n(hv["share_pct"], 1) + "% of the total</strong>, and <strong>"
                       + n(sb["overhead_share_pct"], 1) + "% sits above the current level</strong> " + VF_C + ". "
                       "A heavy band overhead means <strong>sellers waiting to get out at cost</strong>. "
                       "<strong>This is an approximation, not a true volume profile</strong> &mdash; see note (c).")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=None)
    ap.add_argument("--kind", default="morning", choices=("morning", "close", "global"))
    ap.add_argument("--out", default=None)
    a = ap.parse_args()

    now = datetime.datetime.now(KST)
    today = d(a.date) if a.date else now.date()
    D, H = load()
    N = Narrative(narrative_for(today, a.kind))

    C = prepare(D, H, N, today, now, a.kind)
    doc = Doc()
    doc.sec("today", "오늘의 결론", "The Bottom Line", sec_today(C))
    doc.sec("korea", "국내 증시", "Korean Equities", sec_korea(C))
    doc.sec("flows", "수급 &middot; 증시 주변자금", "Flows and Money Around the Market", sec_flows(C))
    doc.sec("global", "간밤 해외", "Overnight Overseas", sec_global(C))
    doc.sec("earnings", "실적 &middot; 컨퍼런스콜", "Results and Calls", sec_earnings(C))
    doc.sec("macro", "금리 &middot; 환율 &middot; 원자재", "Rates, FX and Commodities", sec_macro(C))
    deep = sec_deep(C)
    if deep:
        doc.sec("deep", deep[0], deep[1], deep[2])
    doc.sec("calendar", "일정 &middot; 체크포인트", "Calendar", sec_calendar(C))
    doc.sec("talking", "고객 응대", "Talking Points", sec_talking(C))
    doc.sec("verify", "데이터 &middot; 검증", "Data and Verification", sec_verify(C))

    kindko, kinden = KIND_NAME[a.kind]
    title = "%s · %d년 %s | 미래에셋증권 마포WM" % (kindko, today.year, DK(today, True))
    title_en = ("%s · %s %d | Mirae Asset Securities Mapo WM"
                % (kinden, DE(today, True), today.year))
    html = assemble(ROOT + "/docs/briefing-chrome", doc, title, C["hero"], now,
                    title_en=title_en)

    # 이제 모든 절이 서술을 다 꺼내 갔다. 그제서야 개수를 박는다.
    html = html.replace(NUSED, str(len(N.used))).replace(NFB, str(len(set(N.missing))))
    assert NUSED not in html and NFB not in html

    out = a.out or (ROOT + "/docs/briefings/%s-%s.html"
                    % (today.isoformat(), a.kind))
    io.open(out, "w", encoding="utf-8").write(html)
    rep = N.report()
    print("만듦: %s (%d자, 절 %d개, 상세 %d개)"
          % (out, len(html), len(doc.secs), html.count('<details class="exp"')))
    print("  서술: 손으로 쓴 자리 %d · 자료에서 만든 자리 %d"
          % (len(rep["written"]), len(rep["fell_back"])))
    if rep["fell_back"]:
        print("  비어 있던 키: " + ", ".join(rep["fell_back"]))


if __name__ == "__main__":
    main()
