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

print("=== 1. quote keys per region ===")
for r in ["kr", "us", "jp", "cn", "hk"]:
    j = q([reg(r)])
    R, err = res(j)
    if err: print(r, "ERR", err); continue
    qs = R.get("quotes") or []
    print(r, "total", R.get("total"), "first", [x.get("symbol") for x in qs])
    if qs and r == "us":
        print("  keys:", sorted(qs[0].keys()))
    if qs:
        x = qs[0]
        print("  sample", {k: x.get(k) for k in ["symbol", "shortName", "marketCap", "trailingPE", "forwardPE", "sector", "industry", "exchange", "financialCurrency", "currency"]})

print("=== 2. industry / sector filter ===")
for f, v in [("industry", "Semiconductors"), ("sector", "Technology"), ("industry", "semiconductors")]:
    R, err = res(q([reg("us"), {"operator": "eq", "operands": [f, v]}]))
    print(f, v, err or (R.get("total"), [x.get("symbol") for x in R.get("quotes") or []]))

print("=== 3. revenue/op income fields as sort and gt filter ===")
for fld in ["totalrevenues.lasttwelvemonths", "operatingincome.lasttwelvemonths", "ebit.lasttwelvemonths",
            "peratio.lasttwelvemonths", "netincomeis.lasttwelvemonths"]:
    R, err = res(q([reg("us")], sort=fld))
    print("sort", fld, err or (R.get("total"), [x.get("symbol") for x in R.get("quotes") or []]))
    R, err = res(q([reg("us"), {"operator": "gt", "operands": [fld, 1e10 if 'pe' not in fld else 0]}]))
    print("  gt", fld, err or (R.get("total"),))

print("=== 4. records response with includeFields ===")
inc = ["ticker", "companyshortname", "intradaymarketcap", "industry", "sector",
       "totalrevenues.lasttwelvemonths", "operatingincome.lasttwelvemonths",
       "peratio.lasttwelvemonths", "ebit.lasttwelvemonths"]
for extra in ["&useRecordsResponse=true", "&useRecordsResponse=true&formatted=false"]:
    j = q([reg("kr")], size=3, extra=extra, includeFields=inc)
    R, err = res(j)
    if err: print(extra, "ERR", err); continue
    print(extra, "keys", sorted(R.keys()))
    recs = R.get("records") or R.get("quotes") or []
    for x in recs[:3]:
        print("  ", json.dumps(x, ensure_ascii=False)[:900])

print("=== 5. industry values seen (kr top 50 via records) ===")
j = q([reg("kr")], size=50, extra="&useRecordsResponse=true", includeFields=inc)
R, err = res(j)
if not err:
    for x in (R.get("records") or [])[:50]:
        print("  ", x.get("ticker"), x.get("companyShortName") or x.get("companyshortname"), "|", x.get("industry"), "|", x.get("sector"))
