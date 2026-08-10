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


def main():
    print("지금 %s KST" % datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"))
    for sym, label in FX.items():
        show(sym, label)


if __name__ == "__main__":
    main()
