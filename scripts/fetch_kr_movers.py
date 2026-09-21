#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""국내 시장 등락률 상위 종목(무빙)과 시총 상위 보드를 수집한다.

MARKET DAILY 마감시황(`scripts/build_market_daily.py --edition close`)이 읽는다.
미국판은 `scripts/fetch_us_movers.py` 다.

원천
----
네이버 증시 화면이 부르는 종목 목록 API 하나를 쓴다.

    https://stock.naver.com/api/domestic/market/stock/default
        ?tradeType=KRX&marketType=ALL&orderType=up|down&startIdx=&pageSize=100

`scripts/fetch_market.py` 의 `naver_limit_api` 가 상한가·하한가를 고를 때
쓰는 그 주소다. **이 API 는 상한가만 주는 것이 아니라 등락률로 정렬한 전체
목록**이므로, 그대로 국내 등락률 스크리너가 된다. 한 행에 등락률·현재가·
거래대금·시가총액이 함께 오므로 사양의 문턱을 한 번에 걸 수 있다.

**장중인지 마감인지 반드시 본다.** 같은 API 가 개장 전에는 전 거래일 마감을,
장중에는 실시간을 준다. `market_status` 를 그대로 실어 두고, 마감시황은
`CLOSE` 를 확인한 뒤에만 쓴다 — 장중 값을 「오늘 마감」으로 쓰면 하루가
어긋난다.

문턱
----
사양의 두 문턱(시총 100억 달러·일평균 거래대금 3억 달러)은 미국 기준이다.
국내판은 같은 취지의 원화 기준으로 바꿔 쓴다.

  * 시가총액 1조원 이상
  * **당일** 거래대금 300억원 이상

두 번째가 미국판과 다르다. 네이버는 평균 거래대금을 주지 않으므로 **당일**
값을 쓰고, 산출물에도 「거래대금(당일)」이라고 적는다. 평균으로 읽히면
안 되기 때문이다.
"""

from __future__ import annotations

import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.request
import zoneinfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "data", "kr_movers")

KST = zoneinfo.ZoneInfo("Asia/Seoul")

API = "https://stock.naver.com/api/domestic/market/stock/default"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")
TIMEOUT = 25
RETRY = 3
PAGES = 6                                  # 600건 — 어느 쪽이든 넉넉하다

MIN_CAP_KRW = 1_000_000_000_000            # 시가총액 1조원
MIN_TRADE_AMOUNT_KRW = 30_000_000_000      # 당일 거래대금 300억원

SOSOK = {"0": "코스피", "1": "코스닥"}

NOTE = "GitHub Actions 러너가 수집한 스냅샷. scripts/build_market_daily.py 가 읽는다."


def log(msg):
    print(msg, flush=True)


def _get(url, referer):
    last = None
    for attempt in range(RETRY):
        if attempt:
            time.sleep(1.5 * (2 ** (attempt - 1)))
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": UA,
                "Accept": "application/json",
                "Referer": referer,
            })
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            last = "HTTP %s" % e.code
            if e.code in (401, 403, 404):
                break
        except Exception as e:                 # noqa: BLE001
            last = str(e)
    raise RuntimeError(last or "unknown error")


def num(x):
    """이 API 는 값을 문자열로 준다("30.0", "11310"). 숫자로 돌린다."""
    if x is None:
        return None
    try:
        return float(str(x).replace(",", ""))
    except (TypeError, ValueError):
        return None


def fetch_side(order):
    """등락률 내림차순(up) 또는 오름차순(down) 목록을 여러 쪽 받아 잇는다."""
    ref = ("https://stock.naver.com/market/stock/kr/stocklist/"
           + ("upper" if order == "up" else "lower"))
    rows, status = [], None
    for page in range(PAGES):
        url = ("%s?tradeType=KRX&marketType=ALL&orderType=%s"
               "&startIdx=%d&pageSize=100" % (API, order, page * 100))
        got = json.loads(_get(url, ref))
        if not isinstance(got, list):
            raise RuntimeError("목록이 아니다 (%s)" % type(got).__name__)
        if not got:
            break
        if status is None:
            status = {"market_status": str(got[0].get("marketStatus") or ""),
                      "session": str(got[0].get("tradingSessionType") or "")}
        rows.extend(got)
        time.sleep(0.3)
    return rows, (status or {})


def shape(r):
    price = num(r.get("nowPrice"))
    cap = num(r.get("marketSum"))
    amt = num(r.get("tradeAmount"))
    return {
        "name": (r.get("itemname") or "").strip(),
        "code": (r.get("itemcode") or "").strip(),
        "market": SOSOK.get(str(r.get("sosok") or ""), ""),
        "price": price,
        "change": num(r.get("prevChangePrice")),
        "change_pct": num(r.get("prevChangeRate")),
        "volume": num(r.get("tradeVolume")),
        "trade_amount": amt,                  # 당일 거래대금 (원)
        "cap": cap,                           # 시가총액 (원)
        "per": num(r.get("per")),
        "type": r.get("type"),
        "halted": (r.get("tradeStopYn") or "N") != "N",
    }


def eligible(r):
    if r["change_pct"] is None or r["price"] is None:
        return False
    if r["halted"] or (r.get("type") or "ST") != "ST":   # 보통주만
        return False
    if not r["cap"] or r["cap"] < MIN_CAP_KRW:
        return False
    if not r["trade_amount"] or r["trade_amount"] < MIN_TRADE_AMOUNT_KRW:
        return False
    return True


def main():
    started = time.time()
    now = dt.datetime.now(dt.timezone.utc)
    sources = {}

    raw_up, st_up = [], {}
    raw_dn, st_dn = [], {}
    try:
        raw_up, st_up = fetch_side("up")
        sources["naver:stocklist-up"] = {"ok": True, "rows": len(raw_up)}
    except Exception as e:                     # noqa: BLE001
        sources["naver:stocklist-up"] = {"ok": False, "error": str(e)}
        log("상승 목록 실패: %s" % e)
    try:
        raw_dn, st_dn = fetch_side("down")
        sources["naver:stocklist-down"] = {"ok": True, "rows": len(raw_dn)}
    except Exception as e:                     # noqa: BLE001
        sources["naver:stocklist-down"] = {"ok": False, "error": str(e)}
        log("하락 목록 실패: %s" % e)

    if not raw_up and not raw_dn:
        log("::error::목록을 받지 못했다")
        return 1

    status = st_up or st_dn
    log("시장 상태 %s / %s" % (status.get("market_status"), status.get("session")))

    seen, ups, downs = set(), [], []
    for raw, bucket in ((raw_up, ups), (raw_dn, downs)):
        for r in raw:
            s = shape(r)
            key = (s["code"], id(bucket))
            if not s["code"] or key in seen:
                continue
            seen.add(key)
            if eligible(s):
                bucket.append(s)

    ups.sort(key=lambda r: r["change_pct"], reverse=True)
    downs.sort(key=lambda r: r["change_pct"])
    gainers, losers = ups[:10], downs[:10]

    log("문턱 통과 — 상승 %d / 하락 %d (조회 %d건)"
        % (len(ups), len(downs), len(raw_up) + len(raw_dn)))
    for r in gainers[:5]:
        log("  ▲ %-12s %+6.2f%%  시총 %6.1f조  거래대금 %6.0f억 (%s)"
            % (r["name"], r["change_pct"], r["cap"] / 1e12,
               r["trade_amount"] / 1e8, r["market"]))
    for r in losers[:5]:
        log("  ▼ %-12s %+6.2f%%  시총 %6.1f조  거래대금 %6.0f억 (%s)"
            % (r["name"], r["change_pct"], r["cap"] / 1e12,
               r["trade_amount"] / 1e8, r["market"]))

    # 시총 상위 보드 — 미국판 빅테크 보드에 대응한다.
    allrows = {r["code"]: r for r in (ups + downs)}
    top_cap = sorted(allrows.values(), key=lambda r: r["cap"] or 0, reverse=True)[:10]

    out = {
        "note": NOTE,
        "generated_at_utc": now.isoformat(timespec="seconds"),
        "generated_at_kst": now.astimezone(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "trade_date_kst": now.astimezone(KST).date().isoformat(),
        # **이것을 보고 마감인지 장중인지 가른다.**
        "market_status": status.get("market_status"),
        "trading_session": status.get("session"),
        "printed_from": "naver:stocklist (domestic/market/stock/default)",
        "filters": {
            "min_cap_krw": MIN_CAP_KRW,
            "min_trade_amount_krw": MIN_TRADE_AMOUNT_KRW,
            "trade_amount_basis": "당일 거래대금 (평균 아님)",
            "only": "보통주(type=ST), 거래정지 제외",
        },
        "counts": {
            "scanned": len(raw_up) + len(raw_dn),
            "passed_up": len(ups),
            "passed_down": len(downs),
        },
        "gainers": gainers,
        "losers": losers,
        "top_cap": top_cap,
        "sources": sources,
        "elapsed_sec": round(time.time() - started, 1),
    }

    os.makedirs(OUT_DIR, exist_ok=True)
    stamp = out["trade_date_kst"]
    suffix = "" if status.get("market_status") == "CLOSE" else "-intraday"
    for path in (os.path.join(OUT_DIR, "latest.json"),
                 os.path.join(OUT_DIR, "%s%s.json" % (stamp, suffix))):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
        log("씀: %s" % os.path.relpath(path, ROOT))

    ok = bool(gainers) and bool(losers)
    log("끝 (%.1fs) — %s" % (out["elapsed_sec"], "정상" if ok else "일부 비었다"))
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
