# -*- coding: utf-8 -*-
"""원천 탐색 — 지금은 아시아 지수의 마지막 봉이 왜 하루 늦는지 본다.

8월 11일 06:34 수집에서 미국·유럽·원자재와 일본·중국 **개별 종목**은 전부
8월 10일이었는데, 아시아 **지수**(^N225 ^HSI 000001.SS ^KS11 ^TWII ^BSESN
^AXJO)만 8월 7일이었다. 같은 yahoo_quote 를 쓰므로 코드가 아니라 응답이
다르다. 무엇이 오는지 그대로 찍어 본다.

작업 브랜치에서만 돈다(워크플로가 main 에서는 이 단계를 건너뛴다).
"""
import json
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"}

INDEX = {"^KS11": "코스피", "^KQ11": "코스닥", "^N225": "니케이", "^HSI": "항셍",
         "000001.SS": "상하이", "^TWII": "대만", "^BSESN": "센섹스", "^AXJO": "호주",
         "^GSPC": "S&P500(대조군)"}
STOCK = {"7203.T": "도요타(대조군)", "600519.SS": "귀주모태(대조군)"}


def get(url, timeout=25):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def series(symbol, rng="5d", interval="1d", extra=""):
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol)
           + "?range=%s&interval=%s%s" % (rng, interval, extra))
    j = json.loads(get(url))
    res = j["chart"]["result"][0]
    meta, q, ts = res["meta"], res["indicators"]["quote"][0], res.get("timestamp") or []
    rows = []
    for i, t in enumerate(ts):
        rows.append((datetime.fromtimestamp(t, KST).strftime("%m-%d %H:%M"),
                     q["close"][i]))
    return meta, rows


def show(symbol, label):
    print("\n=== %s  %s" % (symbol, label))
    for rng, interval, extra in (("5d", "1d", ""),
                                 ("1mo", "1d", ""),
                                 ("5d", "1d", "&includePrePost=false")):
        try:
            meta, rows = series(symbol, rng, interval, extra)
            tail = rows[-3:]
            print("  range=%-4s %s" % (rng + extra.replace("&includePrePost=false", "+npp"),
                                       " | ".join("%s %s" % (d, c) for d, c in tail)))
            if rng == "5d" and not extra:
                print("      meta.tz=%s  exchTz=%s  regularMarketTime=%s"
                      % (meta.get("timezone"), meta.get("exchangeTimezoneName"),
                         datetime.fromtimestamp(meta["regularMarketTime"], KST)
                         .strftime("%m-%d %H:%M") if meta.get("regularMarketTime") else "?"))
                print("      meta.regularMarketPrice=%s  chartPreviousClose=%s"
                      % (meta.get("regularMarketPrice"), meta.get("chartPreviousClose")))
        except Exception as e:
            print("  range=%-4s 실패 %s: %s" % (rng, type(e).__name__, e))


def main():
    print("지금 %s KST" % datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"))
    for sym, label in INDEX.items():
        show(sym, label)
    for sym, label in STOCK.items():
        show(sym, label)

    # 대안 원천 — 스투크는 지수도 일별로 준다
    print("\n=== stooq 대안 확인")
    for code in ("^nkx", "^hsi", "^shc", "^kospi"):
        try:
            txt = get("https://stooq.com/q/d/l/?s=%s&i=d" % code)
            lines = txt.strip().splitlines()
            print("  %-8s %s" % (code, lines[-1] if len(lines) > 1 else txt[:60]))
        except Exception as e:
            print("  %-8s 실패 %s: %s" % (code, type(e).__name__, e))


if __name__ == "__main__":
    main()
