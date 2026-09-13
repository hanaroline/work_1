#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""연혁 법령을 어떤 호출로 받을 수 있는지 러너에서 알아본다.

현행 법령은 `target=law` + `MST` 로 받으면 되지만, **과거 어느 날 시행 중이던
조문**은 그 호출로 나오지 않는다. 안내서에 여러 갈래(eflaw · lsHistory ·
efYd 파라미터)가 적혀 있는데 실제로 무엇이 먹히는지는 응답을 봐야 안다.

세션은 law.go.kr 에 못 붙으므로(사내 이그레스 차단) 여기서 후보를 죄다
두드려 보고 응답을 저장소에 남긴다. 세션은 그것을 읽고 진짜 수집기를 짠다.
한 번 쓰고 버리는 물건이 아니라, 나중에 또 겉모양이 바뀌면 다시 돌린다.

    python scripts/probe_law_history.py          # data/law/probe/ 에 남긴다
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_law import get, OUT, PAUSE  # noqa: E402
import time  # noqa: E402

PROBE = os.path.join(OUT, "probe")

# 소득세법 시행령 하나로 API 를 배운다. 알아내야 할 것은 두 가지다.
#   (1) 과거 시행본의 목록(일련번호)을 어떻게 얻는가
#   (2) 그 일련번호로 본문을 어떻게 받는가
SUBJ = "소득세법 시행령"
MST = "286211"      # 현행 시행 2026-07-01
LID = "003956"      # 법령ID

CASES = [
    # ── 목록 갈래 ────────────────────────────────────────────────
    ("list_law_plain",      "lawSearch.do", {"target": "law", "query": SUBJ}),
    ("list_law_nw2",        "lawSearch.do", {"target": "law", "query": SUBJ, "nw": 2}),
    ("list_eflaw",          "lawSearch.do", {"target": "eflaw", "query": SUBJ}),
    ("list_eflaw_efyd",     "lawSearch.do", {"target": "eflaw", "query": SUBJ,
                                             "efYd": "20200101~20250101"}),
    ("list_lsHistory",      "lawSearch.do", {"target": "lsHistory", "query": SUBJ}),
    ("list_lsHstInf",       "lawSearch.do", {"target": "lsHstInf", "query": SUBJ}),
    ("list_law_ancyd",      "lawSearch.do", {"target": "law", "query": SUBJ,
                                             "ancYd": "20221201~20230401"}),
    ("list_law_efyd",       "lawSearch.do", {"target": "law", "query": SUBJ,
                                             "efYd": "20220101~20230101"}),

    # ── 본문 갈래 ────────────────────────────────────────────────
    ("body_eflaw_mst",      "lawService.do", {"target": "eflaw", "MST": MST}),
    ("body_law_mst_efyd",   "lawService.do", {"target": "law", "MST": MST,
                                              "efYd": "20220601"}),
    ("body_law_id_efyd",    "lawService.do", {"target": "law", "ID": LID,
                                              "efYd": "20220601"}),
    ("body_lsHistory_id",   "lawService.do", {"target": "lsHistory", "ID": LID}),
    ("body_lsHstInf_mst",   "lawService.do", {"target": "lsHstInf", "MST": MST}),
    # 조문 하나만 받아 보기 — JO 는 6자리(제157조 = 015700)
    ("body_law_mst_jo157",  "lawService.do", {"target": "law", "MST": MST,
                                              "JO": "015700"}),
]

# 응답 원문은 통째로 두면 저장소가 무거워진다(시행령 전문이 1MB 가 넘는다).
# 겉모양을 배우는 데는 앞부분이면 충분하다.
CLIP = 20000


def outline(o, depth=0, k=""):
    """응답의 뼈대만 몇 줄로 적는다."""
    pad = "  " * depth
    if isinstance(o, dict):
        yield "%s%s{} %s" % (pad, k, list(o)[:14])
        if depth < 3:
            for kk, vv in list(o.items())[:14]:
                for ln in outline(vv, depth + 1, kk + ": "):
                    yield ln
    elif isinstance(o, list):
        yield "%s%s[%d]" % (pad, k, len(o))
        if o and depth < 3:
            for ln in outline(o[0], depth + 1, "[0] "):
                yield ln
    else:
        yield "%s%s%s" % (pad, k, str(o).replace("\n", "⏎")[:90])


def main():
    oc = os.environ.get("LAW_OC", "").strip()
    if not oc:
        print("!! LAW_OC 가 없다", file=sys.stderr)
        return 1
    os.makedirs(PROBE, exist_ok=True)

    report = []
    print("=== 연혁 법령 호출 탐침 (%d가지) ===" % len(CASES))
    for name, path, params in CASES:
        p = dict(params)
        p.update({"OC": oc, "type": "JSON"})
        entry = {"name": name, "path": path, "params": params}
        try:
            data = get(path, p)
            entry["ok"] = True
            entry["outline"] = list(outline(data))
            blob = json.dumps(data, ensure_ascii=False)
            entry["clipped"] = len(blob) > CLIP
            with open(os.path.join(PROBE, name + ".json"), "w", encoding="utf-8") as f:
                f.write(blob[:CLIP])
            print("  OK   %-22s %d자" % (name, len(blob)))
        except Exception as e:                                    # noqa: BLE001
            entry["ok"] = False
            entry["error"] = "%s: %s" % (type(e).__name__, e)
            print("  FAIL %-22s %s" % (name, entry["error"][:110]))
        report.append(entry)
        time.sleep(PAUSE)

    with open(os.path.join(PROBE, "_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print("\n%d/%d 성공 — data/law/probe/ 에 남겼다"
          % (sum(1 for r in report if r["ok"]), len(report)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
