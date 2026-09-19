#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""자산배분 제안서 — PPT판.

**파이썬이 셈하고 노드는 그리기만 한다.** 배분 산수가 세 번째로 복제되면
화면·엑셀·PPT 가 서로 다른 비중을 보여 주는 날이 온다. 그래서 여기서
proposal_lib 로 다 셈해 JSON 한 덩이로 만들고, proposal_deck.mjs 는 그것을
받아 슬라이드로 옮기기만 한다.

PPT 는 화면·엑셀과 달리 **한 고객·한 시나리오**의 문서다. 그래서 성향·기간·
금액을 인자로 받아 그 한 벌을 만든다.

**화면에서 고친 배분을 그대로 받는다** (`--from 조정안.json`). PPT 안에서는
자산배분 작업을 할 수 없다 — 작업은 화면(proposal.html)이나 엑셀에서 하고,
PPT 는 그 결과를 고객에게 보여 주는 자리다. 화면의 「조정안 내려받기」 단추가
내보낸 파일을 여기 물리면 비중도 고른 상품도 그대로 실린다. 그것이 없으면
PPT 는 제안값 그대로를 싣고, 표지에 그렇게 적는다.

차트는 네이티브로 넣는다(그림이 아니다) — 고객 앞에서 숫자를 고칠 수 있어야
하고, 미래에셋 기준도 그것을 요구한다.

쓰는 법
  python3 scripts/build_proposal_pptx.py
  python3 scripts/build_proposal_pptx.py --risk 5 --years 3 --amount 50000 \
      --client "홍길동 고객님"

  # 화면에서 조정한 배분으로 만들기 (권하는 길)
  python3 scripts/build_proposal_pptx.py --from 자산배분조정안_홍길동_2026-09-19.json

산출물
  고객제안서_자산배분.pptx
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import proposal_lib as P                                          # noqa: E402

ROOT = P.ROOT
HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_OUT = os.path.join(ROOT, "고객제안서_자산배분.pptx")
RENDERER = os.path.join(HERE, "proposal_deck.mjs")

HORIZON_LABEL = {1: "1년 이내", 3: "3년", 5: "5년", 10: "5년 초과"}
PER_CLASS = 5


def fx_note(u):
    fx = ((u.get("원천", {}).get("해외주식") or {}).get("환율") or {})
    if not fx.get("usdkrw"):
        return None
    return "해외 시가총액은 USD/KRW %.2f (%s) 로 환산" % (
        fx["usdkrw"], fx.get("src", "출처 미상"))


def trim(p):
    return {"name": p.get("name") or p.get("code"),
            "type": p.get("type") or p.get("assetClass") or "",
            "company": p.get("company") or "",
            "size": p.get("size"), "ret1y": p.get("ret1y"),
            "vol": p.get("vol"),
            "feeMin": p.get("feeMin"), "feeMax": p.get("feeMax")}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--risk", type=int, default=3, choices=[1, 2, 3, 4, 5])
    ap.add_argument("--years", type=int, default=10, choices=[1, 3, 5, 10])
    ap.add_argument("--amount", type=int, default=10000,
                    help="투자금액 (만원). 기본 1억")
    ap.add_argument("--client", default="")
    ap.add_argument("--from", dest="plan", default=None,
                    help="화면에서 내려받은 조정안 JSON. 비중·상품을 그대로 씁니다")
    ap.add_argument("--out", default=DEFAULT_OUT)
    args = ap.parse_args()

    u = P.load_universe()
    avail = {c for c, s in u["자산군"].items() if s.get("종목수")}

    adjusted = None
    if args.plan:
        with open(args.plan, encoding="utf-8") as fp:
            adjusted = json.load(fp)
        # 조정안이 있으면 그것이 진실이다. 성향·기간·금액·고객명까지 따라간다 —
        # 인자와 조정안이 어긋나면 어느 쪽 문서인지 알 수 없게 된다.
        args.risk = int(adjusted.get("risk", args.risk))
        args.amount = int(adjusted.get("amount", args.amount))
        if adjusted.get("client") and not args.client:
            args.client = adjusted["client"]

    weights, prof, notes = P.allocate(args.risk, args.years, avail)
    if adjusted and adjusted.get("weights"):
        weights = {c: float(adjusted["weights"].get(c, 0)) for c in P.CLASSES}
        if adjusted.get("edited"):
            notes = notes + ["화면에서 **비중을 조정한** 제안입니다."]
        total = sum(weights.values())
        if abs(total - 100) > 0.05:
            # 합계가 안 맞는 조정안으로 고객 문서를 만들지 않는다.
            raise SystemExit("조정안의 비중 합계가 %.1f%% 입니다 — 100%% 로 "
                             "맞춘 뒤 다시 내려받으십시오." % total)
    m = P.portfolio(weights, u["자산군"])

    rows = []
    for cls in P.CLASSES:
        w = weights.get(cls, 0)
        if w <= 0:
            continue
        s = u["자산군"].get(cls) or {}
        rows.append({
            "cls": cls, "pct": w,
            "amount": round(args.amount * w / 100),
            "ret1y": s.get("ret1y_중앙값"), "vol": s.get("vol_중앙값"),
        })

    products = {}
    picked = (adjusted or {}).get("products") or {}
    by_code = {}
    for prod in u["상품"]:
        by_code.setdefault(prod.get("cls"), {})[
            prod.get("code") or prod.get("name")] = prod
    for r in rows:
        if r["cls"] == "현금":
            continue
        if r["cls"] in picked:
            # 화면에서 고른 것을 **그 순서 그대로** 싣는다. 찾지 못한 코드는
            # 건너뛰되, 하나도 못 찾으면 제안값으로 돌아가지 않고 비워 둔다 —
            # 고른 것과 다른 상품이 실리는 것이 제일 나쁘다.
            table = by_code.get(r["cls"], {})
            items = [table[k] for k in picked[r["cls"]] if k in table]
        else:
            items = P.pick_products(u["상품"], r["cls"], PER_CLASS)
        if items:
            products[r["cls"]] = [trim(p) for p in items]

    payload = {
        "client": args.client,
        "amount": args.amount,
        "yearsLabel": HORIZON_LABEL[args.years],
        "riskName": prof["name"], "riskDesc": prof["desc"], "risk": args.risk,
        "rows": rows, "metrics": m,
        # 안내문의 ** 강조는 슬라이드에서 쓰지 않으므로 여기서 떼어 낸다.
        "notes": [n.replace("**", "") for n in notes],
        "products": products,
        "classStats": [dict(cls=c, **s) for c, s in u["자산군"].items()],
        "sources": [{"name": k,
                     "src": str(v.get("src") or "—"),
                     "count": v.get("count"),
                     "asOf": v.get("asOf") or "—"}
                    for k, v in u["원천"].items() if isinstance(v, dict)],
        "fxNote": fx_note(u),
        "adjusted": bool(adjusted),
        "adjustedFrom": (adjusted or {}).get("generatedFrom"),
        "generated": datetime.now(P.KST).strftime("%Y-%m-%d %H:%M"),
        "universeGenerated": u.get("generated_at_kst"),
        "out": args.out,
    }

    tmp = os.path.join(ROOT, ".proposal-deck.json")
    with open(tmp, "w", encoding="utf-8") as fp:
        json.dump(payload, fp, ensure_ascii=False)

    try:
        r = subprocess.run(["node", RENDERER, tmp], cwd=ROOT,
                           capture_output=True, text=True)
    finally:
        try:
            os.remove(tmp)
        except OSError:
            pass

    sys.stdout.write(r.stdout)
    if r.returncode != 0:
        sys.stderr.write(r.stderr)
        raise SystemExit("슬라이드를 만들지 못했습니다. "
                         "pptxgenjs 가 없으면 `npm install pptxgenjs` 하십시오.")
    print("%s (%.0f KB)" % (os.path.relpath(args.out, ROOT),
                            os.path.getsize(args.out) / 1024))


if __name__ == "__main__":
    main()
