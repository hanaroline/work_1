#!/usr/bin/env python3
"""us-top100.html 의 대상 100개 목록을 안전하게 갈아 끼우는 도구.

왜 스크립트인가
  목록은 `us-top100.html` 한 곳에만 있고(수집기도 이 배열을 읽는다), 종목 하나를
  바꾸려면 네 곳을 함께 고쳐야 한다 — COMPANIES · PROFILE_KO · KEYWORDS · FOREIGN.
  한 곳이라도 빠지면 화면에서 그 종목만 이름이 비거나 "기업 한눈에"가 빈 채로 나온다.
  주마다 자동으로 도는 작업이 손으로 고치는 것과 같은 실수를 하지 않도록,
  고치는 절차와 검사를 여기 묶어 둔다.

무엇을 하지 않는가
  **무엇을 넣고 뺄지는 정하지 않는다.** 후보와 안전장치만 알려 주고(report),
  실제 교체는 넘겨받은 계획서대로만 한다(apply). 새 종목의 한글명·기업 개요는
  사람(또는 주간 자동 작업을 맡은 Claude)이 써서 계획서에 담아 넘긴다 —
  영문 요약을 기계적으로 옮기면 화면의 다른 99개와 말투도 깊이도 어긋난다.

쓰는 법
  python scripts/us100_list_tool.py report
      지금 목록과 ranking.json 을 견주어 "바꿔도 되는" 후보만 추린다.
      (안전장치를 통과한 것만 나온다 — 아래 상수 참고)

  python scripts/us100_list_tool.py apply --plan plan.json
      계획서대로 네 곳을 함께 고치고, 고친 뒤 검사까지 한다.
      plan.json 형식:
        {
          "add": [{"sym": "LRCX", "en": "Lam Research", "ko": "램리서치",
                   "sector": "it", "keywords": "반도체 장비 식각",
                   "foreign": null,
                   "profile": ["주력사업 한 줄", "개요 서너 문장", "키워드·키워드"]}],
          "drop": ["AMT"]
        }

  python scripts/us100_list_tool.py validate
      고치지 않고 검사만 한다(목록 100개·중복 없음·개요 누락 없음·JS 문법).
"""

import argparse
import datetime
import urllib.error
import urllib.request
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "us-top100.html")
RANKING = os.path.join(ROOT, "data", "us100", "ranking.json")

TARGET = 100            # 목록은 언제나 정확히 100개
ADD_RANK_MAX = 100      # 편입 후보는 지금 시총 100위 안에 있어야 한다
DROP_RANK_MIN = 130     # 제외 후보는 130위 밖으로 밀려나 있어야 한다(순위가 오가는 구간은 건드리지 않는다)
MAX_SWAPS = 3           # 한 번에 세 종목까지 — 화면이 주마다 낯설어지지 않게
PROTECTED = {"TSM", "ASML"}   # 사용자가 명시적으로 담아 달라고 한 종목은 순위와 무관하게 둔다
CHART = "https://query1.finance.yahoo.com/v8/finance/chart/%s?range=1mo&interval=1d"
UA = {"User-Agent": "Mozilla/5.0 (compatible; us100-list-tool)"}


def tradable(sym, timeout=12):
    """이 심볼이 실제로 시세를 주는지 본다.

    순위 화면에는 상장 형태가 다른 것들이 섞여 들어온다(비상장 평가액이 스크리너에
    잡히거나, 막 상장해 시세가 아직 얇거나). 그런 것을 목록에 넣으면 그 종목만
    "미조회"로 남아 화면에 구멍이 생긴다. 넣기 전에 한 번 불러 본다.
    반환값: (되는가, 사유, 야후가 아는 이름)
    """
    try:
        req = urllib.request.Request(CHART % sym, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            j = json.load(r)
    except urllib.error.HTTPError as e:
        return False, "HTTP %s" % e.code, None
    except Exception as e:                                  # noqa: BLE001 — 망 문제도 "확인 못 함"이다
        return False, str(e)[:80], None
    res = ((j.get("chart") or {}).get("result") or [None])[0]
    if not res:
        return False, "시세 없음", None
    meta = res.get("meta") or {}
    closes = (((res.get("indicators") or {}).get("quote") or [{}])[0] or {}).get("close") or []
    got = [c for c in closes if c is not None]
    if len(got) < 5:
        return False, "일봉이 %d개뿐" % len(got), meta.get("longName")
    return True, "일봉 %d개 · %s" % (len(got), meta.get("fullExchangeName") or "?"), meta.get("longName")


# ---------------------------------------------------------------- 읽기

def read_page():
    with open(PAGE, encoding="utf-8") as f:
        return f.read()


def block(src, head, close):
    """`var X = [` … `\\n];` 같은 덩어리의 (시작, 끝) 위치. 끝은 닫는 줄의 시작."""
    i = src.find(head)
    if i < 0:
        raise SystemExit("%s 를 찾지 못했다" % head.strip())
    j = src.find("\n" + close, i)
    if j < 0:
        raise SystemExit("%s 의 끝(%s)을 찾지 못했다" % (head.strip(), close))
    return i + len(head), j + 1


ROW_RE = re.compile(r"\[\s*'([^']+)'\s*,\s*(?:'([^']*)'|\"([^\"]*)\")\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*\]")


def companies(src):
    a, b = block(src, "var COMPANIES = [", "];")
    out = []
    for sym, en1, en2, ko, sector in ROW_RE.findall(src[a:b]):
        out.append({"sym": sym, "en": en1 or en2, "ko": ko, "sector": sector})
    return out


def profile_syms(src):
    a, b = block(src, "var PROFILE_KO = {", "};")
    return set(re.findall(r"^\s{2}'?([A-Z][A-Z0-9.-]*)'?:\s*\[", src[a:b], re.M))


def sector_codes(src):
    """섹터 코드는 화면의 SECTORS 맵이 정답이다 — 여기에 또 적어 두면 어긋난다."""
    a, b = block(src, "var SECTORS = {", "};")
    return set(re.findall(r"^\s{2}([a-z]+):", src[a:b], re.M))


def comma_ready(body):
    """덩어리 끝에 새 항목을 붙이기 전에, 마지막 줄이 쉼표로 끝나게 한다.
    마지막 항목에는 쉼표를 생략해 둔 곳이 있어(FOREIGN) 그대로 이어 붙이면 문법이 깨진다."""
    lines = body.rstrip("\n").split("\n")
    for i in range(len(lines) - 1, -1, -1):
        t = lines[i].rstrip()
        if not t or t.lstrip().startswith(("//", "/*", "*")):
            continue
        if not t.endswith(","):
            lines[i] = t + ","
        break
    return "\n".join(lines)


def js_key(sym):
    """BRK-B 처럼 하이픈이 든 심볼은 키를 따옴표로 감싸야 한다."""
    return sym if re.match(r"^[A-Za-z_$][A-Za-z0-9_$]*$", sym) else "'" + sym + "'"


# ---------------------------------------------------------------- 쓰기

def js_str(s):
    """작은따옴표 JS 문자열. 한글 개요에 따옴표가 섞여도 깨지지 않게."""
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ") + "'"


def drop_from_companies(src, syms):
    a, b = block(src, "var COMPANIES = [", "];")
    body = src[a:b]
    keep = []
    for line in body.split("\n"):
        m = re.match(r"\s*\['([^']+)'", line)
        if m and m.group(1) in syms:
            continue
        keep.append(line)
    return src[:a] + "\n".join(keep) + src[b:]


def add_to_companies(src, adds):
    a, b = block(src, "var COMPANIES = [", "];")
    body = comma_ready(src[a:b])
    lines = [body, "  /* 주간 목록 점검으로 편입한 종목(scripts/us100_list_tool.py) */"]
    for c in adds:
        lines.append("  [%s,%s,%s,%s]," % (js_str(c["sym"]), js_str(c["en"]), js_str(c["ko"]), js_str(c["sector"])))
    return src[:a] + "\n".join(lines) + "\n" + src[b:]


def drop_from_profile(src, syms):
    a, b = block(src, "var PROFILE_KO = {", "};")
    lines = src[a:b].split("\n")
    keep, skipping = [], False
    for line in lines:
        m = re.match(r"\s{2}'?([A-Z][A-Z0-9.-]*)'?:\s*\[", line)
        if m:
            skipping = m.group(1) in syms
        if not skipping:
            keep.append(line)
        if skipping and re.search(r"\],\s*$", line):
            skipping = False
    return src[:a] + "\n".join(keep) + src[b:]


def add_to_profile(src, adds):
    a, b = block(src, "var PROFILE_KO = {", "};")
    body = comma_ready(src[a:b])
    lines = [body]
    for c in adds:
        p = c["profile"]
        lines.append("  %s: [%s," % (js_key(c["sym"]), js_str(p[0])))
        lines.append("    %s," % js_str(p[1]))
        lines.append("    %s]," % js_str(p[2]))
    return src[:a] + "\n".join(lines) + "\n" + src[b:]


def edit_map(src, head, syms_out, adds_in):
    """KEYWORDS·FOREIGN 처럼 한 줄에 여러 항목이 섞인 맵을 고친다."""
    a, b = block(src, head, "};")
    body = src[a:b]
    for s in syms_out:
        body = re.sub(r"'?\b" + re.escape(s) + r"\b'?:\s*(?:'[^']*'|\[[^\]]*\])\s*,\s*", "", body)
    if adds_in:
        body = comma_ready(body) + "\n" + "\n".join(adds_in)
    else:
        body = body.rstrip("\n")
    return src[:a] + body + "\n" + src[b:]


def bump_build(src):
    m = re.search(r"var BUILD = '([^']+)';", src)
    if not m:
        return src
    today = datetime.date.today().strftime("%Y-%m-%d")
    prev = m.group(1)
    n = 1
    if prev.startswith(today + "."):
        try:
            n = int(prev.split(".")[-1]) + 1
        except ValueError:
            n = 2
    return src[:m.start(1)] + "%s.%d" % (today, n) + src[m.end(1):]


# ---------------------------------------------------------------- 검사

def validate(src, verbose=True):
    errs = []
    rows = companies(src)
    codes = sector_codes(src)
    syms = [c["sym"] for c in rows]
    if len(syms) != TARGET:
        errs.append("목록이 %d개다 — %d개여야 한다" % (len(syms), TARGET))
    dup = sorted({s for s in syms if syms.count(s) > 1})
    if dup:
        errs.append("중복된 심볼: %s" % ", ".join(dup))
    for c in rows:
        if not c["ko"].strip():
            errs.append("%s 에 한글명이 없다" % c["sym"])
        if c["sector"] not in codes:
            errs.append("%s 의 섹터 코드 '%s' 가 SECTORS 에 없다" % (c["sym"], c["sector"]))
    have = profile_syms(src)
    missing = [s for s in syms if s not in have]
    if missing:
        errs.append("기업 개요(PROFILE_KO)가 없는 종목: %s" % ", ".join(missing))
    stray = [s for s in sorted(have) if s not in syms]
    if stray:
        errs.append("목록에 없는데 개요만 남은 종목: %s" % ", ".join(stray))

    node = shutil.which("node")
    if node:
        blocks = re.findall(r'<script(?![^>]*type="application/json")[^>]*>(.*?)</script>', src, re.S)
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
            f.write("\n".join(blocks))
            tmp = f.name
        r = subprocess.run([node, "--check", tmp], capture_output=True, text=True)
        os.unlink(tmp)
        if r.returncode != 0:
            errs.append("자바스크립트 문법 오류:\n" + (r.stderr or "").strip()[:2000])
    elif verbose:
        print("  (node 가 없어 문법 검사는 건너뛴다)")

    if verbose:
        if errs:
            print("검사 실패:")
            for e in errs:
                print("  - " + e)
        else:
            print("검사 통과 — 종목 %d개, 개요 %d개, 문법 이상 없음" % (len(syms), len(have)))
    return errs


# ---------------------------------------------------------------- 명령

def cmd_report(a):
    src = read_page()
    rows = companies(src)
    ours = {c["sym"] for c in rows}
    print("지금 목록: %d개" % len(rows))

    path = a.ranking or RANKING
    if not os.path.exists(path):
        print("%s 가 없다 — 먼저 목록 점검을 돌려야 한다"
              "(git show origin/us100-data:data/us100/ranking.json > %s)" % (path, path))
        return 1
    rank = json.load(open(path, encoding="utf-8"))
    print("점검 시각: %s · 기준 %s" % (rank.get("builtAt"), rank.get("asOf") or rank.get("builtAt")))

    our_ranks = rank.get("ourRanks") or {}
    adds, drops = [], []
    for c in (rank.get("add") or []):
        r = c.get("rank")
        if c.get("sym") in ours or r is None or r > ADD_RANK_MAX:
            continue
        adds.append(c)
    for sym in sorted(ours):
        r = our_ranks.get(sym)
        if sym in PROTECTED or r is None or r <= DROP_RANK_MIN:
            continue
        drops.append({"sym": sym, "rank": r})

    adds.sort(key=lambda c: c["rank"])
    drops.sort(key=lambda c: -c["rank"])

    if not a.no_verify:
        ok, bad = [], []
        for c in adds[:12]:
            good, why, name = tradable(c["sym"])
            (ok if good else bad).append((c, why, name))
            if good:
                c["verified"] = why
                c["yahooName"] = name
        if bad and not ok:
            print("\n주의: 후보를 하나도 확인하지 못했다 — 이 자리에서 야후에 못 나가는 것일 수 있다"
                  "(사유 예: %s). --no-verify 로 확인 없이 볼 수 있지만, 그 상태로 apply 하지 말 것." % bad[0][1])
        for c, why, _ in bad:
            print("  건너뜀  %-6s %s" % (c["sym"], why))
        adds = [c for c, _, _ in ok]

    n = min(len(adds), len(drops), a.max_swaps)

    print("\n안전장치: 편입은 %d위 안, 제외는 %d위 밖, 한 번에 최대 %d종목, %s 는 제외하지 않음"
          % (ADD_RANK_MAX, DROP_RANK_MIN, a.max_swaps, "·".join(sorted(PROTECTED))))
    print("\n편입 후보 (%d개 중 상위 %d개를 쓸 수 있다)" % (len(adds), n))
    for c in adds[:max(n, 8)]:
        print("  %4s위  %-6s %-40s %s" % (c["rank"], c["sym"],
                                          (c.get("yahooName") or c.get("name") or "").strip(),
                                          c.get("verified") or ""))
    print("\n제외 후보 (%d개 중 하위 %d개를 쓸 수 있다)" % (len(drops), n))
    for c in drops[:max(n, 8)]:
        row = next((x for x in rows if x["sym"] == c["sym"]), {})
        print("  %4s위  %-6s %s" % (c["rank"], c["sym"], row.get("ko") or ""))

    if n == 0:
        print("\n→ 이번 주에 바꿀 것이 없다.")
        return 0
    print("\n→ 이번 주 교체 가능: %s  ↔  %s"
          % (", ".join(c["sym"] for c in adds[:n]), ", ".join(c["sym"] for c in drops[:n])))
    print("   (한글명·기업 개요를 채워 plan.json 을 만든 뒤 apply 로 넘긴다)")
    return 0


def cmd_apply(a):
    plan = json.load(open(a.plan, encoding="utf-8"))
    adds = plan.get("add") or []
    drops = plan.get("drop") or []

    src = read_page()
    rows = companies(src)
    ours = {c["sym"] for c in rows}

    errs = []
    if len(adds) != len(drops):
        errs.append("편입 %d개, 제외 %d개 — 목록이 %d개로 유지되지 않는다" % (len(adds), len(drops), TARGET))
    if len(adds) > a.max_swaps:
        errs.append("한 번에 %d개까지만 바꾼다(계획서에는 %d개)" % (a.max_swaps, len(adds)))
    for s in drops:
        if s in PROTECTED:
            errs.append("%s 는 제외 대상이 아니다" % s)
        if s not in ours:
            errs.append("%s 는 지금 목록에 없다" % s)
    for c in adds:
        for k in ("sym", "en", "ko", "sector", "profile"):
            if not c.get(k):
                errs.append("편입 항목에 %s 가 없다: %s" % (k, c.get("sym") or c))
        if c.get("sym") in ours:
            errs.append("%s 는 이미 목록에 있다" % c["sym"])
        if c.get("sector") and c["sector"] not in sector_codes(src):
            errs.append("%s 의 섹터 코드 '%s' 가 SECTORS 에 없다" % (c["sym"], c["sector"]))
        p = c.get("profile") or []
        if len(p) != 3 or not all(isinstance(x, str) and x.strip() for x in p):
            errs.append("%s 의 기업 개요는 [주력사업, 개요, 키워드] 세 줄이어야 한다" % c.get("sym"))
        elif len(p[1]) < 60:
            errs.append("%s 의 개요가 너무 짧다(%d자) — 다른 종목과 깊이가 어긋난다" % (c["sym"], len(p[1])))
    if not a.no_verify:
        for c in adds:
            if not c.get("sym"):
                continue
            good, why, name = tradable(c["sym"])
            if not good:
                errs.append("%s 의 시세를 확인하지 못했다(%s) — 목록에 넣으면 그 종목만 비어 보인다" % (c["sym"], why))
            else:
                print("확인  %-6s %s · %s" % (c["sym"], (name or "").strip(), why))
    if errs:
        print("계획서를 받아들일 수 없다:")
        for e in errs:
            print("  - " + e)
        return 2

    dropset = set(drops)
    src = drop_from_companies(src, dropset)
    src = add_to_companies(src, adds)
    src = drop_from_profile(src, dropset)
    src = add_to_profile(src, adds)
    src = edit_map(src, "var KEYWORDS = {", dropset,
                   ["  %s: %s," % (js_key(c["sym"]), js_str(c["keywords"])) for c in adds if c.get("keywords")])
    src = edit_map(src, "var FOREIGN = {", dropset,
                   ["  %s: [%s, %s]," % (js_key(c["sym"]), js_str(c["foreign"][0]), js_str(c["foreign"][1]))
                    for c in adds if c.get("foreign")])
    src = bump_build(src)

    errs = validate(src, verbose=False)
    if errs:
        print("고친 결과가 검사를 통과하지 못해 **쓰지 않았다**:")
        for e in errs:
            print("  - " + e)
        return 3

    if a.dry_run:
        print("검사 통과 — 그러나 --dry-run 이라 쓰지 않았다")
        return 0
    with open(PAGE, "w", encoding="utf-8") as f:
        f.write(src)
    build = re.search(r"var BUILD = '([^']+)';", src)
    print("반영했다 — 편입 %s / 제외 %s · 판 %s"
          % (", ".join(c["sym"] for c in adds), ", ".join(drops), build.group(1) if build else "?"))
    validate(src)
    return 0


def cmd_validate(a):
    return 1 if validate(read_page()) else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("report", help="지금 목록과 ranking.json 을 견주어 교체 후보를 추린다")
    r.add_argument("--ranking", help="ranking.json 경로(기본: data/us100/ranking.json)")
    r.add_argument("--max-swaps", type=int, default=MAX_SWAPS)
    r.add_argument("--no-verify", action="store_true", help="시세가 나오는지 확인하지 않는다(망이 막힌 자리에서만)")
    r.set_defaults(fn=cmd_report)

    p = sub.add_parser("apply", help="계획서대로 목록을 갈아 끼운다")
    p.add_argument("--plan", required=True)
    p.add_argument("--max-swaps", type=int, default=MAX_SWAPS)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--no-verify", action="store_true", help="시세 확인을 건너뛴다(권장하지 않음)")
    p.set_defaults(fn=cmd_apply)

    v = sub.add_parser("validate", help="고치지 않고 검사만 한다")
    v.set_defaults(fn=cmd_validate)

    a = ap.parse_args()
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
