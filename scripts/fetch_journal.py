#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""국내 시장일지에 쓸 **종목 순위**를 받아 둔다.

시세·금리·환율·예탁금은 이미 `scripts/fetch_market.py` 가 받아
`data/market/latest.json` 에 넣는다. 여기서 받는 것은 그 파일에 없는 것,
곧 **그날의 주요종목을 짚는 데 필요한 순위**뿐이다.

  · 상승률 상위 · 거래대금 상위 · 거래량 급증 · 52주 신고가 · 상한가
  · ETF 상승률·거래대금 상위 (레버리지·인버스는 빌더가 거른다)
  · 기관 · 외국인 종목별 순매수 상위, 쌍매수 · 쌍매도
  · 테마 · 업종 등락률

앞의 다섯은 **주소 하나**로 풀린다. `stock.naver.com` 의 종목 목록 API 가
한 줄에 등락률·거래대금·거래량·전일대비 거래량증가율·52주 최고가·상한가
구분을 모두 담고 있어서, 전종목을 한 벌 받아 두면 순위는 우리가 매기면
된다. **순위별로 주소를 따로 두지 않는 까닭**이 이것이다 — 주소가 하나면
끊겼을 때 한 곳만 고치면 되고, 여러 순위 사이에 기준일이 어긋날 일도 없다.

기관·외국인 종목별 순매수는 그 API 에 없다. 원천이 여럿이라 순서대로
찔러 보고 먼저 되는 것을 쓰며, **모두 실패하면 비워 둔다.** 0 으로 채우면
「사지도 팔지도 않았다」가 되어 그날 수급이 중립으로 끌려간다.

세션은 네이버에 직접 못 붙으므로(CONNECT 403) 러너에서 돈다.
"""
from __future__ import annotations

import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
OUTDIR = "data/journal"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
CTX = ssl.create_default_context()
STOCKLIST = "https://stock.naver.com/api/domestic/market/stock/default"

sources: dict[str, dict] = {}


def note(key: str, ok: bool, **kw) -> None:
    sources[key] = {"ok": ok, **kw}


def get_json(url: str, referer: str = "https://stock.naver.com/", tries: int = 3):
    last = ""
    for i in range(tries):
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": UA,
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "ko-KR,ko;q=0.9",
                "Referer": referer,
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            last = f"{type(e).__name__}: {e}"
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(last)


def f(v, default=None):
    """네이버는 수를 문자열로 준다. 콤마를 떼고 float 로."""
    if v is None or v == "":
        return default
    try:
        return float(str(v).replace(",", ""))
    except ValueError:
        return default


def i(v, default=None):
    x = f(v)
    return default if x is None else int(x)


# ── ① 전종목 한 벌 ──────────────────────────────────────────────────
def fetch_universe(market_type: str, page_size: int = 100, cap: int = 3200) -> list[dict]:
    """시가총액 순으로 끝까지 넘겨 한 벌을 받는다.

    `cap` 은 안전장치다. 페이지가 끝나도 같은 줄을 계속 주는 원천을 만나면
    무한히 돌 수 있으므로, 이미 본 종목코드가 다시 오면 거기서 끊는다.
    """
    rows: list[dict] = []
    seen: set[str] = set()
    idx = 0
    while idx < cap:
        url = (
            f"{STOCKLIST}?tradeType=KRX&marketType={market_type}"
            f"&orderType=marketSum&startIdx={idx}&pageSize={page_size}"
        )
        batch = get_json(url)
        if not isinstance(batch, list) or not batch:
            break
        fresh = [r for r in batch if r.get("itemcode") not in seen]
        if not fresh:
            break
        for r in fresh:
            seen.add(r.get("itemcode"))
        rows.extend(fresh)
        if len(batch) < page_size:
            break
        idx += page_size
        time.sleep(0.25)
    return rows


def slim(r: dict) -> dict:
    """인쇄에 쓸 칸만 남긴다. 단위를 여기서 정하고 이름에 박는다."""
    price = f(r.get("nowPrice"))
    vol = f(r.get("tradeVolume"))
    amt = f(r.get("tradeAmount"))          # 원
    prev_q = f(r.get("prevQuant"))
    w52h = f(r.get("week52HighPrice"))
    return {
        "code": r.get("itemcode"),
        "name": r.get("itemname"),
        # sosok 0=코스피 1=코스닥 (상한가 관찰에서 대조했다)
        "market": "코스피" if str(r.get("sosok")) == "0" else "코스닥",
        "type": r.get("type"),
        "close": price,
        "change_pct": f(r.get("prevChangeRate")),
        "change": f(r.get("prevChangePrice")),
        "volume": vol,
        "value_eok": None if amt is None else round(amt / 1e8, 1),
        "cap_eok": None if f(r.get("marketSum")) is None else round(f(r.get("marketSum")) / 1e8, 0),
        "prev_volume": prev_q,
        "volume_diff_pct": f(r.get("quantDiffRate")),
        "w52_high": w52h,
        "w52_low": f(r.get("week52LowPrice")),
        # 「종가가 52주 최고가에 닿았다」 — 장중 고가가 아니라 종가 기준이다.
        "new_high": bool(price is not None and w52h is not None and price >= w52h),
        "up_down_gb": str(r.get("upDownGb") or ""),
        "continual_upper": i(r.get("continualUpperLimit"), 0),
        "frgn_hold_rate": f(r.get("frgnHoldRate")),
        "per": f(r.get("per")),
        "pbr": f(r.get("pbr")),
        "nav": f(r.get("nav")),
        "etf_type": r.get("etfType"),
        "manage": str(r.get("manageStatusGb") or "0") != "0",
        "halt": str(r.get("tradeStopYn") or "N") == "Y",
    }


def rank(rows: list[dict], key: str, n: int = 20, reverse: bool = True,
         where=None) -> list[dict]:
    pool = [r for r in rows if r.get(key) is not None and (where is None or where(r))]
    pool.sort(key=lambda r: r[key], reverse=reverse)
    return pool[:n]


# ── ② 기관 · 외국인 종목별 순매수 ───────────────────────────────────
def fetch_investor_rank(market: str) -> dict | None:
    """되는 원천을 순서대로 찾는다. 모두 실패하면 None — 지어내지 않는다.

    `data/journal/raw/journal_api.txt` 에 어떤 자리가 열렸는지 기록이 남는다.
    새 원천을 찾으면 이 목록 맨 앞에 넣으면 된다.
    """
    sosok = "01" if market == "코스피" else "02"
    cands = [
        ("naver:aggregateInvestorRanking",
         "https://stock.naver.com/api/domestic/home/marketaggregate/aggregateInvestorRanking"),
        ("naver:dealrank",
         "https://finance.naver.com/sise/sise_deal_rank.naver"
         f"?investor_gubun=9000&type=buy&sosok={sosok}"),
    ]
    for name, url in cands:
        try:
            d = get_json(url, referer="https://stock.naver.com/")
        except Exception as e:  # noqa: BLE001
            note(f"investor:{market}:{name}", False, error=str(e)[:160])
            continue
        note(f"investor:{market}:{name}", True, bytes=len(json.dumps(d)))
        return {"source": name, "source_url": url, "raw": d}
    return None


def fetch_flows_from_kr100(bizdate: str) -> dict | None:
    """기관·외국인 종목별 순매수 — **대형주 100 종목 한정**의 대용이다.

    `data/flows/kr100.json` 은 시가총액 상위 100 종목만 담는다. 전체
    시장의 매수상위가 아니므로, 빌더는 반드시 「대형주 100 기준」이라고
    이름을 달아 실어야 한다. 그 이름을 떼면 거짓이 된다.
    """
    path = "data/flows/kr100.json"
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as fh:
        d = json.load(fh)
    out = []
    for code, s in (d.get("stocks") or {}).items():
        days = s.get("d") or []
        if bizdate not in days:
            continue
        k = days.index(bizdate)
        row = {
            "code": code.split(".")[0],
            "foreign_eok": (s.get("f") or [None] * len(days))[k],
            "inst_eok": (s.get("i") or [None] * len(days))[k],
            "retail_eok": (s.get("p") or [None] * len(days))[k],
            "close": (s.get("c") or [None] * len(days))[k],
            "frgn_rate": (s.get("r") or [None] * len(days))[k],
        }
        # 연속 순매수 — 뒤에서부터 부호가 이어지는 날수를 센다.
        for side, key in (("foreign", "f"), ("inst", "i")):
            ser = s.get(key) or []
            run = 0
            for v in reversed(ser[: k + 1]):
                if v is None or v <= 0:
                    break
                run += 1
            row[f"{side}_streak"] = run
        out.append(row)
    if not out:
        return None
    return {
        "source": "data/flows/kr100.json",
        "universe": "시가총액 상위 100 종목",
        "coverage": d.get("coverage"),
        "unit": "억원",
        "bizdate": bizdate,
        "rows": out,
    }


# ── ③ 테마 · 업종 ───────────────────────────────────────────────────
def fetch_rankings(kind: str, size: int = 20) -> dict | None:
    url = (
        f"https://stock.naver.com/api/stockSecurity/rankings/v2/domestic/{kind}"
        f"?sortType=changeRate&size={size}&excludeCodes=25&period=daily"
    )
    try:
        d = get_json(url)
    except Exception as e:  # noqa: BLE001
        note(f"rank:{kind}", False, error=str(e)[:160])
        return None
    note(f"rank:{kind}", True)
    return {"source_url": url, "raw": d}


# ── ④ 시세 파일에 없는 지수 — HSCEI ─────────────────────────────────
def fetch_yahoo(symbol: str) -> dict | None:
    url = (
        "https://query1.finance.yahoo.com/v8/finance/chart/"
        + urllib.parse.quote(symbol)
        + "?range=5d&interval=1d"
    )
    try:
        d = get_json(url, referer="https://finance.yahoo.com/")
    except Exception as e:  # noqa: BLE001
        note(f"yahoo:{symbol}", False, error=str(e)[:160])
        return None
    try:
        res = d["chart"]["result"][0]
        meta = res["meta"]
        ts = res["timestamp"]
        close = res["indicators"]["quote"][0]["close"]
        pairs = [(t, c) for t, c in zip(ts, close) if c is not None]
        if len(pairs) < 2:
            note(f"yahoo:{symbol}", False, error="봉이 둘도 안 된다")
            return None
        (_, prev), (t_last, last) = pairs[-2], pairs[-1]
        note(f"yahoo:{symbol}", True)
        return {
            "symbol": symbol,
            "date": datetime.fromtimestamp(t_last, timezone.utc)
            .astimezone(timezone(timedelta(seconds=meta.get("gmtoffset", 0))))
            .strftime("%Y-%m-%d"),
            "close": last,
            "prev_close": prev,
            "change": last - prev,
            "change_pct": (last - prev) / prev * 100.0,
            "currency": meta.get("currency"),
        }
    except Exception as e:  # noqa: BLE001
        note(f"yahoo:{symbol}", False, error=f"파싱 실패 {e}")
        return None


# ── 본체 ────────────────────────────────────────────────────────────
def main() -> int:
    now = datetime.now(KST)
    os.makedirs(OUTDIR, exist_ok=True)

    # 전종목 한 벌.
    try:
        universe_raw = fetch_universe("ALL")
        note("naver:universe", True, rows=len(universe_raw))
    except Exception as e:  # noqa: BLE001
        note("naver:universe", False, error=str(e)[:200])
        universe_raw = []

    market_status = None
    session_type = None
    if universe_raw:
        market_status = universe_raw[0].get("marketStatus")
        session_type = universe_raw[0].get("tradingSessionType")

    rows = [slim(r) for r in universe_raw]
    # 거래정지·관리종목은 순위에서 빼되 셈에서 지우지는 않는다.
    live = [r for r in rows if not r["halt"] and r["close"]]

    def by_market(m: str) -> list[dict]:
        return [r for r in live if r["market"] == m and r["type"] == "ST"]

    ranks: dict[str, dict] = {}
    for m in ("코스피", "코스닥"):
        pool = by_market(m)
        ranks[m] = {
            "종목수": len(pool),
            "상승률상위": rank(pool, "change_pct", 20),
            "하락률상위": rank(pool, "change_pct", 10, reverse=False),
            "거래대금상위": rank(pool, "value_eok", 20),
            # 거래량 급증은 대금 문턱을 둔다. 문턱이 없으면 하루 3천만원
            # 거래되던 종목이 3억이 되어 1000% 로 1등을 하고, 그 줄은
            # 「오늘 시장이 본 종목」이 아니다.
            "거래량급증": rank(pool, "volume_diff_pct", 15,
                           where=lambda r: (r["value_eok"] or 0) >= 100),
            "신고가": sorted(
                [r for r in pool if r["new_high"]],
                key=lambda r: -(r["value_eok"] or 0),
            )[:20],
            "상한가": [r for r in pool if r["up_down_gb"] == "1"],
            "하한가": [r for r in pool if r["up_down_gb"] == "4"],
        }

    # ETF 는 목록 API 의 다른 판을 쓴다. 안 되면 전종목에서 걸러 낸다.
    etf_rows: list[dict] = []
    try:
        etf_raw = fetch_universe("ETF", page_size=100, cap=1200)
        etf_rows = [slim(r) for r in etf_raw]
        note("naver:etf", True, rows=len(etf_rows))
    except Exception as e:  # noqa: BLE001
        note("naver:etf", False, error=str(e)[:200])
    if not etf_rows:
        etf_rows = [r for r in rows if (r["type"] or "").upper() in ("EF", "ETF")]
        note("naver:etf_fallback", bool(etf_rows), rows=len(etf_rows))

    etf_live = [r for r in etf_rows if not r["halt"] and r["close"]]
    etf = {
        "종목수": len(etf_live),
        "상승률상위": rank(etf_live, "change_pct", 30),
        "거래대금상위": rank(etf_live, "value_eok", 20),
    }

    bizdate = None
    # 시세 파일의 거래일을 기준일로 삼는다 — 두 파일의 날짜가 어긋나면
    # 빌더가 잡아낼 수 있게 여기서 둘 다 남긴다.
    try:
        with open("data/market/latest.json", encoding="utf-8") as fh:
            mk = json.load(fh)
        bizdate = (mk.get("market_internals", {}).get("kospi", {}) or {}).get("bizdate")
        if bizdate and len(bizdate) == 8:
            bizdate = f"{bizdate[:4]}-{bizdate[4:6]}-{bizdate[6:]}"
    except Exception:  # noqa: BLE001
        pass
    if not bizdate:
        bizdate = now.strftime("%Y-%m-%d")

    out = {
        "generated_at_kst": now.strftime("%Y-%m-%d %H:%M:%S"),
        "bizdate": bizdate,
        "market_status": market_status,
        "session": session_type,
        "unit": {
            "value_eok": "억원(거래대금)",
            "cap_eok": "억원(시가총액)",
            "change_pct": "%",
            "volume_diff_pct": "% (전일 거래량 대비)",
        },
        "basis": (
            "전종목 한 벌을 시가총액 순으로 받아 순위는 우리가 매겼다. "
            "「신고가」는 종가가 52주 최고가 이상인 종목이고, 장중 고가 기준이 아니다."
        ),
        "universe": {
            "전체": len(rows),
            "코스피": len(by_market("코스피")),
            "코스닥": len(by_market("코스닥")),
        },
        "rank": ranks,
        "etf": etf,
        "themes": fetch_rankings("themes"),
        "industries": fetch_rankings("industries"),
        "investor_rank": {
            m: fetch_investor_rank(m) for m in ("코스피", "코스닥")
        },
        "flows_kr100": fetch_flows_from_kr100(bizdate),
        "hscei": fetch_yahoo("^HSCE"),
        "sources": sources,
    }

    ok = sum(1 for v in sources.values() if v["ok"])
    out["summary"] = {"sources_ok": ok, "sources_tried": len(sources)}

    for name in (f"{bizdate}.json", "latest.json"):
        with open(os.path.join(OUTDIR, name), "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, indent=1)

    print(f"기준일 {bizdate} · 전종목 {len(rows)} · 원천 {ok}/{len(sources)} 성공")
    for k, v in sorted(sources.items()):
        if not v["ok"]:
            print(f"  실패 {k} — {v.get('error', '사유 없음')}")
    return 0 if rows else 1


if __name__ == "__main__":
    sys.exit(main())
