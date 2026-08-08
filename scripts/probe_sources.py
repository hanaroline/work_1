#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""선물 투자자별 단위를 결정적으로 가린다. 결과는 data/market/probe.txt.

가진 것:
  - 네이버 FUT dealTrendInfo (20260807): 개인 -1,444 / 외국인 +9,624 / 기관 -7,662
  - 2026-07-10 자 기사 문장(디지털데일리): "선물시장에서는 기관이 6309계약을
    순매수한 반면 외국인은 7738계약을 순매도했다"

검증 설계:
  네이버에서 20260710 의 선물 투자자별을 꺼낼 수 있으면,
  그 값이 (기관 +6,309 / 외국인 -7,738) 과 일치하는지로 단위가 결정된다.
  일치 -> 계약. 전혀 다른 크기 -> 금액(억원).
  8월 7일자 기사 46건을 확인했지만 선물 계약 수를 적은 기사는 한 건도 없었으므로,
  그날 기사로는 대조가 불가능하다. 그래서 7월 10일을 쓴다.
"""
import json
import re
import urllib.error
import urllib.request

MUA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
       "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")


def get(url, timeout=25):
    h = {"User-Agent": MUA, "Accept-Language": "ko-KR,ko;q=0.9",
         "Referer": "https://m.stock.naver.com/"}
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


print("=" * 78)
print("A. 선물 투자자별 과거치를 주는 경로 찾기")
print("=" * 78)
CANDS = [
    "https://m.stock.naver.com/api/index/FUT/dealTrend",
    "https://m.stock.naver.com/api/index/FUT/dealTrend?bizdate=20260710",
    "https://m.stock.naver.com/api/index/FUT/investorDealTrend",
    "https://m.stock.naver.com/api/index/FUT/trend",
    "https://m.stock.naver.com/api/index/FUT/price?pageSize=20&page=1",
    "https://m.stock.naver.com/api/index/FUT/basic",
    "https://api.stock.naver.com/chart/domestic/index/FUT",
    "https://finance.naver.com/sise/investorDealTrendDay.naver?bizdate=20260710&sosok=FUT",
]
for u in CANDS:
    try:
        r = get(u)
    except urllib.error.HTTPError as e:
        print("  [%-62s] HTTP %s" % (u[-62:], e.code))
        continue
    except Exception as e:                                         # noqa: BLE001
        print("  [%-62s] %s" % (u[-62:], str(e)[:40]))
        continue
    hit = "dealTrend" in r or "personalValue" in r or "투자자" in r
    print("  [%-62s] OK %6d  투자자자료=%s" % (u[-62:], len(r), hit))
    if hit:
        for m in list(re.finditer(r'\{[^{}]*"personalValue"[^{}]*\}', r))[:6]:
            print("      %s" % m.group(0))

print()
print("=" * 78)
print("B. 지금 값 재확인 + 대금·거래량으로 승수 검산")
print("=" * 78)
try:
    j = json.loads(get("https://m.stock.naver.com/api/index/FUT/integration"))
    d = j["dealTrendInfo"]
    vol = None
    val = None
    close = None
    for t in j["totalInfos"]:
        if t["code"] == "accumulatedTradingVolume":
            vol = float(t["value"].replace(",", ""))
        if t["code"] == "accumulatedTradingValue":
            val = float(re.sub(r"[^\d.]", "", t["value"]))     # 백만 단위
        if t["code"] == "lastClosePrice":
            close = float(t["value"].replace(",", ""))
    print("  dealTrendInfo: %s" % json.dumps(d, ensure_ascii=False))
    print("  거래량 %s계약 · 대금 %s백만 · 전일 %s" % (vol, val, close))
    if vol and val and close:
        implied = val * 1e6 / vol / close
        print("  역산 승수 = 대금 / 거래량 / 지수 = %.0f 원/포인트" % implied)
        print("  (코스피200 선물 정규 승수는 250,000원/포인트)")
        # 외국인 값을 두 단위로 각각 환산해 규모를 견준다
        f = float(d["foreignValue"].replace(",", "").replace("+", ""))
        print("  외국인 값을 계약으로 보면: %.0f계약 = %.2f조원 (거래량의 %.1f%%)"
              % (f, f * close * 250000 / 1e12, f / vol * 100))
        print("  외국인 값을 억원으로 보면: %.0f억원 = %.2f조원 (대금의 %.1f%%)"
              % (f, f / 1e4, f * 1e8 / (val * 1e6) * 100))
except Exception as e:                                             # noqa: BLE001
    print("  실패:", e)

print()
print("탐색 종료")
