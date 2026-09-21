#!/usr/bin/env python3
"""2차 관찰로 찾은 자리들의 **손잡이**를 마저 확인한다.

찾은 것
  종목별 수급  /api/domestic/market/trend/trendForeignOrg
               ?investorType=FOREIGNER&tradeType=KRX&marketType=KOSPI
               &startIdx=0&pageSize=20&periodType=DAY
               → sections.buyRankList / sellRankList (각 20)
  ETF         /api/stockSecurity/etfs/v2/domestic?listingType=tradingValueDesc
               &size=100&index=0  → totalCount 1171, hasNext
  레버리지 구분 /api/stockSecurity/etfs/v1/domestic/leverage-types
               → P1 일반 · P2 레버리지_2X · N2 인버스_2X · N1 인버스_1X

확인할 것
  ① `investorType` 에 기관은 무엇으로 들어가는가. 사모펀드·연기금은 있는가.
  ② `pageSize` 를 20 보다 키울 수 있는가 (매수상위 20 이 필요하다).
  ③ 브라우저 없이도 열리는가.
  ④ ETF 를 `index` 로 끝까지 넘길 수 있는가. `listingType` 에 무엇이 먹는가.
  ⑤ 전종목 목록은 시장별로 받으면 몇 줄까지 오는가 (ALL 은 1000 에서 끊겼다).
"""
from __future__ import annotations

import json
import os
import ssl
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
OUT = "data/journal/raw"
os.makedirs(OUT, exist_ok=True)
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
CTX = ssl.create_default_context()
lines: list[str] = []


def say(s=""):
    lines.append(s)
    print(s, flush=True)


def get(url, referer="https://stock.naver.com/market/stock/kr"):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept": "application/json, text/plain, */*",
        "Accept-Language": "ko-KR,ko;q=0.9", "Referer": referer})
    try:
        with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:1200]
    except Exception as e:  # noqa: BLE001
        return 0, str(e).encode()


TFO = "https://stock.naver.com/api/domestic/market/trend/trendForeignOrg"

say(f"손잡이 확인 {datetime.now(KST):%Y-%m-%d %H:%M KST}")
say("")
say("========== ① investorType ==========")
for it in ["FOREIGNER", "ORGANIZATION", "ORGAN", "INSTITUTION", "INSTITUTE",
           "INSTITUTIONAL", "ORG", "PERSONAL", "PRIVATE_EQUITY", "PRIVATEEQUITY",
           "PENSION", "TRUST", "INVESTMENT_TRUST", "FINANCIAL_INVESTMENT"]:
    url = f"{TFO}?investorType={it}&tradeType=KRX&marketType=KOSPI&startIdx=0&pageSize=20&periodType=DAY"
    st, body = get(url)
    if st != 200:
        say(f"    {it:22s} 실패 {st} {body[:90].decode('utf-8','replace')}")
        continue
    try:
        d = json.loads(body)
        b = (d.get("sections") or {}).get("buyRankList") or []
        s = (d.get("sections") or {}).get("sellRankList") or []
        head = ", ".join(r.get("itemname") for r in b[:3])
        say(f"    {it:22s} 200 · 매수 {len(b)} 매도 {len(s)} · {head}")
        if b:
            say(f"        첫 줄: {json.dumps(b[0], ensure_ascii=False)[:300]}")
    except Exception as e:  # noqa: BLE001
        say(f"    {it:22s} 200 인데 파싱 실패 {e}")
say("")

say("========== ② pageSize ==========")
for ps in [20, 30, 50, 100]:
    url = f"{TFO}?investorType=FOREIGNER&tradeType=KRX&marketType=KOSPI&startIdx=0&pageSize={ps}&periodType=DAY"
    st, body = get(url)
    if st != 200:
        say(f"    pageSize={ps:<4d} 실패 {st}")
        continue
    d = json.loads(body)
    b = (d.get("sections") or {}).get("buyRankList") or []
    say(f"    pageSize={ps:<4d} 200 · 매수 {len(b)} 줄")
say("")

say("========== ③ periodType · marketType ==========")
for pt in ["DAY", "WEEK", "MONTH", "SEGMENT_1DAY"]:
    for mt in ["KOSPI", "KOSDAQ"]:
        url = f"{TFO}?investorType=FOREIGNER&tradeType=KRX&marketType={mt}&startIdx=0&pageSize=20&periodType={pt}"
        st, body = get(url)
        cnt = "-"
        if st == 200:
            try:
                cnt = len((json.loads(body).get("sections") or {}).get("buyRankList") or [])
            except Exception:  # noqa: BLE001
                cnt = "?"
        say(f"    periodType={pt:<12s} marketType={mt:<7s} {st} · {cnt} 줄")
say("")

# 본문 한 벌을 남긴다 — 마감 뒤에 accTradeAmount 가 차는지 확인해야 한다.
for it, mt in (("FOREIGNER", "KOSPI"), ("FOREIGNER", "KOSDAQ")):
    st, body = get(f"{TFO}?investorType={it}&tradeType=KRX&marketType={mt}"
                   f"&startIdx=0&pageSize=20&periodType=DAY")
    if st == 200:
        with open(os.path.join(OUT, f"api2_tfo_{it}_{mt}.json"), "wb") as fh:
            fh.write(body)
        say(f"    → api2_tfo_{it}_{mt}.json 에 남겼다")

say("")
say("========== ④ ETF ==========")
ETF = "https://stock.naver.com/api/stockSecurity/etfs/v2/domestic"
for lt in ["tradingValueDesc", "changeRateDesc", "changeRate", "priceTop",
           "marketCapDesc", "totalNetAssetsDesc", "changeRateAsc"]:
    st, body = get(f"{ETF}?listingType={lt}&size=10&index=0")
    say(f"    listingType={lt:<20s} {st} {'' if st == 200 else body[:200].decode('utf-8', 'replace')}")
for idx in [0, 100, 1000, 1100]:
    st, body = get(f"{ETF}?listingType=tradingValueDesc&size=100&index={idx}")
    if st != 200:
        say(f"    index={idx:<5d} 실패 {st}")
        continue
    d = json.loads(body)
    items = d.get("items") or []
    say(f"    index={idx:<5d} 200 · {len(items)} 줄 · totalCount {d.get('totalCount')} · hasNext {d.get('hasNext')}"
        + (f" · 첫 줄 {items[0].get('itemName')}" if items else ""))
say("")

say("========== ⑤ 전종목 목록 — 시장별 ==========")
SL = "https://stock.naver.com/api/domestic/market/stock/default"
for mt in ["ALL", "KOSPI", "KOSDAQ"]:
    total = 0
    for idx in range(0, 3000, 500):
        st, body = get(f"{SL}?tradeType=KRX&marketType={mt}&orderType=marketSum"
                       f"&startIdx={idx}&pageSize=500")
        if st != 200:
            say(f"    {mt} startIdx={idx} 실패 {st}")
            break
        rows = json.loads(body)
        if not rows:
            say(f"    {mt} startIdx={idx} → 빈 응답 (여기서 끝)")
            break
        total += len(rows)
        say(f"    {mt} startIdx={idx} → {len(rows)} 줄 (누적 {total})")
    say(f"    ⇒ {mt} 로 받을 수 있는 것은 {total} 종목")
say("")

dest = os.path.join(OUT, "journal_api2.txt")
with open(dest, "w", encoding="utf-8") as fh:
    fh.write("\n".join(lines) + "\n")
print(f"\n기록 → {dest}")
