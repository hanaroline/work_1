#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""과거 어느 날 시행 중이던 조문을 받는다.

현행 수집(fetch_law.py)은 `target=law` + `MST` 로 **지금** 시행 중인 본문만
가져온다. 그런데 자료에 2021년 양도분을 인용하려면 그때의 조문이 필요하다.
시행일이 다르면 다른 조문이고, 개정으로 사라진 문언은 현행본에 남지 않는다.

받는 방법은 두 걸음이다.

  1. `lawSearch.do?target=eflaw&efYd=<범위>` 로 **시행본 목록**을 받는다.
     한 줄이 (시행일자, 공포본) 짝이고 공포본마다 법령일련번호가 붙어 있다.
  2. 원하는 날짜 이전에 시행된 것 중 가장 나중 것을 골라
     `lawService.do?target=law&MST=<그 번호>&JO=<조문>` 으로 그 조문만 받는다.

`JO` 를 붙이면 조문 하나만 와서 응답이 5KB 대로 줄어든다. 전문을 받으면
1MB 가 넘는다 — 연혁은 시점마다 받아야 하므로 이 차이가 크다.

시행일법령 본문 API(`target=eflaw` 본문)는 따로 신청해야 열린다. 신청 전에는
"공동활용 미신청" 안내가 오므로 여기서는 쓰지 않는다.

받은 뒤에는 **응답이 정말 그 시점 것인지 되짚는다.** 기본정보의 공포번호가
고른 것과 다르면 크게 찍는다 — 조용히 현행본을 과거 조문으로 인용하는 것이
이 도구가 막으려는 사고다.

    python scripts/fetch_law_history.py
    python scripts/fetch_law_history.py --law "소득세법 시행령" --jo 157 --at 2022-06-01
"""
import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_law import (get, search_items, squash, slugify, OUT, PAUSE,   # noqa: E402
                       basic_info, articles, admrul_articles, render, reachable)

KST = timezone(timedelta(hours=9))
HIST = os.path.join(OUT, "history")
CONF = os.path.join(OUT, "history_targets.json")


def jo_code(spec):
    """'157' → '015700', '1의2' → '000102'. JO 는 조 4자리 + 가지 2자리."""
    m = re.fullmatch(r"제?(\d+)조?(?:의(\d+))?", str(spec).strip())
    if not m:
        raise ValueError("조문 표기를 알아듣지 못했다: %r" % spec)
    return "%04d%02d" % (int(m.group(1)), int(m.group(2) or 0))


def jo_label(spec):
    m = re.fullmatch(r"제?(\d+)조?(?:의(\d+))?", str(spec).strip())
    return "제%s조%s" % (m.group(1), ("의" + m.group(2)) if m.group(2) else "")


def versions(oc, name, frm, to):
    """시행본 목록. [(시행일자, 공포일자, 공포번호, MST)] 를 돌려준다."""
    want = squash(name)
    rows, page = [], 1
    while page <= 10:
        data = get("lawSearch.do", {
            "OC": oc, "target": "eflaw", "type": "JSON", "query": name,
            "efYd": "%s~%s" % (frm, to), "display": 100, "page": page,
        })
        items = search_items(data)
        if not items:
            break
        for it in items:
            if squash(it.get("법령명한글", "")) != want:
                continue
            rows.append((str(it.get("시행일자") or ""), str(it.get("공포일자") or ""),
                         str(it.get("공포번호") or ""), str(it.get("법령일련번호") or "")))
        if len(items) < 100:
            break
        page += 1
        time.sleep(PAUSE)
    return sorted(set(rows))


def pick(rows, at):
    """`at`(YYYYMMDD) 당시 시행 중이던 본. 시행일이 같으면 나중에 공포된 것."""
    cand = [r for r in rows if r[0] and r[0] <= at]
    if not cand:
        return None
    return sorted(cand, key=lambda r: (r[0], r[1]))[-1]


def fetch_article(oc, mst, jo):
    return get("lawService.do", {"OC": oc, "target": "law", "type": "JSON",
                                 "MST": mst, "JO": jo})


def article_eff(arts):
    """조문 단위에 적힌 시행일자 중 가장 이른 것. 없으면 빈 문자열."""
    days = [str(a.get("시행일자") or "") for a in arts if a.get("시행일자")]
    return min(days) if days else ""


def looks_deleted(body):
    return bool(re.fullmatch(r"제\d+조(?:의\d+)?\s*삭제\s*", body or ""))


def one(oc, name, jo_spec, at_list, log):
    """한 법령의 한 조문을, 여러 시점에 대해 받는다.

    한 공포본의 본문에는 **아직 시행되지 않은 개정도 반영돼 있다.** 실제로
    2022년에 멀쩡히 살아 있던 소득세법 시행령 제157조가 그 시점 공포본에서는
    "제157조 삭제" 로 나왔다 — 금융투자소득세 시행에 맞춰 삭제하도록 예정된
    문언이 먼저 보인 것이다. 그대로 믿으면 "2022년에는 대주주 규정이 없었다"
    는 엉뚱한 결론이 된다.

    그래서 조문에 적힌 시행일자를 보고, 기준 시점보다 나중이거나 삭제로만
    나오면 **한 판 앞선 공포본으로 물러나며** 다시 찾는다. 몇 판 물러났는지
    기록에 남긴다.
    """
    jo = jo_code(jo_spec)
    label = jo_label(jo_spec)
    span_from = min(at_list).replace("-", "")
    # 시행본 목록은 요청 시점보다 넉넉히 앞에서부터 훑는다. 그 날짜 직전의
    # 개정이 목록 밖이면 엉뚱하게 더 옛 본을 고르게 된다.
    frm = "%d0101" % (int(span_from[:4]) - 8)
    to = datetime.now(KST).strftime("%Y%m%d")
    rows = versions(oc, name, frm, to)
    log("  %s — 시행본 %d개 (%s ~ %s)" % (name, len(rows), frm, to))
    if not rows:
        raise RuntimeError("시행본 목록이 비었다")

    out = []
    for at in at_list:
        key = at.replace("-", "")
        # 그 시점 이전에 시행된 공포본들을, 나중 것부터 차례로
        cand = sorted({r for r in rows if r[0] and r[0] <= key},
                      key=lambda r: (r[0], r[1]), reverse=True)
        if not cand:
            log("    %s  건너뜀 — 그 이전 시행본이 목록에 없다" % at)
            continue

        chosen = None
        for back, (eff, anc, no, mst) in enumerate(cand[:6]):
            data = fetch_article(oc, mst, jo)
            info = basic_info(data)
            arts = articles(data) or admrul_articles(data)
            body = "\n\n".join(render(a) for a in arts)
            aeff = article_eff(arts)
            future = bool(aeff and aeff > key)
            if arts and not looks_deleted(body) and not future:
                chosen = (back, eff, anc, no, mst, info, arts, body, aeff)
                break
            why = "조문 없음" if not arts else ("삭제 표기" if looks_deleted(body)
                                             else "조문시행일 %s > 기준" % aeff)
            log("    %s  %s판 물러남 (공포 %s 제%s호) — %s" % (at, back, anc, no, why))
            time.sleep(PAUSE)

        if not chosen:
            log("    %s  실패 — 여섯 판을 물러나도 그 시점 문언을 찾지 못했다" % at)
            continue

        back, eff, anc, no, mst, info, arts, body, aeff = chosen
        got_no = str(info.get("공포번호") or "")
        rec = {
            "법령명": name, "조문": label,
            "기준시점": at,
            "고른 시행본": {"시행일자": eff, "공포일자": anc, "공포번호": no, "MST": mst},
            "응답 기본정보": {"시행일자": str(info.get("시행일자") or ""),
                          "공포일자": str(info.get("공포일자") or ""),
                          "공포번호": got_no},
            "조문시행일자": aeff,
            "물러난 판수": back,
            "일치": got_no == no,
            "조문수": len(arts),
            "본문": body,
        }
        out.append(rec)
        log("    %s → 공포 %s 제%s호 (MST %s) · 조문시행 %s · %d판 물러남 · 조문 %d"
            % (at, anc, no, mst, aeff or "?", back, len(arts)))
        time.sleep(PAUSE)
    return out


def main():
    ap = argparse.ArgumentParser(description="연혁(시행일 기준) 조문 수집")
    ap.add_argument("--law", help="법령명 (없으면 history_targets.json)")
    ap.add_argument("--jo", help="조문 — 157 / 1의2 / 167의8")
    ap.add_argument("--at", nargs="*", default=[], help="기준 시점 YYYY-MM-DD")
    args = ap.parse_args()

    oc = os.environ.get("LAW_OC", "").strip()
    if not oc:
        print("!! LAW_OC 가 없다", file=sys.stderr)
        return 1

    if args.law:
        reqs = [{"법령": args.law, "조문": args.jo, "시점": args.at}]
    else:
        with open(CONF, encoding="utf-8") as f:
            reqs = json.load(f)["요청"]

    if not reachable(oc):
        return 2

    os.makedirs(HIST, exist_ok=True)
    print("=== 연혁 조문 수집 (%d건) ===" % len(reqs))
    all_rec, fails = [], 0
    for r in reqs:
        try:
            all_rec += one(oc, r["법령"], r["조문"], r["시점"], print)
        except Exception as e:                                     # noqa: BLE001
            fails += 1
            print("  FAIL %s %s <- %s: %s" % (r["법령"], r["조문"], type(e).__name__, e))

    for rec in all_rec:
        slug = "%s_%s_%s" % (slugify(rec["법령명"]), rec["조문"], rec["기준시점"])
        with open(os.path.join(HIST, slug + ".json"), "w", encoding="utf-8") as f:
            json.dump(rec, f, ensure_ascii=False, indent=2)

    idx = {
        "수집시각": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S KST"),
        "출처": "국가법령정보센터 OPEN API — target=eflaw 목록 + target=law&MST&JO 본문",
        "항목": [{k: v for k, v in r.items() if k != "본문"} for r in all_rec],
    }
    with open(os.path.join(HIST, "index.json"), "w", encoding="utf-8") as f:
        json.dump(idx, f, ensure_ascii=False, indent=2)

    bad = [r for r in all_rec if not r["일치"]]
    print("\n%d개 시점 확보, 어긋남 %d개, 실패 %d건" % (len(all_rec), len(bad), fails))
    return 0 if all_rec else 1


if __name__ == "__main__":
    sys.exit(main())
