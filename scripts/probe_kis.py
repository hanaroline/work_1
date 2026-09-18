#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""KIS 오픈API 실측 — 지금 가진 앱키로 **어떤 시세가 실제로 나오는지** 잰다.

왜 붙이기 전에 재는가
──────────────────────────────────────────────────────────────────────
받은 것은 **모의투자 앱키**(계좌 50 으로 시작)다. 모의투자는 주문·잔고 검증용이고
시세 API 중 상당수에 「모의투자 미지원」이 붙는다 — 그런데 어디까지 되는지
공식 목록을 확인하지 못했다. 브리핑 세션은 KIS 로 나가는 길이 막혀 있고
(9443·29443 은 프록시가 비-443 포트를 지원하지 않는다, 443 은 403),
개발자포털도 같은 이그레스 정책에 막힌다.

그래서 **문서를 믿지 않고 러너에서 직접 때려 본다.** ETFCHECK·ELS 를 붙일 때
probe 를 먼저 돌린 것과 같은 순서다.

아래 TR_ID·경로는 문서를 열지 못한 채 적었으므로 **틀렸을 수 있다.** 틀린 것은
이 실측이 골라낸다 — 없는 TR 은 msg_cd 로 티가 난다. 한 회차 돌리고 report.md 를
보면 무엇을 고쳐야 하는지 나온다.

쓰는 법
  KIS_APP_KEY=... KIS_APP_SECRET=... python3 scripts/probe_kis.py
  python3 scripts/probe_kis.py --env prod        # 실전 앱키를 받았을 때
  python3 scripts/probe_kis.py --only 국내       # 묶음 하나만

산출물
  tools/kis-discovery/probe.json   기계가 읽을 원본
  tools/kis-discovery/report.md    사람이 읽을 표
"""

import argparse
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kis_lib import KST, KisClient, ROOT, env_banner            # noqa: E402

OUT_DIR = os.path.join(ROOT, "tools", "kis-discovery")

# 시험할 종목·심볼. 국내는 삼성전자, ETF 는 KODEX 200, 해외는 애플로 고정한다 —
# 거래정지나 상장폐지로 조용히 실패하지 않을 만한 것들이다.
SAMSUNG = "005930"
KODEX200 = "069500"

TODAY = datetime.now(KST).strftime("%Y%m%d")
YEAR_AGO = str(int(TODAY) - 10000)

# (묶음, 이름, 경로, TR_ID, 파라미터, 응답에서 확인할 칸)
#
# 확인할 칸은 "이 API 가 쓸모 있으려면 여기에 값이 있어야 한다"는 뜻이다.
# rt_cd 가 0 이어도 칸이 비어 있으면 못 쓰는 것이므로 따로 본다.
CASES = [
    # ── 국내주식 기본시세 ─────────────────────────────────────────────
    ("국내", "주식현재가 시세",
     "/uapi/domestic-stock/v1/quotations/inquire-price", "FHKST01010100",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": SAMSUNG},
     ["output", "stck_prpr"]),

    ("국내", "주식현재가 일자별(최근 30일)",
     "/uapi/domestic-stock/v1/quotations/inquire-daily-price", "FHKST01010400",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": SAMSUNG,
      "FID_PERIOD_DIV_CODE": "D", "FID_ORG_ADJ_PRC": "0"},
     ["output", 0, "stck_clpr"]),

    # ↓ 이것이 이 저장소에 가장 필요한 것이다. 시·고·저·종·거래량을 한 출처에서
    #   길게 받아야 지표(ATR·ADX·스토캐스틱·MFI·OBV·매물대)를 셈할 수 있다.
    ("국내", "국내주식기간별시세(일/주/월/년) ★기준 일봉 후보",
     "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
     "FHKST03010100",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": SAMSUNG,
      "FID_INPUT_DATE_1": YEAR_AGO, "FID_INPUT_DATE_2": TODAY,
      "FID_PERIOD_DIV_CODE": "D", "FID_ORG_ADJ_PRC": "0"},
     ["output2", 0, "stck_clpr"]),

    ("국내", "주식현재가 호가·예상체결",
     "/uapi/domestic-stock/v1/quotations/inquire-asking-price-exp-ccn",
     "FHKST01010200",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": SAMSUNG},
     ["output1", "askp1"]),

    ("국내", "주식현재가 체결",
     "/uapi/domestic-stock/v1/quotations/inquire-ccnl", "FHKST01010300",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": SAMSUNG},
     ["output", 0, "stck_prpr"]),

    # ── 지수 ─────────────────────────────────────────────────────────
    ("지수", "국내업종 현재지수(코스피)",
     "/uapi/domestic-stock/v1/quotations/inquire-index-price", "FHPUP02100000",
     {"FID_COND_MRKT_DIV_CODE": "U", "FID_INPUT_ISCD": "0001"},
     ["output", "bstp_nmix_prpr"]),

    ("지수", "국내업종 기간별지수(코스피 일봉)",
     "/uapi/domestic-stock/v1/quotations/inquire-daily-indexchartprice",
     "FHKUP03500100",
     {"FID_COND_MRKT_DIV_CODE": "U", "FID_INPUT_ISCD": "0001",
      "FID_INPUT_DATE_1": YEAR_AGO, "FID_INPUT_DATE_2": TODAY,
      "FID_PERIOD_DIV_CODE": "D"},
     ["output2", 0, "bstp_nmix_prpr"]),

    # ── ETF ──────────────────────────────────────────────────────────
    ("ETF", "ETF/ETN 현재가",
     "/uapi/etfetn/v1/quotations/inquire-price", "FHPST02400000",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": KODEX200},
     ["output", "stck_prpr"]),

    ("ETF", "ETF 구성종목시세",
     "/uapi/etfetn/v1/quotations/inquire-component-stock-price", "FHKST121600C0",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": KODEX200,
      "FID_COND_SCR_DIV_CODE": "11216"},
     ["output2", 0, "stck_shrn_iscd"]),

    # ETF 도 결국 주식 코드라 기본시세 TR 로도 잡힐 수 있다. 전용 TR 이 모의에서
    # 막혀도 이 길이 살아 있으면 ETF 화면은 굴러간다 — 그래서 따로 잰다.
    ("ETF", "ETF 를 주식 일봉 TR 로 받기(우회로)",
     "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
     "FHKST03010100",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": KODEX200,
      "FID_INPUT_DATE_1": YEAR_AGO, "FID_INPUT_DATE_2": TODAY,
      "FID_PERIOD_DIV_CODE": "D", "FID_ORG_ADJ_PRC": "0"},
     ["output2", 0, "stck_clpr"]),

    # ── 해외주식 ─────────────────────────────────────────────────────
    # 해외는 실시간이 유료 신청 대상이라 무료로는 지연시세만 나올 수 있다.
    # 값이 나오는지와 함께 **언제 시각인지**도 report 에 적어 둔다.
    ("해외", "해외주식 현재체결가(AAPL/나스닥)",
     "/uapi/overseas-price/v1/quotations/price", "HHDFS00000300",
     {"AUTH": "", "EXCD": "NAS", "SYMB": "AAPL"},
     ["output", "last"]),

    ("해외", "해외주식 현재가상세(AAPL)",
     "/uapi/overseas-price/v1/quotations/price-detail", "HHDFS76200200",
     {"AUTH": "", "EXCD": "NAS", "SYMB": "AAPL"},
     ["output", "last"]),

    ("해외", "해외주식 기간별시세(AAPL 일봉)",
     "/uapi/overseas-price/v1/quotations/dailyprice", "HHDFS76240000",
     {"AUTH": "", "EXCD": "NAS", "SYMB": "AAPL", "GUBN": "0",
      "BYMD": "", "MODP": "0"},
     ["output2", 0, "clos"]),
]

# ── 2차 — 수급·차트·해외ETF·원자재 ───────────────────────────────────
#
# 1차에서 국내주식·ETF·지수·해외주식의 기본 시세가 되는 것을 확인했다. 그 다음
# 물음은 「어디까지 되는가」다 — 투자자별 매매동향, 외국인·기관 수급, 분봉,
# 해외ETF, 원자재. 아래는 **추측으로 적은 것이고 실측이 가릴 것이다.**
# 1차에서 내 추측이 이미 한 번 틀렸다(유량 제한을 경로 오류로 오진).
CASES += [
    # ── 수급 — 이 저장소가 가장 아쉬워하던 칸이다 ──────────────────────
    # data/flows/kr100.json 이 수급을 담고 있지만 시·고·저·거래량이 없어
    # 지표에 못 쓴다고 fetch_kr_prices_naver.py 머리말에 적혀 있다. 증권사가
    # 직접 주는 수급이면 그 칸이 메워진다.
    ("수급", "주식현재가 투자자(개인·외국인·기관)",
     "/uapi/domestic-stock/v1/quotations/inquire-investor", "FHKST01010900",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": SAMSUNG},
     ["output", 0, "frgn_ntby_qty"]),

    ("수급", "종목별 외인·기관 추정가집계",
     "/uapi/domestic-stock/v1/quotations/investor-trend-estimate",
     "HHPTJ04160200",
     {"MKSC_SHRN_ISCD": SAMSUNG},
     ["output2", 0, "frgn_fake_ntby_qty"]),

    ("수급", "외국인·기관 매매종목 가집계(시장 전체)",
     "/uapi/domestic-stock/v1/quotations/foreign-institution-total",
     "FHPTJ04400000",
     {"FID_COND_MRKT_DIV_CODE": "V", "FID_COND_SCR_DIV_CODE": "16449",
      "FID_INPUT_ISCD": "0000", "FID_DIV_CLS_CODE": "0",
      "FID_RANK_SORT_CLS_CODE": "0", "FID_ETC_CLS_CODE": "0"},
     ["output", 0, "hts_kor_isnm"]),

    ("수급", "주식현재가 회원사(거래원)",
     "/uapi/domestic-stock/v1/quotations/inquire-member", "FHKST01010600",
     {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": SAMSUNG},
     ["output", "seln_mbcr_name1"]),

    # ── 차트 — 일봉 말고 더 잘게 ──────────────────────────────────────
    ("차트", "국내주식 분봉",
     "/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice",
     "FHKST03010200",
     {"FID_ETC_CLS_CODE": "", "FID_COND_MRKT_DIV_CODE": "J",
      "FID_INPUT_ISCD": SAMSUNG, "FID_INPUT_HOUR_1": "093000",
      "FID_PW_DATA_INCU_YN": "Y"},
     ["output2", 0, "stck_prpr"]),

    # ── 해외ETF·원자재 ───────────────────────────────────────────────
    # 해외는 ETF 도 종목코드로 취급된다. 전용 API 가 따로 있는 것이 아니라
    # 해외주식 시세 TR 에 심볼만 바꿔 넣는 것이 되는지 본다.
    ("해외", "해외ETF — SPY(S&P500, 아멕스)",
     "/uapi/overseas-price/v1/quotations/price", "HHDFS00000300",
     {"AUTH": "", "EXCD": "AMS", "SYMB": "SPY"},
     ["output", "last"]),

    ("해외", "해외ETF — QQQ(나스닥100)",
     "/uapi/overseas-price/v1/quotations/price", "HHDFS00000300",
     {"AUTH": "", "EXCD": "NAS", "SYMB": "QQQ"},
     ["output", "last"]),

    # 원자재의 직접 시세(WTI·금 선물)는 해외선물 영역이다. 그쪽이 막히면
    # 원자재 ETF 로 대신 볼 수 있으므로 두 길을 다 재 둔다.
    ("원자재", "원자재 ETF — GLD(금)",
     "/uapi/overseas-price/v1/quotations/price", "HHDFS00000300",
     {"AUTH": "", "EXCD": "AMS", "SYMB": "GLD"},
     ["output", "last"]),

    ("원자재", "원자재 ETF — USO(원유)",
     "/uapi/overseas-price/v1/quotations/price", "HHDFS00000300",
     {"AUTH": "", "EXCD": "AMS", "SYMB": "USO"},
     ["output", "last"]),

    ("원자재", "해외선물 시세(직접) — 금 GC",
     "/uapi/overseas-futureoption/v1/quotations/inquire-price", "HHDFC55010100",
     {"SRS_CD": "GCZ25", "EXCH_CD": "CME"},
     ["output1", "last_price"]),
]

# 환율에 대하여 — KIS 에 전용 환율 시세 API 가 있는지 확인하지 못했고, 애초에
# 이 저장소가 KIS 로 갈 이유가 적다. 환율은 이미 야후에서 KRW=X · DX-Y.NYB 로
# 받고 있고(probe_sources.py), 24시간 시장이라 증권사 시세가 특별히 낫지 않다.
# 바꿀 이유가 없으므로 후보에 넣지 않는다.

# 펀드에 대하여 — KIS 오픈API 목록은 국내주식·해외주식·선물옵션·채권·ELW 로,
# **공모펀드 기준가는 들어 있지 않은 것으로 보인다.** 확인하지 못했으므로 단정하지
# 않되, 이 실측에 넣을 후보 경로조차 없어 칸을 비워 둔다. 지금 펀드 자료
# (fund-weekly.yml)는 금투협 쪽이 원천이고 웹방화벽에 막히는 문제가 따로 있다 —
# KIS 로 그 칸을 메우는 것은 기대하지 않는 편이 낫다. 실측 결과를 보고 다시 판단한다.


def dig(blob, path):
    """응답에서 칸 하나를 꺼낸다. 없으면 None."""
    cur = blob
    for step in path:
        try:
            cur = cur[step]
        except (KeyError, IndexError, TypeError):
            return None
    return cur


def probe_one(kis, case):
    group, name, path, tr_id, params, check = case
    row = {"묶음": group, "이름": name, "경로": path, "tr_id": tr_id,
           "파라미터": params}
    try:
        got = kis.get(path, tr_id, params, raw=True)
    except Exception as exc:                                       # noqa: BLE001
        row.update({"판정": "호출실패", "상세": "%s: %s"
                    % (type(exc).__name__, str(exc)[:200])})
        return row

    # **HTTP 상태만 보고 판정하지 않는다.** KIS 는 거절을 HTTP 500 에 실어
    # 보내면서 몸통에는 rt_cd·msg_cd 를 제대로 담아 준다. 처음 판이 그것을
    # 읽지 않고 「HTTP오류」로 적어, 유량 초과(EGW00201)에 물린 멀쩡한 TR
    # 세 개가 「경로나 TR_ID 가 틀렸다」로 잘못 분류됐다.
    # JSON 조차 아닐 때만 HTTP 오류로 적는다.
    if "_body" in got:
        row.update({"판정": "HTTP오류", "상세": "HTTP %s %s"
                    % (got.get("_http"), str(got.get("_body"))[:200])})
        return row
    if got.get("_http"):
        row["http"] = got["_http"]

    rt_cd = str(got.get("rt_cd", ""))
    row["rt_cd"] = rt_cd
    row["msg_cd"] = got.get("msg_cd", "")
    row["msg1"] = (got.get("msg1") or "").strip()

    if rt_cd != "0":
        row["판정"] = "거절"
        return row

    value = dig(got, check)
    row["확인칸"] = ".".join(str(s) for s in check)
    row["확인값"] = value
    if value in (None, "", "0"):
        # rt_cd 는 0 인데 알맹이가 없다. 모의투자에서 껍데기만 돌려주는 경우가
        # 이렇게 보인다 — 「된다」고 적으면 안 되는 자리다.
        row["판정"] = "빈응답"
    else:
        row["판정"] = "정상"
        row["응답키"] = sorted(k for k in got.keys() if not k.startswith("_"))
    return row


def write_report(rows, kis, started):
    os.makedirs(OUT_DIR, exist_ok=True)

    blob = {"잰때": started, "환경": kis.env, "도메인": kis.base, "결과": rows}
    with open(os.path.join(OUT_DIR, "probe.json"), "w", encoding="utf-8") as fp:
        json.dump(blob, fp, ensure_ascii=False, indent=1)

    ok = [r for r in rows if r["판정"] == "정상"]
    lines = [
        "# KIS 오픈API 실측",
        "",
        "- 잰 때: %s" % started,
        "- 환경: **%s**" % env_banner(kis),
        "- 정상 %d / 전체 %d" % (len(ok), len(rows)),
        "",
        "판정은 네 가지다. **정상**은 rt_cd 0 이고 확인칸에 값이 있다.",
        "**빈응답**은 rt_cd 는 0 인데 알맹이가 없다 — 껍데기만 오는 것이므로 못 쓴다.",
        "**거절**은 KIS 가 rt_cd 로 물린 것(모의 미지원이면 여기 msg1 에 나온다).",
        "**호출실패/HTTP오류**는 경로나 TR_ID 가 틀렸을 가능성이 크다.",
        "",
        "| 묶음 | 이름 | TR_ID | 판정 | msg_cd | 메시지 / 확인값 |",
        "|---|---|---|---|---|---|",
    ]
    for r in rows:
        tail = r.get("msg1") or ""
        if r["판정"] == "정상":
            tail = "%s = %s" % (r.get("확인칸", ""), r.get("확인값"))
        elif r["판정"] in ("호출실패", "HTTP오류"):
            tail = r.get("상세", "")
        lines.append("| %s | %s | `%s` | **%s** | %s | %s |" % (
            r["묶음"], r["이름"], r["tr_id"], r["판정"],
            r.get("msg_cd", ""), str(tail).replace("|", "/")[:160]))

    lines += ["", "## 다음 할 일", ""]
    if ok:
        lines.append("정상으로 나온 것부터 수집기에 붙인다:")
        lines += ["- %s (`%s`)" % (r["이름"], r["tr_id"]) for r in ok]
    else:
        lines.append("정상이 하나도 없다. 앱키 환경(실전/모의)이 맞는지, "
                     "경로·TR_ID 가 맞는지 먼저 본다.")
    bad = [r for r in rows if r["판정"] in ("호출실패", "HTTP오류")]
    if bad:
        lines += ["", "경로나 TR_ID 를 고쳐야 하는 것 — 개발자포털 문서와 맞대 본다:"]
        lines += ["- %s (`%s`)" % (r["이름"], r["tr_id"]) for r in bad]
    rejected = [r for r in rows if r["판정"] == "거절"]
    if rejected:
        lines += ["", "KIS 가 물린 것 — 모의투자 미지원이면 실전 앱키가 있어야 한다:"]
        lines += ["- %s — %s %s" % (r["이름"], r.get("msg_cd", ""), r.get("msg1", ""))
                  for r in rejected]

    with open(os.path.join(OUT_DIR, "report.md"), "w", encoding="utf-8") as fp:
        fp.write("\n".join(lines) + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--env", choices=["vps", "prod"],
                    help="vps=모의(기본), prod=실전")
    ap.add_argument("--only", help="묶음 하나만 (국내/지수/ETF/해외)")
    args = ap.parse_args()

    kis = KisClient(env=args.env)
    started = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S KST")
    print("KIS 실측 — %s" % env_banner(kis))
    print("잰 때: %s\n" % started)

    cases = CASES
    if args.only:
        cases = [c for c in CASES if c[0] == args.only]
        if not cases:
            raise SystemExit("그런 묶음이 없다: %s" % args.only)

    rows = []
    for case in cases:
        row = probe_one(kis, case)
        rows.append(row)
        mark = {"정상": "○", "빈응답": "△", "거절": "×",
                "호출실패": "!", "HTTP오류": "!"}.get(row["판정"], "?")
        detail = row.get("msg1") or row.get("상세", "")
        if row["판정"] == "정상":
            detail = "%s = %s" % (row.get("확인칸"), row.get("확인값"))
        print("%s [%s] %s\n    %s" % (mark, row["묶음"], row["이름"],
                                      str(detail)[:150]))

    write_report(rows, kis, started)
    ok = sum(1 for r in rows if r["판정"] == "정상")
    print("\n정상 %d / 전체 %d — tools/kis-discovery/report.md 에 적었다."
          % (ok, len(rows)))

    # 실측은 「무엇이 안 되는지」를 알아내는 것이 목적이므로, 몇 개가 막혔다고
    # 잡을 실패시키지 않는다. 앱키 자체가 죽었을 때만(전부 실패) 실패로 본다.
    if ok == 0:
        raise SystemExit("정상이 하나도 없다 — 앱키나 환경 설정을 본다.")


if __name__ == "__main__":
    main()
