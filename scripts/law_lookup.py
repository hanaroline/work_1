#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""받아 둔 법령에서 조문을 찾아 원문 그대로 찍는다.

망을 쓰지 않는다. `scripts/fetch_law.py` 가 러너에서 받아 커밋해 둔
`data/law/` 만 읽으므로, law.go.kr 에 못 붙는 세션에서도 조문을 인용할 수 있다.

    python3 scripts/law_lookup.py --list                # 무엇을 받아 뒀는지
    python3 scripts/law_lookup.py 자본시장법 55          # 제55조
    python3 scripts/law_lookup.py 자본시장법 55의2       # 제55조의2
    python3 scripts/law_lookup.py 자본시장법 55-58       # 제55조부터 제58조까지
    python3 scripts/law_lookup.py --grep 손실보전        # 받아 둔 전부에서 찾기

찍히는 머리글에 **시행일자와 받은 때**가 같이 나온다. 시행일이 다르면 다른
조문이므로, 자료에 옮길 때는 그 줄을 함께 적는다.

끝 상태(exit code)
    0  찾았다
    1  못 찾았다
    2  받아 둔 자료가 없다 — 먼저 수집을 돌려야 한다
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "law")
INDEX = os.path.join(OUT, "index.json")


def squash(s):
    return re.sub(r"[\s·ㆍ‧・]", "", s or "")


def load_index():
    if not os.path.exists(INDEX):
        print("!! data/law/index.json 이 없다. 아직 아무것도 받지 않았다.\n"
              "   bash scripts/request_law_refresh.sh  (러너에 수집을 부른다)",
              file=sys.stderr)
        sys.exit(2)
    with open(INDEX, encoding="utf-8") as f:
        return json.load(f)


def find_law(index, name):
    """이름·약칭의 일부만 대도 찾는다. 여러 개면 후보를 보여 주고 멈춘다."""
    want = squash(name)
    laws = index.get("법령", [])
    exact = [l for l in laws
             if want in (squash(l["법령명"]), squash(l.get("약칭", "")))]
    if len(exact) == 1:
        return exact[0], None
    hits = [l for l in laws
            if want in squash(l["법령명"]) or want in squash(l.get("약칭", ""))]
    if len(hits) == 1:
        return hits[0], None
    if not hits:
        return None, "받아 둔 법령 중에 '%s' 이(가) 없다. --list 로 목록을 본다." % name
    # 시행령·시행규칙까지 걸린 경우 — 가장 짧은 이름(본법)을 먼저 보여 준다
    cand = ", ".join(sorted((l["법령명"] for l in hits), key=len)[:6])
    return None, "'%s' 에 걸리는 것이 여럿이다: %s" % (name, cand)


def load_articles(law):
    path = os.path.join(ROOT, law["파일"]["조문"])
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def header(law, index):
    return ("%s (%s) — 시행 %s, %s %s호\n출처 국가법령정보센터 · 받은 때 %s"
            % (law["법령명"], law.get("구분", ""), law.get("시행일자", "?"),
               law.get("공포일자", "?"), law.get("공포번호", "?"),
               index.get("수집시각", "?")))


def label(a):
    s = "제%s조" % a.get("조문번호", "")
    br = str(a.get("조문가지번호", "") or "")
    if br and br.strip("0"):
        s += "의%s" % br.lstrip("0")
    return s


def render(a):
    """찍을 본문. 조문내용이 이미 "제55조(…)" 로 시작하면 머리글을 덧대지 않는다."""
    body = a.get("본문", "")
    return body if body.lstrip().startswith("제%s조" % a.get("조문번호", "")) \
        else (label(a) + "\n" + body)


def branch_of(a):
    return str(a.get("조문가지번호", "") or "").lstrip("0")


def want_numbers(spec):
    """'55' / '55의2' / '55-58' 을 조문을 고르는 조건으로 바꾼다."""
    m = re.fullmatch(r"제?(\d+)조?의(\d+)", spec)
    if m:
        return lambda a: (a.get("조문번호") == m.group(1)
                          and branch_of(a) == m.group(2))
    m = re.fullmatch(r"제?(\d+)조?\s*[-~]\s*제?(\d+)조?", spec)
    if m:
        # 범위에는 가지 조문(제55조의2)도 넣는다. 제55조부터 제58조까지라고
        # 하면 그 사이에 낀 가지 조문도 읽고 싶은 것이 보통이다.
        lo, hi = int(m.group(1)), int(m.group(2))
        return lambda a: a.get("조문번호", "").isdigit() and lo <= int(a["조문번호"]) <= hi
    m = re.fullmatch(r"제?(\d+)조?", spec)
    if m:
        # 제55조는 제55조의2 가 아니다. 가지번호가 붙은 것은 빼고 준다.
        return lambda a: a.get("조문번호") == m.group(1) and not branch_of(a)
    return None


def main():
    ap = argparse.ArgumentParser(description="받아 둔 법령에서 조문 찾기")
    ap.add_argument("법령", nargs="?", help="법령명 또는 약칭의 일부")
    ap.add_argument("조문", nargs="?", help="55 / 55의2 / 55-58")
    ap.add_argument("--list", action="store_true", help="받아 둔 법령 목록")
    ap.add_argument("--grep", help="본문에서 말을 찾는다")
    args = ap.parse_args()

    index = load_index()

    if args.list:
        print("받은 때 %s — %s" % (index.get("수집시각", "?"), index.get("출처", "")))
        for l in index.get("법령", []):
            print("  %-46s %-8s 시행 %s  조문 %d"
                  % (l["법령명"], l.get("구분", ""), l.get("시행일자", "?"),
                     l.get("조문수", 0)))
        bad = [k for k, v in index.get("sources", {}).items() if not v.get("ok")]
        if bad:
            print("\n못 받은 것: " + ", ".join(bad))
        return 0

    if args.grep:
        needle = args.grep
        found = 0
        for l in index.get("법령", []):
            if args.법령 and squash(args.법령) not in squash(l["법령명"]) \
               and squash(args.법령) not in squash(l.get("약칭", "")):
                continue
            for a in load_articles(l):
                if needle in a["본문"] or needle in a.get("조문제목", ""):
                    found += 1
                    print("\n── %s %s%s"
                          % (l["법령명"], label(a),
                             "(%s)" % a["조문제목"] if a.get("조문제목") else ""))
                    print("   시행 %s" % l.get("시행일자", "?"))
                    print(render(a))
        if not found:
            print("'%s' 이(가) 든 조문이 없다." % needle, file=sys.stderr)
            return 1
        print("\n%d개 조문에서 찾았다." % found)
        return 0

    if not args.법령:
        ap.print_help()
        return 1

    law, err = find_law(index, args.법령)
    if err:
        print("!! " + err, file=sys.stderr)
        return 1

    arts = load_articles(law)
    if not arts:
        print("!! %s 의 조문 파일이 비었다. 수집을 다시 돌려야 한다." % law["법령명"],
              file=sys.stderr)
        return 1

    print(header(law, index))
    print("=" * 60)

    if not args.조문:
        for a in arts:
            print("  %s%s" % (label(a),
                              "(%s)" % a["조문제목"] if a.get("조문제목") else ""))
        print("\n조문 %d개. 본문을 보려면 조문 번호를 붙인다: "
              "python3 scripts/law_lookup.py %s 55" % (len(arts), args.법령))
        return 0

    match = want_numbers(args.조문)
    if match is None:
        print("!! 조문 지정을 알아듣지 못했다: %s (보기: 55, 55의2, 55-58)" % args.조문,
              file=sys.stderr)
        return 1

    hits = [a for a in arts if match(a)]
    if not hits:
        print("!! %s 에 %s 가 없다." % (law["법령명"], args.조문), file=sys.stderr)
        return 1
    for a in hits:
        print()
        print(render(a))
    return 0


if __name__ == "__main__":
    sys.exit(main())
