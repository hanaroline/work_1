#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""이미 받아 둔 펀드 기준가 계열에 「결산 재산정」 규칙을 다시 건다.

왜 따로 두는가 — 규칙은 `fetch_fund_nav.py` 가 받을 때 걸지만, 이미 받아
둔 986 종을 고치자고 원천을 다시 다 때릴 일은 아니다. 계열은 손에 있으므로
규칙만 다시 걸면 된다.

**두 번 돌려도 같다.** 이어 붙이고 나면 값이 1000 배수에서 벗어나므로
(1000.39 → 1035.6) 자리 조건에 더는 안 걸린다. 아래 --확인 이 그것을 본다.

    python3 scripts/resplice_fund_nav.py            # 무엇이 바뀌는지만 본다
    python3 scripts/resplice_fund_nav.py --쓰기      # 실제로 고쳐 쓴다
"""
import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from fetch_fund_nav import find_reset_steps, splice, RESET_BASE  # noqa: E402

NAV = os.path.join(ROOT, "data", "proposal", "fund_nav.json")


def cagr(vals, per_year=12):
    """달 간격 계열의 연환산 수익률(%). 재지 못하면 None."""
    if len(vals) < 13 or vals[0] <= 0:
        return None
    years = (len(vals) - 1) / float(per_year)
    return ((vals[-1] / vals[0]) ** (1 / years) - 1) * 100


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--쓰기", action="store_true", dest="write",
                    help="실제로 고쳐 쓴다 (없으면 무엇이 바뀌는지만 본다)")
    args = ap.parse_args()

    doc = json.load(open(NAV, encoding="utf-8"))
    items = doc["items"]

    changed, added, shown = [], 0, 0
    for code, v in items.items():
        steps = find_reset_steps(v["c"])
        if not steps:
            continue
        before = v["c"]
        after = splice(before, steps)
        changed.append((code, v, len(steps), cagr(before), cagr(after)))
        added += len(steps)
        v["c"] = [round(x, 4) for x in after]
        v["steps"] = int(v.get("steps") or 0) + len(steps)

    print("결산 계단을 이어 붙인 펀드 **%d 종** · 계단 %d 개\n"
          % (len(changed), added))
    changed.sort(key=lambda t: -(t[4] or 0) + (t[3] or 0))
    print("  %-44s %6s → %6s" % ("펀드", "전 연%", "후 연%"))
    for code, v, n, a, b in changed:
        shown += 1
        if shown > 12:
            continue
        print("  %-44s %6s   %6s"
              % (v["name"][:44],
                 "—" if a is None else "%.1f" % a,
                 "—" if b is None else "%.1f" % b))
    if len(changed) > 12:
        print("  … 그 밖 %d 종" % (len(changed) - 12))

    # 두 번 걸어도 더 잡히지 않는지 — 여기서 확인한다.
    again = sum(1 for v in items.values() if find_reset_steps(v["c"]))
    print("\n다시 걸어 보면 더 잡히는 펀드: %d 종 (0 이어야 맞습니다)" % again)

    if not args.write:
        print("\n(--쓰기 를 주지 않아 고쳐 쓰지 않았습니다.)")
        return
    if again:
        raise SystemExit("두 번째에도 계단이 잡힙니다 — 쓰지 않습니다.")

    doc["count"] = len(items)
    doc["결산보정"] = ("받아 둔 계열에 결산 재산정 규칙을 다시 걸어 %d 종 "
                       "%d 개를 이어 붙였습니다 (기준가 %d 되돌림)."
                       % (len(changed), added, int(RESET_BASE)))
    tmp = NAV + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, NAV)
    print("\n%s 를 고쳐 썼습니다." % os.path.relpath(NAV, ROOT))


if __name__ == "__main__":
    main()
