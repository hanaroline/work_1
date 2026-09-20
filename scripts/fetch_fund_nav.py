#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""공모펀드의 **기준가 계열**을 받아, 변동성·최대낙폭을 잴 수 있게 만든다.

왜 — 「못 잰다」고 적어 둔 것이 틀렸다
──────────────────────────────────────────────────────────────────────
제안서 곳곳에 「펀드는 원천이 기준가를 7 거래일만 주므로 변동성·낙폭을 못
잰다」고 적어 두었다. **그 7 거래일은 `prices/daily` 한 곳의 얘기였다**
(`size` 상한이 10 이다). 같은 원천에 `base-price/chart` 가 따로 있고,

    term=3m   하루 간격 64 점
    term=1y   주   간격 52 점
    term=5y   달   간격 60 점      ← 5 해치

5 해치가 달 간격으로 온다. 달 60 점이면 **월수익률 기반 연변동성(×√12)과
최대낙폭**을 셈할 수 있다. 일봉보다 거칠어 낙폭은 다소 얕게 나오는데, 그건
숨기지 않고 산출물에 적어 둔다(`표본간격: 달`).

계단을 넘기면 안 된다
──────────────────────────────────────────────────────────────────────
기준가 계열에는 **수익률이 아닌 점프**가 있다.

    위로 나는 계단 — 기준가 **재산정**. 974.57 → 3,356.48 (3.44배)
    아래로 나는 계단 — **결산·분배**. 쌓인 이익을 나눠 주고 1,000 으로 되돌림

앞뒤가 같은 자로 잰 값이 아니다. 그냥 나누면 하루 만에 244% 가 나오고, 그
숫자가 고객 자료에 실린다 — 이 저장소에서 실제로 겪은 고장이다. 그래서
계단을 찾아 **앞뒤를 이어 붙인다**(chain-link).

계단 찾는 규칙은 펀드 수집기(`collect_fund_kr.mjs`)가 두 번 고쳐 가며
세운 것을 그대로 옮긴다. 보편 상수 하나를 모든 펀드에 들이대지 않고
**그 펀드 자신의 평소 폭**(로그수익률의 MAD)과 견준다.

  |로그수익률| 이 (가) 절대 바닥을 넘고 (나) 평소 폭의 8 배를 넘으면 계단.

둘 다 있어야 한다. 바닥만 쓰면 변동이 큰 펀드의 정상적인 달이 잡히고, 평소
폭만 쓰면 하루 0.001% 씩 움직이던 채권형이 0.5% 만 움직여도 500σ 가 된다.

**클로드 세션에서는 네이버에 못 붙는다**(이그레스 프록시가 막는다). 러너 몫이다.

쓰는 법
  python3 scripts/fetch_fund_nav.py
  python3 scripts/fetch_fund_nav.py --limit 20        # 스무 종만(시험)

산출물
  data/proposal/fund_nav.json
  data/proposal/fund_nav_report.md
"""

import argparse
import json
import math
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))
OUT_DIR = os.path.join(ROOT, "data", "proposal")
OUT = os.path.join(OUT_DIR, "fund_nav.json")
REPORT = os.path.join(OUT_DIR, "fund_nav_report.md")
UNIVERSE = os.path.join(OUT_DIR, "universe.json")

API = "https://stock.naver.com/api/fund/funds"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
REFERER = "https://stock.naver.com/domestic/fund"

SAVE_EVERY = 50           # 쉰 종목마다 저장 — 끊겨도 잃지 않게
MIN_POINTS = 24           # 두 해는 있어야 변동성이라 부를 만하다
STEP_K = 8                # 평소 폭의 몇 배부터 계단으로 보는가
STEP_FLOOR = 1.15         # 절대 바닥 — 이보다 작은 점프는 계단으로 보지 않는다


def _get(url, tries=3, timeout=30):
    last = None
    for i in range(tries):
        req = urllib.request.Request(
            url, headers={"User-Agent": UA, "Referer": REFERER})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as fp:
                return json.loads(fp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            last = exc
            if exc.code not in (429, 500, 502, 503, 504):
                raise
        except (OSError, ValueError) as exc:
            last = exc
        if i < tries - 1:
            time.sleep(1.5 * (i + 1))
    raise last


def series(code, term="5y"):
    """`base-price/chart` 응답을 (날짜, 기준가) 로. 오래된 것부터 온다."""
    j = _get("%s/%s/base-price/chart?term=%s" % (API, code, term))
    out = []
    for p in (j.get("series") or []):
        day = (p.get("tradeDate") or "").replace("-", "")
        try:
            v = float(p.get("basePrice"))
        except (TypeError, ValueError):
            continue
        if len(day) == 8 and v > 0:
            out.append((day, v))
    out.sort()
    return out


def median(xs):
    s = sorted(xs)
    if not s:
        return None
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2.0


def find_steps(vals):
    """계단의 자리(i = 뒤쪽 점의 index)와 배율을 찾는다.

    펀드 수집기가 세운 규칙 그대로다 — 절대 바닥과 **그 펀드 자신의 평소
    폭**(MAD) 둘 다 넘어야 계단으로 본다.
    """
    if len(vals) < 5:
        return []
    lr = [math.log(vals[i] / vals[i - 1]) for i in range(1, len(vals))]
    med = median(lr) or 0.0
    # MAD 를 정규분포의 표준편차로 되돌리는 상수. 0 이면(완전히 평평한 계열)
    # 평소 폭 조건이 무의미하므로 바닥만 본다.
    sigma = (median([abs(x - med) for x in lr]) or 0.0) * 1.4826
    floor = math.log(STEP_FLOOR)
    out = []
    for i, x in enumerate(lr):
        dev = abs(x - med)
        if dev <= floor:
            continue                       # (가) 절대 바닥
        if sigma > 0 and dev <= STEP_K * sigma:
            continue                       # (나) 평소 폭의 8 배
        out.append((i + 1, vals[i + 1] / vals[i]))
    return out


def splice(vals, steps):
    """계단에서 앞뒤를 **이어 붙인다**.

    계단 뒤의 값을 배율로 나눠 앞쪽 자에 맞춘다. 그러면 계열이 하나의 자로
    이어져 변동성·낙폭을 잴 수 있다. 계단 자체는 수익률이 아니므로 사라진다
    — 사라져야 맞다.
    """
    if not steps:
        return list(vals)
    out = list(vals)
    for i, ratio in steps:
        if not ratio or ratio <= 0:
            continue
        for j in range(i, len(out)):
            out[j] /= ratio
    return out


def targets(limit):
    u = json.load(open(UNIVERSE, encoding="utf-8"))
    out = []
    for p in u["상품"]:
        if p.get("kind") != "펀드":
            continue
        code = str(p.get("code") or "").strip()
        if not code:
            continue
        out.append({"code": code, "name": p.get("name") or code,
                    "cls": p.get("cls"), "size": p.get("size")})
    # 규모 순 — 도중에 끊겨도 제안에 오를 확률이 높은 것부터 남는다.
    out.sort(key=lambda p: -(p.get("size") or 0))
    return out[:limit] if limit else out


def load_existing():
    if not os.path.exists(OUT):
        return {}
    try:
        return json.load(open(OUT, encoding="utf-8")).get("items") or {}
    except ValueError:
        return {}


def save(items):
    os.makedirs(OUT_DIR, exist_ok=True)
    doc = {
        "generated_at_kst": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "source": "네이버 Npay 증권 (base-price/chart, term=5y, 달 간격)",
        "표본간격": "달",
        "계단보정": ("기준가 재산정·결산 계단을 찾아 앞뒤를 이어 붙였습니다"
                     "(그 펀드 자신의 평소 폭 %d 배, 절대 바닥 %.2f 배)."
                     % (STEP_K, STEP_FLOOR)),
        "count": len(items),
        "items": items,
    }
    tmp = OUT + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fp:
        json.dump(doc, fp, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, OUT)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="몇 종만 (0=전부)")
    ap.add_argument("--redo", action="store_true")
    ap.add_argument("--sleep", type=float, default=0.12,
                    help="호출 사이 쉬는 초 (원천을 때리지 않게)")
    args = ap.parse_args()

    want = targets(args.limit)
    if not want:
        raise SystemExit("받을 펀드가 없습니다 — 먼저 유니버스를 만드십시오.")

    items = {} if args.redo else load_existing()
    print("펀드 기준가 계열 — %d 종 · 이미 받은 것 %d 종\n"
          % (len(want), len(items)))

    done, skipped, failed, stepped = 0, 0, [], 0
    for i, t in enumerate(want, 1):
        code = t["code"]
        if code in items and not args.redo:
            skipped += 1
            continue
        try:
            rows = series(code)
        except Exception as exc:                                  # noqa: BLE001
            failed.append({**t, "why": str(exc)[:110]})
            continue
        if len(rows) < MIN_POINTS:
            failed.append({**t, "why": "점 %d 개뿐" % len(rows)})
            continue

        days = [d for d, _ in rows]
        vals = [v for _, v in rows]
        steps = find_steps(vals)
        fixed = splice(vals, steps)
        if steps:
            stepped += 1
        items[code] = {
            "name": t["name"], "cls": t["cls"],
            "d": days, "c": [round(x, 4) for x in fixed],
            "steps": len(steps),
        }
        done += 1
        if done % 25 == 0 or i == len(want):
            print("  [%4d/%d] 받음 %d · 계단보정 %d · 실패 %d"
                  % (i, len(want), done, stepped, len(failed)))
        if done % SAVE_EVERY == 0:
            save(items)
        if args.sleep:
            time.sleep(args.sleep)

    save(items)

    n = sorted(len(v["d"]) for v in items.values())
    lines = ["원천: 네이버 Npay 증권 (base-price/chart, term=5y, **달 간격**)", "",
             "이번에 받음 **%d** · 건너뜀 %d · 실패 %d · 누적 **%d 종**"
             % (done, skipped, len(failed), len(items)), "",
             "계단(기준가 재산정·결산)을 찾아 이어 붙인 펀드 **%d 종**" % stepped, ""]
    if n:
        lines += ["| 펀드 | 5해(60점↑) | 3해(36점↑) | 2해(24점↑) | 중앙 점수 |",
                  "|---|---|---|---|---|",
                  "| %d | %d | %d | %d | %d |"
                  % (len(n), sum(1 for x in n if x >= 60),
                     sum(1 for x in n if x >= 36),
                     sum(1 for x in n if x >= 24), n[len(n) // 2])]
    if failed:
        lines += ["", "**받지 못한 것 %d**" % len(failed)]
        lines += ["- `%s` %s — %s" % (x["code"], x["name"][:30], x["why"])
                  for x in failed[:40]]
    with open(REPORT, "w", encoding="utf-8") as fp:
        fp.write("\n".join(lines) + "\n")

    print("\n받음 %d · 건너뜀 %d · 실패 %d · 누적 %d 종 — %s"
          % (done, skipped, len(failed), len(items), os.path.relpath(OUT, ROOT)))


if __name__ == "__main__":
    main()
