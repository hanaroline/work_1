# -*- coding: utf-8 -*-
"""원천 탐색 — 지금은 환율 심볼의 일봉 날짜 기준을 본다.

지수 빈 봉 문제를 고치면서 날짜 판정을 KST 에서 거래소 현지(meta.gmtoffset)
로 바꿨다. 그 결과 `usdkrw` 가 2026-08-11 에서 2026-08-10 으로 바뀌었다.
환율은 24시간 돌아 "세션"이 없으므로 어느 쪽이 맞는지 응답을 보고 정한다.

작업 브랜치에서만 돈다.
"""
import json
import urllib.parse
from datetime import datetime, timedelta, timezone

from fetch_market import _get

KST = timezone(timedelta(hours=9))
FX = {"KRW=X": "원/달러", "EURUSD=X": "유로/달러", "JPY=X": "달러/엔",
      "DX-Y.NYB": "달러인덱스", "CL=F": "WTI(대조군)", "^KS11": "코스피(대조군)"}


def show(symbol, label):
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol) + "?range=5d&interval=1d")
    try:
        res = json.loads(_get(url))["chart"]["result"][0]
    except Exception as e:
        print("\n=== %s %s — 실패 %s: %s" % (symbol, label, type(e).__name__, e))
        return
    meta, q = res["meta"], res["indicators"]["quote"][0]
    ts = res.get("timestamp") or []
    off = meta.get("gmtoffset")
    tz = timezone(timedelta(seconds=off)) if isinstance(off, int) else KST
    print("\n=== %s  %s" % (symbol, label))
    print("   exchangeTimezoneName=%s  gmtoffset=%s" % (meta.get("exchangeTimezoneName"), off))
    rmt = meta.get("regularMarketTime")
    if rmt:
        print("   regularMarketTime  현지 %s | KST %s   price=%s"
              % (datetime.fromtimestamp(rmt, tz).strftime("%m-%d %H:%M"),
                 datetime.fromtimestamp(rmt, KST).strftime("%m-%d %H:%M"),
                 meta.get("regularMarketPrice")))
    for i in range(max(0, len(ts) - 3), len(ts)):
        print("   봉 현지 %s | KST %s  종가 %s"
              % (datetime.fromtimestamp(ts[i], tz).strftime("%m-%d %H:%M"),
                 datetime.fromtimestamp(ts[i], KST).strftime("%m-%d %H:%M"),
                 q["close"][i]))


# 아직 못 채운 두 칸을 어디서 받을 수 있는지 본다. 러너에서만 알 수 있다 —
# 브리핑 세션은 이그레스 정책 때문에 어디에도 직접 못 붙기 때문이다.
#
#   VKOSPI  — 야후 미수록, 네이버 미취급, 인베스팅 403, stooq 차단.
#   반대매매 — 증시자금동향 표에 없다(금투협 소관).
GAPS = [
    ("VKOSPI · KRX 지수 통계(공개)",
     "https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd", "post_krx"),
    ("VKOSPI · 네이버 모바일 지수 목록",
     "https://m.stock.naver.com/api/index/VKOSPI/basic", "get"),
    ("VKOSPI · 야후 심볼 시도(^VKOSPI)",
     "https://query1.finance.yahoo.com/v8/finance/chart/%5EVKOSPI?range=5d&interval=1d", "get"),
    ("반대매매 · 금투협 FREESIS 통계 화면",
     "https://freesis.kofia.or.kr/meta/getMetaDataList.do", "get"),
    ("반대매매 · 금투협 공시 포털",
     "https://dis.kofia.or.kr/websquare/index.jsp", "get"),
]


def probe_gaps():
    """빈 칸을 메울 원천 후보에 붙어 본다. 무엇이 돌아오는지만 적는다."""
    print("\n\n########## 아직 못 채운 항목의 원천 후보 ##########")
    for label, url, how in GAPS:
        print("\n=== %s\n    %s" % (label, url))
        try:
            if how == "post_krx":
                body = _get(url,
                            data={"bld": "dbms/MDC/STAT/standard/MDCSTAT00301",
                                  "locale": "ko_KR", "idxIndMidclssCd": "05"},
                            referer="https://data.krx.co.kr/",
                            headers={"X-Requested-With": "XMLHttpRequest",
                                     "Origin": "https://data.krx.co.kr"})
            else:
                body = _get(url, referer="https://www.google.com/")
        except Exception as e:                                    # noqa: BLE001
            print("    실패 %s: %s" % (type(e).__name__, str(e)[:120]))
            continue
        head = body[:200].replace("\n", " ")
        print("    %d bytes | %s" % (len(body), head))
        if "VKOSPI" in body or "변동성" in body:
            print("    >>> VKOSPI 문자열이 응답에 있다 — 파서를 붙일 만하다")
        if "반대매매" in body or "미수금" in body:
            print("    >>> 반대매매 문자열이 응답에 있다 — 파서를 붙일 만하다")


def main():
    print("지금 %s KST" % datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"))
    for sym, label in FX.items():
        show(sym, label)
    probe_gaps()


if __name__ == "__main__":
    main()
