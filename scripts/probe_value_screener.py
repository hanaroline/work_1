#!/usr/bin/env python3
"""Temporary probe: what the Yahoo screener returns for whole-market industry data."""
import json, sys, urllib.parse, urllib.request
sys.path.insert(0, 'scripts')
import fetch_us100 as F

F.init_crumb()

def post(body, extra=''):
    url = ("https://query2.finance.yahoo.com/v1/finance/screener?lang=en-US&region=US" + extra
           + ("&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""))
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers=dict(F.HDRS, **{"Content-Type": "application/json"}))
    try:
        with F._OPENER.open(req, timeout=F.TIMEOUT) as r:
            return json.loads(r.read().decode("utf-8", "replace"))
    except Exception as e:
        try:
            return {"_err": str(e), "_body": e.read().decode()[:400]}
        except Exception:
            return {"_err": str(e)}

def q(ops, size=3, sort="intradaymarketcap", extra='', **kw):
    body = {"size": size, "offset": 0, "sortField": sort, "sortType": "DESC",
            "quoteType": "EQUITY", "query": {"operator": "AND", "operands": ops},
            "userId": "", "userIdType": "guid"}
    body.update(kw)
    return post(body, extra)

def res(j):
    if "_err" in j:
        return None, j
    r = ((j.get("finance") or {}).get("result") or [None])[0] or {}
    return r, None

reg = lambda r: {"operator": "eq", "operands": ["region", r]}

inc = ["ticker", "companyshortname", "intradaymarketcap", "industry", "sector",
       "totalrevenues.lasttwelvemonths", "operatingincome.lasttwelvemonths", "peratio.lasttwelvemonths"]
X = "&useRecordsResponse=true"
print("=== A. extra field names ===")
for f in ["exchange", "currency", "financialcurrency", "country", "region", "quotetype", "netincomeis.lasttwelvemonths", "dilutedeps.lasttwelvemonths", "lastclosemarketcap.lasttwelvemonths", "eodprice"]:
    R, err = res(q([reg("us")], size=2, extra=X, includeFields=inc + [f]))
    recs = (R or {}).get("records") or []
    print(f, err or [{k: v for k, v in r.items() if k not in ("companyName", "sector")} for r in recs[:2]])
print("=== B. page size ===")
for sz in [100, 250, 500]:
    R, err = res(q([reg("jp")], size=sz, extra=X, includeFields=inc))
    print(sz, err or (R.get("count"), len(R.get("records") or [])))
print("=== C. us exchange filter ===")
ex = {"operator": "or", "operands": [{"operator": "eq", "operands": ["exchange", e]} for e in ["NMS", "NYQ", "NGM", "NCM", "ASE"]]}
R, err = res(q([reg("us"), ex], size=5, extra=X, includeFields=inc))
print(err or (R.get("total"), [r.get("ticker") for r in R.get("records")]))
R, err = res(q([reg("us"), ex, {"operator": "eq", "operands": ["industry", "Semiconductors"]}], size=10, extra=X, includeFields=inc + ["exchange"]))
print(err or (R.get("total"), [(r.get("ticker"), r.get("totalRevenueLtm")) for r in R.get("records")]))
print("=== D. ADR currency check: TSM, ASML, BABA, TM revenue ===")
for t in ["TSM", "ASML", "BABA", "TM", "NVDA"]:
    R, err = res(q([{"operator": "eq", "operands": ["ticker", t]}], size=1, extra=X, includeFields=inc))
    print(t, err or [(r.get("ticker"), r.get("totalRevenueLtm"), r.get("peRatioLtm"), r.get("marketCap")) for r in R.get("records") or []])
print("=== E. cn / jp / hk sample ===")
for r_ in ["cn", "jp", "hk"]:
    R, err = res(q([reg(r_)], size=5, extra=X, includeFields=inc))
    print(r_, err or [(r.get("ticker"), r.get("companyName"), r.get("industry"), r.get("totalRevenueLtm"), r.get("operatingIncomeLtm"), r.get("peRatioLtm")) for r in R.get("records")])
