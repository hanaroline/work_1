# -*- coding: utf-8 -*-
"""시세 자료에서 **판이 쓸 값을 전부 계산한다.**

빌더가 문장 안에 숫자를 손으로 적지 않게 하려는 것이다. 비율·개수·주도 종목·
날짜 이름표·기본 문장까지 여기서 만들고, 빌더는 받아 쓰기만 한다.
그래서 자료를 갈아 끼우면 판 전체가 함께 바뀐다(지침 7-2-1 ④).
"""
import datetime

from briefing_lib import (
    CORE, VF_OK, VF_MD, VF_C, VF_1, VF_N,
    d, DK, DE, DD, DS, n, pct, bp, eok, jo, esc,
    L, TH, THP, perf_cells, tbl, sparkline, bar)


def _pos52(close, fw):
    lo, hi = fw.get("low"), fw.get("high")
    if not lo or not hi or hi <= lo:
        return None
    return (close - lo) / (hi - lo) * 100.0


_KNUM = {6: "여섯", 8: "여덟", 10: "열", 12: "열둘"}


def _split(dct, k=8):
    """등락률로 정렬해 위 k · 아래 k. **표 하나에 마흔 줄을 싣지 않는다.**"""
    items = [(nm, v) for nm, v in dct.items() if v.get("change_pct") is not None]
    items.sort(key=lambda kv: -kv[1]["change_pct"])
    return items[:k], items[-k:]


def prepare(D, H, N, today, now, kind):
    I = D["indices"]
    KS, KQ = I["kospi"], I["kosdaq"]
    MI = D["market_internals"]
    KSI, KQI = MI["kospi"], MI["kosdaq"]
    ksb, kqb = KSI["breadth"], KQI["breadth"]
    kf, qf = KSI["investor_flows"], KQI["investor_flows"]
    ru, ec, rk = D["rates_us"], D.get("rates_ecos", {}), D.get("rates_kr", {})
    S = D["stocks"]
    US = D["us_stocks"]
    mfl = (D.get("money_flow") or {}).get("latest") or {}
    FX = D["fx"]
    byk = {r["key"]: r for r in FX["rows"]}

    prev_kr = d(KS["date"])
    prev_us = d(I["sp500"]["date"])

    # 거래대금 — 며칠째 줄고 있는지 **세어서** 말한다
    ser = D["index_daily"]["kospi"]["series"]
    tv = [(r["date"], r["value_mn_krw"] / 1e6) for r in ser[:5]]
    down = 0
    for i in range(len(tv) - 1):
        if tv[i][1] < tv[i + 1][1]:
            down += 1
        else:
            break
    word = {0: "", 1: "이틀 연속 감소", 2: "사흘 연속 감소", 3: "나흘 연속 감소",
            4: "닷새 연속 감소"}.get(down, "감소")
    if down == 0:
        word = "전일 대비 증가" if len(tv) > 1 and tv[0][1] > tv[1][1] else "보합"

    ksum = ksb["advancing"] + ksb["declining"] + ksb.get("unchanged", 0)
    qsum = kqb["advancing"] + kqb["declining"] + kqb.get("unchanged", 0)
    adv10 = round(ksb["advancing"] / max(1, ksum) * 10)
    adv10q = round(kqb["advancing"] / max(1, qsum) * 10)

    IV = D.get("investors_kospi") or []
    fgn1 = IV[1]["foreign"] if len(IV) > 1 else None
    fgn2 = IV[2]["foreign"] if len(IV) > 2 else None

    kr_top, kr_bot = _split(S, 8)
    us_top, us_bot = _split(US, 6)
    sec_top = (D.get("sectors") or {}).get("top5") or []
    sec_bot = (D.get("sectors") or {}).get("bottom5") or []

    ktb10 = (ec.get("ktb10y") or {}).get("value")
    gap = (ktb10 - ru["curve"]["ust10y"]) * 100 if ktb10 else None

    usdkrw = byk.get("usdkrw") or {"close": None, "change_pct": None}

    C = {
        "D": D, "H": H, "N": N, "I": I, "KS": KS, "KQ": KQ, "S": S, "US": US,
        "MI": MI, "KSI": KSI, "KQI": KQI, "ksb": ksb, "kqb": kqb,
        "kf": kf, "qf": qf, "ru": ru, "ec": ec, "rk": rk, "mfl": mfl,
        "FX": FX, "byk": byk, "usdkrw": usdkrw,
        "today": today, "now": now, "kind": kind,
        "prev_kr": prev_kr, "prev_us": prev_us,
        "turnover": tv, "turnover_word": ('<span class="down">' + word + '</span>' if down
                                          else '<span class="flat">' + word + '</span>'),
        "turnover_trail": " &rarr; ".join(n(x[1]) for x in reversed(tv[:4])),
        "turnover_trail_en": "KRW " + n(tv[0][1]) + "tn",
        "adv_per_ten": adv10, "adv_per_ten_q": adv10q,
        "fgn1": fgn1, "fgn2": fgn2,
        "kr_top": kr_top, "kr_bot": kr_bot, "us_top": us_top, "us_bot": us_bot,
        "sec_top": sec_top, "sec_bot": sec_bot,
        "pos52_ks": _pos52(KS["close"], KSI["fifty_two_week"]),
        "pos52_kq": _pos52(KQ["close"], KQI["fifty_two_week"]),
        "kr_us_gap": gap,
        "why": N.d.get("why") or {},
        "price_of": lambda nm: (n(S[nm]["close"], 0) + "원" if nm in S else
                                ("$" + n(US[nm]["close"]) if nm in US else "")),
    }

    _tables(C)
    _fallbacks(C)
    _hero(C)
    return C


# ══════════════════════════════════════════════════════════════════
# 표 — 빌더가 그대로 끼워 넣기만 하게 미리 만든다
# ══════════════════════════════════════════════════════════════════
def _tables(C):
    from build_briefing import _brow, _cell, _stock_table, build_supply
    D, I, C_ = C["D"], C["I"], C
    ru, rk, ec = C["ru"], C["rk"], C["ec"]

    # 업종 상·하위
    sh = [TH("업종", "Sector", "wrap"), TH("등락률", "Change %", "n"),
          TH("1주 누적", "1W cumulative", "n"), TH("검증", "Verified", "n opt")]
    srows = []
    for label_ko, label_en, grp in (("오른 업종", "Leaders", C["sec_top"]),
                                    ("내린 업종", "Laggards", list(reversed(C["sec_bot"])))):
        srows.append('      <tr class="grp"><th class="wrap" colspan="4">' + L(label_ko, label_en) + '</th></tr>')
        for s in grp:
            srows.append('      <tr><th class="wrap">' + esc(s["name"]) + '</th>'
                         '<td class="n">' + pct(s["change_pct"]) + '</td>'
                         '<td class="n">' + pct((s.get("perf") or {}).get("w1")) + '</td>'
                         '<td class="n opt">' + VF_MD + '</td></tr>')
    C["sector_tbl"] = tbl("업종 상위 &middot; 하위 &mdash; " + DK(C["prev_kr"]),
                          "Sector leaders and laggards &mdash; " + DE(C["prev_kr"]),
                          sh, srows, cls="data compact",
                          foot_ko="「1주 누적」은 <strong>일간 등락률을 더한 값</strong>이지 지수 계열이 "
                                  "아닙니다 &mdash; 네이버 업종은 지수를 주지 않습니다 " + VF_C + ".",
                          foot_en="The weekly column <strong>sums daily moves</strong>; Naver publishes no sector "
                                  "index series " + VF_C + ".")

    # 등락 종목 수 추이
    bh = [TH("날짜", "Date", "wrap"), TH("코스피 %", "KOSPI %", "n"), TH("상승", "Adv", "n"),
          TH("하락", "Dec", "n"), TH("코스닥 %", "KOSDAQ %", "n"), TH("상승", "Adv", "n"),
          TH("하락", "Dec", "n"), TH("검증", "Verified", "n opt")]
    brows = []
    for r in (C["H"].get("rows") or []):
        b = r["breadth"]
        ks_, kq_ = b["kospi"], b["kosdaq"]
        miss = (ks_["advancing"] + ks_["declining"]) == 0
        dash = '<span class="mut">&mdash;</span>'
        brows.append('      <tr><th class="wrap">' + r["date"][5:] + '</th>'
                     '<td class="n">' + pct(r["kospi"]["change_pct"]) + '</td>'
                     '<td class="n">' + (dash if miss else n(ks_["advancing"], 0)) + '</td>'
                     '<td class="n">' + (dash if miss else n(ks_["declining"], 0)) + '</td>'
                     '<td class="n">' + pct(r["kosdaq"]["change_pct"]) + '</td>'
                     '<td class="n">' + (dash if miss else n(kq_["advancing"], 0)) + '</td>'
                     '<td class="n">' + (dash if miss else n(kq_["declining"], 0)) + '</td>'
                     '<td class="n opt">' + VF_MD + '</td></tr>')
    C["breadth_trend"] = tbl("등락 종목 수 추이", "Breadth over recent sessions", bh, brows,
                             cls="data compact",
                             foot_ko="<strong>지수 방향과 폭이 어긋난 날</strong>을 찾아 보십시오 &mdash; "
                                     "그런 날은 대형주 몇 개가 지수를 움직인 것입니다.",
                             foot_en="<strong>Look for days when the index and breadth disagree</strong> &mdash; "
                                     "on those days a few heavyweights moved the index.")

    # 투자자별 추이
    ih = [TH("날짜", "Date", "wrap"), TH("개인", "Retail", "n"), TH("외국인", "Foreign", "n"),
          TH("기관", "Institution", "n"), TH("검증", "Verified", "n opt")]
    irows = ['      <tr><th class="wrap">' + r["date"] + '</th>'
             '<td class="n">' + eok(r["retail"]) + '</td>'
             '<td class="n">' + eok(r["foreign"]) + '</td>'
             '<td class="n">' + eok(r["institution"]) + '</td>'
             '<td class="n opt">' + VF_MD + '</td></tr>'
             for r in (D.get("investors_kospi") or [])[:10]]
    C["inv_trend"] = tbl("코스피 투자자별 순매수 &mdash; 최근 10거래일, 단위 억원",
                         "KOSPI net buying by investor type &mdash; last 10 sessions",
                         ih, irows, cls="data compact",
                         foot_ko="<strong>하루치가 아니라 방향이 언제 바뀌었는지를 보십시오.</strong> 외국인이 "
                                 "며칠째 같은 쪽인지, 그 흐름이 끊긴 날이 언제인지가 위 표의 하루치보다 "
                                 "오래 갑니다 " + VF_MD + ". 개인과 외국인이 <strong>거울처럼 반대</strong>인 "
                                 "구간은 손이 바뀌고 있다는 뜻입니다.",
                         foot_en="<strong>Read the turn, not the day.</strong> How many sessions foreigners have "
                                 "stayed on one side, and when that run broke, outlasts any single day&rsquo;s "
                                 "figure " + VF_MD + ". Stretches where retail mirrors foreign flow are the "
                                 "market changing hands.")

    C["supply_tbl"] = build_supply(C)
    C["holiday_tbl"], C["holiday_note"] = _holidays(C)

    # 환율 — 원화 쪽만 본문에, 달러 상대는 상세로
    fh = [TH("통화쌍", "Pair", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
          TH("현재", "Level", "n"), TH("등락률", "Change %", "n"), THP(),
          TH("검증", "Verified", "n opt")]

    def _fxrow(key, extra_ko="", extra_en=""):
        r = C["byk"].get(key)
        if not r:
            return ""
        dp = 4 if (r["close"] or 0) < 10 else (1 if (r["close"] or 0) < 3000 else 0)
        nk = (r.get("note_ko") or "") + ((" &mdash; " + extra_ko) if extra_ko else "")
        ne = (r.get("note_en") or "") + ((" &mdash; " + extra_en) if extra_en else "")
        return ('      <tr' + (' class="hl"' if key == "usdkrw" else '') + '>'
                '<th class="wrap">' + L(r["name_ko"], r["name_en"]) + '</th>'
                '<td class="n note">' + L(nk or "&nbsp;", ne or "&nbsp;") + '</td>'
                '<td class="n">' + n(r["close"], dp) + '</td>' + _cell(r.get("change_pct"))
                + perf_cells(r.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')

    C["fx_tbl"] = tbl("원화 환율 &mdash; 오늘 아침 " + DK(C["today"]),
                      "The won &mdash; this morning, " + DE(C["today"]), fh,
                      [x for x in (_fxrow("usdkrw"), _fxrow("jpykrw"), _fxrow("cnykrw"),
                                   _fxrow("eurkrw"), _fxrow("audkrw")) if x],
                      cls="data compact",
                      foot_ko="<strong>이 표는 뒤 통화가 1개입니다</strong> &mdash; 원/달러 1,384 는 달러 1개를 "
                              "사는 데 1,384원이 든다는 뜻이라, <strong>숫자가 내려가면 원화가 세진 것</strong>입니다. "
                              "원화 크로스 넷은 받아 온 값이 아니라 <strong>원/달러에서 계산한 재정환율</strong>입니다 "
                              + VF_C + " &mdash; 원화는 달러 말고 직접 거래되는 시장이 사실상 없어 국내 고시 환율도 "
                                       "전부 그렇게 만듭니다. <strong>달러 상대 통화는 빗금 방향이 반대</strong>이므로 "
                                       "아래 상세에 따로 두었습니다.",
                      foot_en="<strong>In this table the second currency is the unit</strong> &mdash; USD/KRW 1,384 "
                              "means one dollar costs 1,384 won, so <strong>a lower number is a stronger won</strong>. "
                              "The four crosses are <strong>computed from USD/KRW</strong> " + VF_C + ", as Korean "
                              "published rates are. <strong>The dollar crosses read the other way round</strong> and "
                              "sit in the detail below.")

    uh = [TH("통화쌍 &middot; 지수", "Pair or index", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
          TH("현재", "Level", "n"), TH("등락률", "Change %", "n"), THP(), TH("검증", "Verified", "n opt")]
    C["usdfx_tbl"] = tbl("달러 상대 통화", "The dollar against others", uh,
                         [x for x in (_fxrow("dxy", "<strong>이 줄만 통화쌍이 아니라 지수</strong>이고, "
                                             "미국 장중에만 갱신돼 시각 기준이 다릅니다",
                                             "<strong>An index, not a pair</strong>, and on a different clock"),
                                      _fxrow("usdjpy"), _fxrow("usdcny"), _fxrow("usdtwd"),
                                      _fxrow("eurusd", "<strong>여기만 반대입니다</strong> &mdash; 올라가면 달러 약세",
                                             "<strong>Reversed</strong> &mdash; up means a weaker dollar"),
                                      _fxrow("gbpusd", "<strong>여기만 반대입니다</strong>",
                                             "<strong>Reversed</strong>")) if x],
                         cls="data compact",
                         foot_ko="<strong>이 표는 빗금 앞이 1개입니다</strong> &mdash; 달러/엔 159 는 달러 1개가 "
                                 "159엔. 그래서 <strong>달러가 앞이면 숫자↑ = 달러 강세</strong>이고, 달러가 뒤인 "
                                 "<strong>유로/달러&middot;파운드/달러만 반대</strong>입니다. 위의 원화 표와 규칙이 "
                                 "다르다는 점을 함께 보십시오. <strong>맨 윗줄만 통화쌍이 아닙니다.</strong>",
                         foot_en="<strong>Here the first currency is the unit</strong> &mdash; USD/JPY 159 means one "
                                 "dollar buys 159 yen, so <strong>up is a stronger dollar</strong>, except in "
                                 "<strong>EUR/USD and GBP/USD</strong>. Note this is the opposite convention to the "
                                 "won table above. <strong>The top row is an index, not a pair.</strong>")

    # 원자재
    ch = [TH("항목", "Item", "wrap"), TH("읽는 법", "How to read it", "note wrap"),
          TH("종가", "Close", "n"), TH("등락률", "Change %", "n"), THP(), TH("검증", "Verified", "n opt")]
    CM = [("brent", "브렌트유", "Brent", "물가와 금리에 곧바로 닿습니다", "It feeds inflation and rates", True),
          ("wti", "WTI", "WTI", "미국 기준 유종", "The US benchmark", False),
          ("gold", "금", "Gold", "재정&middot;통화 불신의 온도계", "A gauge of fiscal and monetary distrust", False),
          ("copper", "구리", "Copper", "제조업 경기의 대리 지표", "A proxy for industrial demand", False),
          ("btc", "비트코인", "Bitcoin", "위험 선호의 끝단", "The far end of risk appetite", False)]
    crows = []
    for k, ko, en, nk, ne, hl in CM:
        v = I.get(k)
        if not v:
            continue
        crows.append('      <tr' + (' class="hl"' if hl else '') + '><th class="wrap">' + L(ko, en) + '</th>'
                     '<td class="n note">' + L(nk, ne) + '</td>'
                     '<td class="n">' + n(v["close"]) + '</td>' + _cell(v.get("change_pct"))
                     + perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>')
    C["cm_tbl"] = tbl("원자재 &middot; 기타 &mdash; " + DK(C["prev_us"]),
                      "Commodities and others &mdash; " + DE(C["prev_us"]), ch, crows,
                      cls="data compact",
                      foot_ko="유가는 <strong>야후 일봉 종가</strong>입니다. 국내 보도는 <strong>선물 정산가</strong>를 "
                              "쓰는 일이 많아 폭이 다를 수 있습니다 &mdash; <strong>틀린 값이 아니라 기준이 다른 "
                              "값</strong>이므로, 폭을 인용하실 때 어느 기준인지 밝혀 주십시오 " + VF_MD + ".",
                      foot_en="Crude is at the <strong>Yahoo daily close</strong>. Korean coverage often quotes "
                              "<strong>futures settlements</strong>, which differ &mdash; <strong>a different basis, "
                              "not a wrong one</strong> " + VF_MD + ".")

    # 미 국채 곡선 전체
    LAB = [("ust1m", "1개월", "1M"), ("ust3m", "3개월", "3M"), ("ust6m", "6개월", "6M"),
           ("ust1y", "1년", "1Y"), ("ust2y", "2년", "2Y"), ("ust3y", "3년", "3Y"),
           ("ust5y", "5년", "5Y"), ("ust7y", "7년", "7Y"), ("ust10y", "10년", "10Y"),
           ("ust20y", "20년", "20Y"), ("ust30y", "30년", "30Y")]
    curows = []
    for k, ko, en in LAB:
        if k not in ru["curve"]:
            continue
        p = (ru.get("perf") or {}).get(k) or {}
        curows.append('      <tr' + (' class="hl"' if k in ("ust2y", "ust10y", "ust30y") else '') + '>'
                      '<th class="wrap">' + L(ko, en) + '</th>'
                      '<td class="n">' + n(ru["curve"][k], 3) + '%</td>'
                      '<td class="n">' + bp(ru["change_bp"].get(k)) + '</td>'
                      + perf_cells(p, "bp") + '<td class="n opt">' + VF_OK + '</td></tr>')
    C["curve_tbl"] = tbl("미 재무부 확정 곡선 &mdash; " + DK(C["prev_us"]),
                         "US Treasury official curve &mdash; " + DE(C["prev_us"]),
                         [TH("만기", "Maturity", "wrap"), TH("수익률", "Yield", "n"),
                          TH("전일 대비", "Change", "n"),
                          TH("1주", "1W", "n perf"), TH("1개월", "1M", "n perf"),
                          TH("3개월", "3M", "n perf"), TH("연초", "YTD", "n perf"),
                          TH("검증", "Verified", "n opt")], curows, cls="data compact",
                         foot_ko="<strong>금리는 기간 「수익률」이 아니라 기간 「변화(bp)」로 냅니다</strong> &mdash; "
                                 "4.20% 가 4.50% 가 된 것은 +7.1% 가 아니라 <strong>+30bp</strong> 입니다. "
                                 "<strong>짧은 쪽이 더 움직였으면 정책 기대</strong>, 장기물까지 같이 움직였으면 "
                                 "<strong>성장&middot;물가 전망</strong>이 움직인 것입니다.",
                         foot_en="<strong>Rates are shown as change in basis points, not percentage return</strong>. "
                                 "<strong>The front end moving means policy expectations</strong>; the long end "
                                 "moving means the growth and inflation view.")

    # 미국 업종 ETF · 유럽 · 일본 · 중국
    eh = [TH("업종", "Sector", "wrap"), TH("무엇이 들어 있나", "What it holds", "note wrap"),
          TH("등락률", "Change %", "n"), THP(), TH("검증", "Verified", "n opt")]
    erows = ['      <tr><th class="wrap">' + esc(k) + '</th>'
             '<td class="n note">' + L(v.get("note_ko") or "&nbsp;", v.get("note_en") or "&nbsp;") + '</td>'
             + _cell(v.get("change_pct")) + perf_cells(v.get("perf"))
             + '<td class="n opt">' + VF_MD + '</td></tr>'
             for k, v in sorted(D["us_sectors"].items(), key=lambda kv: -(kv[1].get("change_pct") or 0))]
    C["us_sec_tbl"] = tbl("S&amp;P 500 업종 ETF &mdash; " + DK(C["prev_us"]),
                          "S&amp;P 500 sector ETFs &mdash; " + DE(C["prev_us"]),
                          eh, erows, cls="data compact",
                          foot_ko="<strong>금리가 오른 날은 부동산&middot;유틸리티가 먼저 밀립니다</strong> &mdash; "
                                  "배당으로 사는 자산이기 때문입니다 " + VF_C + ".",
                          foot_en="<strong>When yields rise, real estate and utilities give way first</strong> "
                                  "&mdash; they are bought for yield " + VF_C + ".")

    def _region(key, tko, ten, note):
        dct = D.get(key) or {}
        if not dct:
            return ""
        h = [TH("종목", "Name", "wrap"), TH("핵심", "What it does", "note wrap"),
             TH("종가", "Close", "n"), TH("등락률", "Change %", "n"), THP(),
             TH("검증", "Verified", "n opt")]
        rows = ['      <tr><th class="wrap">' + esc(k) + '</th>'
                '<td class="n note">' + L(v.get("note_ko") or "&nbsp;", v.get("note_en") or "&nbsp;") + '</td>'
                '<td class="n">' + n(v["close"]) + '</td>' + _cell(v.get("change_pct"))
                + perf_cells(v.get("perf")) + '<td class="n opt">' + VF_MD + '</td></tr>'
                for k, v in sorted(dct.items(), key=lambda kv: -(kv[1].get("change_pct") or 0))]
        return tbl(tko, ten, h, rows, cls="data compact", foot_ko=note[0], foot_en=note[1])

    C["eu_tbl"] = _region("eu_stocks", "유럽 주요 종목 &mdash; <strong>거래 통화 기준</strong>",
                          "European stocks &mdash; <strong>in local trading currency</strong>",
                          ("<strong>통화가 섞여 있습니다</strong>(EUR&middot;GBp&middot;CHF&middot;DKK) &mdash; "
                           "영국 종목은 펜스 표시라 파운드로 보려면 100으로 나눕니다. "
                           "<strong>비교는 종가가 아니라 등락률로</strong> 하십시오.",
                           "<strong>Mixed currencies</strong> (EUR, GBp, CHF, DKK) &mdash; UK names are in pence. "
                           "<strong>Compare by percentage, not by price.</strong>"))
    C["jp_tbl"] = _region("jp_stocks", "일본 주요 종목 &mdash; 단위 엔", "Japanese stocks &mdash; in yen",
                          ("도쿄는 15:30 KST 에 닫습니다 &mdash; <strong>미국 장중 소식을 모르는 채 끝난 값</strong>입니다.",
                           "Tokyo closes at 15:30 KST &mdash; <strong>before the US session</strong>."))
    C["cn_tbl"] = _region("cn_stocks", "중국 &middot; 홍콩 주요 종목", "Chinese and Hong Kong stocks",
                          ("<strong>본토는 CNY, 홍콩은 HKD</strong> 라 종가를 견주면 안 됩니다.",
                           "<strong>Mainland in CNY, Hong Kong in HKD</strong> &mdash; do not compare price levels."))

    # 데이터 계보
    lh = [TH("항목", "Item", "wrap"), TH("출처", "Source", "wrap"), TH("검증", "Verified", "n")]
    LIN = [("지수&middot;종목 종가", "Index and stock closes", "야후 파이낸스 + 네이버", "Yahoo + Naver", VF_OK),
           ("등락 종목 수&middot;상한가", "Breadth and limit moves", "네이버 금융", "Naver Finance", VF_MD),
           ("투자자별 수급&middot;프로그램", "Investor and programme flows", "네이버 매매동향", "Naver", VF_MD),
           ("예탁금&middot;신용융자", "Deposits and margin", "네이버 증시자금동향 (" + (C["mfl"].get("date") or "") + ")",
            "Naver, as of " + (C["mfl"].get("date") or ""), VF_MD),
           ("매물대", "Supply bands", "일별 종가&middot;거래대금에서 계산 &mdash; <strong>근사</strong>",
            "Computed from daily close and turnover &mdash; <strong>approximate</strong>", VF_C),
           ("실적&middot;컨퍼런스콜", "Results and calls", "기사 본문 원문 인용", "Quoted from article text", VF_1),
           ("미 국채 곡선", "US Treasury curve", "미 재무부 확정 고시", "US Treasury official fixing", VF_OK),
           ("국고채&middot;CD", "Korean bonds", "한국은행 ECOS", "Bank of Korea ECOS", VF_MD),
           ("환율", "Exchange rates", "야후 (24시간)", "Yahoo (24-hour)", VF_MD),
           ("VKOSPI", "VKOSPI", "KRX 인증키가 없어 받지 못했습니다", "No KRX key", VF_N),
           ("미수금&middot;반대매매", "Forced liquidation", "금투협 웹방화벽이 막습니다", "Blocked by KOFIA", VF_N)]
    C["lineage"] = tbl("데이터 계보", "Data lineage", lh,
                       ['      <tr><th class="wrap">' + L(a, b) + '</th>'
                        '<td class="wrap">' + L(c, e) + '</td><td class="n">' + f + '</td></tr>'
                        for a, b, c, e, f in LIN], cls="data compact",
                       foot_ko="<strong>브리핑 세션은 시세 사이트에 직접 붙지 못하지만</strong>, 정책 바깥에서 도는 "
                               "수집 서버가 대신 받아 저장소에 커밋합니다 &mdash; <strong>허용 목록을 바꾸지 않아도 "
                               "시세가 확보됩니다.</strong>",
                       foot_en="<strong>The briefing session cannot reach market sites directly</strong>, but a "
                               "collector outside that policy fetches and commits the data.")


# ══════════════════════════════════════════════════════════════════
# 자료에서 만든 기본 문장 — 서술이 비었을 때 대신 나간다
# ══════════════════════════════════════════════════════════════════
def _fallbacks(C):
    I, KS, KQ, ksb, kqb, kf = C["I"], C["KS"], C["KQ"], C["ksb"], C["kqb"], C["kf"]
    ru, S = C["ru"], C["S"]
    agree = (KS["change_pct"] > 0) == (ksb["advancing"] > ksb["declining"])
    lead = C["kr_top"][0] if C["kr_top"] else None
    lag = C["kr_bot"][0] if C["kr_bot"] else None

    C["fallback_today"] = [
        ("<strong>국내.</strong> 코스피 " + pct(KS["change_pct"]) + " (" + n(KS["close"]) + "), 코스닥 "
         + pct(KQ["change_pct"]) + " 입니다. 오른 종목 " + n(ksb["advancing"], 0) + " 대 내린 종목 "
         + n(ksb["declining"], 0) + " 로 <strong>지수와 폭이 " + ("같은" if agree else "다른")
         + " 쪽</strong>을 봤습니다 " + VF_MD + ". 거래대금은 " + n(C["turnover"][0][1]) + "조입니다.",
         "<strong>Korea.</strong> The KOSPI was " + pct(KS["change_pct"]) + " and the KOSDAQ "
         + pct(KQ["change_pct"]) + ", with " + n(ksb["advancing"], 0) + " advancers against "
         + n(ksb["declining"], 0) + " &mdash; <strong>index and breadth "
         + ("agree" if agree else "disagree") + "</strong> " + VF_MD + "."),
        ("<strong>수급.</strong> 외국인 " + eok(kf["foreign"]) + ", 기관 " + eok(kf["institution"])
         + ", 개인 " + eok(kf["retail"]) + " 입니다 " + VF_MD
         + (". 그 앞 거래일 외국인은 " + eok(C["fgn1"]) + " 였습니다." if C["fgn1"] is not None else "."),
         "<strong>Flows.</strong> Foreigners " + eok(kf["foreign"]) + ", institutions "
         + eok(kf["institution"]) + ", retail " + eok(kf["retail"]) + " " + VF_MD + "."),
        ("<strong>간밤 해외.</strong> 다우 " + pct(I["dow"]["change_pct"]) + ", S&amp;P "
         + pct(I["sp500"]["change_pct"]) + ", 나스닥 " + pct(I["nasdaq"]["change_pct"]) + ", SOX "
         + pct(I["sox"]["change_pct"]) + " 입니다. 미 10년물은 " + n(ru["curve"]["ust10y"], 3) + "%("
         + bp(ru["change_bp"]["ust10y"]) + "), 브렌트 " + pct(I["brent"]["change_pct"]) + " 입니다 " + VF_MD + ".",
         "<strong>Overnight.</strong> Dow " + pct(I["dow"]["change_pct"]) + ", S&amp;P "
         + pct(I["sp500"]["change_pct"]) + ", NASDAQ " + pct(I["nasdaq"]["change_pct"]) + ", SOX "
         + pct(I["sox"]["change_pct"]) + "; the 10-year at " + n(ru["curve"]["ust10y"], 3) + "% and Brent "
         + pct(I["brent"]["change_pct"]) + " " + VF_MD + "."),
    ]

    C["fb_korea"] = (
        "코스피는 " + pct(KS["change_pct"]) + " 로 " + n(KS["close"]) + ", 코스닥은 " + pct(KQ["change_pct"])
        + " 입니다 " + VF_MD + ". 오른 종목이 " + n(ksb["advancing"], 0) + "개, 내린 종목이 "
        + n(ksb["declining"], 0) + "개로 <strong>열에 " + n(C["adv_per_ten"], 0) + "이 올랐습니다</strong>."
        + (" 가장 크게 오른 것은 " + esc(lead[0]) + " " + pct(lead[1]["change_pct"]) + " 이고, 가장 크게 빠진 것은 "
           + esc(lag[0]) + " " + pct(lag[1]["change_pct"]) + " 입니다." if lead and lag else ""),
        "The KOSPI was " + pct(KS["change_pct"]) + " at " + n(KS["close"]) + " and the KOSDAQ "
        + pct(KQ["change_pct"]) + " " + VF_MD + ", with " + n(ksb["advancing"], 0) + " advancers against "
        + n(ksb["declining"], 0) + ".")

    C["fb_flows"] = (
        "외국인 " + eok(kf["foreign"]) + ", 기관 " + eok(kf["institution"]) + ", 개인 "
        + eok(kf["retail"]) + " 입니다 " + VF_MD + ". <strong>수급은 잔액이 아니라 변화로 읽으십시오</strong> "
        "&mdash; 팔던 손이 멎는 것만으로 지수가 움직입니다.",
        "Foreigners " + eok(kf["foreign"]) + ", institutions " + eok(kf["institution"]) + ", retail "
        + eok(kf["retail"]) + " " + VF_MD + ". <strong>Read the change, not the level.</strong>")

    C["fb_global"] = (
        "다우 " + pct(I["dow"]["change_pct"]) + ", S&amp;P " + pct(I["sp500"]["change_pct"]) + ", 나스닥 "
        + pct(I["nasdaq"]["change_pct"]) + ", SOX " + pct(I["sox"]["change_pct"]) + " 입니다 " + VF_MD
        + ". 유럽은 STOXX 600 " + pct(I["stoxx600"]["change_pct"]) + ", 아시아는 니케이 "
        + pct(I["nikkei"]["change_pct"]) + " &middot; 항셍 " + pct(I["hangseng"]["change_pct"]) + " 입니다.",
        "Dow " + pct(I["dow"]["change_pct"]) + ", S&amp;P " + pct(I["sp500"]["change_pct"]) + ", NASDAQ "
        + pct(I["nasdaq"]["change_pct"]) + ", SOX " + pct(I["sox"]["change_pct"]) + " " + VF_MD + ".")

    C["fb_macro"] = (
        "미 국채는 2년 " + bp(ru["change_bp"]["ust2y"]) + ", 10년 " + bp(ru["change_bp"]["ust10y"])
        + ", 30년 " + bp(ru["change_bp"]["ust30y"]) + " 입니다 " + VF_OK + ". 원/달러는 "
        + n(C["usdkrw"]["close"], 2) + "원(" + pct(C["usdkrw"]["change_pct"]) + "), 브렌트는 "
        + pct(I["brent"]["change_pct"]) + " 입니다.",
        "The 2-year " + bp(ru["change_bp"]["ust2y"]) + ", 10-year " + bp(ru["change_bp"]["ust10y"])
        + ", 30-year " + bp(ru["change_bp"]["ust30y"]) + " " + VF_OK + ".")

    # 표 꼬리말도 자료에서
    C["kr_idx_foot_ko"] = ("<strong>「1주」 열은 최근 5거래일 기준</strong>이라 「직전 금요일 종가 대비」와 "
                           "다를 수 있습니다 &mdash; <strong>자가 다르면 자가 다르다고 읽으십시오</strong> " + VF_C + ".")
    C["kr_idx_foot_en"] = ("<strong>The 1W column is a trailing five sessions</strong>, which differs from a "
                           "week-to-date measure &mdash; <strong>two rulers, not two answers</strong> " + VF_C + ".")
    # 몇 개를 싣는지는 판마다 다르다 &mdash; 전체 판은 위아래 여덟, 핵심본은 두 표를
    # 나란히 세워 열씩. 꼬리말에 숫자를 박아 두면 **표와 어긋난다**(실제로 어긋났다).
    _k = 10 if CORE[0] else 8
    C["kr_stk_foot_ko"] = ("<strong>수집한 " + n(len(C["S"]), 0) + " 종목을 다 싣지 않고 위아래 "
                           + _KNUM[_k] + "씩만</strong> "
                           "보입니다 &mdash; 가운데 종목은 그날을 설명하지 못합니다. "
                           "「사유」는 <strong>확인된 것만</strong> 답니다.")
    C["kr_stk_foot_en"] = ("<strong>Only the top and bottom " + str(_k) + "</strong> &mdash; the middle of the "
                           "list does not explain the day. A reason is shown "
                           "<strong>only where verified</strong>.")
    C["us_stk_foot_ko"] = ("<strong>이 표는 미국 정규장 마감 값</strong>입니다 &mdash; 마감 뒤에 나온 실적이나 "
                           "시간외 움직임은 들어 있지 않습니다. <strong>「실적&middot;컨퍼런스콜」 절과 함께 "
                           "보십시오.</strong>")
    C["us_stk_foot_en"] = ("<strong>These are regular-session closes</strong> &mdash; after-hours moves and "
                           "post-close results are not in them. <strong>Read alongside the results section.</strong>")
    C["flow_foot_ko"] = ("세 주체 합이 0 이 아닌 것은 <strong>기타법인이 빠져 있기 때문</strong>입니다. "
                         "<strong>선물 외국인은 받지 못하므로 프로그램 비차익을 대용</strong>으로 봅니다 " + VF_1 + ".")
    C["flow_foot_en"] = ("The columns do not sum to zero because <strong>other corporates are excluded</strong>. "
                         "<strong>Foreign futures flow is unavailable; non-arb programme trading stands in</strong> "
                         + VF_1 + ".")

    C["fb_talking"] = [
        {"q_ko": "어제 제 계좌는 왜 지수와 달랐나요?",
         "q_en": "Why did my account not track the index?",
         "a_ko": "<strong>무엇을 담고 계셨느냐로 갈렸습니다.</strong> 코스피가 " + pct(KS["change_pct"])
                 + " 인 날 오른 종목이 " + n(ksb["advancing"], 0) + "개, 내린 종목이 " + n(ksb["declining"], 0)
                 + "개였습니다 " + VF_MD + ". <strong>시가총액 큰 종목 몇 개가 지수를 만들기 때문에</strong> "
                   "지수와 계좌는 자주 어긋납니다. <strong>확정된 투자 판단이 아닙니다.</strong>",
         "a_en": "<strong>It came down to what you held.</strong> On a day the KOSPI was " + pct(KS["change_pct"])
                 + ", " + n(ksb["advancing"], 0) + " stocks rose and " + n(ksb["declining"], 0) + " fell "
                 + VF_MD + ". <strong>A handful of heavyweights make the index.</strong>"},
        {"q_ko": "지금 들어가기에 비싼 자리인가요?",
         "q_en": "Is this an expensive level to enter?",
         "a_ko": "<strong>52주 구간에서 코스피는 " + n(C["pos52_ks"], 1) + "%, 코스닥은 " + n(C["pos52_kq"], 1)
                 + "% 자리</strong>에 있습니다 " + VF_C + ". <strong>두 시장이 다른 자리에 있으므로 같은 말씀을 "
                   "드리면 어긋납니다.</strong> 매물대 표에서 <strong>현재가 위에 쌓인 비중</strong>도 함께 "
                   "보십시오 &mdash; 위가 두꺼우면 올라갈 때 저항을 만납니다. <strong>확정된 투자 판단이 "
                   "아닙니다.</strong>",
         "a_en": "<strong>The KOSPI sits at " + n(C["pos52_ks"], 1) + "% of its 52-week range and the KOSDAQ at "
                 + n(C["pos52_kq"], 1) + "%</strong> " + VF_C + ". <strong>The two are in different places</strong>, "
                   "so one answer will not fit both."},
    ]


# 판 이름은 한 곳에서만 정한다. 세 군데에 흩어 두면 하나만 고치고 지나간다.
KIND_NAME = {
    "morning": ("모닝 마켓 브리핑", "Morning Market Briefing"),
    "close":   ("장마감 시황 브리핑", "Market Close Briefing"),
    "global":  ("해외 증시 브리핑", "Global Market Briefing"),
}


def _hero(C):
    """머리말 — 날짜와 작성 시각은 **시계에서** 만든다."""
    now, today, I = C["now"], C["today"], C["I"]
    N, KS = C["N"], C["KS"]
    kindko, kinden = KIND_NAME[C["kind"]]
    a, b = N.get("hero", C["fallback_today"][0][0], C["fallback_today"][0][1])
    tone_ko, tone_en = N.get("tone",
                             "지수보다 <strong>무엇이 움직였는지</strong>를 보십시오",
                             "Look at <strong>what moved</strong>, not the index")

    # 첫 줄은 **그날의 한마디**다. 「모닝 마켓 브리핑」은 판 이름일 뿐이라
    # 첫 쪽에서 가장 큰 글자가 매일 같은 말을 하고 있었다 — 받아 보는 쪽에
    # 아무것도 알려 주지 않는 자리다. 판 이름은 위 kicker 에 이미 있으므로,
    # 큰 글자는 그날 시장이 한 일을 말하게 한다(narrative 의 headline).
    # 없으면 예전처럼 판 이름으로 떨어진다 — **지어내지 않는다.**
    if N.has("headline"):
        hl_ko, hl_en = N.get("headline", kindko, kinden)
    else:
        hl_ko, hl_en = kindko, kinden
    C["hero"] = (
        '<div class="hero">\n'
        '  <p class="hero-kicker">' + L("%d년 %s" % (today.year, DK(today, True)),
                                        "%s %d" % (DE(today, True), today.year))
        + ' &middot; ' + L("미래에셋증권 마포WM &middot; " + kindko,
                           "Mirae Asset Securities, Mapo WM &middot; " + kinden) + '</p>\n'
        '  <h1 class="hero-title">' + L(hl_ko, hl_en) + '</h1>\n'
        '  <p class="hero-lede">' + L(a, b) + '</p>\n'
        '  <p class="hero-meta"><span class="tone mixed">' + L(tone_ko, tone_en) + '</span> &nbsp; '
        + L(("기준: 국내는 오늘 " + DK(today) + " 마감 &middot; 해외는 " + DK(C["prev_us"], True)
             + " 마감(아직 열지 않았습니다) &middot; 환율은 오늘 마감"
             if C["kind"] == "close" else
             "기준: 국내&middot;해외 모두 " + DK(C["prev_us"], True) + " 마감 &middot; 환율은 오늘 아침 "
             + DK(today))
            + " &middot; 시세 파일 " + C["D"]["generated_at_kst"][5:16] + " 수집 &middot; 작성 "
            + now.strftime("%Y-%m-%d") + "(" + "월화수목금토일"[now.weekday()] + ") "
            + now.strftime("%H:%M") + " KST"
            + (" &middot; <strong>오늘 09:00 국내 증시 개장</strong>" if C["kind"] == "morning" else "")
            + (" &middot; <strong>오늘 15:30 국내 증시 마감</strong>" if C["kind"] == "close" else ""),
            ("Basis: Korea closed today; overseas closes of " + DE(C["prev_us"], True)
             + " (not yet open); FX at today&rsquo;s close"
             if C["kind"] == "close" else
             "Basis: closes of " + DE(C["prev_us"], True) + "; FX as of this morning")
            + "; data collected "
            + C["D"]["generated_at_kst"][5:16] + "; compiled " + now.strftime("%H:%M") + " KST")
        + '</p>\n</div>')


def _holidays(C):
    """휴장일 표 — **자료 파일에서 읽는다**(`data/market/holidays.json`).

    빌더에 문자열로 박아 두면 날마다 복사되면서 틀린 채로 굴러다닌다. 실제로
    그랬다 — 중국 국경절이 10/1~10/8 로, 일본 9월 연휴가 이틀로 적혀 있었고
    국내 10/5 대체공휴일은 아예 없었다.

    **시장별이 아니라 날짜순으로 세운다** — 응대에서 필요한 것은 「어느 시장이
    언제 쉬나」가 아니라 「그날 어디가 닫혀 있나」이기 때문이다.
    """
    import json as _json
    import os as _os
    path = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))),
                         "data", "market", "holidays.json")
    if not _os.path.exists(path):
        return "", None
    try:
        HJ = _json.load(open(path, encoding="utf-8"))
    except Exception:                                             # noqa: BLE001
        return "", None

    today = C["today"]
    horizon = today + datetime.timedelta(days=126)                # 넉 달
    rows = []
    for m in HJ.get("markets", []):
        for day in m.get("days", []):
            try:
                dt = d(day["date"])
            except Exception:                                     # noqa: BLE001
                continue
            if dt < today or dt > horizon:
                continue
            rows.append((dt, m, day))
    if not rows:
        return "", None
    rows.sort(key=lambda x: (x[0], x[1]["key"]))

    KIND = {"full": ("종일 휴장", "Closed"),
            "early": ("조기마감", "Early close"),
            "weekend": ("주말과 겹침", "Falls on a weekend")}
    out = []
    for dt, m, day in rows:
        kk, ke = KIND.get(day.get("kind"), ("휴장", "Closed"))
        if day.get("close_local"):
            kk += " (" + day["close_local"] + ")"
            ke += " (" + day["close_local"] + ")"
        extra_k = (" &mdash; " + day["note_ko"]) if day.get("note_ko") else ""
        extra_e = (" &mdash; " + day["note_en"]) if day.get("note_en") else ""
        is_kr = m["key"] == "kr"
        out.append('      <tr' + (' class="hl"' if is_kr else '') + '>'
                   '<th class="wrap">' + DS(dt) + " (" + "월화수목금토일"[dt.weekday()] + ")" + '</th>'
                   '<td class="wrap">' + L(m["name_ko"], m["name_en"]) + '</td>'
                   '<td class="wrap">' + L(day["ko"] + extra_k, day["en"] + extra_e) + '</td>'
                   '<td class="n">' + L(kk, ke) + '</td>'
                   '<td class="n opt">' + VF_1 + '</td></tr>')

    # 국내가 쉬는 사이 해외가 몇 번 마감하는지 — 재개장 아침이 며칠치를 받는지
    kr_off = sorted({x[0] for x in rows if x[1]["key"] == "kr" and x[2].get("kind") == "full"})
    nxt = kr_off[0] if kr_off else None
    note = None
    if nxt:
        # 국내 휴장일 그날 미국 장이 열리면 재개장 아침이 이틀치를 받는다
        us_off = {x[0] for x in rows if x[1]["key"] == "us" and x[2].get("kind") == "full"}
        opens = 0 if (nxt in us_off or nxt.weekday() >= 5) else 1
        note = (nxt, opens)

    head = [TH("날짜", "Date", "wrap"), TH("시장", "Market", "wrap"),
            TH("무슨 날", "What", "wrap"), TH("구분", "Type", "n"),
            TH("검증", "Verified", "n opt")]
    foot_ko = ("<strong>국내 줄을 표시해 두었습니다</strong> &mdash; 국내가 쉬는 날 해외가 열리면 "
               "<strong>재개장 아침에 이틀치를 한꺼번에 받습니다.</strong> ")
    foot_en = ("<strong>Korean rows are highlighted</strong> &mdash; when Korea is shut and others trade, "
               "<strong>the reopening morning takes in two sessions at once.</strong> ")
    if note and note[1]:
        foot_ko += ("다음 국내 휴장일은 <strong>" + DS(note[0]) + "(" + "월화수목금토일"[note[0].weekday()]
                    + ")</strong> 이고, 그날 뉴욕은 <strong>열립니다</strong>. ")
        foot_en += ("The next Korean closure is <strong>" + DE(note[0]) + "</strong>, and New York <strong>trades "
                    "that day</strong>. ")
    foot_ko += ("<strong>거래소가 일정을 바꿉니다 &mdash; 주문 직전 다시 확인하십시오.</strong> "
                "확인 시점은 " + (HJ.get("verified_at") or "&mdash;") + " 입니다 " + VF_1 + ".")
    foot_en += ("<strong>Exchanges move these dates &mdash; reconfirm before acting.</strong> Verified "
                + (HJ.get("verified_at") or "&mdash;") + " " + VF_1 + ".")
    return tbl("휴장일 &mdash; 앞으로 넉 달 (" + DK(today) + " 이후)",
               "Market holidays &mdash; the next four months", head, out, cls="data compact",
               foot_ko=foot_ko, foot_en=foot_en), note
