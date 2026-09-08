#!/usr/bin/env python3
"""미국 100대 기업 시세·지표·실적·컨센서스·일정을 모아 data/us100/ 에 JSON 으로 저장한다.

이 스크립트는 **GitHub Actions 러너에서 돈다.** 사내(그리고 Claude 세션) 이그레스
정책 때문에 야후에 직접 붙지 못하므로, 러너가 대신 받아 저장소에 커밋하고
`us-top100.html` 은 커밋된 스냅샷을 읽는다. 브라우저에서 야후에 바로 붙을 수 있는
환경이면 화면이 그 위에 실시간 값을 덮어쓴다.

종목 목록은 `us-top100.html` 의 COMPANIES 배열을 그대로 읽는다 — 목록을 두 곳에
두면 반드시 어긋나므로 화면 파일을 유일한 원본으로 삼는다.

산출물
  data/us100/latest.json        전 종목 요약(시세·지표·목표주가·일정·실적) + 수집 상태
  data/us100/chart/{SYM}.json   종목별 일봉 2년 + 월봉 10년 (주봉은 화면에서 일봉을 묶어 만든다)

원천이 하나 죽어도 나머지는 그대로 저장한다. 종목별 성공/실패는 latest.json 의
"sources" 에 남으므로, 화면은 무엇이 확보됐고 무엇이 비었는지 그대로 표시할 수 있다.
"""

import http.cookiejar
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")
TIMEOUT = 25
PAUSE = 0.35            # 요청 사이 간격 — 야후 429 를 피하려는 최소한의 예의
RETRY = 3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "us-top100.html")
OUT_DIR = os.path.join(ROOT, "data", "us100")
CHART_DIR = os.path.join(OUT_DIR, "chart")

QS_MODULES = ",".join([
    "assetProfile", "price", "summaryDetail", "defaultKeyStatistics", "financialData",
    "calendarEvents", "earnings", "earningsTrend", "earningsHistory",
    "recommendationTrend", "upgradeDowngradeHistory",
    "incomeStatementHistory", "incomeStatementHistoryQuarterly",
])

TS_TYPES = ",".join([
    "annualTotalRevenue", "annualOperatingIncome", "annualNetIncome", "annualDilutedEPS",
    "quarterlyTotalRevenue", "quarterlyOperatingIncome", "quarterlyNetIncome", "quarterlyDilutedEPS",
    "trailingMarketCap", "trailingPeRatio", "trailingForwardPeRatio", "trailingPsRatio",
    "trailingPbRatio", "trailingEnterprisesValueEBITDARatio",
])


# ---------------------------------------------------------------- HTTP

# 야후는 2024년부터 quoteSummary 계열에 쿠키 + crumb 을 요구한다(없으면 401).
# 쿠키를 물고 다니는 오프너를 하나 쓰고, crumb 은 시작할 때 한 번 받아 둔다.
_CJ = http.cookiejar.CookieJar()
_OPENER = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_CJ))
CRUMB = None

HDRS = {"User-Agent": UA, "Accept": "application/json,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9"}


def _open(url, timeout=None):
    return _OPENER.open(urllib.request.Request(url, headers=HDRS), timeout=timeout or TIMEOUT)


def init_crumb():
    """쿠키를 받고 crumb 을 얻는다. 실패하면 None — 그 경우 quoteSummary 는 포기한다.

    fc.yahoo.com 은 404 를 주지만 Set-Cookie 는 함께 온다(널리 쓰이는 방식).
    EU 리전 러너에서는 동의 화면으로 넘어가 crumb 이 HTML 로 올 수 있어, 형태를 본다.
    """
    global CRUMB
    for url in ("https://fc.yahoo.com/", "https://finance.yahoo.com/quote/AAPL/"):
        try:
            _open(url).read(64)
        except Exception:                       # noqa: BLE001 — 쿠키만 필요하다
            pass
    for host in ("query2.finance.yahoo.com", "query1.finance.yahoo.com"):
        try:
            v = _open("https://" + host + "/v1/test/getcrumb").read().decode("utf-8", "replace").strip()
            if v and len(v) < 40 and "<" not in v:
                CRUMB = v
                print("crumb 확보: %s (쿠키 %d개)" % (v, len(_CJ)), flush=True)
                return CRUMB
        except Exception as e:                  # noqa: BLE001
            print("crumb 실패(%s): %s" % (host, e), flush=True)
    print("crumb 을 얻지 못했다 — quoteSummary 는 건너뛴다", flush=True)
    return None


def _get(url):
    """실패하면 잠깐 쉬고 다시. 429·5xx 는 기다릴수록 나아지고, 404 는 그렇지 않다."""
    last = None
    for attempt in range(RETRY):
        if attempt:
            time.sleep(1.5 * (2 ** (attempt - 1)))
        try:
            with _open(url) as r:
                return r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            last = "HTTP %s" % e.code
            if e.code in (401, 403, 404):      # 기다려도 달라지지 않는다
                break
        except Exception as e:                  # noqa: BLE001 — 원천 장애를 삼키고 계속 간다
            last = str(e)
    raise RuntimeError(last or "unknown error")


def yget(path):
    """query1 이 막히면 query2 로 한 번 더 — 야후는 호스트별로 상태가 다를 때가 있다."""
    err = None
    for host in ("query1.finance.yahoo.com", "query2.finance.yahoo.com"):
        try:
            return json.loads(_get("https://" + host + path))
        except Exception as e:                  # noqa: BLE001
            err = e
    raise RuntimeError(str(err))


# ---------------------------------------------------------------- 유틸

def raw(v):
    """quoteSummary 는 formatted=false 로도 {'raw':..} 를 섞어 준다."""
    if isinstance(v, dict):
        return v.get("raw")
    return v


def num(v, nd=None):
    v = raw(v)
    if v is None or isinstance(v, (str, bool)):
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if f != f or f in (float("inf"), float("-inf")):
        return None
    return round(f, nd) if nd is not None else f


def pctize(v):
    """성장률·마진·ROE·서프라이즈는 비율(0.152 = 15.2%)로 온다."""
    v = num(v)
    return None if v is None else round(v * 100, 2)


def companies_from_page():
    """us-top100.html 의 COMPANIES 배열에서 [심볼, 영문명, 한글명, 섹터] 를 읽는다."""
    src = open(PAGE, encoding="utf-8").read()
    m = re.search(r"var COMPANIES = \[(.*?)\n\];", src, re.S)
    if not m:
        raise SystemExit("us-top100.html 에서 COMPANIES 배열을 찾지 못했다")
    rows = re.findall(r"\[\s*'([^']+)'\s*,\s*(?:'([^']*)'|\"([^\"]*)\")\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*\]",
                      m.group(1))
    out = []
    for sym, en1, en2, ko, sector in rows:
        out.append({"sym": sym, "en": en1 or en2, "ko": ko, "sector": sector})
    if len(out) < 50:
        raise SystemExit("COMPANIES 파싱 결과가 %d개다 — 정규식을 확인해야 한다" % len(out))
    return out


# ---------------------------------------------------------------- 차트

def fetch_chart(sym, rng, interval, events=False):
    path = ("/v8/finance/chart/" + urllib.parse.quote(sym) +
            "?range=%s&interval=%s&includePrePost=false" % (rng, interval))
    if events:
        path += "&events=div%2Csplit"
    j = yget(path)
    res = j["chart"]["result"][0]
    meta = res.get("meta") or {}
    ts = res.get("timestamp") or []
    q = (res.get("indicators", {}).get("quote") or [{}])[0]
    out = {"d": [], "o": [], "h": [], "l": [], "c": [], "v": []}
    for i, t in enumerate(ts):
        c = (q.get("close") or [None] * len(ts))[i]
        if c is None:
            continue
        day = datetime.fromtimestamp(t, timezone.utc).strftime("%Y-%m-%d")
        out["d"].append(day)
        out["o"].append(num((q.get("open") or [None])[i] if q.get("open") else None, 4))
        out["h"].append(num((q.get("high") or [None])[i] if q.get("high") else None, 4))
        out["l"].append(num((q.get("low") or [None])[i] if q.get("low") else None, 4))
        out["c"].append(num(c, 4))
        out["v"].append(int(q["volume"][i]) if q.get("volume") and q["volume"][i] is not None else None)
    if not out["c"]:
        raise RuntimeError("빈 시계열")

    ev = res.get("events") or {}
    divs = [{"date": v.get("date"), "amount": num(v.get("amount"), 4)}
            for v in (ev.get("dividends") or {}).values() if v.get("date")]
    splits = [{"date": v.get("date"),
               "ratio": v.get("splitRatio") or "%s:%s" % (v.get("numerator"), v.get("denominator"))}
              for v in (ev.get("splits") or {}).values() if v.get("date")]
    divs.sort(key=lambda x: -x["date"])
    splits.sort(key=lambda x: -x["date"])
    return out, meta, divs, splits


def fetch_chart_stooq(sym, interval="d", keep_days=800):
    """야후 차트가 막힌 심볼의 대체 경로. Stooq 일별/월별 CSV.

    첫 수집에서 FI(Fiserv)·MMC(Marsh & McLennan)만 야후 chart 가 404 였다.
    두 종목은 timeseries 는 정상이라 심볼 문제가 아니라 야후 쪽 사정으로 보인다.
    """
    code = sym.lower().replace("-", ".") + ".us"
    url = "https://stooq.com/q/d/l/?s=%s&i=%s" % (code, interval)
    txt = _get(url)
    lines = [l for l in txt.strip().splitlines() if l]
    if not lines or not lines[0].lower().startswith("date"):
        raise RuntimeError("stooq CSV 아님")
    out = {"d": [], "o": [], "h": [], "l": [], "c": [], "v": []}
    for line in lines[1:]:
        parts = line.split(",")
        if len(parts) < 5:
            continue
        day, o, h, lo, c = parts[0], parts[1], parts[2], parts[3], parts[4]
        v = parts[5] if len(parts) > 5 else None
        if num(c) is None:
            continue
        out["d"].append(day)
        out["o"].append(num(o, 4)); out["h"].append(num(h, 4))
        out["l"].append(num(lo, 4)); out["c"].append(num(c, 4))
        out["v"].append(int(float(v)) if v not in (None, "", "0") and num(v) is not None else None)
    if not out["c"]:
        raise RuntimeError("빈 시계열")
    keep = keep_days if interval == "d" else 130
    for k in out:
        out[k] = out[k][-keep:]
    return out


# ---------------------------------------------------------------- quoteSummary

def fetch_summary(sym):
    if not CRUMB:
        raise RuntimeError("crumb 없음")
    path = ("/v10/finance/quoteSummary/" + urllib.parse.quote(sym) +
            "?modules=" + QS_MODULES + "&formatted=false&corsDomain=finance.yahoo.com" +
            "&crumb=" + urllib.parse.quote(CRUMB))
    j = yget(path)
    res = (j.get("quoteSummary") or {}).get("result")
    if not res:
        raise RuntimeError("quoteSummary 응답에 result 가 없다")
    return res[0]


def shape_summary(m, meta):
    """quoteSummary 응답을 화면 모델과 같은 모양으로 접는다.

    화면(us-top100.html)의 normalizeSummary 와 키를 일치시킨다. 두 쪽이 어긋나면
    스냅샷은 실시간 경로와 다른 값을 보여주게 된다.
    """
    p = m.get("price") or {}
    sd = m.get("summaryDetail") or {}
    ks = m.get("defaultKeyStatistics") or {}
    fd = m.get("financialData") or {}
    ap = m.get("assetProfile") or {}

    q = {}
    q["price"] = num(p.get("regularMarketPrice")) or num(fd.get("currentPrice")) or num(meta.get("regularMarketPrice"))
    q["prevClose"] = num(p.get("regularMarketPreviousClose")) or num(sd.get("previousClose")) or num(meta.get("previousClose"))
    if q["price"] is not None and q["prevClose"]:
        q["changePct"] = round((q["price"] - q["prevClose"]) / q["prevClose"] * 100, 2)
    q["cap"] = num(p.get("marketCap")) or num(sd.get("marketCap"))
    q["currency"] = p.get("currency") or sd.get("currency") or meta.get("currency") or "USD"
    q["exchange"] = p.get("fullExchangeName") or p.get("exchangeName") or meta.get("fullExchangeName")
    q["asof"] = num(p.get("regularMarketTime")) or num(meta.get("regularMarketTime"))
    q["open"] = num(p.get("regularMarketOpen")) or num(sd.get("open"))
    q["dayHigh"] = num(p.get("regularMarketDayHigh")) or num(sd.get("dayHigh"))
    q["dayLow"] = num(p.get("regularMarketDayLow")) or num(sd.get("dayLow"))
    q["volume"] = num(p.get("regularMarketVolume")) or num(sd.get("volume"))
    q["avgVolume"] = num(sd.get("averageVolume"))
    q["high52"] = num(sd.get("fiftyTwoWeekHigh")) or num(meta.get("fiftyTwoWeekHigh"))
    q["low52"] = num(sd.get("fiftyTwoWeekLow")) or num(meta.get("fiftyTwoWeekLow"))
    q["per"] = num(sd.get("trailingPE"), 2)
    q["fwdPer"] = num(sd.get("forwardPE"), 2) or num(ks.get("forwardPE"), 2)
    q["psr"] = num(sd.get("priceToSalesTrailing12Months"), 2)
    q["divRate"] = num(sd.get("dividendRate"), 4)
    q["payout"] = pctize(sd.get("payoutRatio"))
    q["beta"] = num(sd.get("beta"), 2) or num(ks.get("beta"), 2)
    q["eps"] = num(ks.get("trailingEps"), 2)
    q["fwdEps"] = num(ks.get("forwardEps"), 2)
    q["pbr"] = num(ks.get("priceToBook"), 2)
    q["bookValue"] = num(ks.get("bookValue"), 2)
    q["evEbitda"] = num(ks.get("enterpriseToEbitda"), 2)
    q["ev"] = num(ks.get("enterpriseValue"))
    q["peg"] = num(ks.get("pegRatio"), 2)
    q["shares"] = num(ks.get("sharesOutstanding"))
    q["roe"] = pctize(fd.get("returnOnEquity"))
    q["opMargin"] = pctize(fd.get("operatingMargins"))
    q["netMargin"] = pctize(fd.get("profitMargins"))
    q["grossMargin"] = pctize(fd.get("grossMargins"))
    q["revenue"] = num(fd.get("totalRevenue"))
    q["revenueGrowth"] = pctize(fd.get("revenueGrowth"))
    q["earningsGrowth"] = pctize(fd.get("earningsGrowth"))
    q["debtToEquity"] = num(fd.get("debtToEquity"), 2)
    q["cash"] = num(fd.get("totalCash"))
    q["fcf"] = num(fd.get("freeCashflow"))

    # 배당수익률: 응답이 비율(0.0044)인지 퍼센트(0.44)인지 섞여 있다.
    dy = num(sd.get("dividendYield"))
    if dy is not None:
        if q.get("divRate") and q.get("price"):
            calc = q["divRate"] / q["price"] * 100
            dy = dy * 100 if abs(calc - dy * 100) < abs(calc - dy) else dy
        elif dy < 0.3:
            dy = dy * 100
        q["divYield"] = round(dy, 2)

    target = {
        "low": num(fd.get("targetLowPrice"), 2), "mean": num(fd.get("targetMeanPrice"), 2),
        "high": num(fd.get("targetHighPrice"), 2), "median": num(fd.get("targetMedianPrice"), 2),
        "analysts": num(fd.get("numberOfAnalystOpinions")),
        "rating": fd.get("recommendationKey"), "ratingMean": num(fd.get("recommendationMean"), 2),
        "dist": None, "history": [],
    }
    trend = ((m.get("recommendationTrend") or {}).get("trend") or [])
    if trend:
        c = trend[0]
        target["dist"] = {k: c.get(k) or 0 for k in ("strongBuy", "buy", "hold", "sell", "strongSell")}
    for h in ((m.get("upgradeDowngradeHistory") or {}).get("history") or [])[:12]:
        target["history"].append({"ts": num(h.get("epochGradeDate")), "firm": h.get("firm"),
                                  "from": h.get("fromGrade"), "to": h.get("toGrade"), "action": h.get("action")})

    ce = m.get("calendarEvents") or {}
    cee = ce.get("earnings") or {}
    dates = [num(d) for d in (cee.get("earningsDate") or []) if num(d)]
    calendar = {
        "dates": dates, "estimate": len(dates) > 1,
        "epsEst": num(cee.get("earningsAverage"), 2), "epsLow": num(cee.get("earningsLow"), 2),
        "epsHigh": num(cee.get("earningsHigh"), 2), "revEst": num(cee.get("revenueAverage")),
        "revLow": num(cee.get("revenueLow")), "revHigh": num(cee.get("revenueHigh")),
        "exDiv": num(ce.get("exDividendDate")) or num(sd.get("exDividendDate")),
        "divPay": num(ce.get("dividendDate")),
    }

    surprises = []
    for h in ((m.get("earningsHistory") or {}).get("history") or [])[-6:][::-1]:
        surprises.append({"ts": num(h.get("quarter")), "period": h.get("period"),
                          "est": num(h.get("epsEstimate"), 2), "act": num(h.get("epsActual"), 2),
                          "diff": num(h.get("epsDifference"), 2), "surprise": pctize(h.get("surprisePercent"))})

    eps_quarters = []
    ec = (m.get("earnings") or {}).get("earningsChart") or {}
    for r in (ec.get("quarterly") or []):
        eps_quarters.append({"label": r.get("date"), "act": num(r.get("actual"), 2), "est": num(r.get("estimate"), 2)})
    if ec.get("currentQuarterEstimate") is not None:
        eps_quarters.append({"label": "%s%s" % (ec.get("currentQuarterEstimateDate") or "",
                                                ec.get("currentQuarterEstimateYear") or ""),
                             "act": None, "est": num(ec.get("currentQuarterEstimate"), 2), "upcoming": True})

    eps_trend = []
    for r in ((m.get("earningsTrend") or {}).get("trend") or []):
        if r.get("period") not in ("0q", "+1q", "0y", "+1y"):
            continue
        e = r.get("earningsEstimate") or {}
        rv = r.get("revenueEstimate") or {}
        eps_trend.append({"period": r.get("period"), "endDate": r.get("endDate"),
                          "avg": num(e.get("avg"), 2), "low": num(e.get("low"), 2), "high": num(e.get("high"), 2),
                          "n": num(e.get("numberOfAnalysts")), "yearAgo": num(e.get("yearAgoEps"), 2),
                          "growth": pctize(r.get("growth")), "revAvg": num(rv.get("avg")),
                          "revGrowth": pctize(rv.get("growth"))})

    def inc_rows(rows, quarterly):
        out = []
        for r in rows[:6 if quarterly else 5][::-1]:
            end = raw(r.get("endDate"))
            if isinstance(end, (int, float)):
                dt = datetime.fromtimestamp(end, timezone.utc)
                label = dt.strftime("%Y-%m") if quarterly else dt.strftime("%Y")
            elif isinstance(end, str):
                label = end[:7] if quarterly else end[:4]
            else:
                label = "—"
            rev, op, net = num(r.get("totalRevenue")), num(r.get("operatingIncome")), num(r.get("netIncome"))
            out.append({"label": label, "revenue": rev, "op": op, "net": net,
                        "gross": num(r.get("grossProfit")),
                        "opMargin": round(op / rev * 100, 2) if rev and op is not None else None})
        return out

    financials = {}
    ann = (m.get("incomeStatementHistory") or {}).get("incomeStatementHistory") or []
    qtr = (m.get("incomeStatementHistoryQuarterly") or {}).get("incomeStatementHistory") or []
    if ann:
        financials["annual"] = inc_rows(ann, False)
    if qtr:
        financials["quarterly"] = inc_rows(qtr, True)
    fc = (m.get("earnings") or {}).get("financialsChart") or {}
    if not financials.get("annual") and fc.get("yearly"):
        financials["annual"] = [{"label": str(r.get("date")), "revenue": num(r.get("revenue")),
                                 "op": None, "net": num(r.get("earnings")), "eps": None} for r in fc["yearly"]]
    if not financials.get("quarterly") and fc.get("quarterly"):
        financials["quarterly"] = [{"label": str(r.get("date")), "revenue": num(r.get("revenue")),
                                    "op": None, "net": num(r.get("earnings")), "eps": None} for r in fc["quarterly"]]

    profile = {"sector": ap.get("sector"), "industry": ap.get("industry"),
               "employees": num(ap.get("fullTimeEmployees")), "website": ap.get("website"),
               "country": ap.get("country")}

    return {"quote": q, "target": target, "calendar": calendar, "surprises": surprises,
            "epsQuarters": eps_quarters, "epsTrend": eps_trend, "financials": financials,
            "profile": profile}


def fetch_timeseries(sym):
    """quoteSummary 가 막혔을 때의 대체 경로 — 실적·밸류에이션만 확보한다."""
    end = int(time.time())
    start = 1262304000                          # 2010-01-01. 좁게 잡으면 연간 계열이 한 행만 온다
    path = ("/ws/fundamentals-timeseries/v1/finance/timeseries/" + urllib.parse.quote(sym) +
            "?symbol=" + urllib.parse.quote(sym) + "&type=" + TS_TYPES +
            "&period1=%d&period2=%d&merge=false" % (start, end))
    j = yget(path)
    res = (j.get("timeseries") or {}).get("result") or []
    series = {}
    for r in res:
        types = (r.get("meta") or {}).get("type") or []
        if not types:
            continue
        typ = types[0]
        rows = [x for x in (r.get(typ) or []) if x and x.get("asOfDate")]
        if rows:
            got = [{"date": x.get("asOfDate"), "v": num(x.get("reportedValue"))} for x in rows]
            series.setdefault(typ, []).extend(got)     # 덮어쓰면 계열이 한 행으로 줄어든다
    for typ in series:
        seen, uniq = set(), []
        for x in sorted(series[typ], key=lambda y: y["date"]):
            if x["date"] in seen:
                continue
            seen.add(x["date"])
            uniq.append(x)
        series[typ] = uniq

    def rows_for(rev_k, op_k, net_k, eps_k, quarterly):
        rev = series.get(rev_k) or []
        if not rev:
            return None
        keep = rev[-(6 if quarterly else 5):]
        out = []
        for r in keep:
            def pick(k):
                for x in series.get(k) or []:
                    if x["date"] == r["date"]:
                        return x["v"]
                return None
            op = pick(op_k)
            out.append({"label": str(r["date"])[:7] if quarterly else str(r["date"])[:4],
                        "revenue": r["v"], "op": op, "net": pick(net_k), "eps": pick(eps_k),
                        "opMargin": round(op / r["v"] * 100, 2) if r["v"] and op is not None else None})
        return out

    def last(k):
        a = series.get(k)
        return a[-1]["v"] if a else None

    return {
        "financials": {
            "annual": rows_for("annualTotalRevenue", "annualOperatingIncome", "annualNetIncome", "annualDilutedEPS", False),
            "quarterly": rows_for("quarterlyTotalRevenue", "quarterlyOperatingIncome", "quarterlyNetIncome", "quarterlyDilutedEPS", True),
        },
        "quote": {"cap": last("trailingMarketCap"), "per": last("trailingPeRatio"),
                  "fwdPer": last("trailingForwardPeRatio"), "psr": last("trailingPsRatio"),
                  "pbr": last("trailingPbRatio"), "evEbitda": last("trailingEnterprisesValueEBITDARatio"),
                  # TTM EPS: quoteSummary 의 trailingEps 가 없을 때 최근 4개 분기 희석 EPS 를 더한다.
                  # 파생값이므로 화면이 근거를 표시할 수 있게 epsBasis 를 함께 남긴다.
                  "eps": _ttm_eps(series.get("quarterlyDilutedEPS")),
                  "epsBasis": "ttm-quarters" if _ttm_eps(series.get("quarterlyDilutedEPS")) is not None else None},
    }


def merge_financials(base, ts):
    """손익 모듈(base)에 timeseries(ts) 값을 같은 기간끼리 메운다.

    기준은 base 의 기간 라벨('2025' / '2025-06')이다. base 에 없는 기간은 만들지 않는다 —
    두 원천의 회계기간 표기가 어긋날 때 없는 행을 지어내지 않기 위함이다.
    0 으로 온 값(그로스가 자주 그렇다)은 결측으로 본다.
    """
    out = {}
    for key in ("annual", "quarterly"):
        rows = list(base.get(key) or [])
        extra = list((ts or {}).get(key) or [])
        if not rows:
            out[key] = extra or None
            continue
        by_label = {}
        for r in extra:
            by_label[r["label"]] = r
        for r in rows:
            src = by_label.get(r["label"])
            for f in ("revenue", "op", "net", "eps"):
                if r.get(f) in (None, 0) and src and src.get(f) not in (None, 0):
                    r[f] = src[f]
            if r.get("gross") in (0,):
                r["gross"] = None
            if r.get("opMargin") is None and r.get("revenue") and r.get("op") is not None:
                r["opMargin"] = round(r["op"] / r["revenue"] * 100, 2)
        out[key] = rows
    return {k: v for k, v in out.items() if v}


def _ttm_eps(rows):
    """최근 4개 분기 희석 EPS 의 합. 4개가 다 있지 않으면 만들지 않는다."""
    if not rows or len(rows) < 4:
        return None
    vals = [r["v"] for r in rows[-4:] if r.get("v") is not None]
    if len(vals) < 4:
        return None
    return round(sum(vals), 2)


# ---------------------------------------------------------------- 본체

def fetch_one(c):
    """한 종목. 어느 단계가 실패했는지 상태로 남기고, 받은 것만 돌려준다."""
    sym = c["sym"]
    payload = {"sym": sym}
    status = {}

    meta = {}
    try:
        daily, meta, divs, splits = fetch_chart(sym, "2y", "1d", events=True)
        payload["events"] = {"divs": divs[:8], "splits": splits[:4]}
        status["chart"] = True
    except Exception as e:                      # noqa: BLE001
        daily, divs, splits = None, [], []
        status["chart"] = str(e)
        time.sleep(PAUSE)
        try:
            daily = fetch_chart_stooq(sym, "d")
            status["chart"] = True
            status["chartVia"] = "stooq"
        except Exception as e2:                 # noqa: BLE001
            status["chartStooq"] = str(e2)
    time.sleep(PAUSE)

    monthly = None
    try:
        monthly, meta2, _, _ = fetch_chart(sym, "10y", "1mo")
        meta = meta or meta2
        status["monthly"] = True
    except Exception as e:                      # noqa: BLE001
        status["monthly"] = str(e)
        time.sleep(PAUSE)
        try:
            monthly = fetch_chart_stooq(sym, "m")
            status["monthly"] = True
            status["monthlyVia"] = "stooq"
        except Exception as e2:                 # noqa: BLE001
            status["monthlyStooq"] = str(e2)
    time.sleep(PAUSE)

    try:
        payload.update(shape_summary(fetch_summary(sym), meta))
        status["summary"] = True
    except Exception as e:                      # noqa: BLE001
        status["summary"] = str(e)
    time.sleep(PAUSE)

    # timeseries 는 quoteSummary 성공 여부와 무관하게 받는다.
    # 야후의 손익 모듈이 영업이익·EPS 를 빼놓고 오는 일이 잦아(그로스는 0 으로 온다)
    # 같은 기간의 timeseries 값으로 메워야 표가 비지 않는다.
    try:
        ts = fetch_timeseries(sym)
        status["timeseries"] = True
        if status.get("summary") is True:
            payload["financials"] = merge_financials(payload.get("financials") or {}, ts["financials"])
            q0 = payload.setdefault("quote", {})
            for k, v in ts["quote"].items():
                if v is not None and q0.get(k) is None:
                    q0[k] = v
        else:
            payload["financials"] = {k: v for k, v in ts["financials"].items() if v}
            payload["quote"] = {k: v for k, v in ts["quote"].items() if v is not None}
    except Exception as e2:                     # noqa: BLE001
        status["timeseries"] = str(e2)
    time.sleep(PAUSE)

    # 차트 메타로 시세 최소치는 채운다 (quoteSummary 가 막힌 경우의 안전망)
    q = payload.setdefault("quote", {})
    if daily and daily["c"]:
        q.setdefault("price", meta.get("regularMarketPrice") or daily["c"][-1])
        if q.get("prevClose") is None and len(daily["c"]) > 1:
            q["prevClose"] = meta.get("previousClose") or daily["c"][-2]
        if q.get("price") is not None and q.get("prevClose"):
            q["changePct"] = round((q["price"] - q["prevClose"]) / q["prevClose"] * 100, 2)
        q.setdefault("currency", meta.get("currency") or "USD")
        q.setdefault("volume", daily["v"][-1])
    if q.get("cap") is None and q.get("shares") and q.get("price"):
        q["cap"] = q["shares"] * q["price"]

    chart = None
    if daily or monthly:
        chart = {"symbol": sym, "fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
        if daily:
            chart["daily"] = daily
        if monthly:
            chart["monthly"] = monthly
    return payload, status, chart


def main():
    companies = companies_from_page()
    only = sys.argv[1:]                          # 디버그용: 심볼을 인자로 주면 그것만 받는다
    if only:
        companies = [c for c in companies if c["sym"] in only]

    os.makedirs(CHART_DIR, exist_ok=True)
    init_crumb()
    out = {
        "fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "yahoo-finance",
        "note": "GitHub Actions 러너가 수집한 스냅샷. us-top100.html 이 읽는다.",
        "fx": {}, "companies": {}, "sources": {},
    }

    try:
        fx, _, _, _ = fetch_chart("KRW=X", "5d", "1d")
        out["fx"]["usdkrw"] = fx["c"][-1]
    except Exception as e:                       # noqa: BLE001
        out["sources"]["fx"] = str(e)

    ok = qs_ok = 0
    for i, c in enumerate(companies, 1):
        try:
            payload, status, chart = fetch_one(c)
        except Exception as e:                   # noqa: BLE001
            out["sources"][c["sym"]] = {"fatal": str(e)}
            print("  %3d/%d %-6s 실패 — %s" % (i, len(companies), c["sym"], e), flush=True)
            continue
        out["companies"][c["sym"]] = payload
        out["sources"][c["sym"]] = status
        if status.get("chart") is True:
            ok += 1
        if status.get("summary") is True:
            qs_ok += 1
        if chart:
            with open(os.path.join(CHART_DIR, c["sym"] + ".json"), "w", encoding="utf-8") as f:
                json.dump(chart, f, ensure_ascii=False, separators=(",", ":"))
        price = payload.get("quote", {}).get("price")
        print("  %3d/%d %-6s %s%s" % (i, len(companies), c["sym"],
                                      ("$%.2f" % price) if price else "가격 없음",
                                      "" if status.get("summary") is True else "  (지표 미확보)"), flush=True)

    # 시세를 못 받은 종목만 한 번 더 — 429·일시적 오류가 대부분이라 재시도로 대개 붙는다
    retry = [c for c in companies if not isinstance(out["sources"].get(c["sym"]), dict)
             or out["sources"][c["sym"]].get("chart") is not True]
    if retry:
        print("\n시세 실패 %d종목 재시도: %s" % (len(retry), ", ".join(c["sym"] for c in retry)), flush=True)
        time.sleep(5)
        for c in retry:
            try:
                payload, status, chart = fetch_one(c)
            except Exception as e:              # noqa: BLE001
                print("  %-6s 재시도도 실패 — %s" % (c["sym"], e), flush=True)
                continue
            if status.get("chart") is True:
                out["companies"][c["sym"]] = payload
                out["sources"][c["sym"]] = status
                ok += 1
                if status.get("summary") is True:
                    qs_ok += 1
                if chart:
                    with open(os.path.join(CHART_DIR, c["sym"] + ".json"), "w", encoding="utf-8") as f:
                        json.dump(chart, f, ensure_ascii=False, separators=(",", ":"))
                print("  %-6s 재시도 성공" % c["sym"], flush=True)

    out["summary"] = {"symbols": len(companies), "chartOk": ok, "summaryOk": qs_ok,
                      "crumb": bool(CRUMB)}
    with open(os.path.join(OUT_DIR, "latest.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    size = os.path.getsize(os.path.join(OUT_DIR, "latest.json"))
    print("\n수집 완료: 시세 %d/%d · 지표 %d/%d · latest.json %.0fKB"
          % (ok, len(companies), qs_ok, len(companies), size / 1024), flush=True)
    if ok == 0:
        raise SystemExit("한 종목도 받지 못했다 — 원천이 전부 막혔거나 응답 형태가 바뀌었다")


if __name__ == "__main__":
    main()
