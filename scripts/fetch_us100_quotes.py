#!/usr/bin/env python3
"""미국 100대 기업 **가격만** 빠르게 받아 data/us100/quotes.json 에 저장한다.

`fetch_us100.py` 는 종목별로 5번씩 요청해 5~8분이 걸린다(지표·실적·컨센서스까지 받는다).
장중에 가격만 자주 갱신하려면 그 무게로는 안 되므로, 이 스크립트는 **한 번에 25종목씩
묶어 4~5번만 요청**하고 20초 안에 끝낸다. 그래서 10분 주기로 돌릴 수 있다.

`us-top100.html` 은 quotes.json 을 스냅샷(latest.json)보다 우선해 가격·등락률에 덮어쓰고,
화면에는 "시세 N분 전" 으로 나이를 표시한다.

출력 (data/us100/quotes.json)
  {
    "fetchedAt": "2026-09-08T13:40:02Z",
    "source": "yahoo-spark",           # 또는 stooq
    "fx": {"usdkrw": 1341.48},
    "quotes": {"AAPL": {"price": 319.97, "prevClose": 328.21, "changePct": -2.51,
                        "volume": 39606884, "asof": 1788552001}}
  }
"""

import json
import os
import sys
import time
import urllib.parse
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_us100 import (                       # noqa: E402  같은 규칙을 공유하려고 그대로 쓴다
    CHART_DIR, OUT_DIR, PAUSE, _get, companies_from_page, num, yget,
)

CHUNK = 25


def spark(symbols, rng, interval):
    """여러 종목을 한 번에. 마지막 종가 = 현재가, chartPreviousClose = 전일 종가."""
    path = ("/v8/finance/spark?symbols=" + ",".join(urllib.parse.quote(s) for s in symbols) +
            "&range=%s&interval=%s" % (rng, interval))
    j = yget(path)
    out = {}

    def put(sym, closes, prev, ts, vols=None):
        cl = [c for c in (closes or []) if c is not None]
        if not sym or not cl:
            return
        last = cl[-1]
        base = prev if prev is not None else (cl[-2] if len(cl) > 1 else None)
        rec = {"price": num(last, 4), "prevClose": num(base, 4)}
        if base:
            rec["changePct"] = round((last - base) / base * 100, 2)
        if ts:
            rec["asof"] = int(ts[-1])
        if vols:
            v = [x for x in vols if x is not None]
            if v:
                rec["volume"] = int(sum(v))
        out[sym] = rec

    # 형태 1) { AAPL: { close: [...], chartPreviousClose, timestamp: [...] } }
    for sym in symbols:
        r = j.get(sym) if isinstance(j, dict) else None
        if isinstance(r, dict) and r.get("close"):
            put(sym, r.get("close"),
                r.get("chartPreviousClose", r.get("previousClose")),
                r.get("timestamp"))
    # 형태 2) { spark: { result: [ { symbol, response: [ {meta, timestamp, indicators} ] } ] } }
    if not out and isinstance(j, dict) and isinstance(j.get("spark"), dict):
        for r in (j["spark"].get("result") or []):
            resp = (r.get("response") or [None])[0]
            if not resp:
                continue
            q = ((resp.get("indicators") or {}).get("quote") or [{}])[0]
            meta = resp.get("meta") or {}
            put(r.get("symbol"), q.get("close"),
                meta.get("chartPreviousClose", meta.get("previousClose")),
                resp.get("timestamp"), q.get("volume"))
    if not out:
        raise RuntimeError("spark 응답에서 값을 찾지 못했다")
    return out


def stooq_bulk(symbols):
    """야후가 막혔을 때. Stooq 는 전일 종가를 주지 않아 등락률은 당일 시가 대비다."""
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
        rec = {"price": close, "prevClose": None, "intraday": True,
               "volume": int(num(p[ix["volume"]]) or 0) or None}
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
           "source": None, "fx": {}, "quotes": {}, "failed": []}

    got_yahoo = 0
    for i in range(0, len(syms), CHUNK):
        chunk = syms[i:i + CHUNK]
        rec = None
        for rng, interval in (("1d", "5m"), ("5d", "1d")):
            try:
                rec = spark(chunk, rng, interval)
                break
            except Exception as e:                      # noqa: BLE001
                err = e
        if rec:
            out["quotes"].update(rec)
            got_yahoo += len(rec)
        else:
            try:
                out["quotes"].update(stooq_bulk(chunk))
                out["source"] = "mixed"
            except Exception as e2:                     # noqa: BLE001
                out["failed"].extend(chunk)
                print("  %s 실패 — %s / %s" % (",".join(chunk), err, e2), flush=True)
        time.sleep(PAUSE)

    if not out["quotes"]:
        raise SystemExit("한 종목도 받지 못했다 — 원천이 전부 막혔다")
    out["source"] = out["source"] or ("yahoo-spark" if got_yahoo else "stooq")

    try:
        fx = spark(["KRW=X"], "5d", "1d")
        if fx.get("KRW=X", {}).get("price"):
            out["fx"]["usdkrw"] = fx["KRW=X"]["price"]
    except Exception as e:                              # noqa: BLE001
        print("환율 실패 — %s" % e, flush=True)

    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, "quotes.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    n = len(out["quotes"])
    sample = out["quotes"].get("AAPL") or next(iter(out["quotes"].values()))
    print("가격 수집 완료: %d/%d 종목 · %.0fKB · 예: %s"
          % (n, len(syms), os.path.getsize(path) / 1024, json.dumps(sample, ensure_ascii=False)),
          flush=True)
    if out["failed"]:
        print("실패: %s" % ", ".join(out["failed"]), flush=True)


if __name__ == "__main__":
    main()
