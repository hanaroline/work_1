#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""수집기에 넣기 전에 어느 원천이 응답하는지 본다. 결과는 data/market/probe.txt.

이번에 찾는 것 넷.

(1) 채권 변동성 — 주식의 VIX 에 해당하는 값이 없다. 야후 `^MOVE` 가 잡히는지.
(2) 기대인플레이션 — 명목금리만 보면 금리 하락이 성장 때문인지 물가 때문인지
    안 갈린다. FRED 는 예전 프로브에서 계속 끊겼으므로, 이미 잘 붙는
    home.treasury.gov 의 **실질수익률곡선(TIPS)** 을 본다. 명목 − 실질 이
    곧 기대인플레이션이라 새 호스트를 늘리지 않고 둘 다 얻는다.
(3) 미국 정책금리 — 지금은 연방기금 선물 내재금리를 1개월물과 비교하는
    우회를 쓴다. 뉴욕연은이 EFFR 을 공개 API 로 준다.
(4) 한국 기준금리 — ECOS 722Y001. ECOS 는 이미 붙고 있다.
"""
import json
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
        print("  [%-32s] HTTP %s" % (label, e.code))
        return None
    except Exception as e:                                         # noqa: BLE001
        print("  [%-32s] %s: %s" % (label, type(e).__name__, str(e)[:60]))
        return None
    print("  [%-32s] OK %6d | %s" % (label, len(raw), raw[:show].replace("\n", " | ")))
    return raw


print("=" * 78)
print("A. 채권 변동성 (MOVE) — 야후에 심볼이 있는가")
print("=" * 78)
for sym in ("^MOVE", "MOVE", "^VXTLT", "TLT"):
    r = probe("야후 " + sym,
              "https://query1.finance.yahoo.com/v8/finance/chart/%s?range=5d&interval=1d"
              % urllib.parse.quote(sym), show=0)
    if r:
        try:
            res = json.loads(r)["chart"]["result"][0]
            m = res["meta"]
            print("     └ %s | 종가 %s | 통화 %s | 이름 %s"
                  % (m.get("symbol"), m.get("regularMarketPrice"),
                     m.get("currency"), m.get("shortName")))
        except Exception as e:                                     # noqa: BLE001
            print("     └ 파싱 실패: %s" % e)

print()
print("=" * 78)
print("B. 기대인플레이션 — 재무부 실질수익률곡선(TIPS)")
print("=" * 78)
r = probe("재무부 실질수익률곡선 CSV",
          "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/"
          "daily-treasury-rates.csv/2026/all?type=daily_treasury_real_yield_curve"
          "&field_tdr_date_value=2026&page&_format=csv", show=0, timeout=50)
if r:
    lines = [l for l in r.splitlines() if l.strip()]
    print("     └ %d행" % len(lines))
    print("       머리글: %s" % lines[0][:200])
    for l in lines[1:3]:
        print("       %s" % l[:200])

probe("FRED 기대인플레 T10YIE",
      "https://fred.stlouisfed.org/graph/fredgraph.csv?id=T10YIE&cosd=2026-07-25",
      show=160, timeout=50)

print()
print("=" * 78)
print("C. 미국 정책금리 — 뉴욕연은 EFFR")
print("=" * 78)
r = probe("뉴욕연은 EFFR",
          "https://markets.newyorkfed.org/api/rates/unsecured/effr/last/3.json",
          show=0, timeout=40)
if r:
    try:
        for row in json.loads(r).get("refRates", []):
            print("     └ %s %s%% (type %s)"
                  % (row.get("effectiveDate"), row.get("percentRate"), row.get("type")))
    except Exception as e:                                         # noqa: BLE001
        print("     └ 파싱 실패: %s" % e)

probe("FRED 연방기금 목표 상단 DFEDTARU",
      "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFEDTARU&cosd=2026-07-25",
      show=160, timeout=50)

print()
print("=" * 78)
print("D. 한국 기준금리 — ECOS 722Y001")
print("=" * 78)
ECOS = "https://ecos.bok.or.kr/api/%s/sample/json/kr/1/20/%s"
r = probe("ECOS 항목목록 722Y001",
          ECOS % ("StatisticItemList", "722Y001"), show=0, timeout=60)
if r:
    try:
        rows = json.loads(r).get("StatisticItemList", {}).get("row", [])
        for row in rows[:12]:
            print("     └ %-12s %s" % (row.get("ITEM_CODE"), row.get("ITEM_NAME")))
    except Exception as e:                                         # noqa: BLE001
        print("     └ 파싱 실패: %s" % e)

r = probe("ECOS 기준금리 0101000",
          ECOS % ("StatisticSearch", "722Y001/D/20260701/20260808/0101000"),
          show=0, timeout=60)
if r:
    try:
        rows = json.loads(r).get("StatisticSearch", {}).get("row", [])
        print("     └ %d행" % len(rows))
        for row in rows[-3:]:
            print("       %s %s = %s" % (row.get("TIME"), row.get("ITEM_NAME1"),
                                         row.get("DATA_VALUE")))
    except Exception as e:                                         # noqa: BLE001
        print("     └ 파싱 실패: %s" % e)

print()
print("끝.")
