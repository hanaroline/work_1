# -*- coding: utf-8 -*-
"""원천 탐색 — 지금은 아시아 지수의 마지막 봉이 왜 하루 늦는지 본다.

8월 11일 07:29 수집에서 미국·유럽·원자재와 일본·중국 **개별 종목**은 전부
8월 10일이었는데, 아시아 **지수**(^N225 ^HSI 000001.SS ^KS11 ^TWII ^BSESN
^AXJO)만 8월 7일이었다. 같은 yahoo_quote 를 쓰므로 코드가 아니라 응답이
다르다. 무엇이 오는지 그대로 찍어 본다.

수집기의 `_get` 을 그대로 쓴다. 맨 urllib 로 부르면 야후가 429 를 준다 —
헤더가 달라서다. 먼저 짠 판이 그 함정에 빠져 전부 429 였다.

작업 브랜치에서만 돈다(워크플로가 main 에서는 이 단계를 건너뛴다).
"""
import json
import urllib.parse
from datetime import datetime, timedelta, timezone

from fetch_market import _get

KST = timezone(timedelta(hours=9))

INDEX = {"^KS11": "코스피", "^KQ11": "코스닥", "^N225": "니케이", "^HSI": "항셍",
         "000001.SS": "상하이", "^TWII": "대만", "^BSESN": "센섹스", "^AXJO": "호주",
         "^GSPC": "S&P500(대조군)", "^STOXX": "유럽(대조군)"}
STOCK = {"7203.T": "도요타(대조군)", "600519.SS": "귀주모태(대조군)",
         "005930.KS": "삼성전자(대조군)"}


def series(symbol, rng="5d", interval="1d"):
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol) + "?range=%s&interval=%s" % (rng, interval))
    res = json.loads(_get(url))["chart"]["result"][0]
    q, ts = res["indicators"]["quote"][0], res.get("timestamp") or []
    rows = [(datetime.fromtimestamp(t, KST).strftime("%m-%d %H:%M"), q["close"][i])
            for i, t in enumerate(ts)]
    return res["meta"], rows


def show(symbol, label):
    print("\n=== %s  %s" % (symbol, label))
    for rng in ("5d", "1mo"):
        try:
            meta, rows = series(symbol, rng)
            print("  range=%-4s %s" % (rng, " | ".join(
                "%s %s" % (d, "null" if c is None else round(c, 2)) for d, c in rows[-3:])))
            if rng == "5d":
                rmt = meta.get("regularMarketTime")
                print("      거래소tz=%s  regularMarketTime=%s  regularMarketPrice=%s"
                      % (meta.get("exchangeTimezoneName"),
                         datetime.fromtimestamp(rmt, KST).strftime("%m-%d %H:%M") if rmt else "?",
                         meta.get("regularMarketPrice")))
        except Exception as e:
            print("  range=%-4s 실패 %s: %s" % (rng, type(e).__name__, e))


def main():
    print("지금 %s KST" % datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"))
    for sym, label in list(INDEX.items()) + list(STOCK.items()):
        show(sym, label)


if __name__ == "__main__":
    main()
