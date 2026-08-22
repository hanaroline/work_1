# -*- coding: utf-8 -*-
"""시세 파일의 **기간 수익률이 어디까지 채워졌는지** 센다.

브리핑 지침 4-3절은 「기간 수익률을 모든 시세 표에 세운다」고 한다. 그런데
채워졌는지 확인할 방법이 없어서, 빈 칸은 표를 눈으로 볼 때에야 드러났다.
실제로 미 실질금리·기대인플레이션·EFFR·연방기금선물·국내 금리·업종·예탁금은
**한 번도 기간 수익률이 붙은 적이 없었다** — 수집기가 계산하지 않았기
때문인데, 아무도 알려 주지 않으니 판마다 조용히 비어 나갔다.

    python3 scripts/check_perf_coverage.py            # 사람이 읽는 표
    python3 scripts/check_perf_coverage.py --strict   # 빠진 게 있으면 끝 상태 1

끝 상태
    0  기대한 블록이 모두 채워졌다 (또는 --strict 없이 돌렸다)
    1  --strict 인데 빠진 블록이 있다
    2  파일을 읽을 수 없다

「없어도 되는 것」은 EXPECT 에 사유와 함께 적어 둔다. 원천에 계열이 아예
없는 항목(코스피200 선물의 종가 계열 같은 것)까지 빨갛게 띄우면 경고가
무뎌진다.
"""
import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "data/market/latest.json")

# 되짚기를 기대하는 구간. 자료가 짧아 못 닿는 구간은 빼도 되지만, 가장 짧은
# 1주까지 없으면 그 블록은 기간 수익률이 통째로 없는 것이다.
CORE = "w1"


def _has(p):
    return bool(p) and any(k in p for k in ("w1", "m1", "m3", "m6", "y1", "ytd"))


def _explained(v):
    """수집기가 「왜 못 냈는지」를 적어 둔 항목. 빈 것과는 다르게 센다.

    적어 두지 않은 빈 칸만 결함이다. 사유가 적혀 있으면 그것은 판단이
    끝난 자리다 — 원천에 계열이 없거나, 이력이 아직 안 쌓였거나.
    """
    return isinstance(v, dict) and bool(v.get("perf_note"))


def _core(p):
    return bool(p) and CORE in p


def survey(D):
    """(블록이름, 채워진 항목 수, 전체 항목 수, 1주까지 있는 수) 목록."""
    out = []

    def flat(name, dct, getter=lambda v: (v or {}).get("perf")):
        if not isinstance(dct, dict):
            return
        items = [(k, v) for k, v in dct.items() if isinstance(v, dict)]
        if not items:
            return
        # 사유를 적어 둔 것은 「채워졌다」로 세지 않되 결함으로도 세지 않는다
        items = [(k, v) for k, v in items if not (_explained(v) and not _has(getter(v)))]
        if not items:
            return
        got = sum(1 for _, v in items if _has(getter(v)))
        core = sum(1 for _, v in items if _core(getter(v)))
        out.append((name, got, len(items), core,
                    sorted(k for k, v in items if not _has(getter(v)))))

    def one(name, obj, getter=lambda v: (v or {}).get("perf")):
        if obj is None:
            return
        p = getter(obj)
        out.append((name, 1 if _has(p) else 0, 1, 1 if _core(p) else 0,
                    [] if _has(p) else [name]))

    for name in ("indices", "stocks", "broker_stocks", "us_stocks", "eu_stocks",
                 "jp_stocks", "cn_stocks", "us_sectors", "kr_etf"):
        flat(name, D.get(name))

    # 금리 곡선 — perf 가 만기별 사전으로 한 단계 더 들어가 있다
    for name in ("rates_us", "rates_us_real", "breakeven"):
        blk = D.get(name) or {}
        cur, pf = blk.get("curve") or {}, blk.get("perf") or {}
        if cur:
            out.append((name, sum(1 for k in cur if _has(pf.get(k))), len(cur),
                        sum(1 for k in cur if _core(pf.get(k))),
                        sorted(k for k in cur if not _has(pf.get(k)))))

    # ECOS — 항목마다 자기 perf 를 가진다
    eco = {k: v for k, v in (D.get("rates_ecos") or {}).items() if isinstance(v, dict)}
    flat("rates_ecos", eco)

    # 네이버 금리 스냅숏 — perf 가 블록 하나에 모여 있다
    rk = D.get("rates_kr") or {}
    fields = [k for k in ("ktb1y", "ktb3y", "ktb5y", "ktb10y", "cd91", "call",
                          "corp3y", "cofix_new", "cofix_balance") if k in rk]
    if fields:
        pf = rk.get("perf") or {}
        out.append(("rates_kr", sum(1 for k in fields if _has(pf.get(k))), len(fields),
                    sum(1 for k in fields if _core(pf.get(k))),
                    sorted(k for k in fields if not _has(pf.get(k)))))

    one("policy_rate_us", D.get("policy_rate_us"))
    one("fed_implied", D.get("fed_implied"))

    sec = (D.get("sectors") or {}).get("all") or []
    if sec:
        out.append(("sectors", sum(1 for s in sec if _has(s.get("perf"))), len(sec),
                    sum(1 for s in sec if _core(s.get("perf"))), []))

    mf = D.get("money_flow") or {}
    if mf.get("latest"):
        want = ("deposit", "credit_balance", "fund_equity")
        pf = mf.get("perf") or {}
        out.append(("money_flow", sum(1 for k in want if _has(pf.get(k))), len(want),
                    sum(1 for k in want if _core(pf.get(k))),
                    sorted(k for k in want if not _has(pf.get(k)))))

    fx = (D.get("fx") or {}).get("rows") or []
    if fx:
        out.append(("fx", sum(1 for r in fx if _has(r.get("perf"))), len(fx),
                    sum(1 for r in fx if _core(r.get("perf"))),
                    sorted(r.get("key", "?") for r in fx if not _has(r.get("perf")))))
    return out


# 비어 있어도 통과시키는 것과, 그 사유.
EXCUSED = {
    "futures": "네이버 선물 응답에 일별 계열이 없다. indices.kospi200 으로 대신 본다",
}


def main(argv=None):
    ap = argparse.ArgumentParser(description="기간 수익률이 어디까지 채워졌는지 센다")
    ap.add_argument("path", nargs="?", default=PATH)
    ap.add_argument("--strict", action="store_true", help="빠진 블록이 있으면 끝 상태 1")
    a = ap.parse_args(argv)

    try:
        with open(a.path, encoding="utf-8") as f:
            D = json.load(f)
    except (OSError, ValueError) as e:
        print("!! 시세 파일을 읽을 수 없다: %s" % e)
        return 2

    rows = survey(D)
    print("기간 수익률 채움 — %s (수집 %s)"
          % (os.path.relpath(a.path, ROOT), D.get("generated_at_kst", "?")))
    bad = []
    for name, got, total, core, missing in sorted(rows):
        mark = "OK  " if got == total else ("빔  " if got == 0 else "일부")
        note = ""
        if got < total:
            note = "  <- 없음: " + ", ".join(missing[:6]) + ("…" if len(missing) > 6 else "")
        if core < total:
            note += ("  (1주까지 있는 것 %d/%d)" % (core, total)) if core else "  (1주도 없음)"
        print("  %s %-16s %3d/%-3d%s" % (mark, name, got, total, note))
        if got < total and name not in EXCUSED:
            bad.append(name)

    for name, why in sorted(EXCUSED.items()):
        print("  넘김 %-16s %s" % (name, why))

    if bad:
        print("\n채워지지 않은 블록 %d 개: %s" % (len(bad), ", ".join(bad)))
        print("수집기(scripts/fetch_market.py)에서 그 블록의 perf 를 만드십시오.")
    else:
        print("\n기대한 블록이 모두 채워졌다.")
    return 1 if (bad and a.strict) else 0


if __name__ == "__main__":
    sys.exit(main())
