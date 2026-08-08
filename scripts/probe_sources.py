#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""모닝 브리핑의 남은 두 항목. 결과는 data/market/probe.txt.

(1) 미 국채 2년물 — FRED 는 cosd 를 줘도 계속 끊긴다. 재무부 원본을 본다.
(2) VKOSPI — 네이버는 아예 취급하지 않는다(지수 코드가 FUT/KOSDAQ/KOSPI/
    KPI100/KPI200/KVALUE 뿐). 인베스팅 403, 야후 미수록, KRX 401.
    stooq 같은 무료 배포처와 공개 리더 경유를 본다.
"""
import re
import urllib.error
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def get(url, timeout=30, encoding="utf-8"):
    h = {"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
        return r.read().decode(encoding, "replace")


def probe(label, url, show=200, **kw):
    try:
        raw = get(url, **kw)
    except urllib.error.HTTPError as e:
        print("  [%-30s] HTTP %s" % (label, e.code))
        return None
    except Exception as e:                                         # noqa: BLE001
        print("  [%-30s] %s: %s" % (label, type(e).__name__, str(e)[:50]))
        return None
    print("  [%-30s] OK %6d | %s" % (label, len(raw), raw[:show].replace("\n", " | ")))
    return raw


print("=" * 78)
print("A. 미 국채 2년물 — 재무부 원본과 대안들")
print("=" * 78)
r = probe("재무부 일별 수익률곡선 CSV",
          "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/"
          "daily-treasury-rates.csv/2026/all?type=daily_treasury_yield_curve"
          "&field_tdr_date_value=2026&page&_format=csv", show=260, timeout=50)
if r:
    lines = [l for l in r.splitlines() if l.strip()]
    print("     └ %d행" % len(lines))
    print("       머리글: %s" % lines[0][:220])
    for l in lines[1:4]:
        print("       %s" % l[:220])

probe("야후 2년물 수익률선물",
      "https://query1.finance.yahoo.com/v8/finance/chart/2YY=F?range=5d&interval=1d",
      show=220)
probe("stooq 2년물",
      "https://stooq.com/q/d/l/?s=10usy2.b&i=d", show=200)
probe("FRED 한 계열만",
      "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS2&cosd=2026-07-25",
      show=200, timeout=50)

print()
print("=" * 78)
print("B. VKOSPI — 무료 배포처")
print("=" * 78)
for label, url in [
    ("stooq ^vkospi 일별", "https://stooq.com/q/d/l/?s=^vkospi&i=d"),
    ("stooq ^vkospi 시세", "https://stooq.com/q/l/?s=^vkospi&f=sd2t2ohlcv&h&e=csv"),
    ("stooq vkospi 검색", "https://stooq.com/cmp/?s=vkospi"),
    ("stooq ^kospi 대조", "https://stooq.com/q/l/?s=^kospi&f=sd2t2ohlcv&h&e=csv"),
]:
    probe(label, url, show=220)

# 공개 리더를 거쳐 인베스팅을 읽어 본다 (직접은 403)
inv = "https://kr.investing.com/indices/kospi-volatility"
probe("r.jina.ai 경유 인베스팅", "https://r.jina.ai/" + inv, show=300, timeout=60)
probe("allorigins 경유 인베스팅",
      "https://api.allorigins.win/raw?url=" + urllib.parse.quote(inv, safe=""),
      show=300, timeout=60)

print()
print("=" * 78)
print("C. 참고 — stooq 가 다른 지수도 주는지 (예비 원천으로 쓸 만한가)")
print("=" * 78)
for s in ("^spx", "^ndq", "^kospi", "^nkx"):
    probe("stooq " + s,
          "https://stooq.com/q/l/?s=%s&f=sd2t2ohlcv&h&e=csv" % urllib.parse.quote(s),
          show=160)

print()
print("탐색 종료")
