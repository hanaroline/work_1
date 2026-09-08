#!/usr/bin/env python3
"""미국 100대 기업 **가격만** 빠르게 받아 data/us100/quotes.json 에 저장한다.

`fetch_us100.py` 는 종목별로 5번씩 요청해 5~8분이 걸린다(지표·실적·컨센서스까지 받는다).
장중에 가격만 자주 갱신하려면 그 무게로는 안 되므로 이 스크립트를 따로 둔다.

경로는 세 갈래이고, 되는 것을 먼저 쓴다.

  1) v7/finance/quote  — 쿠키 + crumb 을 붙이면 **한 번에 50종목**을 준다(2~3초).
                          시가총액·PER·거래량·장 상태까지 함께 온다.
  2) v8/finance/chart  — 종목별 1일치 일봉. meta 의 regularMarketPrice 와
                          chartPreviousClose(=전일 종가)를 쓴다. 100종목 60~90초.
  3) Stooq CSV 벌크    — 야후가 전부 막혔을 때. 전일 종가가 없어 등락률은 시가 대비다.

**v8/finance/spark 는 쓰지 않는다.** 2026-09-08 러너에서 range/interval 조합을 바꿔가며
불러 봤지만 400·404 만 돌아왔다(야후가 접은 것으로 보인다).

출력 (data/us100/quotes.json)
  {
    "fetchedAt": "2026-09-08T13:40:02Z",
    "source": "yahoo-quote",          # yahoo-quote | yahoo-chart | stooq | mixed
    "marketState": "REGULAR",
    "fx": {"usdkrw": 1341.48},
    "quotes": {"AAPL": {"price": 319.97, "prevClose": 328.21, "changePct": -2.51,
                        "volume": 39606884, "cap": 4669700046848, "per": 36.61,
                        "asof": 1788552001}}
  }
"""

import json
import os
import sys
import time
import urllib.parse
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_us100 import (                       # noqa: E402  환산 규칙을 그대로 공유한다
    OUT_DIR, PAUSE, _get, companies_from_page, fetch_chart, init_crumb, num, yget,
)
import fetch_us100 as F                          # noqa: E402  CRUMB 는 모듈 속성으로 읽는다

QUOTE_CHUNK = 50
STOOQ_CHUNK = 15


def quote_bulk(symbols):
    """v7/finance/quote — crumb 이 있어야 한다(없으면 401). 한 번에 여러 종목."""
    if not F.CRUMB:
        raise RuntimeError("crumb 없음")
    path = ("/v7/finance/quote?symbols=" + ",".join(urllib.parse.quote(s) for s in symbols) +
            "&crumb=" + urllib.parse.quote(F.CRUMB))
    j = yget(path)
    res = ((j.get("quoteResponse") or {}).get("result")) or []
    if not res:
        raise RuntimeError("quoteResponse 가 비었다")
    out = {}
    for r in res:
        sym = r.get("symbol")
        price = num(r.get("regularMarketPrice"), 4)
        if not sym or price is None:
            continue
        rec = {"price": price, "prevClose": num(r.get("regularMarketPreviousClose"), 4)}
        if rec["prevClose"]:
            rec["changePct"] = round((price - rec["prevClose"]) / rec["prevClose"] * 100, 2)
        else:
            rec["changePct"] = num(r.get("regularMarketChangePercent"), 2)
        for key, field in (("volume", "regularMarketVolume"), ("cap", "marketCap"),
                           ("per", "trailingPE"), ("asof", "regularMarketTime")):
            v = num(r.get(field))
            if v is not None:
                rec[key] = int(v) if key in ("volume", "asof") else round(v, 4)
        if r.get("marketState"):
            rec["marketState"] = r["marketState"]
        # 프리마켓·애프터마켓 가격. 정규장이 닫혀 있으면 regularMarketPrice 는 종가에서
        # 멈춰 있어 몇 시간이 지나도 값이 바뀌지 않는다(사용자가 "3시간 전 데이터"로 본 것).
        # 시간외 호가가 오면 그것을 따로 담아 화면이 "프리마켓 $X (+1.2%)" 로 함께 보여 준다.
        for kind, pfx in (("pre", "preMarket"), ("post", "postMarket")):
            sp = num(r.get(pfx + "Price"), 4)
            if sp is None:
                continue
            rec[kind] = {"price": sp,
                         "pct": num(r.get(pfx + "ChangePercent"), 2),
                         "at": int(num(r.get(pfx + "Time")) or 0) or None}
        out[sym] = rec
    if not out:
        raise RuntimeError("쓸 값이 없다")
    return out


def quote_one_chart(sym):
    """종목별 1일치 일봉 — range=1d 에서는 chartPreviousClose 가 전일 종가다."""
    series, meta, _, _ = fetch_chart(sym, "1d", "1d")
    price = num(meta.get("regularMarketPrice"), 4)
    if price is None and series["c"]:
        price = series["c"][-1]
    prev = num(meta.get("chartPreviousClose"), 4)
    if prev is None:
        prev = num(meta.get("previousClose"), 4)
    if price is None:
        raise RuntimeError("가격 없음")
    rec = {"price": price, "prevClose": prev}
    if prev:
        rec["changePct"] = round((price - prev) / prev * 100, 2)
    if meta.get("regularMarketVolume") is not None:
        rec["volume"] = int(num(meta["regularMarketVolume"]) or 0)
    if meta.get("regularMarketTime") is not None:
        rec["asof"] = int(num(meta["regularMarketTime"]) or 0)
    if meta.get("marketState"):
        rec["marketState"] = meta["marketState"]
    return rec


def stooq_bulk(symbols):
    """야후가 전부 막혔을 때. 전일 종가가 없어 등락률은 당일 시가 대비다."""
    codes = ",".join(s.lower().replace("-", ".") + ".us" for s in symbols)
    txt = _get("https://stooq.com/q/l/?s=%s&f=sd2t2ohlcv&h&e=csv" % codes)
    lines = [l for l in txt.strip().splitlines() if l]
    if not lines or not lines[0].lower().startswith("symbol"):
        raise RuntimeError("stooq CSV 아님")
    head = [h.strip().lower() for h in lines[0].split(",")]
    ix = {h: i for i, h in enumerate(head)}
    out = {}
    for line in lines[1:]:
        p = line.split(",")
        if len(p) < len(head):
            continue
        sym = p[ix["symbol"]].upper().replace(".US", "").replace(".", "-")
        close, opn = num(p[ix["close"]]), num(p[ix["open"]])
        if close is None:
            continue
        rec = {"price": close, "prevClose": None, "intraday": True}
        vol = num(p[ix["volume"]]) if "volume" in ix else None
        if vol:
            rec["volume"] = int(vol)
        if opn:
            rec["changePct"] = round((close - opn) / opn * 100, 2)
        out[sym] = rec
    if not out:
        raise RuntimeError("stooq 결과 없음")
    return out


def main():
    companies = companies_from_page()
    syms = [c["sym"] for c in companies]
    out = {"fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
           "source": None, "fx": {}, "quotes": {}, "failed": [], "routes": {}}

    init_crumb()

    # 1) 벌크 quote (crumb) — 되면 여기서 거의 다 끝난다
    remaining = list(syms)
    if F.CRUMB:
        got = []
        for i in range(0, len(remaining), QUOTE_CHUNK):
            chunk = remaining[i:i + QUOTE_CHUNK]
            try:
                rec = quote_bulk(chunk)
                out["quotes"].update(rec)
                got.extend(rec.keys())
                print("  quote 벌크 %d종목" % len(rec), flush=True)
            except Exception as e:                          # noqa: BLE001
                print("  quote 벌크 실패(%d종목) — %s" % (len(chunk), e), flush=True)
            time.sleep(PAUSE)
        if got:
            out["routes"]["yahoo-quote"] = len(got)
        remaining = [s for s in remaining if s not in out["quotes"]]

    # 2) 남은 종목은 개별 차트로
    if remaining:
        print("  개별 차트로 %d종목 받는다" % len(remaining), flush=True)
        done = 0
        for sym in list(remaining):
            try:
                out["quotes"][sym] = quote_one_chart(sym)
                done += 1
            except Exception as e:                          # noqa: BLE001
                print("    %-6s 실패 — %s" % (sym, e), flush=True)
            time.sleep(PAUSE)
        if done:
            out["routes"]["yahoo-chart"] = done
        remaining = [s for s in remaining if s not in out["quotes"]]

    # 3) 그래도 남으면 Stooq
    if remaining:
        print("  Stooq 로 %d종목 받는다" % len(remaining), flush=True)
        done = 0
        for i in range(0, len(remaining), STOOQ_CHUNK):
            chunk = remaining[i:i + STOOQ_CHUNK]
            try:
                rec = stooq_bulk(chunk)
                out["quotes"].update(rec)
                done += len(rec)
            except Exception as e:                          # noqa: BLE001
                print("    %s 실패 — %s" % (",".join(chunk), e), flush=True)
            time.sleep(PAUSE)
        if done:
            out["routes"]["stooq"] = done
        remaining = [s for s in remaining if s not in out["quotes"]]

    out["failed"] = remaining
    if not out["quotes"]:
        raise SystemExit("한 종목도 받지 못했다 — 원천이 전부 막혔다")
    routes = list(out["routes"].keys())
    out["source"] = routes[0] if len(routes) == 1 else "mixed"
    states = [r.get("marketState") for r in out["quotes"].values() if r.get("marketState")]
    if states:
        out["marketState"] = max(set(states), key=states.count)

    # 환율 — 시가총액 원화 환산에 쓴다
    try:
        out["fx"]["usdkrw"] = quote_one_chart("KRW=X")["price"]
    except Exception as e:                                  # noqa: BLE001
        print("환율 실패 — %s" % e, flush=True)

    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, "quotes.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    sample = out["quotes"].get("AAPL") or next(iter(out["quotes"].values()))
    print("\n가격 수집 완료: %d/%d 종목 · 경로 %s · %.0fKB\n  예: %s"
          % (len(out["quotes"]), len(syms), out["routes"], os.path.getsize(path) / 1024,
             json.dumps(sample, ensure_ascii=False)), flush=True)
    if out["failed"]:
        print("실패: %s" % ", ".join(out["failed"]), flush=True)


if __name__ == "__main__":
    main()
