#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""원/달러 **일별 환율**을 10 해치 받는다.

왜 필요한가
──────────────────────────────────────────────────────────────────────
해외 종목의 일봉은 **달러**다. 그래서 여태 제안서의 해외주식·해외ETF 연평균
수익률은 달러 기준이었고, **원화로 투자하는 고객이 실제로 겪는 것과 달랐다.**
차이는 작지 않다 — 원/달러가 10 해 동안 1,100 에서 1,385 로 갔다면 해마다
2.3%p 가 수익에 얹힌다. 변동성도 달라진다(환율이 주가와 같이 움직이면 더
커지고, 반대로 움직이면 상쇄된다).

환율을 어디서 받나
──────────────────────────────────────────────────────────────────────
야후(`KRW=X`)다. 이 저장소는 국내 주식 시세는 야후 대신 증권사(KIS) 값을
쓰기로 심판해 두었지만(`data/prices_kis/verdict.txt`), **환율은 그 심판의
대상이 아니었다.** KIS 오픈API 에 전용 환율 시세가 있는지 확인하지 못했고
(`probe_kis.py` 의 기록), 24 시간 시장이라 증권사 시세가 특별히 낫지도 않다.
확인하지 못한 것을 확인한 것처럼 바꾸지 않는다.

**클로드 세션에서는 야후에 못 붙는다**(이그레스 프록시가 403 을 준다).
그래서 러너 몫이다.

무엇을 조심했나
──────────────────────────────────────────────────────────────────────
· `KRW=X` 는 거래소가 Europe/London 인 24 시간 시세라, **마지막 봉이 아직
  진행 중인 호가**일 수 있다. 그 값을 그날 마감으로 적으면 안 되므로
  마지막 봉은 `partial` 로 표시해 둔다.
· 주가와 환율은 **쉬는 날이 다르다.** 미국 장이 열린 날 서울 환시가 쉬면
  그날 환율이 없다. 그래서 환산할 때는 **그날 이전의 가장 가까운 환율**을
  쓴다(`rate_on`). 없는 날을 지어내지 않고, 앞의 값을 끌어다 쓰는 것이다.
· 빈 봉(`null`)은 버린다 — 0 으로 읽으면 수익률이 무한이 된다.

쓰는 법
  python3 scripts/fetch_fx_daily.py
  python3 scripts/fetch_fx_daily.py --years 10

산출물
  data/proposal/fx_daily.json
"""

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
OUT_DIR = os.path.join(ROOT, "data", "proposal")
OUT = os.path.join(OUT_DIR, "fx_daily.json")

SYMBOL = "KRW=X"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


def fetch(symbol, years):
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol)
           + "?range=%dy&interval=1d" % int(max(1, round(years))))
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as fp:
        j = json.loads(fp.read().decode("utf-8"))
    res = j["chart"]["result"][0]
    q = res["indicators"]["quote"][0]
    ts = res["timestamp"]
    closes = q["close"]

    out = {}
    for t, c in zip(ts, closes):
        if c is None or c <= 0:
            continue              # 빈 봉을 0 으로 읽으면 수익률이 무한이 된다
        # 환율은 KST 로 적는다. 주가 일봉의 날짜(현지 거래일)와 맞추기 위한
        # 것이 아니라, 국내 고객이 보는 날짜로 남기기 위한 것이다. 어긋나는
        # 날은 환산할 때 `rate_on` 이 앞의 값으로 메운다.
        out[datetime.fromtimestamp(t, KST).strftime("%Y%m%d")] = float(c)
    return out, res.get("meta") or {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", type=float, default=10.0)
    args = ap.parse_args()

    rates, meta = fetch(SYMBOL, args.years)
    if len(rates) < 500:
        raise SystemExit("환율 봉이 %d 개뿐입니다 — 받아 온 것을 보십시오."
                         % len(rates))

    days = sorted(rates)
    doc = {
        "generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "source": "야후 파이낸스 (%s, 일봉)" % SYMBOL,
        "symbol": SYMBOL,
        "pair": "USD/KRW",
        "years_requested": args.years,
        "count": len(days),
        "from": days[0], "to": days[-1],
        # 24 시간 시세라 마지막 봉은 아직 진행 중인 호가일 수 있다.
        "last_may_be_partial": True,
        "d": days,
        "r": [rates[x] for x in days],
    }
    os.makedirs(OUT_DIR, exist_ok=True)
    tmp = OUT + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, OUT)

    print("원/달러 일별 환율 — %s" % doc["source"])
    print("%d 봉 · %s ~ %s" % (len(days), days[0], days[-1]))
    print("처음 %.2f · 마지막 %.2f (마지막은 진행 중일 수 있습니다)"
          % (rates[days[0]], rates[days[-1]]))
    print(os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    main()
