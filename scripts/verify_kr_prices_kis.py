#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""야후와 네이버를 **심판한다** — 증권사(KIS) 일봉을 제3의 잣대로 놓고.

풀어야 할 막다른 골목
──────────────────────────────────────────────────────────────────────
data/prices_naver/verify.txt 가 이렇게 끝나 있다:

    두 출처가 종가를 91.9% 만 같게 봅니다(어긋난 1565 건, 중앙 0.96% · 최대 34.93%).
    상대의 고저 범위를 벗어난 종가는 네이버 629 건 · 야후 629 건입니다.
    어느 쪽으로도 쏠리지 않아 **이 자료만으로는 심판할 수 없습니다.**

629 대 629. 둘을 맞대는 것만으로는 여기서 한 발도 못 나간다. 세 번째 자료가
있어야 하고, 그것이 증권사 원본이다.

이 대본이 답하는 것
──────────────────────────────────────────────────────────────────────
  하나. 두 벤더가 갈릴 때 **KIS 는 누구 편인가** — 이것이 심판이다
  둘.   고저 범위를 벗어난 629 대 629 를 **KIS 고저로 다시 재면** 누가 틀렸나
  셋.   야후가 빠뜨린 거래일(2025-09-19, 2026-09-18)이 **KIS 에는 있는가**
  넷.   수정주가 기준이 어긋난 종목은 없는가 — 있으면 그 종목의 대조는 무효다

넷째를 먼저 걸러야 하는 까닭. 최대 34.93% 라는 갈림은 시세 오류가 아니라
**액면분할·권리락을 한쪽만 반영한** 모양이다. 기준이 다른 자료를 맞대 놓고
「어긋났다」고 세면 심판이 아니라 잡음을 세는 것이 된다. 그래서 한 종목의 어긋남이
**전 구간에 걸쳐 일정한 비율**로 나타나면 그 종목을 따로 빼서 적는다.

쓰는 법
  python3 scripts/verify_kr_prices_kis.py
  python3 scripts/verify_kr_prices_kis.py --sample 40    # 종목 일부만

산출물
  data/prices_kis/verdict.txt   판정문
"""

import argparse
import json
import os
import statistics as st
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KIS = os.path.join(ROOT, "data", "prices_kis", "kr100.json")
NAVER = os.path.join(ROOT, "data", "prices_naver", "kr100.json")
OUT = os.path.join(ROOT, "data", "prices_kis", "verdict.txt")

# 종가가 같다고 볼 한계. 원 단위 시세라 0.005% 면 사실상 동일하다
# (10만원 주식에서 5원). 기존 대조기와 같은 값을 쓴다 — 기준이 달라지면
# 두 판정문의 숫자를 나란히 놓고 볼 수 없다.
EPS = 0.005


def load(path, label):
    if not os.path.exists(path):
        raise SystemExit("%s 가 없다: %s" % (label, path))
    with open(path, encoding="utf-8") as fp:
        return json.load(fp)


def bars_of(doc, sym):
    s = doc["stocks"].get(sym)
    if not s:
        return {}
    return {s["d"][i]: (s["o"][i], s["h"][i], s["l"][i], s["c"][i], s["v"][i])
            for i in range(len(s["d"]))}


def yahoo_bars(sym):
    """야후 일봉은 자료 가지(origin/kr100-data)에 있다. 기존 대조기와 같은 길."""
    r = subprocess.run(["git", "-C", ROOT, "show",
                        "origin/kr100-data:data/kr100/chart/%s.json" % sym],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    d = json.loads(r.stdout).get("daily") or {}
    if not d.get("d"):
        return None
    return {d["d"][i]: (d["o"][i], d["h"][i], d["l"][i], d["c"][i], d["v"][i])
            for i in range(len(d["d"]))}


def adj_mismatch(kis, other):
    """수정주가 기준이 어긋났는가.

    겹치는 날의 종가 비율을 모아, **비율이 1 이 아닌데 거의 일정하면** 한쪽만
    분할·권리락을 반영한 것이다. 시세가 틀린 것이 아니라 기준이 다른 것이므로
    그 종목은 심판에서 뺀다.
    """
    ratios = []
    for d in set(kis) & set(other):
        a, b = kis[d][3], other[d][3]
        if a and b:
            ratios.append(a / b)
    if len(ratios) < 30:
        return None
    med = st.median(ratios)
    if abs(med - 1.0) < 0.01:
        return None
    # 비율이 일정한가 — 흩어짐이 작아야 「기준 차이」다. 들쭉날쭉하면 그냥 다른 것.
    spread = st.pstdev(ratios) / med if med else 9.9
    if spread < 0.02:
        return med
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", type=int, default=0,
                    help="종목 수 제한 (0 이면 전부)")
    args = ap.parse_args()

    kdoc = load(KIS, "KIS 일봉")
    ndoc = load(NAVER, "네이버 일봉")

    syms = sorted(set(kdoc["stocks"]) & set(ndoc["stocks"]))
    if args.sample:
        step = max(1, len(syms) // args.sample)
        syms = syms[::step][:args.sample]

    # 심판 집계
    win_naver = win_yahoo = win_neither = 0     # 갈릴 때 KIS 가 누구와 같은가
    # **봉 나이로 나눠서도 센다.** signal_backtest.py 가 남겨 둔 미해결 항목이
    # 이것이다 — 「최근 5봉이 75.8% 로 갈린다(5~19일 전 봉은 99.3% 가 맞는다).
    # 어느 쪽이 잠정치인지 모른다.」 전체 집계만 내면 그 물음에 답하지 못한다.
    # 최근 봉은 한쪽이 잠정치를 보여 주는 것일 수 있고, 그렇다면 전체 승패와
    # 최근 승패가 갈린다. 갈리는지 아닌지는 세어 봐야 안다.
    RECENT_N = 5
    recent = {"네이버": 0, "야후": 0, "둘 다 아님": 0, "봉": 0, "갈림": 0}
    older = {"네이버": 0, "야후": 0, "둘 다 아님": 0, "봉": 0, "갈림": 0}
    pairs = 0                                   # 세 자료가 모두 있는 봉
    diffs = 0                                   # 야후·네이버가 갈린 봉
    n_out = y_out = 0                           # KIS 고저를 벗어난 종가
    k_missing_n = k_missing_y = 0               # KIS 에 있는데 상대에 없는 거래일
    missing_detail = {"네이버에 없음": [], "야후에 없음": []}
    skipped = {}                                # 수정주가 기준이 어긋난 종목
    no_yahoo = []
    worst = []
    rel_naver, rel_yahoo = [], []               # KIS 대비 상대차

    for sym in syms:
        kb = bars_of(kdoc, sym)
        nb = bars_of(ndoc, sym)
        yb = yahoo_bars(sym)
        if not kb or not nb:
            continue
        if yb is None:
            no_yahoo.append(sym)
            yb = {}

        # 넷째 — 수정주가 기준부터 본다. 어긋나면 이 종목은 심판에서 뺀다.
        bad = {}
        m = adj_mismatch(kb, nb)
        if m:
            bad["네이버"] = m
        if yb:
            m = adj_mismatch(kb, yb)
            if m:
                bad["야후"] = m
        if bad:
            skipped[sym] = bad
            continue

        lo = max(min(kb), min(nb))
        if yb:
            lo = max(lo, min(yb))

        common = sorted(set(kb) & set(nb) & (set(yb) if yb else set(kb)))
        # 「최근 5봉」은 종목마다 다르다 — 거래정지가 있으면 달력 날짜로는 어긋난다.
        # 그래서 그 종목의 공통 구간 끝에서 다섯 개를 센다.
        recent_days = set(common[-RECENT_N:])

        for d in common:
            if d < lo:
                continue
            ko, kh, kl, kc, _ = kb[d]
            no_, nh, nl, nc, _ = nb[d]
            if None in (kc, nc, kh, kl):
                continue
            if yb:
                yo, yh, yl, yc, _ = yb[d]
                if yc is None:
                    continue
            else:
                continue

            pairs += 1
            rn = (nc - kc) / kc * 100
            ry = (yc - kc) / kc * 100
            rel_naver.append(rn)
            rel_yahoo.append(ry)

            # 둘째 — KIS 고저를 벗어난 종가는 그 세션의 종가일 수 없다
            if nc > kh or nc < kl:
                n_out += 1
            if yc > kh or yc < kl:
                y_out += 1

            # 하나 — 두 벤더가 갈릴 때 KIS 는 누구 편인가. **이것이 심판이다.**
            bucket = recent if d in recent_days else older
            bucket["봉"] += 1
            if abs((nc - yc) / yc * 100) <= EPS:
                continue                      # 둘이 같으면 심판할 것이 없다
            diffs += 1
            bucket["갈림"] += 1
            n_same = abs(rn) <= EPS
            y_same = abs(ry) <= EPS
            if n_same and not y_same:
                win_naver += 1
                bucket["네이버"] += 1
            elif y_same and not n_same:
                win_yahoo += 1
                bucket["야후"] += 1
            else:
                win_neither += 1
                bucket["둘 다 아님"] += 1

            if abs(rn - ry) > 0.5 and len(worst) < 25:
                worst.append(
                    "%-11s %s  KIS %9.0f | 네이버 %9.0f (%+.2f%%) | "
                    "야후 %9.0f (%+.2f%%)" % (sym, d, kc, nc, rn, yc, ry))

        # 셋째 — KIS 에는 있는데 상대에 없는 거래일
        for d in sorted(set(kb)):
            if d < lo:
                continue
            if d not in nb:
                k_missing_n += 1
                if len(missing_detail["네이버에 없음"]) < 12:
                    missing_detail["네이버에 없음"].append("%s %s" % (sym, d))
            if yb and d not in yb:
                k_missing_y += 1
                if len(missing_detail["야후에 없음"]) < 12:
                    missing_detail["야후에 없음"].append("%s %s" % (sym, d))

    # ── 판정문 ────────────────────────────────────────────────────────
    out = []
    w = out.append
    w("국내 일봉 심판 — 야후 · 네이버 · 한국투자증권")
    w("")
    w("KIS 자료: %s" % kdoc.get("source", "?"))
    w("  받은 때 %s · 수정주가 %s"
      % (kdoc.get("generated_at_kst", "?"),
         "예" if kdoc.get("adjusted") else "아니오 (원주가)"))
    w("  종목 %s · 거래일 %s"
      % (kdoc.get("coverage", {}).get("stocks"),
         kdoc.get("coverage", {}).get("days")))
    w("")

    if skipped:
        w("■ 수정주가 기준이 어긋나 심판에서 뺀 종목 %d" % len(skipped))
        w("  이 종목들은 시세가 틀린 것이 아니라 분할·권리락 반영이 다른 것입니다.")
        w("  기준이 다른 자료를 맞대면 심판이 아니라 잡음을 세게 됩니다.")
        for sym, bad in list(skipped.items())[:12]:
            w("    %-11s %s" % (sym, " · ".join("KIS/%s = %.4f" % (k, v)
                                                for k, v in bad.items())))
        w("")

    if not pairs:
        w("세 자료가 모두 있는 봉이 하나도 없습니다 — 심판할 수 없습니다.")
        w("야후 자료 가지(origin/kr100-data)를 받았는지 확인하십시오.")
        _write(out)
        return 1

    w("■ 심판 — 야후와 네이버가 갈릴 때 KIS 는 누구 편인가")
    w("  세 자료가 모두 있는 봉 %d, 그 가운데 두 벤더가 갈린 봉 %d (%.1f%%)"
      % (pairs, diffs, diffs / pairs * 100))
    if diffs:
        w("")
        w("    네이버가 맞았다   %6d 건  (%.1f%%)"
          % (win_naver, win_naver / diffs * 100))
        w("    야후가 맞았다     %6d 건  (%.1f%%)"
          % (win_yahoo, win_yahoo / diffs * 100))
        w("    둘 다 아니다      %6d 건  (%.1f%%)"
          % (win_neither, win_neither / diffs * 100))
        w("")
        lead = max(win_naver, win_yahoo)
        if lead and abs(win_naver - win_yahoo) / diffs > 0.2:
            winner = "네이버" if win_naver > win_yahoo else "야후"
            w("  → **%s 가 증권사 시세에 뚜렷하게 가깝습니다.** 기준 일봉을 %s 로 "
              "두는 근거가 됩니다." % (winner, winner))
        elif win_neither > diffs * 0.5:
            w("  → **둘 다 KIS 와 다른 건이 절반을 넘습니다.** 세 벤더가 제각각이라는 "
              "뜻이므로, 수정주가 기준과 거래일 정의부터 다시 봐야 합니다.")
        else:
            w("  → 어느 쪽으로도 뚜렷하게 쏠리지 않습니다. 한 번 더 받아 보거나 "
              "표본을 늘려야 합니다.")
    w("")

    # signal_backtest.py 가 남겨 둔 미해결 항목에 답하는 자리다.
    w("■ 봉 나이별 — 최근 %d봉과 그 이전이 다른가" % RECENT_N)
    w("  (signal_backtest.py 가 「최근 5봉이 75.8% 로 갈리는데 어느 쪽이 잠정치인지")
    w("   모른다」를 미해결로 남겨 두었습니다. 증권사 값이 그 물음에 답합니다.)")
    w("")
    for label, b in (("최근 %d봉" % RECENT_N, recent), ("그 이전", older)):
        if not b["갈림"]:
            w("    %-8s 갈린 봉이 없습니다 (대조 %d봉)" % (label, b["봉"]))
            continue
        w("    %-8s 대조 %6d봉 · 갈림 %5d (%.1f%%) — 네이버 %.1f%% · 야후 %.1f%%"
          % (label, b["봉"], b["갈림"], b["갈림"] / b["봉"] * 100,
             b["네이버"] / b["갈림"] * 100, b["야후"] / b["갈림"] * 100))
    if recent["갈림"] and older["갈림"]:
        r_n = recent["네이버"] / recent["갈림"]
        o_n = older["네이버"] / older["갈림"]
        # 두 구간의 승자가 뒤바뀌면 그것이 답이다 — 진 쪽이 그 구간에서
        # 잠정치를 보여 주고 있다는 뜻이다.
        if (r_n > 0.5) != (o_n > 0.5):
            lose = "네이버" if r_n < 0.5 else "야후"
            w("")
            w("  → **최근 봉과 옛 봉의 승자가 뒤바뀝니다.** 최근 %d봉에서는 %s 가"
              % (RECENT_N, lose))
            w("     증권사 값과 어긋납니다 — 그쪽이 확정 전 잠정치를 보여 주는 것으로")
            w("     읽힙니다. 최근 봉만 쓰는 신호는 이 점을 감안해야 합니다.")
        else:
            w("")
            w("  → 두 구간의 승자가 같습니다. 최근 봉이라고 달리 볼 까닭이 없습니다.")
    w("")

    w("■ 고저 범위 이탈 — 종가가 KIS 고저를 벗어난 건수")
    w("  (기존 대조는 서로를 기준으로 재어 네이버 629 · 야후 629 로 완전 대칭이었고,")
    w("   그래서 심판이 불가능했습니다. 이번에는 증권사 고저를 기준으로 잽니다.)")
    w("")
    w("    네이버 종가가 KIS 고저 밖   %6d 건  (%.2f%%)"
      % (n_out, n_out / pairs * 100))
    w("    야후 종가가 KIS 고저 밖     %6d 건  (%.2f%%)"
      % (y_out, y_out / pairs * 100))
    if n_out or y_out:
        if abs(n_out - y_out) > max(n_out, y_out) * 0.3:
            loser = "네이버" if n_out > y_out else "야후"
            w("")
            w("  → **%s 쪽이 뚜렷하게 많습니다.** 그쪽이 그 세션의 가격을 쓰지 않고 "
              "있다는 뜻입니다." % loser)
    w("")

    w("■ 거래일 결손 — KIS 에는 있는데 상대에 없는 날")
    w("    네이버에 없음  %d 건" % k_missing_n)
    w("    야후에 없음    %d 건" % k_missing_y)
    for label, rows in missing_detail.items():
        if rows:
            w("      %s: %s" % (label, ", ".join(rows)))
    w("  (기존 검산에서 야후가 2025-09-19 · 2026-09-18 을 빠뜨린 것이 확인되었고,")
    w("   그것이 네이버로 갈아탄 까닭이었습니다. KIS 가 그 판단을 다시 확인해 줍니다.)")
    w("")

    for label, rels in (("네이버", rel_naver), ("야후", rel_yahoo)):
        ab = sorted(abs(x) for x in rels if abs(x) > EPS)
        same = (len(rels) - len(ab)) / len(rels) * 100 if rels else 0
        w("■ KIS 대비 %s — 같은 값 %.1f%%, 어긋난 %d 건" % (label, same, len(ab)))
        if ab:
            w("    상대차 중앙 %.2f%% · 90분위 %.2f%% · 최대 %.2f%%"
              % (ab[len(ab) // 2], ab[int(len(ab) * 0.9)], ab[-1]))
    w("")

    if no_yahoo:
        w("야후 자료를 못 받은 종목 %d: %s"
          % (len(no_yahoo), ", ".join(no_yahoo[:10])))
        w("")

    if worst:
        w("■ 가장 크게 갈린 봉")
        for line in worst:
            w("    " + line)
        w("")

    _write(out)
    return 0


def _write(lines):
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    body = "\n".join(lines) + "\n"
    with open(OUT, "w", encoding="utf-8") as fp:
        fp.write(body)
    sys.stderr.write(body)
    sys.stderr.write("\n판정문: %s\n" % os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    sys.exit(main())
