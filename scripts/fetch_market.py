#!/usr/bin/env python3
"""장 마감 시세를 모아 data/market/ 아래에 JSON으로 저장한다.

이 스크립트는 GitHub Actions 러너에서 돈다. 브리핑을 만드는 Claude 세션은
사내 이그레스 정책 때문에 KRX·네이버·야후에 직접 붙지 못하므로, 러너가 대신
받아 저장소에 커밋하고 세션은 커밋된 파일을 읽는다.

원천이 하나 죽어도 나머지는 그대로 저장한다. 각 원천의 성공/실패는 결과
JSON의 "sources" 에 남기므로, 브리핑은 무엇이 확보됐고 무엇이 비었는지
그대로 알 수 있다.
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")
TIMEOUT = 20

# 지수·환율·원자재 — 야후 심볼
YAHOO_INDEX = {
    "kospi": "^KS11", "kosdaq": "^KQ11", "usdkrw": "KRW=X",
    "sp500": "^GSPC", "nasdaq": "^IXIC", "dow": "^DJI", "sox": "^SOX",
    "vix": "^VIX", "dxy": "DX-Y.NYB", "usdjpy": "JPY=X",
    "wti": "CL=F", "brent": "BZ=F", "gold": "GC=F",
    "ust10y": "^TNX", "ust2y": "^IRX",
}

# 시가총액 상위 — 야후는 코스피 종목에 .KS, 코스닥에 .KQ 를 쓴다
YAHOO_STOCKS = {
    "삼성전자": "005930.KS", "SK하이닉스": "000660.KS",
    "LG에너지솔루션": "373220.KS", "삼성바이오로직스": "207940.KS",
    "현대차": "005380.KS", "KB금융": "105560.KS",
    "한화에어로스페이스": "012450.KS", "삼성전기": "009150.KS",
    "셀트리온": "068270.KS", "NAVER": "035420.KS",
}


def _get(url, data=None, headers=None, referer=None):
    h = {"User-Agent": UA, "Accept": "*/*",
         "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
    if referer:
        h["Referer"] = referer
    if headers:
        h.update(headers)
    body = urllib.parse.urlencode(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=h)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read().decode("utf-8", "replace")


def _num(x):
    return round(x, 4) if isinstance(x, float) else x


def yahoo_quote(symbol):
    """일봉 2개를 받아 종가·전일대비·OHLC·거래량을 만든다."""
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol) + "?range=5d&interval=1d")
    j = json.loads(_get(url))
    res = j["chart"]["result"][0]
    meta = res["meta"]
    q = res["indicators"]["quote"][0]
    ts = res["timestamp"]

    # 마지막으로 종가가 있는 인덱스
    idx = [i for i, c in enumerate(q["close"]) if c is not None]
    if not idx:
        raise ValueError("no close data")
    last = idx[-1]
    prev = idx[-2] if len(idx) > 1 else None

    close = q["close"][last]
    prev_close = q["close"][prev] if prev is not None else meta.get("chartPreviousClose")
    change = close - prev_close if prev_close else None
    return {
        "symbol": symbol,
        "date": datetime.fromtimestamp(ts[last], KST).strftime("%Y-%m-%d"),
        "close": _num(close),
        "open": _num(q["open"][last]),
        "high": _num(q["high"][last]),
        "low": _num(q["low"][last]),
        "volume": q["volume"][last],
        "prev_close": _num(prev_close),
        "change": _num(change),
        "change_pct": _num(change / prev_close * 100) if prev_close else None,
        "currency": meta.get("currency"),
    }


def naver_index(code):
    """네이버 금융 지수 API — 지수 기본 시세."""
    return json.loads(_get(
        "https://api.stock.naver.com/index/%s/basic" % code,
        referer="https://m.stock.naver.com/"))


def naver_sectors():
    """업종별 등락률 — 네이버 업종 시세 페이지(HTML)."""
    return _get("https://finance.naver.com/sise/sise_group.naver?type=upjong",
                referer="https://finance.naver.com/")


def krx_json(bld, **params):
    """KRX 정보데이터시스템 JSON 엔드포인트."""
    p = {"bld": bld, "locale": "ko_KR"}
    p.update(params)
    return json.loads(_get(
        "https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd",
        data=p, referer="https://data.krx.co.kr/contents/MDC/MDI/mainChart/index.cmd"))


def run(label, fn, *a, **k):
    """원천 하나를 시도하고 (값, 상태) 를 돌려준다. 실패해도 죽지 않는다."""
    try:
        v = fn(*a, **k)
        return v, {"ok": True}
    except urllib.error.HTTPError as e:
        return None, {"ok": False, "error": "HTTP %s" % e.code}
    except Exception as e:                                    # noqa: BLE001
        return None, {"ok": False, "error": "%s: %s" % (type(e).__name__, e)}


def main():
    now = datetime.now(KST)
    out = {
        "generated_at_kst": now.strftime("%Y-%m-%d %H:%M:%S"),
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
        "sources": {},
        "indices": {},
        "stocks": {},
    }

    for name, sym in YAHOO_INDEX.items():
        v, st = run(name, yahoo_quote, sym)
        if v:
            out["indices"][name] = v
        out["sources"]["yahoo:" + name] = st

    for name, sym in YAHOO_STOCKS.items():
        v, st = run(name, yahoo_quote, sym)
        if v:
            out["stocks"][name] = v
        out["sources"]["yahoo:" + sym] = st

    # 네이버 — 지수 기본 + 업종별 (야후에 없는 것들)
    for code in ("KOSPI", "KOSDAQ"):
        v, st = run(code, naver_index, code)
        if v:
            out.setdefault("naver", {})[code] = v
        out["sources"]["naver:index:" + code] = st

    html, st = run("sectors", naver_sectors)
    out["sources"]["naver:sectors"] = st
    if html:
        out["naver_sectors_html_bytes"] = len(html)
        os.makedirs("data/market/raw", exist_ok=True)
        with open("data/market/raw/naver_sectors_%s.html" % now.strftime("%Y-%m-%d"),
                  "w", encoding="utf-8") as f:
            f.write(html)

    # KRX — 투자자별 거래실적(MDCSTAT02201), 전종목 시세(MDCSTAT01501)
    d = now.strftime("%Y%m%d")
    for label, bld, extra in (
        ("investors", "dbms/MDC/STAT/standard/MDCSTAT02201",
         {"mktId": "STK", "trdVolVal": "2", "askBid": "3",
          "strtDd": d, "endDd": d, "share": "1", "money": "1"}),
        ("allstocks", "dbms/MDC/STAT/standard/MDCSTAT01501",
         {"mktId": "ALL", "trdDd": d, "share": "1", "money": "1"}),
    ):
        v, st = run(label, krx_json, bld, **extra)
        if v:
            out.setdefault("krx", {})[label] = v
        out["sources"]["krx:" + label] = st

    ok = sum(1 for s in out["sources"].values() if s["ok"])
    out["summary"] = {"sources_tried": len(out["sources"]), "sources_ok": ok}

    os.makedirs("data/market", exist_ok=True)
    stamp = now.strftime("%Y-%m-%d")
    for path in ("data/market/latest.json", "data/market/%s.json" % stamp):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)

    print("=== 원천별 결과 ===")
    for k, v in sorted(out["sources"].items()):
        print(("  OK   " if v["ok"] else "  FAIL ") + k
              + ("" if v["ok"] else "  <- " + v["error"]))
    print("\n%d/%d 성공" % (ok, len(out["sources"])))
    for k in ("kospi", "kosdaq", "usdkrw"):
        if k in out["indices"]:
            i = out["indices"][k]
            print("  %s %s  close=%s  chg=%s (%s%%)  vol=%s"
                  % (k, i["date"], i["close"], i["change"], i["change_pct"], i["volume"]))

    # 아무것도 못 받으면 실패로 끝내 워크플로가 빨갛게 뜨도록 한다
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
