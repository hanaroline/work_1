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
def fetch_universe(market_type: str) -> list[dict]:
    """시가총액 순으로 한 벌을 받는다.

    **`startIdx` 로 넘길 수 없다.** 2026-09-21 확인 — `startIdx` 를 올리면
    빈 응답이 오고, 한 번에 받는 양은 `pageSize` 가 정한다. 그래서 큰
    `pageSize` 부터 내려가며 한 번에 받는다.

    그러므로 이 자료는 **시가총액 상위 N 종목**이다. 전종목이 아니다. 받은
    줄 수를 `universe` 에 적어 산출물이 그 사실을 달고 다니게 한다.
    """
    last = ""
    for size in (2000, 1000, 500):
        url = (f"{STOCKLIST}?tradeType=KRX&marketType={market_type}"
               f"&orderType=marketSum&startIdx=0&pageSize={size}")
        try:
            batch = get_json(url, tries=2)
        except Exception as e:  # noqa: BLE001
            last = str(e)
            continue
        if isinstance(batch, list) and batch:
            note(f"naver:universe:{market_type}:pageSize", True, size=size, rows=len(batch))
            return batch
        last = f"pageSize={size} 가 빈 응답"
    raise RuntimeError(last or "받지 못했다")


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
TFO = "https://stock.naver.com/api/domestic/market/trend/trendForeignOrg"

# 투자자 구분 코드. **`scripts/fetch_market.py` 와 같은 묶음을 쓴다** — 두
# 파일이 다른 셈을 하면 같은 판 안에서 코스피 수급이 두 값으로 갈린다.
# 7000·7100(기타법인)은 기관이 아니다. 한때 7100 을 기관에 넣어 기관계가
# 실제보다 훨씬 크게 나온 적이 있다.
INV_RETAIL = ("8000",)
INV_FOREIGN = ("9000", "9001")
INV_INST = ("1000", "2000", "3000", "3100", "4000", "5000", "6000")
# 기관 안쪽 — 이름은 네이버 화면의 차례를 따른다. 값이 비면 비운다.
# **7000 과 7100 은 둘 다 기관계 밖이다.** 7100 은 2026-09-17 에 +1조 7,046억으로
# 기관계(+2,480억)보다 컸다 — 기관에 잘못 더하면 수급 해석이 통째로 뒤집힌다.
# 합이 0 인지 검산하려면 둘을 모두 세야 한다.
INV_DETAIL = {
    "금융투자": "1000", "보험": "2000", "투신": "3000", "사모펀드": "3100",
    "은행": "4000", "기타금융": "5000", "연기금": "6000",
    "기타법인": "7000", "기타법인2": "7100",
}

# 기관이 `investorType` 에 무엇으로 들어가는지는 관찰로 가린다. 먼저 되는
# 것을 쓰고 어느 이름이 먹었는지 산출물에 적는다 — 다음에 이름이 바뀌어도
# 기록을 보고 고칠 수 있다.
# 2026-09-21 확인 — 열리는 것은 이 둘뿐이다. INSTITUTION·PENSION·
# PRIVATE_EQUITY 따위는 모두 400 이다. **종목별 사모펀드 순매수는 여기에
# 없다** — 거래소에만 있고 거래소는 수집 서버 IP 를 막는다.
INVESTOR_TYPES = {"외국인": ["FOREIGNER"], "기관": ["ORGANIZATION"]}


def fetch_investor_rank(market: str) -> dict | None:
    """종목별 기관·외국인 순매수·순매도 상위.

    **금액이 아니라 수량 순위일 수 있다.** 장중에는 `accTradeAmount` 가 0 이고
    `estimated` 가 참이다. 그래서 받은 값을 그대로 옮기되, 금액이 비어 있으면
    빌더가 수량 × 종가로 어림하고 그렇게 적는다. 어림한 값을 확정치처럼
    쓰지 않는다.
    """
    mt = "KOSPI" if market == "코스피" else "KOSDAQ"
    out: dict = {"market": market, "source_url_base": TFO, "sides": {}}
    got = False
    for label, cands in INVESTOR_TYPES.items():
        for it in cands:
            url = (f"{TFO}?investorType={it}&tradeType=KRX&marketType={mt}"
                   f"&startIdx=0&pageSize=20&periodType=DAY")
            try:
                d = get_json(url)
            except Exception as e:  # noqa: BLE001
                note(f"investor:{market}:{label}:{it}", False, error=str(e)[:120])
                continue
            sec = (d or {}).get("sections") or {}
            buy, sell = sec.get("buyRankList") or [], sec.get("sellRankList") or []
            if not buy and not sell:
                note(f"investor:{market}:{label}:{it}", False, error="빈 명단")
                continue
            note(f"investor:{market}:{label}:{it}", True, buy=len(buy), sell=len(sell))

            def tidy(lst):
                rows = []
                for r in lst:
                    amt = f(r.get("accTradeAmount"))
                    qty = f(r.get("accTradeVolume"))
                    px = f(r.get("nowPrice"))
                    rows.append({
                        "code": r.get("itemcode"),
                        "name": r.get("itemname"),
                        "bizdate": r.get("bizdateTo") or r.get("bizdateFrom"),
                        "qty": qty,
                        # 원천이 금액을 줬으면 그대로. 0 이면 장중이라 아직
                        # 안 찬 것이므로 **어림했다고 이름표를 단다.**
                        "value_eok": (round(amt / 1e8, 1) if amt else None),
                        "value_eok_est": (round(qty * px / 1e8, 1)
                                          if (not amt and qty and px) else None),
                        "close": px,
                        "change_pct": f(r.get("prevChangeRate")),
                        "estimated": bool(r.get("estimated")),
                    })
                return rows

            # 한쪽은 오늘, 다른 쪽은 어제일 수 있다(장중에 실제로 그랬다).
            # 그래서 **줄마다** 기준일을 달아 둔다.
            out["sides"][label] = {
                "investor_type": it,
                "source_url": url,
                "estimated": bool(buy and buy[0].get("estimated")),
                "bizdate": (buy or sell or [{}])[0].get("bizdateTo"),
                "rank_basis": ("금액" if (buy and f(buy[0].get("accTradeAmount")))
                               else "수량(금액 미제공)"),
                "buy": tidy(buy),
                "sell": tidy(sell),
            }
            got = True
            break
    return out if got else None


def fetch_investor_daily(market: str, bizdate: str) -> dict | None:
    """시장별 투자자 순매수 **합계**를 날짜별로 받는다.

    `data/market/latest.json` 의 `market_internals` 는 「지금」 한 점이라
    장중에 받으면 오늘 진행분이 들어온다. 시장일지는 마감 기준이므로 날짜가
    붙은 계열이 필요하다. 코스피만 있던 것을 코스닥까지 받는다.
    """
    mt = "KOSPI" if market == "코스피" else "KOSDAQ"
    url = ("https://stock.naver.com/api/domestic/market/trend/daily"
           f"?tradeType=KRX&marketType={mt}&bizdate={bizdate.replace('-', '')}"
           "&startIdx=0&pageSize=30")
    try:
        d = get_json(url)
    except Exception as e:  # noqa: BLE001
        note(f"trend_daily:{market}", False, error=str(e)[:160])
        return None
    rows = []
    for c in (d or {}).get("content") or []:
        amts = {str(a.get("investorGubun")): a.get("diffValue")
                for a in (c.get("netAmounts") or [])}

        def s(codes):
            """원 → 억원. 한 코드라도 없으면 **0 으로 때우지 않고 None 을 낸다.**"""
            got = [amts.get(x) for x in codes]
            if any(v is None for v in got):
                return None
            return round(sum(float(v) for v in got) / 1e8)

        b = str(c.get("bizdate") or "")
        if len(b) != 8:
            continue
        rows.append({
            "date": f"{b[:4]}-{b[4:6]}-{b[6:]}",
            "retail": s(INV_RETAIL),
            "foreign": s(INV_FOREIGN),
            "institution": s(INV_INST),
            # 기관 안쪽 — 시장일지가 묻는 「사모펀드 순매수」는 **시장 합계**까지만
            # 받을 수 있다. 종목별 사모펀드 순매수는 거래소(KRX)에만 있고,
            # KRX 는 수집 서버 IP 를 막는다.
            "detail": {name: s((code,)) for name, code in INV_DETAIL.items()},
        })
    if not rows:
        note(f"trend_daily:{market}", False, error="빈 응답")
        return None
    note(f"trend_daily:{market}", True, days=len(rows))
    return {"source_url": url, "unit": "억원", "rows": rows}


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
    # 누적본은 하루 늦게 돌기도 한다. 기준일이 없으면 **가장 늦은 날**로
    # 물러서되 그 날짜를 적어 산출물이 달고 다니게 한다. 날짜를 숨기고
    # 어제 값을 오늘 것처럼 싣는 것이 가장 나쁘다.
    have = sorted({x for s in (d.get("stocks") or {}).values() for x in (s.get("d") or [])})
    use = bizdate if bizdate in have else (have[-1] if have else None)
    if not use:
        return None
    out = []
    for code, s in (d.get("stocks") or {}).items():
        days = s.get("d") or []
        if use not in days:
            continue
        k = days.index(use)
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
        "bizdate": use,
        "stale": use != bizdate,
        "rows": out,
    }


# ── ③ ETF ───────────────────────────────────────────────────────────
ETF_API = "https://stock.naver.com/api/stockSecurity/etfs/v2/domestic"


def etf_slim(r: dict) -> dict:
    price = f(r.get("currentPrice"))
    amt = f(r.get("tradingValue"))
    aum = f(r.get("totalNetAssets"))
    return {
        "code": r.get("itemCode"),
        "name": r.get("itemName"),
        "market": "ETF",
        "close": price,
        "change_pct": f(r.get("changeRate")),
        "change": f(r.get("changePrice")),
        "volume": f(r.get("tradingVolume")),
        "value_eok": None if amt is None else round(amt / 1e8, 1),
        "aum_eok": None if aum is None else round(aum / 1e8, 0),
        "etf_type": r.get("etfType"),
        "inav": f(r.get("iNav")),
        "r1m": f(r.get("returnRate1m")),
        "r3m": f(r.get("returnRate3m")),
    }


def fetch_etf_list(listing_types: list[str]) -> tuple[list[dict], str | None]:
    """되는 `listingType` 을 앞에서부터 찾아 한 판(100 줄)을 받는다.

    **`index` 로 넘길 수 없다**(2026-09-21 확인 — index=100 이면 빈 응답에
    hasNext 도 거짓이다). 그래서 순위마다 판을 따로 받는다. 총 1,171 종목
    가운데 각 순위의 **위 100 줄**이 우리가 보는 전부다.
    """
    for lt in listing_types:
        url = f"{ETF_API}?listingType={lt}&size=100&index=0"
        try:
            d = get_json(url, tries=2)
        except Exception as e:  # noqa: BLE001
            note(f"naver:etf:{lt}", False, error=str(e)[:140])
            continue
        items = (d or {}).get("items") or []
        if not items:
            note(f"naver:etf:{lt}", False, error="빈 응답")
            continue
        note(f"naver:etf:{lt}", True, rows=len(items), total=(d or {}).get("totalCount"))
        rows = [etf_slim(r) for r in items]
        return [r for r in rows if r["close"] and r["change_pct"] is not None], lt
    return [], None


# ── ④ 테마 · 업종 ───────────────────────────────────────────────────
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

    # 전종목 한 벌 — 시장별로 받아 잇는다(ALL 은 1000 줄에서 끊긴다).
    universe_raw: list[dict] = []
    for mt in ("KOSPI", "KOSDAQ"):
        try:
            part = fetch_universe(mt)
            note(f"naver:universe:{mt}", True, rows=len(part))
            universe_raw += part
        except Exception as e:  # noqa: BLE001
            note(f"naver:universe:{mt}", False, error=str(e)[:200])

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
        # 상승률·하락률에는 **거래대금 문턱**을 둔다. 문턱이 없으면 하루에
        # 몇백만원 거래되는 우선주와 잠든 종목이 상위 20 을 채우고, 그 줄은
        # 「오늘 시장이 본 종목」이 아니다. 10억원으로 잡았다.
        liquid = [r for r in pool if (r["value_eok"] or 0) >= 10]
        ranks[m] = {
            "종목수": len(pool),
            "유동표본": len(liquid),
            "문턱": "거래대금 10억원 이상(상승률·하락률·신고가에 적용)",
            "상승률상위": rank(liquid, "change_pct", 20),
            "하락률상위": rank(liquid, "change_pct", 10, reverse=False),
            "거래대금상위": rank(pool, "value_eok", 20),
            # 거래량 급증은 대금 문턱을 둔다. 문턱이 없으면 하루 3천만원
            # 거래되던 종목이 3억이 되어 1000% 로 1등을 하고, 그 줄은
            # 「오늘 시장이 본 종목」이 아니다.
            "거래량급증": rank(pool, "volume_diff_pct", 15,
                           where=lambda r: (r["value_eok"] or 0) >= 100),
            # 「오늘 올라서 52주 최고가에 닿은」 종목만 센다. 원천의 52주
            # 최고가 칸은 최근 며칠을 반영하지 못할 때가 있어, 오름세 조건이
            # 없으면 이미 뚫고 내려온 종목이 며칠씩 이어서 잡힌다.
            "신고가": sorted(
                [r for r in liquid if r["new_high"] and (r["change_pct"] or 0) > 0],
                key=lambda r: -(r["value_eok"] or 0),
            )[:20],
            "상한가": [r for r in pool if r["up_down_gb"] == "1"],
            "하한가": [r for r in pool if r["up_down_gb"] == "4"],
        }

    # ETF — 순위마다 판을 따로 받는다(넘기기가 안 된다).
    etf_up, lt_up = fetch_etf_list(["changeRateDescUpAll", "changeRateDesc"])
    etf_val, lt_val = fetch_etf_list(["tradingValueDesc"])
    if not etf_up and etf_val:
        # 상승률 판이 막히면 거래대금 판 100 줄 안에서 매긴다 — 그 사실을
        # 이름표로 달아 빌더가 표에 적을 수 있게 한다.
        etf_up, lt_up = rank(etf_val, "change_pct", 40), "tradingValueDesc 안에서 정렬"
    etf = {
        "종목수": len({e["code"] for e in etf_up + etf_val}),
        "총상장": next((v.get("total") for k, v in sources.items()
                     if k == "naver:etf:tradingValueDesc"), None),
        "상승률_기준": lt_up,
        "거래대금_기준": lt_val,
        # 레버리지·인버스 거르기는 **빌더가** 한다. 수집기는 원자료를 줄이지
        # 않는다 — 걸러 낸 뒤에 「왜 빠졌나」를 되짚을 수 없으면 곤란하다.
        "상승률상위": rank(etf_up, "change_pct", 40),
        "거래대금상위": rank(etf_val, "value_eok", 30),
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
            "시가총액 상위부터 한 벌을 받아 순위는 직접 매겼다. 원천이 "
            "startIdx 로 넘기는 것을 받지 않아 **시장별 상위 N 종목이 표본**이다"
            "(전종목이 아니다). 「신고가」는 종가가 52주 최고가 이상인 종목이고 "
            "장중 고가 기준이 아니다. 거래량 급증은 전일 거래량 대비 증가율이다."
        ),
        "universe": {
            "표본": len(rows),
            "코스피": len(by_market("코스피")),
            "코스닥": len(by_market("코스닥")),
            "주의": "거래소 상장 전종목이 아니라 시가총액 상위 표본입니다.",
        },
        "rank": ranks,
        "etf": etf,
        "themes": fetch_rankings("themes"),
        "industries": fetch_rankings("industries"),
        "investor_rank": {
            m: fetch_investor_rank(m) for m in ("코스피", "코스닥")
        },
        "investor_daily": {
            m: fetch_investor_daily(m, bizdate) for m in ("코스피", "코스닥")
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
