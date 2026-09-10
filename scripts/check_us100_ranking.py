#!/usr/bin/env python3
"""지금 시가총액 상위 100 과 화면의 대상 목록을 견주어 **갱신 후보만 알려 준다**.

목록을 자동으로 갈아치우지 않는 이유
  화면의 한글 자산(기업명·검색 키워드·"기업 한눈에" 개요)은 종목마다 사람이 쓴 것이다.
  자동 교체는 한글이 빈 종목이 조용히 섞여 들어오는 방식이 된다. 그래서 이 스크립트는
  차이만 보고하고, 실제 교체는 한글을 채우는 커밋으로 한다.

순위를 어떻게 만드나
  기준 유니버스는 **S&P 500 구성종목 + 우리 목록**이다. S&P 500 은 미국에 본사를 둔
  기업만 담으므로 "미국 100대 기업"의 모집단으로 맞다.
  야후 스크리너(시총 내림차순)는 **보조**로만 쓴다 — region=us 는 "미국에 상장"이라는
  뜻이어서 TSM·ASML·텐센트·삼성전자 같은 외국 기업과 같은 회사의 OTC 중복 티커
  (ASMLF·TCTZF·RHHBF…)가 상위를 채운다. 그래서 스크리너에서 온 종목은
  ① 정규 거래소(NMS·NYQ 등)에 있고 ② assetProfile.country 가 미국이고
  ③ 우리 목록에 있는 회사와 같은 이름이 아닐 때만(GOOG·BRK-A 같은 복수 클래스 제외)
  후보로 올린다.
  우리 목록의 시총은 방금 수집한 data/us100/latest.json 에서 읽는다(요청을 아낀다).

내놓는 것
  data/us100/ranking.json  — 데이터 브랜치에 함께 올라가고, 화면 ⑩ 섹션이 읽어 표시한다
  Actions 요약(::notice·단계 요약)  — 사람이 읽을 문장
  (선택) GitHub 이슈 하나를 만들거나 갱신한다 — GITHUB_TOKEN 과 US100_RANK_ISSUE=1 일 때

쓰는 법
  python scripts/check_us100_ranking.py
"""

import csv
import datetime
import io
import json
import os
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_us100 as F                                    # noqa: E402
from fetch_us100 import OUT_DIR, companies_from_page, init_crumb, num, yget   # noqa: E402

TOP = 100
DROP_RANK = 150          # 이 순위 밖으로 밀리면 교체 후보로 본다(경계에서 오가는 잡음을 걸러낸다)
UNIVERSE = 260           # 스크리너에서 받아 볼 상위 개수(보조 경로)
EXTRA_LOOKUPS = 30       # 스크리너 후보의 본사 소재지를 확인할 최대 개수(요청을 묶어 둔다)
REPORT_MAX = 12          # 사람이 읽는 보고에 적는 최대 줄 수(파일에는 전부 남는다)
OK_EXCHANGES = ("NMS", "NYQ", "NGM", "ASE", "NCM", "NYS")   # 정규 거래소 — OTC(PNK 등)는 제외
SP500_CSV = "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv"
OUT = os.path.join(OUT_DIR, "ranking.json")


def _post_json(url, payload):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"),
        headers=dict(F.HDRS, **{"Content-Type": "application/json"}))
    with F._OPENER.open(req, timeout=F.TIMEOUT) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def screener_ranking(size=UNIVERSE):
    """야후 스크리너 — 미국 상장 보통주를 시총 내림차순으로. 250개씩 두 번까지."""
    if not F.CRUMB:
        raise RuntimeError("crumb 없음")
    out = {}
    offset = 0
    while offset < size:
        page = min(250, size - offset)
        payload = {
            "size": page, "offset": offset,
            "sortField": "intradaymarketcap", "sortType": "DESC",
            "quoteType": "EQUITY", "topOperator": "AND",
            "query": {"operator": "AND", "operands": [
                {"operator": "or", "operands": [
                    {"operator": "EQ", "operands": ["region", "us"]}]}]},
            "userId": "", "userIdType": "guid",
        }
        url = ("https://query2.finance.yahoo.com/v1/finance/screener?crumb="
               + urllib.parse.quote(F.CRUMB) + "&lang=en-US&region=US&formatted=false")
        j = _post_json(url, payload)
        res = ((j.get("finance") or {}).get("result") or [])
        quotes = (res[0].get("quotes") if res else []) or []
        if not quotes:
            break
        for q in quotes:
            sym = q.get("symbol")
            cap = num(q.get("marketCap"))
            if not sym or not cap:
                continue
            out[sym] = {"cap": cap, "name": q.get("shortName") or q.get("longName") or sym,
                        "exch": q.get("exchange") or ""}
        offset += page
        if len(quotes) < page:
            break
    if len(out) < 120:
        raise RuntimeError("스크리너 결과가 %d개다" % len(out))
    return out, "screener"


def sp500_ranking():
    """대체 경로 — S&P 500 구성종목을 받아 시총을 일괄 조회한다."""
    with urllib.request.urlopen(
            urllib.request.Request(SP500_CSV, headers={"User-Agent": F.UA}), timeout=F.TIMEOUT) as r:
        txt = r.read().decode("utf-8", "replace")
    syms = []
    for row in csv.DictReader(io.StringIO(txt)):
        s = (row.get("Symbol") or row.get("symbol") or "").strip()
        if s:
            syms.append(s.replace(".", "-"))          # BRK.B → BRK-B (야후 표기)
    if len(syms) < 400:
        raise RuntimeError("구성종목이 %d개다" % len(syms))
    out = {}
    for i in range(0, len(syms), 50):
        chunk = syms[i:i + 50]
        path = ("/v7/finance/quote?symbols=" + ",".join(urllib.parse.quote(s) for s in chunk)
                + ("&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""))
        try:
            j = yget(path)
        except Exception as e:                        # noqa: BLE001
            print("  일괄 시세 실패(%d~): %s" % (i, e), flush=True)
            continue
        for q in ((j.get("quoteResponse") or {}).get("result") or []):
            sym, cap = q.get("symbol"), num(q.get("marketCap"))
            if sym and cap:
                out[sym] = {"cap": cap, "name": q.get("shortName") or q.get("longName") or sym}
    if len(out) < 300:
        raise RuntimeError("시총을 받은 종목이 %d개다" % len(out))
    return out, "sp500"


def our_caps():
    """방금 수집한 스냅샷에서 우리 목록의 **시총만** 읽는다(요청을 아낀다).

    이름은 넣지 않는다 — 여기서 회사 이름 자리에 업종 같은 것을 넣어 두면 아래
    중복 정리(같은 이름 = 같은 회사)가 엉뚱하게 묶어 버린다."""
    path = os.path.join(OUT_DIR, "latest.json")
    if not os.path.exists(path):
        return {}
    try:
        d = json.load(open(path, encoding="utf-8"))
    except Exception:                                 # noqa: BLE001
        return {}
    out = {}
    for sym, c in (d.get("companies") or {}).items():
        cap = ((c.get("quote") or {}).get("cap"))
        if cap:
            out[sym] = cap
    return out


def dedupe_universe(universe, have):
    """같은 회사의 여러 티커를 하나로 줄인다 — GOOGL/GOOG, BRK-B/BRK-A, FOXA/FOX 처럼
    복수 클래스가 각각 순위를 차지하면 상위 100이 회사 100곳이 아니게 된다.
    우리 목록에 있는 쪽을 남기고, 없으면 시총이 큰 쪽을 남긴다."""
    groups = {}
    for sym, rec in universe.items():
        key = norm_name(rec.get("name")) or sym
        groups.setdefault(key, []).append(sym)
    dropped = []
    for syms in groups.values():
        if len(syms) < 2:
            continue
        keep = next((s for s in syms if s in have), None)
        if keep is None:
            keep = max(syms, key=lambda s: universe[s]["cap"])
        for s in syms:
            if s != keep:
                dropped.append({"sym": s, "sameAs": keep, "name": universe[s].get("name")})
    for r in dropped:
        universe.pop(r["sym"], None)
    return dropped


def country_of(sym):
    """후보의 본사 소재지 — 스크리너 상위에는 미국에 상장한 외국 기업(ADR: TSM·ASML 등)도
    들어온다. "미국 100대 기업" 목록에 넣을지는 사람이 판단해야 하므로 함께 적어 준다."""
    try:
        path = ("/v10/finance/quoteSummary/" + urllib.parse.quote(sym)
                + "?modules=assetProfile&formatted=false&corsDomain=finance.yahoo.com"
                + ("&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""))
        j = yget(path)
        res = ((j.get("quoteSummary") or {}).get("result") or [{}])[0]
        return (res.get("assetProfile") or {}).get("country")
    except Exception:                                 # noqa: BLE001
        return None


def usd(v):
    if v is None:
        return "—"
    for unit, div in (("T", 1e12), ("B", 1e9), ("M", 1e6)):
        if abs(v) >= div:
            return "$%.2f%s" % (v / div, unit)
    return "$%d" % v


def open_or_update_issue(body):
    """알림용 이슈 하나를 만들거나 갱신한다 — 실패해도 수집 결과를 망가뜨리지 않는다."""
    tok = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    if not tok or not repo or os.environ.get("US100_RANK_ISSUE") != "1":
        return None
    title = "대상 목록 갱신 후보 (미국 100대 기업)"
    api = "https://api.github.com/repos/" + repo
    hdr = {"Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json",
           "User-Agent": "us100-ranking"}

    def call(url, data=None, method=None):
        req = urllib.request.Request(
            url, data=json.dumps(data).encode("utf-8") if data is not None else None,
            headers=dict(hdr, **({"Content-Type": "application/json"} if data else {})), method=method)
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8", "replace") or "{}")

    try:
        found = None
        for it in call(api + "/issues?state=open&per_page=50"):
            if it.get("title") == title:
                found = it
                break
        if found:
            call(api + "/issues/%d" % found["number"], {"body": body}, "PATCH")
            return found["html_url"]
        made = call(api + "/issues", {"title": title, "body": body})
        return made.get("html_url")
    except Exception as e:                            # noqa: BLE001
        print("::warning::이슈를 만들지 못했다 — %s" % e)
        return None


def norm_name(v):
    """같은 회사의 다른 클래스·다른 티커를 걸러내기 위한 이름 정규화.
    'Alphabet Inc.' 와 'Alphabet Inc' , 'Berkshire Hathaway Inc.' 와 '… Inc. Class B' 를
    같은 회사로 본다."""
    v = (v or "").lower()
    for junk in (" inc.", " inc", " corporation", " corp.", " corp", " company", " co.",
                 " plc.", " plc", " ltd.", " ltd", " limited", " holdings", " holding",
                 " class a", " class b", " class c", " - new york registry shares", ","):
        v = v.replace(junk, " ")
    parts = v.split()
    while parts and len(parts[-1]) == 1:              # "… B", "… A" 같은 클래스 표기
        parts.pop()
    return " ".join(parts)[:18]


def main():
    ours = companies_from_page()
    have = [c["sym"] for c in ours]
    ko = {c["sym"]: c["ko"] for c in ours}
    en = {c["sym"]: c["en"] for c in ours}

    init_crumb(rounds=2)

    # (1) 기준 유니버스 — S&P 500(미국 본사 기업만 담는다) + 우리 목록
    try:
        universe, src = sp500_ranking()
    except Exception as e:                            # noqa: BLE001
        print("::warning::S&P 500 경로 실패 — %s" % e)
        universe, src = {}, "none"

    # (2) 우리 목록의 시총은 방금 수집한 스냅샷 값으로 맞춘다(같은 판의 값으로 순위를 매긴다)
    snap = our_caps()
    for sym, cap in snap.items():
        if sym in universe:
            universe[sym]["cap"] = cap
        else:
            universe[sym] = {"cap": cap, "name": en.get(sym, sym)}
    # S&P 500 에도 없고 스냅샷에도 없는 우리 종목(예: 미국 상장 외국 기업 TSM·ASML,
    # 방금 목록에 넣어 아직 수집되지 않은 종목)은 시총을 직접 받아 순위에 넣는다.
    missing = [s for s in have if s not in universe]
    if missing:
        print("시총이 없는 목록 종목 %d개를 직접 받는다: %s" % (len(missing), ", ".join(missing)), flush=True)
        for i in range(0, len(missing), 50):
            chunk = missing[i:i + 50]
            path = ("/v7/finance/quote?symbols=" + ",".join(urllib.parse.quote(x) for x in chunk)
                    + ("&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""))
            try:
                j = yget(path)
            except Exception as e:                    # noqa: BLE001
                print("  일괄 조회 실패: %s" % e, flush=True)
                continue
            for q in ((j.get("quoteResponse") or {}).get("result") or []):
                sym, cap = q.get("symbol"), num(q.get("marketCap"))
                if sym and cap:
                    universe[sym] = {"cap": cap,
                                     "name": q.get("shortName") or en.get(sym) or sym}
        still = [x for x in have if x not in universe]
        if still:
            print("  끝까지 확인하지 못한 종목: %s" % ", ".join(still), flush=True)

    if len(universe) < 200:
        print("::warning::유니버스가 %d개뿐이다 — 점검을 건너뛴다" % len(universe))
        return 0

    # (3) 보조 경로 — 스크리너 상위에서 "S&P 500 에도 없고 우리 목록에도 없는" 미국 기업을 줍는다.
    #     외국 기업·OTC 중복 티커·복수 클래스를 여기서 걸러낸다.
    ours_names = set(norm_name(en[s]) for s in have)
    ours_names |= set(norm_name(universe[s].get("name")) for s in have if s in universe)
    ours_names.discard("")
    extra = {}
    try:
        scr, _ = screener_ranking()
        cands = sorted(scr.items(), key=lambda kv: -kv[1]["cap"])
        looked = 0
        for sym, rec in cands:
            if sym in universe or looked >= EXTRA_LOOKUPS:
                continue
            if rec.get("exch") and rec["exch"] not in OK_EXCHANGES:
                continue                              # OTC 등 — 같은 회사의 중복 티커가 대부분이다
            if norm_name(rec["name"]) in ours_names:
                continue                              # GOOG·BRK-A 처럼 이미 담은 회사의 다른 클래스
            looked += 1
            ctry = country_of(sym)
            if ctry != "United States":
                continue                              # 미국에 상장했을 뿐인 외국 기업(ADR)
            extra[sym] = dict(rec, country=ctry)
            ours_names.add(norm_name(rec["name"]))
        print("스크리너 보조: 확인 %d개 중 미국 기업 %d개를 유니버스에 더한다" % (looked, len(extra)), flush=True)
    except Exception as e:                            # noqa: BLE001
        print("스크리너 보조를 건너뛴다 — %s" % e, flush=True)
    universe.update(extra)

    # (4) 같은 회사의 여러 티커를 하나로 줄인다(복수 클래스·ADR 중복)
    deduped = dedupe_universe(universe, set(have))
    if deduped:
        print("중복 티커 %d개를 정리했다: %s"
              % (len(deduped), ", ".join("%s→%s" % (r["sym"], r["sameAs"]) for r in deduped[:8])), flush=True)

    ranked = sorted(universe.items(), key=lambda kv: -kv[1]["cap"])
    rank = {sym: i + 1 for i, (sym, _) in enumerate(ranked)}
    top = [sym for sym, _ in ranked[:TOP]]

    add = []
    for s in top:
        if s in have:
            continue
        rec = universe[s]
        add.append({"sym": s, "name": rec["name"], "cap": rec["cap"], "rank": rank[s],
                    "country": rec.get("country"), "exch": rec.get("exch")})
    drop = [{"sym": s, "ko": ko.get(s, s), "cap": universe[s]["cap"], "rank": rank[s]}
            for s in have if s in rank and rank[s] > DROP_RANK]
    drop.sort(key=lambda r: r["rank"])
    unknown = [s for s in have if s not in rank]

    out = {
        "builtAt": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "source": src, "universe": len(universe), "top": TOP, "dropRank": DROP_RANK,
        "add": add, "drop": drop, "unknown": unknown, "deduped": deduped,
        "ourRanks": {s: rank.get(s) for s in have},
        "top100": top,
        "note": ("유니버스 = S&P 500 + 이 화면의 목록 + 스크리너에서 확인한 미국 기업. "
                 "목록은 사람이 관리한다 — 이 파일은 갱신 후보만 알려 준다(한글명·기업 개요를 함께 채워야 하기 때문)."),
    }
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("ranking.json 저장 (유니버스 %d · 추가 후보 %d · 밀린 종목 %d)"
          % (len(universe), len(add), len(drop)), flush=True)

    lines = []
    if add:
        lines.append("**목록에 없는 상위 %d 종목 %d개**" % (TOP, len(add)))
        for r in add[:REPORT_MAX]:
            tail = ""
            if r.get("exch") and r["exch"] not in OK_EXCHANGES:
                tail = " · 거래소 %s" % r["exch"]
            elif not r.get("exch") and r.get("country"):
                tail = " · 스크리너 보조 경로에서 찾은 종목(상장 형태를 확인해 주세요)"
            lines.append("- `%s` %s — %s · 현재 %d위%s"
                         % (r["sym"], r["name"], usd(r["cap"]), r["rank"], tail))
        if len(add) > REPORT_MAX:
            lines.append("- … 그 밖에 %d개 (ranking.json 에 전부 있습니다)" % (len(add) - REPORT_MAX))
    if drop:
        lines.append("")
        lines.append("**목록에 있으나 %d위 밖으로 밀린 종목 %d개**" % (DROP_RANK, len(drop)))
        for r in drop[:REPORT_MAX]:
            lines.append("- `%s` %s — %s · 현재 %d위" % (r["sym"], r["ko"], usd(r["cap"]), r["rank"]))
        if len(drop) > REPORT_MAX:
            lines.append("- … 그 밖에 %d개" % (len(drop) - REPORT_MAX))
    if unknown:
        lines.append("")
        lines.append("순위를 확인하지 못한 종목: " + ", ".join("`%s`" % s for s in unknown))

    if not add and not drop:
        msg = "대상 목록이 지금 시가총액 상위 %d 과 일치한다(%d위 기준, 유니버스 %d)." % (TOP, DROP_RANK, len(universe))
        print("::notice::" + msg)
        body = None
    else:
        msg = ("대상 목록 갱신 후보 — 추가 %d개 / 밀린 종목 %d개 (유니버스 %d, %s)"
               % (len(add), len(drop), len(universe), out["builtAt"]))
        print("::notice::" + msg)
        body = ("유니버스는 **S&P 500 + 이 화면의 목록 + 스크리너에서 확인한 미국 기업**입니다"
                "(미국에 상장한 외국 기업과 같은 회사의 중복 티커는 제외).\n\n"
                + "\n".join(lines)
                + "\n\n교체는 자동으로 하지 않습니다 — 새 종목의 **한글명·검색 키워드·기업 개요**를 "
                  "함께 채워야 화면이 비지 않기 때문입니다. 바꾸려면 `us-top100.html` 의 "
                  "`COMPANIES`·`KEYWORDS`·`PROFILE_KO` 를 함께 고치면 됩니다.\n\n"
                  "이 글은 매일 수집 때 자동으로 갱신됩니다.")

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write("### 대상 목록 점검\n\n" + msg + "\n\n" + ("\n".join(lines) if lines else "") + "\n")
    if body:
        url = open_or_update_issue(body)
        if url:
            print("::notice::이슈에 적어 두었다 — " + url)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
