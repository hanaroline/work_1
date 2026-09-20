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

어디서 받나 — **한 곳에 걸지 않는다**
──────────────────────────────────────────────────────────────────────
처음에는 야후(`KRW=X`) 하나만 보았다가 러너에서 **첫 판에 429(Too Many
Requests)** 를 맞았다. 러너 아이피는 공용이라 야후가 죄어 둔다. 그래서 여러
곳을 차례로 보고, 되는 것을 쓴다. 어느 곳을 썼는지는 산출물에 적힌다.

  1. **FRED `DEXKOUS`** — 미 연준 H.10 고시(뉴욕 정오 매입률). 공공 통계라
     가장 믿을 만하고 한도도 넉넉하다. 다만 **미국 공휴일에 구멍**이 나고
     주말이 없다. 환산할 때 직전 값으로 메우므로 문제되지 않는다.
  2. **Stooq `usdkrw`** — 일별 CSV, 이력이 길다.
  3. **야후 `KRW=X`** — 24 시간 시세. 429 를 맞으면 뒤로 물러서며 다시 본다.

이 저장소는 국내 주식 시세는 야후 대신 증권사(KIS) 값을 쓰기로 심판해
두었지만(`data/prices_kis/verdict.txt`), **환율은 그 심판의 대상이 아니었다.**
KIS 오픈API 에 전용 환율 시세가 있는지 확인하지 못했고(`probe_kis.py` 의
기록), 24 시간 시장이라 증권사 시세가 특별히 낫지도 않다. 확인하지 못한
것을 확인한 것처럼 바꾸지 않는다.

**클로드 세션에서는 어느 곳에도 못 붙는다**(이그레스 프록시가 막는다).
러너 몫이다.

무엇을 조심했나
──────────────────────────────────────────────────────────────────────
· 야후 `KRW=X` 는 24 시간 시세라 **마지막 봉이 아직 진행 중인 호가**일 수
  있다. 그 값을 그날 마감으로 적으면 안 되므로 `last_may_be_partial` 로
  표시해 둔다.
· 주가와 환율은 **쉬는 날이 다르다.** 환산하는 쪽(`proposal_fx.py`)이 그날
  이전의 가장 가까운 환율을 쓴다 — 없는 날을 지어내지 않는다.
· 빈 값·0·말도 안 되는 값은 버린다. 0 으로 읽으면 수익률이 무한이 되고,
  FRED 는 공휴일을 `.` 으로 준다.

쓰는 법
  python3 scripts/fetch_fx_daily.py
  python3 scripts/fetch_fx_daily.py --years 10
  python3 scripts/fetch_fx_daily.py --source fred     # 한 곳만 보기

산출물
  data/proposal/fx_daily.json
"""

import argparse
import csv
import io
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
OUT_DIR = os.path.join(ROOT, "data", "proposal")
OUT = os.path.join(OUT_DIR, "fx_daily.json")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# 원/달러가 이 범위를 벗어나면 받아 온 것이 환율이 아니다. 1998 년 외환위기
# 고점이 1,960 원쯤이었으므로 넉넉히 잡는다. 0 이나 소수점이 어긋난 값을
# 그대로 쓰면 수익률이 통째로 망가진다.
SANE_LO, SANE_HI = 500.0, 3000.0


def _get(url, tries=4):
    """받아 온다. 429·5xx 는 뒤로 물러서며 다시 본다."""
    last = None
    for i in range(tries):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as fp:
                return fp.read()
        except urllib.error.HTTPError as exc:
            last = exc
            if exc.code not in (429, 500, 502, 503, 504):
                raise
        except OSError as exc:                                   # noqa: BLE001
            last = exc
        if i < tries - 1:
            time.sleep(2 ** i * 3)          # 3 · 6 · 12 초
    raise last


def _keep(day, val):
    """쓸 만한 값인지. 아니면 None — 버리고 넘어간다."""
    try:
        v = float(val)
    except (TypeError, ValueError):
        return None                          # FRED 는 공휴일을 '.' 으로 준다
    if not (SANE_LO <= v <= SANE_HI):
        return None
    return v


def from_fred(years):
    """미 연준 H.10 — DEXKOUS(원/달러, 뉴욕 정오 매입률)."""
    start = (datetime.now(KST) - timedelta(days=int(365.25 * years) + 10)).date()
    url = ("https://fred.stlouisfed.org/graph/fredgraph.csv"
           "?id=DEXKOUS&cosd=%s" % start.strftime("%Y-%m-%d"))
    rows = csv.reader(io.StringIO(_get(url).decode("utf-8", "replace")))
    head = next(rows, None)
    if not head or len(head) < 2:
        raise ValueError("FRED 응답이 CSV 가 아닙니다")
    out = {}
    for row in rows:
        if len(row) < 2:
            continue
        v = _keep(row[0], row[1])
        if v is not None:
            out[row[0].replace("-", "")] = v
    return out, "미 연준 H.10 (FRED DEXKOUS, 원/달러 뉴욕 정오 매입률)"


def from_stooq(years):
    """Stooq 일별 CSV."""
    url = "https://stooq.com/q/d/l/?s=usdkrw&i=d"
    rows = csv.DictReader(io.StringIO(_get(url).decode("utf-8", "replace")))
    cut = (datetime.now(KST) - timedelta(days=int(365.25 * years))).strftime("%Y%m%d")
    out = {}
    for row in rows:
        day = (row.get("Date") or "").replace("-", "")
        if len(day) != 8 or day < cut:
            continue
        v = _keep(day, row.get("Close"))
        if v is not None:
            out[day] = v
    return out, "Stooq (usdkrw, 일별 종가)"


def from_yahoo(years):
    """야후 `KRW=X`. 24 시간 시세라 마지막 봉이 진행 중일 수 있다."""
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote("KRW=X")
           + "?range=%dy&interval=1d" % int(max(1, round(years))))
    j = json.loads(_get(url).decode("utf-8"))
    res = j["chart"]["result"][0]
    q = res["indicators"]["quote"][0]
    out = {}
    for t, c in zip(res["timestamp"], q["close"]):
        v = _keep(None, c)
        if v is not None:
            out[datetime.fromtimestamp(t, KST).strftime("%Y%m%d")] = v
    return out, "야후 파이낸스 (KRW=X, 일봉)"


SOURCES = [("fred", from_fred), ("stooq", from_stooq), ("yahoo", from_yahoo)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", type=float, default=10.0)
    ap.add_argument("--source", choices=[k for k, _ in SOURCES],
                    help="한 곳만 본다 (기본: 되는 곳을 차례로)")
    args = ap.parse_args()

    want = [(k, fn) for k, fn in SOURCES if not args.source or k == args.source]
    rates, src, tried = None, None, []
    for key, fn in want:
        try:
            got, label = fn(args.years)
        except Exception as exc:                                  # noqa: BLE001
            tried.append("%s — %s" % (key, str(exc)[:80]))
            print("  %-6s 안 됨: %s" % (key, str(exc)[:70]))
            continue
        if len(got) < 500:
            tried.append("%s — 봉 %d 개뿐" % (key, len(got)))
            print("  %-6s 봉 %d 개뿐 — 건너뜀" % (key, len(got)))
            continue
        rates, src = got, label
        print("  %-6s %d 봉 — 이것을 씁니다" % (key, len(got)))
        break

    if not rates:
        raise SystemExit("환율을 어디서도 받지 못했습니다:\n  "
                         + "\n  ".join(tried))

    days = sorted(rates)
    doc = {
        "generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "source": src,
        "pair": "USD/KRW",
        "years_requested": args.years,
        "count": len(days),
        "from": days[0], "to": days[-1],
        # 야후는 24 시간 시세라 마지막 봉이 아직 진행 중인 호가일 수 있다.
        "last_may_be_partial": src.startswith("야후"),
        "tried": tried,
        "d": days,
        "r": [rates[x] for x in days],
    }
    os.makedirs(OUT_DIR, exist_ok=True)
    tmp = OUT + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, OUT)

    print("\n원/달러 일별 환율 — %s" % src)
    print("%d 봉 · %s ~ %s" % (len(days), days[0], days[-1]))
    print("처음 %.2f · 마지막 %.2f" % (rates[days[0]], rates[days[-1]]))
    print(os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    main()
