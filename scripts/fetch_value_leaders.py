#!/usr/bin/env python3
"""Undervalued industry leaders among each country's top-100 by market cap (KR / US / JP / CN).

A company is picked when all three hold, measured against **every listed company of the
same country in the same Yahoo industry** (the ~145 fine-grained industries, not the 11 sectors):
  1. LTM revenue is in the industry's top 10%      (rank <= ceil(N * 0.10))
  2. LTM operating income is in the industry's top 10%
  3. LTM PER is positive and below the industry average PER

"Industry average PER" is reported three ways and the page lets the reader pick the basis:
  agg    = sum(market cap) / sum(market cap / PER) over members with PER > 0
           (cap-weighted, the usual "industry PER"; default)
  mean   = simple mean of PER over members with PER > 0
  median = median of PER over members with PER > 0

Source: Yahoo Finance screener (POST /v1/finance/screener), two passes per country over the
whole market sorted by market cap:
  records pass  (useRecordsResponse=true) -> industry, sector, totalRevenueLtm,
                operatingIncomeLtm, peRatioLtm, marketCap
  quotes pass   -> financialCurrency, exchange, names, quote time
Rows whose financial statements are not in the country's currency are dropped from the
population (e.g. TSM files in TWD, so its revenue would otherwise rank as if in USD).
Duplicate share classes (preferred shares, GOOG/GOOGL) are merged by company name, keeping
the larger market cap.

US top-100 also requires assetProfile.country == "United States" (ADRs and foreign issuers
that report in USD stay in the industry population but are not top-100 candidates).

Nothing is invented: a missing figure stays null and the company cannot pass a test that needs it.

Usage:
  python3 scripts/fetch_value_leaders.py [--market kr|us|jp|cn|all]
Writes data/value-leaders.json, data/value-leaders-report.md and embeds the data into
value-leaders.html between /*DATA-BEGIN*/ and /*DATA-END*/.
"""

import argparse
import json
import math
import os
import re
import statistics
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_us100 as F  # noqa: E402  (Yahoo cookie + crumb, opener, headers)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JSON = os.path.join(ROOT, "data", "value-leaders.json")
OUT_MD = os.path.join(ROOT, "data", "value-leaders-report.md")
HTML = os.path.join(ROOT, "value-leaders.html")
KST = timezone(timedelta(hours=9))

PAGE = 250          # screener refuses size > 250
TOP_N = 100
SHARE = 0.10

MARKETS = {
    "kr": {"region": "kr", "cur": "KRW", "lang": "ko-KR", "exch": None},
    # NYSE / Nasdaq (Global Select, Global, Capital) / NYSE American -- no OTC
    "us": {"region": "us", "cur": "USD", "lang": "en-US", "exch": ["NMS", "NYQ", "NGM", "NCM", "ASE"]},
    "jp": {"region": "jp", "cur": "JPY", "lang": "en-US", "exch": None},
    "cn": {"region": "cn", "cur": "CNY", "lang": "en-US", "exch": None},
}

INCLUDE = ["ticker", "companyshortname", "intradaymarketcap", "industry", "sector",
           "totalrevenues.lasttwelvemonths", "operatingincome.lasttwelvemonths",
           "peratio.lasttwelvemonths", "exchange"]

# not operating companies -- kept in their own industry population, never top-100 candidates
NOT_COMPANY_IND = {"Shell Companies"}
HANGUL = re.compile(r"[가-힣]")


def post(body, extra, lang):
    url = ("https://query2.finance.yahoo.com/v1/finance/screener?lang=%s&region=US" % lang + extra
           + ("&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""))
    last = None
    for attempt in range(4):
        if attempt:
            time.sleep(2 * attempt)
        req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                     headers=dict(F.HDRS, **{"Content-Type": "application/json"}))
        try:
            with F._OPENER.open(req, timeout=F.TIMEOUT) as r:
                j = json.loads(r.read().decode("utf-8", "replace"))
            res = ((j.get("finance") or {}).get("result") or [])
            if res:
                return res[0]
            last = "no result"
        except Exception as e:  # noqa: BLE001
            last = str(e)
    raise RuntimeError("screener failed: %s" % last)


def query_ops(m):
    ops = [{"operator": "eq", "operands": ["region", m["region"]]}]
    if m["exch"]:
        ops.append({"operator": "or", "operands": [
            {"operator": "eq", "operands": ["exchange", e]} for e in m["exch"]]})
    return {"operator": "AND", "operands": ops}


def sweep(m, records):
    """Every row of the market, market cap descending. records=True -> financial fields."""
    out, offset, total = [], 0, None
    while True:
        body = {"size": PAGE, "offset": offset, "sortField": "intradaymarketcap", "sortType": "DESC",
                "quoteType": "EQUITY", "query": query_ops(m), "userId": "", "userIdType": "guid"}
        extra = ""
        if records:
            body["includeFields"] = INCLUDE
            extra = "&useRecordsResponse=true"
        r = post(body, extra, m["lang"] if not records else "en-US")
        rows = (r.get("records") if records else r.get("quotes")) or []
        total = r.get("total") if total is None else total
        out.extend(rows)
        offset += PAGE
        if not rows or offset >= (total or 0):
            break
        time.sleep(0.35)
    return out, total


def num(v):
    return F.num(v)


def v7_quotes(syms, lang):
    """Fallback for symbols the quotes pass missed."""
    out = {}
    for i in range(0, len(syms), 50):
        chunk = syms[i:i + 50]
        path = ("/v7/finance/quote?lang=%s&symbols=" % lang + urllib.parse.quote(",".join(chunk))
                + ("&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""))
        try:
            j = F.yget(path)
            for q in ((j.get("quoteResponse") or {}).get("result") or []):
                out[q.get("symbol")] = q
        except Exception as e:  # noqa: BLE001
            print("  v7 quote fallback failed: %s" % e, flush=True)
    return out


def country_of(sym):
    path = ("/v10/finance/quoteSummary/" + urllib.parse.quote(sym) +
            "?modules=assetProfile&formatted=false" +
            ("&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""))
    for attempt in range(2):
        try:
            j = F.yget(path)
            res = (j.get("quoteSummary") or {}).get("result") or []
            if res:
                return (res[0].get("assetProfile") or {}).get("country")
            return None
        except Exception:  # noqa: BLE001
            time.sleep(1.5)
    return "?"


def build(mk):
    m = MARKETS[mk]
    print("== %s: records sweep" % mk, flush=True)
    recs, total_r = sweep(m, True)
    print("   %d rows (total %s)" % (len(recs), total_r), flush=True)
    print("== %s: quotes sweep" % mk, flush=True)
    quotes, total_q = sweep(m, False)
    print("   %d rows (total %s)" % (len(quotes), total_q), flush=True)
    qmap = {q.get("symbol"): q for q in quotes if q.get("symbol")}
    missing = [r.get("ticker") for r in recs if r.get("ticker") and r.get("ticker") not in qmap]
    if missing:
        print("   %d symbols missing from quotes pass -> v7 fallback" % len(missing), flush=True)
        qmap.update(v7_quotes(missing, m["lang"]))

    gaps = {"noQuote": 0, "foreignCurrency": 0, "noIndustry": 0, "dupClass": 0, "unknownCurrency": 0}
    foreign_examples = []
    rows = {}
    for r in recs:
        sym = r.get("ticker")
        if not sym:
            continue
        q = qmap.get(sym)
        if not q:
            gaps["noQuote"] += 1
            continue
        fc = q.get("financialCurrency")
        if not fc:
            gaps["unknownCurrency"] += 1
            continue
        if fc != m["cur"]:
            gaps["foreignCurrency"] += 1
            if len(foreign_examples) < 12:
                foreign_examples.append("%s(%s)" % (sym, fc))
            continue
        ind = r.get("industry")
        if not ind:
            gaps["noIndustry"] += 1
            continue
        cap = num(r.get("marketCap")) or num(q.get("marketCap"))
        pe = num(r.get("peRatioLtm"))
        row = {
            "sym": sym,
            "name": r.get("companyName") or q.get("longName") or q.get("shortName") or sym,
            "nameKo": None,
            "ind": ind, "sec": r.get("sector"),
            "ex": q.get("fullExchangeName") or q.get("exchange"),
            "cap": cap,
            "rev": num(r.get("totalRevenueLtm")),
            "op": num(r.get("operatingIncomeLtm")),
            "pe": pe if (pe is not None and pe > 0) else None,
            "peRaw": pe,
            "t": q.get("regularMarketTime"),
            "off": q.get("gmtOffSetMilliseconds"),
        }
        if mk == "kr":
            for k in ("shortName", "longName"):
                if q.get(k) and HANGUL.search(q.get(k)):
                    row["nameKo"] = q.get(k).strip()
                    break
        key = row["name"].strip().lower()
        prev = rows.get(key)
        if prev is not None:
            gaps["dupClass"] += 1
            if (prev["cap"] or 0) >= (cap or 0):
                continue
        rows[key] = row
    pop = list(rows.values())
    print("   population %d  gaps %s" % (len(pop), gaps), flush=True)

    # ---- industry statistics over the whole population
    by_ind = {}
    for x in pop:
        by_ind.setdefault(x["ind"], []).append(x)
    ind_stats = {}
    for ind, xs in by_ind.items():
        revs = sorted([x["rev"] for x in xs if x["rev"] is not None], reverse=True)
        ops = sorted([x["op"] for x in xs if x["op"] is not None], reverse=True)
        pes = [x for x in xs if x["pe"] is not None and x["cap"]]
        k_rev = max(1, math.ceil(len(revs) * SHARE)) if revs else None
        k_op = max(1, math.ceil(len(ops) * SHARE)) if ops else None
        st = {
            "sec": xs[0]["sec"],
            "n": len(xs), "nRev": len(revs), "nOp": len(ops), "nPe": len(pes),
            "kRev": k_rev, "kOp": k_op,
            "revCut": revs[k_rev - 1] if revs else None,
            "opCut": ops[k_op - 1] if ops else None,
            "peAgg": None, "peMean": None, "peMedian": None,
        }
        if pes:
            pv = [x["pe"] for x in pes]
            st["peMean"] = round(statistics.fmean(pv), 2)
            st["peMedian"] = round(statistics.median(pv), 2)
            earn = sum(x["cap"] / x["pe"] for x in pes)
            st["peAgg"] = round(sum(x["cap"] for x in pes) / earn, 2) if earn > 0 else None
        ind_stats[ind] = st

    def rank(x, field):
        v = x[field]
        if v is None:
            return None
        return 1 + sum(1 for y in by_ind[x["ind"]] if y[field] is not None and y[field] > v)

    # ---- top-100 candidates
    ranked = sorted([x for x in pop if x["cap"]], key=lambda x: -x["cap"])
    top, skipped = [], []
    for x in ranked:
        if len(top) >= TOP_N:
            break
        if x["ind"] in NOT_COMPANY_IND:
            skipped.append({"sym": x["sym"], "name": x["name"], "why": x["ind"]})
            continue
        if mk == "us":
            c = country_of(x["sym"])
            time.sleep(0.25)
            if c not in ("United States", "?"):
                skipped.append({"sym": x["sym"], "name": x["name"], "why": "HQ %s" % c})
                continue
            x["countryUnverified"] = (c == "?")
        top.append(x)

    co = []
    for i, x in enumerate(top, 1):
        st = ind_stats[x["ind"]]
        rr, ro = rank(x, "rev"), rank(x, "op")
        pe = x["pe"]
        item = {
            "capRank": i, "sym": x["sym"], "name": x["name"], "nameKo": x["nameKo"],
            "ind": x["ind"], "sec": x["sec"], "ex": x["ex"],
            "cap": x["cap"], "rev": x["rev"], "op": x["op"], "pe": pe,
            "peNeg": x["peRaw"] is not None and x["peRaw"] <= 0,
            "rRev": rr, "rOp": ro,
            "okRev": rr is not None and rr <= st["kRev"],
            "okOp": ro is not None and ro <= st["kOp"],
            "cheap": {b: (pe is not None and st[k] is not None and pe < st[k])
                      for b, k in (("agg", "peAgg"), ("mean", "peMean"), ("median", "peMedian"))},
        }
        if x.get("countryUnverified"):
            item["countryUnverified"] = True
        co.append(item)

    used = sorted({c["ind"] for c in co})
    times = [(x["t"], x["off"]) for x in top if isinstance(x["t"], (int, float))]
    as_of = None
    if times:
        t, off = max(times)
        as_of = datetime.fromtimestamp(t + (off or 0) / 1000, timezone.utc).strftime("%Y-%m-%d")
    picks = [c for c in co if c["okRev"] and c["okOp"] and c["cheap"]["agg"]]
    print("   top %d, picks(agg) %d, skipped %d" % (len(co), len(picks), len(skipped)), flush=True)
    return {
        "market": mk, "currency": m["cur"], "asOf": as_of,
        "screenerTotal": total_r, "population": len(pop), "industries": len(by_ind),
        "gaps": gaps, "foreignExamples": foreign_examples, "skipped": skipped,
        "ind": {k: ind_stats[k] for k in used}, "co": co,
    }


def embed(data):
    if not os.path.exists(HTML):
        print("value-leaders.html not found -- skip embed", flush=True)
        return
    s = open(HTML, encoding="utf-8").read()
    blob = "/*DATA-BEGIN*/window.VALUE_DATA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";/*DATA-END*/"
    s2, n = re.subn(r"/\*DATA-BEGIN\*/.*?/\*DATA-END\*/", lambda _: blob, s, flags=re.S)
    if n != 1:
        raise SystemExit("DATA markers not found exactly once in value-leaders.html")
    open(HTML, "w", encoding="utf-8").write(s2)


def report(data):
    lines = ["| 나라 | 기준일 | 모집단 | 업종 수 | 상위100 | 선정(시총가중) | 선정(단순평균) | 선정(중앙값) |",
             "|---|---|---|---|---|---|---|---|"]
    for mk in ("kr", "us", "jp", "cn"):
        d = data["markets"].get(mk)
        if not d:
            continue
        co = d["co"]
        cnt = lambda b: sum(1 for c in co if c["okRev"] and c["okOp"] and c["cheap"][b])
        lines.append("| %s | %s | %s | %s | %s | %s | %s | %s |" % (
            mk.upper(), d["asOf"], d["population"], d["industries"], len(co),
            cnt("agg"), cnt("mean"), cnt("median")))
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--market", default="all")
    a = ap.parse_args()
    mks = list(MARKETS) if a.market == "all" else a.market.split(",")
    F.init_crumb()
    if not F.CRUMB:
        raise SystemExit("no crumb -- screener needs it")
    data = {"markets": {}}
    if os.path.exists(OUT_JSON):
        try:
            data = json.load(open(OUT_JSON, encoding="utf-8"))
        except Exception:  # noqa: BLE001
            pass
    rc = 0
    for mk in mks:
        try:
            data["markets"][mk] = build(mk)
        except Exception as e:  # noqa: BLE001  keep the previous market data rather than write a half one
            print("!! %s failed: %s" % (mk, e), flush=True)
            rc = 1
    data["generated"] = datetime.now(KST).strftime("%Y-%m-%d %H:%M KST")
    data["source"] = "Yahoo Finance screener (LTM revenue / operating income / PER, industry)"
    data["rule"] = {"share": SHARE, "topN": TOP_N}
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    json.dump(data, open(OUT_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    open(OUT_MD, "w", encoding="utf-8").write(report(data))
    embed(data)
    print(report(data))
    return rc


if __name__ == "__main__":
    sys.exit(main())
