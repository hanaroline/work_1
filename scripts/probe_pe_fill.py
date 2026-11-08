#!/usr/bin/env python3
"""Probe: what Yahoo / Naver give for top-100 names whose screener PER is null (temporary)."""
import json, os, sys, time, urllib.parse, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_us100 as F
import fetch_value_leaders as V

d = json.load(open(os.path.join(V.ROOT, "data", "value-leaders.json")))
miss = {mk: [c["sym"] for c in m["co"] if c["pe"] is None] for mk, m in d["markets"].items()}
ctrl = {"kr": ["005930.KS", "000660.KS"], "us": ["AAPL"], "jp": ["7203.T"], "cn": ["600519.SS"]}
F.init_crumb()
cr = "&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""

FIELDS = ["netincomeis.lasttwelvemonths", "netincometocommon.lasttwelvemonths",
          "dilutedeps.lasttwelvemonths", "basicepscontinuingoperations.lasttwelvemonths",
          "dilutedepscontinuingoperations.lasttwelvemonths", "netepsdiluted.lasttwelvemonths",
          "netepsbasic.lasttwelvemonths"]
for mk, syms in miss.items():
    syms = syms + ctrl[mk]
    print("=====", mk, flush=True)
    # screener with each extra field (one at a time: an unknown field may fail the whole query)
    for f in FIELDS:
        body = {"size": 50, "offset": 0, "sortField": "intradaymarketcap", "sortType": "DESC",
                "quoteType": "EQUITY", "userId": "", "userIdType": "guid",
                "query": {"operator": "or", "operands": [{"operator": "eq", "operands": ["ticker", s]} for s in syms]},
                "includeFields": ["ticker", "intradaymarketcap", "peratio.lasttwelvemonths", f]}
        try:
            r = V.post(body, "&useRecordsResponse=true", "en-US")
            recs = r.get("records") or []
            print(" field", f, "rows", len(recs), "keys", sorted(set(k for x in recs for k in x))[:20])
            for x in recs[:40]:
                print("   ", json.dumps(x)[:300])
        except Exception as e:
            print(" field", f, "ERR", e)
        time.sleep(0.5)
    q = V.v7_quotes(syms, "en-US")
    for s in syms:
        x = q.get(s) or {}
        print(" quote", s, {k: x.get(k) for k in ("regularMarketPrice", "currency", "financialCurrency", "trailingPE",
              "epsTrailingTwelveMonths", "epsCurrentYear", "sharesOutstanding", "marketCap")})
    for s in syms:
        types = "trailingNetIncomeCommonStockholders,trailingDilutedEPS,trailingBasicEPS,trailingNetIncome,quarterlyDilutedEPS,quarterlyNetIncomeCommonStockholders"
        p = ("/ws/fundamentals-timeseries/v1/finance/timeseries/%s?type=%s&period1=1640995200&period2=%d%s"
             % (urllib.parse.quote(s), types, int(time.time()), cr))
        try:
            j = F.yget(p)
            out = {}
            for res in ((j.get("timeseries") or {}).get("result") or []):
                t = (res.get("meta") or {}).get("type", ["?"])[0]
                vals = res.get(t) or []
                out[t] = [(v.get("asOfDate"), v.get("periodType"), (v.get("reportedValue") or {}).get("raw"), v.get("currencyCode")) for v in vals if v][-5:]
            print(" ts", s, json.dumps(out)[:1500])
        except Exception as e:
            print(" ts", s, "ERR", e)
        time.sleep(0.3)
    if mk == "kr":
        for s in syms:
            code = s.split(".")[0]
            req = urllib.request.Request("https://m.stock.naver.com/api/stock/%s/integration" % code,
                                         headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
            try:
                doc = json.loads(urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "replace"))
                ti = {t.get("code"): t.get("value") for t in (doc.get("totalInfos") or [])}
                print(" naver", s, {k: ti.get(k) for k in ("per", "eps", "cnsPer", "cnsEps", "pbr", "marketValue")}, list(ti)[:25])
            except Exception as e:
                print(" naver", s, "ERR", e)
            time.sleep(0.2)
