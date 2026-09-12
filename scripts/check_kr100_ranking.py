#!/usr/bin/env python3
"""지금 시가총액 상위 100 과 국내 화면의 대상 목록을 견주어 **차이를 적어 둔다**.

이 스크립트는 목록을 고치지 않는다
  평일마다 돌면서 ranking.json 만 남긴다. 실제 교체는 주 1회
  scripts/update_kr100_list.py 가 이 파일을 읽어서 한다 — 새 종목의 검색 키워드와
  기업 개요를 함께 지어 넣어야 화면이 비지 않기 때문에, 교체는 그쪽 한 곳에 모아 두었다.

순위를 어떻게 만드나
  야후 스크리너(region=kr, 시가총액 내림차순)로 상위 종목을 받는다. 우리 목록 종목의
  시총은 방금 수집한 data/kr100/latest.json 에서 읽어 같은 판의 값으로 맞춘다.

  **한국거래소(data.krx.co.kr)는 쓰지 않는다.** 전종목 시세를 주는 getJsonData 가
  GitHub 러너에서 HTTP 400 과 본문 `LOGOUT` 을 돌려준다 — Referer·쿠키·bld 를 바꿔
  네 가지로 시도해도 같았다(2026-09-09 확인). 거래소가 클라우드 IP 를 거부하는
  형태여서 헤더로 풀리는 문제가 아니다.

  스크리너 결과에서 걸러내는 것
    · 우선주 — 종목코드 끝자리가 0 이 아닌 것(005935 등). 같은 회사의 다른 종목이고,
      야후가 우선주에 보통주 기준 시가총액을 붙여 주는 일이 있어 순위를 망친다.
    · 스팩·리츠 — "기업이 아닌 것"이라 100대 기업의 모집단이 아니다.
    · 코스피·코스닥이 아닌 심볼(접미사가 .KS/.KQ 가 아닌 것).

내놓는 것
  data/kr100/ranking.json  — 데이터 브랜치에 함께 올라가고, 화면 ⑩ 섹션이 읽어 표시한다
  Actions 요약(::notice·단계 요약)  — 사람이 읽을 문장
  (선택) GitHub 이슈 하나를 만들거나 갱신한다 — GITHUB_TOKEN 과 KR100_RANK_ISSUE=1 일 때

스크리너가 응답하지 않으면 **ranking.json 을 쓰지 않는다.** 반쯤 맞는 순위를 올리면
화면이 "목록이 일치합니다" 라고 잘못 말하게 되므로, 그럴 때는 경고만 남기고 끝낸다.

쓰는 법
  python scripts/check_kr100_ranking.py
"""

import datetime
import json
import os
import re
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_kr100                                          # noqa: E402  국내 시장 프로필
import fetch_us100 as F                                     # noqa: E402  수집 엔진(목록 파싱·HTTP)

TOP = 100
DROP_RANK = 150          # 이 순위 밖으로 밀리면 교체 후보로 본다(경계에서 오가는 잡음을 걸러낸다)
REPORT_MAX = 12          # 사람이 읽는 보고에 적는 최대 줄 수(파일에는 전부 남는다)
PAGE = 100               # 스크리너가 한 번에 주는 행 수
PAGES = 4                # 상위 400위까지 받는다(TOP·DROP_RANK 판정에 넉넉하다)

SYM_RE = re.compile(r"^(\d{6})\.(KS|KQ)$")
# 기업이 아닌 것 — 이름으로 걸러낸다. 야후의 국내 종목명은 영문·한글이 섞여 온다.
EXCLUDE_RE = re.compile(r"스팩|기업인수목적|리츠|위탁관리부동산|인프라투융자|SPAC|REIT", re.I)


def won(v):
    """조·억원으로 적는다 — 화면의 표기와 같은 규칙."""
    if v is None:
        return "—"
    a = abs(v)
    if a >= 1e12:
        return "%s조원" % format(round(a / 1e12, 0 if a >= 1e14 else 1), ",")
    if a >= 1e8:
        return "%s억원" % format(int(round(a / 1e8)), ",")
    return "%s원" % format(int(round(a)), ",")


def screener_page(offset, size=PAGE):
    """야후 스크리너 — region=kr, 시가총액 내림차순. crumb 이 있어야 한다."""
    body = {
        "size": size, "offset": offset,
        "sortField": "intradaymarketcap", "sortType": "DESC",
        "quoteType": "EQUITY",
        "query": {"operator": "AND", "operands": [
            {"operator": "eq", "operands": ["region", "kr"]}]},
        "userId": "", "userIdType": "guid",
    }
    url = ("https://query2.finance.yahoo.com/v1/finance/screener?lang=en-US&region=US"
           + ("&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""))
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                 headers=dict(F.HDRS, **{"Content-Type": "application/json"}))
    with F._OPENER.open(req, timeout=F.TIMEOUT) as r:
        j = json.loads(r.read().decode("utf-8", "replace"))
    res = ((j.get("finance") or {}).get("result") or [])
    if not res:
        raise RuntimeError("스크리너 응답에 result 가 없다")
    return res[0].get("quotes") or [], res[0].get("total")


def screener_universe():
    """{심볼: {cap, name, market}} — 우선주·스팩·리츠를 걸러낸 상위 종목."""
    out, total, dropped = {}, None, 0
    for page in range(PAGES):
        rows, total = screener_page(page * PAGE)
        if not rows:
            break
        for q in rows:
            sym = q.get("symbol") or ""
            m = SYM_RE.match(sym)
            cap = F.num(q.get("marketCap"))
            if not m or not cap:
                dropped += 1
                continue
            if not m.group(1).endswith("0"):
                dropped += 1                     # 우선주 — 같은 회사의 다른 종목이다
                continue
            name = (q.get("shortName") or q.get("longName") or sym).strip()
            if EXCLUDE_RE.search(name):
                dropped += 1
                continue
            out[sym] = {"cap": cap, "name": name,
                        "market": "코스피" if m.group(2) == "KS" else "코스닥"}
        if len(rows) < PAGE:
            break
    if len(out) < 200:
        raise RuntimeError("스크리너에서 쓸 수 있는 종목이 %d개뿐이다" % len(out))
    print("야후 스크리너: 국내 %s종목 중 상위 %d개 확보(우선주·스팩·리츠 등 %d개 제외)"
          % (total, len(out), dropped), flush=True)
    return out, total


def our_caps():
    """방금 수집한 스냅샷에서 우리 목록의 시가총액을 읽는다(같은 판의 값으로 순위를 매긴다)."""
    path = os.path.join(F.OUT_DIR, "latest.json")
    if not os.path.exists(path) or os.path.getsize(path) < 1000:
        print("스냅샷이 없다 — 우리 목록의 시총은 스크리너 값에만 의존한다", flush=True)
        return {}
    try:
        d = json.load(open(path, encoding="utf-8"))
    except Exception as e:                                # noqa: BLE001
        print("::warning::latest.json 을 읽지 못했다 — %s" % e)
        return {}
    caps = {}
    for sym, c in (d.get("companies") or {}).items():
        cap = F.num((c.get("quote") or {}).get("cap"))
        if cap:
            caps[sym] = cap
    print("스냅샷 %s · 시총이 있는 종목 %d개" % (d.get("fetchedAt"), len(caps)), flush=True)
    return caps


def open_or_update_issue(body):
    """알림용 이슈 하나를 만들거나 갱신한다 — 실패해도 점검 결과를 망가뜨리지 않는다."""
    tok = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    if not tok or not repo or os.environ.get("KR100_RANK_ISSUE") != "1":
        return None
    title = "대상 목록 갱신 후보 (국내 100대 기업)"
    api = "https://api.github.com/repos/" + repo
    hdr = {"Authorization": "Bearer " + tok, "Accept": "application/vnd.github+json",
           "User-Agent": "kr100-ranking"}

    def call(url, data=None, method=None):
        req = urllib.request.Request(
            url, data=json.dumps(data).encode("utf-8") if data is not None else None,
            headers=dict(hdr, **({"Content-Type": "application/json"} if data else {})), method=method)
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8", "replace") or "{}")

    try:
        for it in call(api + "/issues?state=open&per_page=50"):
            if it.get("title") == title:
                call(api + "/issues/%d" % it["number"], {"body": body}, "PATCH")
                return it["html_url"]
        return (call(api + "/issues", {"title": title, "body": body}) or {}).get("html_url")
    except Exception as e:                                # noqa: BLE001
        print("::warning::이슈를 만들지 못했다 — %s" % e)
        return None


def main():
    fetch_kr100.configure()
    companies = F.companies_from_page()
    have = [c["sym"] for c in companies]
    ko = {c["sym"]: c["ko"] for c in companies}

    F.init_crumb(rounds=2)
    try:
        universe, total = screener_universe()
    except Exception as e:                                # noqa: BLE001
        # 반쯤 맞는 순위를 올리지 않는다 — 화면이 "일치합니다" 라고 잘못 말하게 된다.
        print("::warning::시가총액 순위를 받지 못해 목록 점검을 건너뛴다 — %s" % e)
        return 0

    # 우리 목록의 시총은 스냅샷 값으로 맞추고, 스크리너에 없던 종목도 순위에 넣는다
    snap = our_caps()
    for sym, cap in snap.items():
        if sym in universe:
            universe[sym]["cap"] = cap
        else:
            m = SYM_RE.match(sym)
            universe[sym] = {"cap": cap, "name": ko.get(sym, sym),
                             "market": "코스닥" if (m and m.group(2) == "KQ") else "코스피"}

    ranked = sorted(universe.items(), key=lambda kv: -kv[1]["cap"])
    rank = {sym: i + 1 for i, (sym, _) in enumerate(ranked)}
    top = [sym for sym, _ in ranked[:TOP]]

    add = [{"sym": s, "name": universe[s]["name"], "cap": universe[s]["cap"],
            "rank": rank[s], "market": universe[s]["market"]}
           for s in top if s not in have]
    drop = sorted(
        [{"sym": s, "ko": ko.get(s, s), "cap": universe[s]["cap"], "rank": rank[s]}
         for s in have if s in rank and rank[s] > DROP_RANK],
        key=lambda r: r["rank"])
    unknown = [s for s in have if s not in rank]

    out = {
        "builtAt": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)
                   .isoformat().replace("+00:00", "Z"),
        "source": "screener", "universe": len(universe), "krTotal": total,
        "top": TOP, "dropRank": DROP_RANK,
        "add": add, "drop": drop, "unknown": unknown, "deduped": [],
        "ourRanks": {s: rank.get(s) for s in have},
        "top100": top,
        "note": ("유니버스 = 야후 스크리너(region=kr) 시총 상위 + 이 화면의 목록. "
                 "우선주·스팩·리츠는 제외한다. 이 파일을 읽어 주 1회 "
                 "scripts/update_kr100_list.py 가 목록을 갈아 끼운다."),
    }
    os.makedirs(F.OUT_DIR, exist_ok=True)
    with open(os.path.join(F.OUT_DIR, "ranking.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("ranking.json 저장 (유니버스 %d · 추가 후보 %d · 밀린 종목 %d · 순위 미확인 %d)"
          % (len(universe), len(add), len(drop), len(unknown)), flush=True)

    lines = []
    if add:
        lines.append("**목록에 없는 상위 %d 종목 %d개**" % (TOP, len(add)))
        for r in add[:REPORT_MAX]:
            lines.append("- `%s` %s — %s · 현재 %d위 · %s"
                         % (r["sym"].split(".")[0], r["name"], won(r["cap"]), r["rank"], r["market"]))
        if len(add) > REPORT_MAX:
            lines.append("- … 그 밖에 %d개 (ranking.json 에 전부 있습니다)" % (len(add) - REPORT_MAX))
    if drop:
        lines.append("")
        lines.append("**목록에 있으나 %d위 밖으로 밀린 종목 %d개**" % (DROP_RANK, len(drop)))
        for r in drop[:REPORT_MAX]:
            lines.append("- `%s` %s — %s · 현재 %d위"
                         % (r["sym"].split(".")[0], r["ko"], won(r["cap"]), r["rank"]))
        if len(drop) > REPORT_MAX:
            lines.append("- … 그 밖에 %d개" % (len(drop) - REPORT_MAX))
    if unknown:
        lines.append("")
        lines.append("시총을 확인하지 못한 종목(상장폐지·합병·코드 변경일 수 있습니다): "
                     + ", ".join("`%s`" % s.split(".")[0] for s in unknown))

    if not add and not drop and not unknown:
        msg = "대상 목록이 지금 시가총액 상위 %d 과 일치한다(유니버스 %d)." % (TOP, len(universe))
        print("::notice::" + msg)
        body = None
    else:
        msg = ("대상 목록 갱신 후보 — 추가 %d개 / 밀린 종목 %d개 / 확인 실패 %d개"
               % (len(add), len(drop), len(unknown)))
        print("::notice::" + msg)
        body = ("유니버스는 **야후 스크리너(region=kr) 시총 상위 + 이 화면의 목록**입니다"
                "(우선주·스팩·리츠 제외).\n\n"
                + "\n".join(lines)
                + "\n\n교체는 **주 1회(금요일 17:00 KST) 자동으로** 이뤄집니다 — "
                  "`scripts/update_kr100_list.py` 가 이 결과를 읽어 `kr-top100.html` 의 "
                  "`COMPANIES`·`KEYWORDS`·`PROFILE_KO` 를 함께 고칩니다. 들어오려면 90위 안, "
                  "나가려면 110위 밖이어야 하고 한 번에 최대 5종목까지만 바뀌므로, 위 후보가 "
                  "모두 이번 주에 반영되지는 않습니다.\n\n"
                  "이 글은 목록 점검이 돌 때마다 자동으로 갱신됩니다.")

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write("### 대상 목록 점검 (국내)\n\n" + msg + "\n\n" + ("\n".join(lines) if lines else "") + "\n")
    if body:
        url = open_or_update_issue(body)
        if url:
            print("::notice::이슈에 적어 두었다 — " + url)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
