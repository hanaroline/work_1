#!/usr/bin/env python3
"""지금 시가총액 상위 100 과 국내 화면의 대상 목록을 견주어 **갱신 후보만 알려 준다**.

목록을 자동으로 갈아치우지 않는 이유
  화면의 한글 자산(검색 키워드·"기업 한눈에" 개요)은 종목마다 사람이 쓴 것이다.
  자동 교체는 개요가 빈 종목이 조용히 섞여 들어오는 방식이 된다. 그래서 이 스크립트는
  차이만 보고하고, 실제 교체는 개요를 채우는 커밋으로 한다.

순위를 어떻게 만드나
  한국거래소 정보데이터시스템(data.krx.co.kr)의 **전종목 시세**를 받아 유가증권·코스닥을
  한 판에 놓고 시가총액으로 줄을 세운다. 미국 쪽 점검(check_us100_ranking.py)이
  S&P 500 + 스크리너로 모집단을 어림해야 했던 것과 달리, 국내는 거래소가 전 종목
  시가총액을 그대로 주므로 모집단을 추정할 필요가 없다.

  우선주·리츠·스팩·ETF 는 "기업"이 아니거나 같은 회사의 다른 종목이므로 제외한다
  (종목코드 끝자리가 0 이 아닌 것이 우선주, 이름으로 걸러지는 것이 스팩·리츠다).

내놓는 것
  data/kr100/ranking.json  — 데이터 브랜치에 함께 올라가고, 화면 ⑩ 섹션이 읽어 표시한다
  Actions 요약(::notice·단계 요약)  — 사람이 읽을 문장
  (선택) GitHub 이슈 하나를 만들거나 갱신한다 — GITHUB_TOKEN 과 KR100_RANK_ISSUE=1 일 때

거래소가 응답하지 않으면 **ranking.json 을 쓰지 않는다.** 반쯤 맞는 순위를 올리면
화면이 "목록이 일치합니다" 라고 잘못 말하게 되므로, 그럴 때는 경고만 남기고 끝낸다.

쓰는 법
  python scripts/check_kr100_ranking.py
"""

import datetime
import json
import os
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_kr100                                          # noqa: E402  국내 시장 프로필
import fetch_us100 as F                                     # noqa: E402  수집 엔진(목록 파싱)

TOP = 100
DROP_RANK = 150          # 이 순위 밖으로 밀리면 교체 후보로 본다(경계에서 오가는 잡음을 걸러낸다)
REPORT_MAX = 12          # 사람이 읽는 보고에 적는 최대 줄 수(파일에는 전부 남는다)
BACK_DAYS = 10           # 휴장일이면 하루씩 앞으로 물러나며 다시 물어본다

KRX_URL = "https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd"
KRX_BLD = "dbms/MDC/STAT/standard/MDCSTAT01501"          # 전종목 시세(시가총액 포함)
KRX_REFERER = "https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd"

# 기업이 아니거나 같은 회사의 다른 종목 — 순위 모집단에서 뺀다
EXCLUDE_WORDS = ("스팩", "리츠", "기업인수목적", "인프라투융자", "위탁관리부동산투자")


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


def krx_all_stocks(day):
    """그 날짜의 전종목 시세. 휴장일이면 빈 목록이 온다."""
    body = urllib.parse.urlencode({
        "bld": KRX_BLD, "locale": "ko_KR", "mktId": "ALL",
        "trdDd": day, "share": "1", "money": "1", "csvxls_isNo": "false",
    }).encode("utf-8")
    req = urllib.request.Request(KRX_URL, data=body, headers={
        "User-Agent": F.UA, "Referer": KRX_REFERER,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
    })
    with urllib.request.urlopen(req, timeout=F.TIMEOUT) as r:
        j = json.loads(r.read().decode("utf-8", "replace"))
    return j.get("OutBlock_1") or j.get("output") or []


def krx_universe():
    """가장 최근 영업일의 전종목 시가총액. {심볼: {cap, name, market}}"""
    today = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).date()
    last_err = None
    for back in range(BACK_DAYS):
        day = (today - datetime.timedelta(days=back)).strftime("%Y%m%d")
        try:
            rows = krx_all_stocks(day)
        except Exception as e:                            # noqa: BLE001
            last_err = e
            print("  %s 조회 실패 — %s" % (day, e), flush=True)
            continue
        if not rows:
            print("  %s 는 휴장(또는 자료 없음)" % day, flush=True)
            continue

        out = {}
        for r in rows:
            code = (r.get("ISU_SRT_CD") or "").strip()
            name = (r.get("ISU_ABBRV") or "").strip()
            mkt = (r.get("MKT_NM") or "").strip()
            cap = F.num(str(r.get("MKTCAP") or "").replace(",", ""))
            if len(code) != 6 or not code.isdigit() or not cap:
                continue
            if not code.endswith("0"):
                continue                                  # 우선주 — 같은 회사의 다른 종목이다
            if mkt not in ("KOSPI", "KOSDAQ", "KOSDAQ GLOBAL"):
                continue                                  # 코넥스 등은 "100대 기업"의 모집단이 아니다
            if any(w in name for w in EXCLUDE_WORDS):
                continue
            sym = code + (".KS" if mkt == "KOSPI" else ".KQ")
            out[sym] = {"cap": cap, "name": name, "market": "코스피" if mkt == "KOSPI" else "코스닥"}
        if len(out) < 1000:
            print("  %s 응답이 %d종목뿐이다 — 다음 날짜로" % (day, len(out)), flush=True)
            continue
        print("한국거래소 %s 기준 %d종목" % (day, len(out)), flush=True)
        return out, day
    raise RuntimeError("최근 %d일 안에서 전종목 시세를 받지 못했다 (마지막 오류: %s)" % (BACK_DAYS, last_err))


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

    try:
        universe, day = krx_universe()
    except Exception as e:                                # noqa: BLE001
        # 반쯤 맞는 순위를 올리지 않는다 — 화면이 "일치합니다" 라고 잘못 말하게 된다.
        print("::warning::한국거래소 전종목 시세를 받지 못해 목록 점검을 건너뛴다 — %s" % e)
        return 0

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
        "source": "krx", "tradeDate": day, "universe": len(universe),
        "top": TOP, "dropRank": DROP_RANK,
        "add": add, "drop": drop, "unknown": unknown, "deduped": [],
        "ourRanks": {s: rank.get(s) for s in have},
        "top100": top,
        "note": ("유니버스 = 한국거래소 전종목 시세(유가증권·코스닥, 우선주·스팩·리츠 제외). "
                 "목록은 사람이 관리한다 — 이 파일은 갱신 후보만 알려 준다(기업 개요를 함께 채워야 하기 때문)."),
    }
    os.makedirs(F.OUT_DIR, exist_ok=True)
    with open(os.path.join(F.OUT_DIR, "ranking.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("ranking.json 저장 (유니버스 %d · 추가 후보 %d · 밀린 종목 %d)"
          % (len(universe), len(add), len(drop)), flush=True)

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
        lines.append("거래소 자료에서 찾지 못한 종목(상장폐지·합병·코드 변경일 수 있습니다): "
                     + ", ".join("`%s`" % s.split(".")[0] for s in unknown))

    if not add and not drop and not unknown:
        msg = "대상 목록이 %s 기준 시가총액 상위 %d 과 일치한다(유니버스 %d)." % (day, TOP, len(universe))
        print("::notice::" + msg)
        body = None
    else:
        msg = ("대상 목록 갱신 후보 — 추가 %d개 / 밀린 종목 %d개 / 확인 실패 %d개 (%s 기준)"
               % (len(add), len(drop), len(unknown), day))
        print("::notice::" + msg)
        body = ("유니버스는 **한국거래소 전종목 시세**입니다(유가증권·코스닥, 우선주·스팩·리츠 제외).\n\n"
                + "\n".join(lines)
                + "\n\n교체는 자동으로 하지 않습니다 — 새 종목의 **검색 키워드·기업 개요**를 함께 "
                  "채워야 화면이 비지 않기 때문입니다. 바꾸려면 `kr-top100.html` 의 "
                  "`COMPANIES`·`KEYWORDS`·`PROFILE_KO` 를 함께 고치면 됩니다.\n\n"
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
