#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""종목별 외국인·기관 순매수를 **증권사 원본(KIS)에서 확정 금액으로** 받는다.

왜 만드는가
──────────────────────────────────────────────────────────────────────
네이버(`trend/trendForeignOrg`)가 주는 종목별 수급에는 두 가지 흠이 있다.

  ① **금액을 주지 않는다.** 장중 잠정치에는 금액 칸이 비어 있어 시장일지는
     수량 × 종가로 어림하고 「≈」를 달아 왔다. 2026-09-21 에 코스피 외국인
     1위 삼성전자가 어림 ≈9,977억 대 확정 11,063억으로 **11% 어긋났다.**
  ② **상위 20 만 준다.** 그 바깥은 아예 볼 수 없어 「연속 순매수」 같은
     것을 시가총액 상위 100 표본으로만 세고 있다.

한국투자증권 오픈API 의 `FHKST01010900`(주식현재가 투자자)은 종목 하나씩이지만
**매수·매도를 수량과 금액으로 각각** 주고 날짜가 붙어 있다.

  frgn_shnu_vol / frgn_shnu_tr_pbmn   외국인 매수 수량·금액
  frgn_seln_vol / frgn_seln_tr_pbmn   외국인 매도 수량·금액
  frgn_ntby_qty / frgn_ntby_tr_pbmn   외국인 순매수 수량·금액
  orgn_* · prsn_*                      기관·개인도 같은 짜임
  stck_bsop_date · stck_clpr           기준일 · 종가

매수와 매도가 따로 오므로 **순매수 = 매수 − 매도**를 기계로 되짚을 수 있다.
네이버에는 없던 검산거리다.

**발행을 앞당기지는 못한다.** 2026-09-22 에 여섯 번 재어 확인했다 — KIS 도
15:37~19:33 은 잠정치였고 22:05 에 바뀌었으며, 바뀐 뒤 값이 네이버 확정치와
정확히 일치했다(삼성전자 기관 259,459). 두 원천은 같은 거래소 자료를 본다.
그러므로 이 수집기는 **저녁에** 돌아야 한다. 자세한 것은
docs/journal-playbook.md 의 KIS 절에 적어 두었다.

어떻게 고르는가
──────────────────────────────────────────────────────────────────────
종목 하나씩 부르므로 전종목은 못 부른다(2,764 종목 × 1.1초 = 50분). 그래서
**거래대금 상위**만 부른다. 순매수 상위 20 은 사실상 거래대금 상위권이라
실질 손실이 거의 없지만, 그래도 「표본 안에서의 순위」임을 산출물에 적는다 —
없는 것을 없다고 말하는 것이 이 저장소의 규칙이다.

  **실측(2026-09-23)**: 400 종목에 **1,491초 = 25분** — 종목당 3.7초다.
  `kis_lib` 의 간격은 모의 1.1초지만 유량 제한(EGW00201) 재시도가 자주 걸려
  실제로는 그 세 배가 든다. 문서의 「초당 1건」을 그대로 믿지 마십시오.
  워크플로 제한 시간을 그 실측에 맞춰 넉넉히 두었다.

쓰는 법
  python3 scripts/fetch_journal_kis.py                 # 시장별 상위 200
  python3 scripts/fetch_journal_kis.py --per-market 300
  python3 scripts/fetch_journal_kis.py --date 20260922 # 기준일 고정

세션은 KIS 에 못 붙는다(9443 비표준 포트를 이그레스 프록시가 막는다).
**러너에서만 돈다.**
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

KST = timezone(timedelta(hours=9))
OUT = "data/journal/kis-flows.json"
TOPN = 20                 # 산출물에 싣는 줄 수 (시장 × 주체 × 매수/매도)
# 단위 검사를 걸 최소 금액(억원). 이보다 작으면 반올림이 지배해 뜻이 없다.
MIN_EOK_FOR_UNIT_CHECK = 50


def num(v, default=None):
    """KIS 는 수를 문자열로 준다. '-00000000001533000' 같은 꼴도 온다."""
    if v is None or v == "":
        return default
    try:
        return float(str(v).strip())
    except (TypeError, ValueError):
        return default


def pick_candidates(per_market: int) -> dict[str, list[dict]]:
    """거래대금 상위를 시장별로 추린다. 네이버 종목 목록을 그대로 쓴다."""
    from fetch_journal import fetch_universe, slim  # noqa: PLC0415

    out = {}
    for mkt, code in (("코스피", "KOSPI"), ("코스닥", "KOSDAQ")):
        rows = [slim(r) for r in fetch_universe(code)]
        rows = [r for r in rows if r.get("code") and (r.get("value_eok") or 0) > 0]
        rows.sort(key=lambda r: r.get("value_eok") or 0, reverse=True)
        out[mkt] = rows[:per_market]
        print(f"{mkt}: 거래대금 상위 {len(out[mkt])} 종목 "
              f"(문턱 {out[mkt][-1]['value_eok']:.0f}억원)" if out[mkt] else f"{mkt}: 없음",
              flush=True)
    return out


def eok_from_pbmn(v):
    """`*_tr_pbmn` → 억원.

    **이 칸은 원이 아니라 백만원이다.** 2026-09-23 에 원으로 알고 1e8 로
    나눴다가 표의 금액이 전부 0억원으로 나왔다. 삼성전자 외국인 순매수
    1,283,306 은 1.28조원이고, 억원으로는 12,833 이다 — 1억원 = 100 백만원.
    """
    return None if v is None else v / 100.0


def unit_sane(v: dict) -> list[str]:
    """금액이 **수량 × 종가**와 자릿수라도 맞는가.

    「순매수 = 매수 − 매도」는 어느 단위로 재든 성립하므로 **단위 착오를 못
    잡는다.** 실제로 100배 틀린 채 그 검산을 통과했다. 그래서 두 계열을
    맞대는 검사를 따로 둔다 — 체결가는 종가와 다르므로 넉넉히 보되,
    100배짜리 사고는 반드시 걸리게 한다.
    """
    bad = []
    close = v.get("close")
    if not close:
        return bad
    for who in ("외국인", "기관"):
        a = v.get(who) or {}
        q, m = a.get("순매수수량"), a.get("순매수금액")
        if q is None or m is None:
            continue
        want = q * close / 1e8            # 수량 × 종가 → 억원
        # **큰 금액에서만 잰다.** 작은 금액은 반올림이 지배해서 −1억 대 −2억
        # 같은 것이 2배로 잡힌다. 실제로 그렇게 네 종목이 걸렸는데 넷 다
        # 1~5억원짜리였다. 단위 사고는 100배로 나타나므로 큰 쪽만 봐도
        # 반드시 걸린다 — 삼성전자라면 12,833억 대 0.128억이다.
        if abs(want) < MIN_EOK_FOR_UNIT_CHECK:
            continue
        got = eok_from_pbmn(m)
        ratio = abs(got / want) if want else 0
        # 체결가는 종가가 아니므로 넉넉히 본다. 자릿수만 잡으면 된다.
        if not (0.5 <= ratio <= 2.0):
            bad.append("%s 금액 %.0f억 이 수량×종가 %.0f억 과 %.2f 배 어긋난다 "
                       "— 단위를 의심하라" % (who, got, want, ratio))
    return bad


def has_flows(v: dict) -> bool:
    """수급 칸이 실제로 채워져 있는가.

    **장중에는 원천이 투자자 칸을 빈 문자열로 준다.** 2026-09-23 14:07 에
    확인했다 — `stck_clpr` 는 현재가가 오는데 `frgn_ntby_qty` 는 `''` 였다.
    그대로 두면 「395종목 수집 성공」이라 말하면서 속이 빈 파일이 나간다.
    """
    return any((v.get(who) or {}).get("순매수수량") is not None
               for who in ("외국인", "기관"))


def fetch_one(kis, code: str) -> dict | None:
    """한 종목의 일자별 투자자. **맨 윗줄(가장 최근 거래일)만** 쓴다."""
    d = kis.get("/uapi/domestic-stock/v1/quotations/inquire-investor",
                "FHKST01010900",
                {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": code})
    rows = d.get("output") or []
    if not rows:
        return None
    r = rows[0]
    out = {"bizdate": r.get("stck_bsop_date"), "close": num(r.get("stck_clpr"))}
    for who, pre in (("외국인", "frgn"), ("기관", "orgn"), ("개인", "prsn")):
        out[who] = {
            "매수수량": num(r.get(f"{pre}_shnu_vol")),
            "매도수량": num(r.get(f"{pre}_seln_vol")),
            "순매수수량": num(r.get(f"{pre}_ntby_qty")),
            "매수금액": num(r.get(f"{pre}_shnu_tr_pbmn")),
            "매도금액": num(r.get(f"{pre}_seln_tr_pbmn")),
            "순매수금액": num(r.get(f"{pre}_ntby_tr_pbmn")),
        }
    return out


def check_row(v: dict) -> list[str]:
    """**순매수 = 매수 − 매도** 를 수량과 금액 양쪽에서 되짚는다.

    네이버에는 없던 검산이다. 원천이 내부적으로 어긋나면 그 종목은 버린다 —
    어긋난 줄을 표에 싣느니 빼는 편이 낫다(fin-data-integrity 3단계).
    """
    bad = []
    for who in ("외국인", "기관", "개인"):
        a = v.get(who) or {}
        for kind, b, s, n in (("수량", "매수수량", "매도수량", "순매수수량"),
                              ("금액", "매수금액", "매도금액", "순매수금액")):
            if a.get(b) is None or a.get(s) is None or a.get(n) is None:
                continue
            got, want = a[n], a[b] - a[s]
            # 금액 단위는 **백만원**이다. 반올림 오차가 있을 수 있어 1 까지 본다.
            if abs(got - want) > 1:
                bad.append(f"{who} {kind}: 순매수 {got:,.0f} ≠ 매수−매도 {want:,.0f}")
    return bad


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-market", type=int, default=200,
                    help="시장별로 거래대금 상위 몇 종목을 부를지 (기본 200)")
    ap.add_argument("--date", help="기준일을 고정한다 (YYYYMMDD). 기본은 원천이 주는 날")
    args = ap.parse_args()

    if not os.environ.get("KIS_APP_KEY") or not os.environ.get("KIS_APP_SECRET"):
        print("KIS_APP_KEY·KIS_APP_SECRET 이 없습니다 — 러너에서만 됩니다"
              "(세션은 9443 포트를 못 엽니다)", file=sys.stderr)
        return 2

    from kis_lib import KisClient  # noqa: PLC0415

    now = datetime.now(KST)
    cand = pick_candidates(args.per_market)
    total = sum(len(v) for v in cand.values())
    if not total:
        print("부를 종목이 없습니다 — 네이버 종목 목록을 못 받았습니다", file=sys.stderr)
        return 1

    kis = KisClient()
    t0 = time.time()
    got: dict[str, list[dict]] = {}
    dropped: list[str] = []
    failed: list[str] = []
    empty: list[str] = []
    seen_dates: dict[str, int] = {}

    for mkt, rows in cand.items():
        got[mkt] = []
        for k, r in enumerate(rows, 1):
            try:
                v = fetch_one(kis, r["code"])
            except Exception as e:  # noqa: BLE001
                failed.append(f"{r['name']}({r['code']}): {str(e)[:80]}")
                continue
            if not v:
                failed.append(f"{r['name']}({r['code']}): 빈 응답")
                continue
            if not has_flows(v):
                empty.append(f"{r['name']}({r['code']})")
                continue
            bad = check_row(v) + unit_sane(v)
            if bad:
                dropped.append(f"{r['name']}({r['code']}): {bad[0]}")
                continue
            seen_dates[str(v["bizdate"])] = seen_dates.get(str(v["bizdate"]), 0) + 1
            v["code"], v["name"], v["market"] = r["code"], r["name"], mkt
            v["change_pct"] = r.get("change_pct")
            v["value_eok"] = r.get("value_eok")
            got[mkt].append(v)
            if k % 50 == 0:
                print(f"  {mkt} {k}/{len(rows)} · {time.time() - t0:.0f}초", flush=True)

    # 읽기가 끊긴 종목은 **한 번만** 다시 부른다. 2026-09-23 수집에서 400 중
    # 5 종목이 read timeout 으로 빠졌다 — 한 번 더 부르면 대개 들어온다.
    if failed:
        again, failed = list(failed), []
        print(f"\n못 받은 {len(again)} 종목을 한 번 더 부른다", flush=True)
        by_code = {r["code"]: (m, r) for m, rows in cand.items() for r in rows}
        for line in again:
            code = line.split("(")[-1].split(")")[0]
            mkt_r = by_code.get(code)
            if not mkt_r:
                failed.append(line)
                continue
            mkt, r = mkt_r
            try:
                v = fetch_one(kis, code)
            except Exception as e:  # noqa: BLE001
                failed.append(f"{r['name']}({code}): {str(e)[:80]}")
                continue
            if not v or not has_flows(v) or check_row(v) or unit_sane(v):
                failed.append(f"{r['name']}({code}): 다시 불러도 쓸 수 없음")
                continue
            seen_dates[str(v["bizdate"])] = seen_dates.get(str(v["bizdate"]), 0) + 1
            v["code"], v["name"], v["market"] = code, r["name"], mkt
            v["change_pct"], v["value_eok"] = r.get("change_pct"), r.get("value_eok")
            got[mkt].append(v)

    # **속이 빈 판은 쓰지 않는다.** 장중에 돌면 원천이 투자자 칸을 빈 문자열로
    # 주므로 「수백 종목 수집 성공」이라 말하면서 순위가 0 줄인 파일이 나온다.
    # 그런 파일을 남기면 다음 판이 그것을 믿고 덮어쓸 수 있다. 쓰지 않고
    # 끝 상태 1 로 끝내 워크플로가 붉게 서도록 한다.
    usable = sum(len(v) for v in got.values())
    if usable < total * 0.5:
        print(f"\n쓸 수 있는 종목이 {usable}/{total} 뿐입니다 — 파일을 쓰지 않습니다.",
              file=sys.stderr)
        if len(empty) > usable:
            print("원천이 수급 칸을 비워 보냈습니다. **장중에는 이 계열이 비어 있습니다** "
                  "— 마감(15:30) 뒤, 확정치가 오는 저녁에 돌리십시오.", file=sys.stderr)
        return 1

    # **기준일이 갈리면 섞지 않는다.** 종목마다 다른 날이 오면 그 자체가
    # 원천이 갱신 중이라는 뜻이다. 가장 많이 나온 날만 남기고 나머지는 버린다.
    bizdate = args.date or (max(seen_dates, key=seen_dates.get) if seen_dates else None)
    mixed = {d: n for d, n in seen_dates.items() if d != bizdate}
    for mkt in got:
        before = len(got[mkt])
        got[mkt] = [v for v in got[mkt] if str(v["bizdate"]) == str(bizdate)]
        if before != len(got[mkt]):
            print(f"::warning::{mkt} 에서 기준일이 다른 {before - len(got[mkt])} 종목을 뺐습니다")

    # 시장 × 주체 × 매수/매도 로 상위 20 을 **우리가** 정렬한다.
    rank: dict[str, dict] = {}
    for mkt, rows in got.items():
        rank[mkt] = {}
        for who in ("외국인", "기관"):
            buy = sorted((v for v in rows if (v[who]["순매수금액"] or 0) > 0),
                         key=lambda v: v[who]["순매수금액"], reverse=True)[:TOPN]
            sell = sorted((v for v in rows if (v[who]["순매수금액"] or 0) < 0),
                          key=lambda v: v[who]["순매수금액"])[:TOPN]

            def line(v, _who=who):
                a = v[_who]
                return {"code": v["code"], "name": v["name"], "close": v["close"],
                        "change_pct": v.get("change_pct"),
                        "qty": a["순매수수량"],
                        "value_eok": eok_from_pbmn(a["순매수금액"])}

            rank[mkt][who] = {"매수": [line(v) for v in buy],
                              "매도": [line(v) for v in sell]}

    elapsed = time.time() - t0
    out = {
        "무엇": "종목별 외국인·기관 순매수 — 한국투자증권 오픈API 확정 금액",
        "generated_at_kst": now.strftime("%Y-%m-%d %H:%M:%S"),
        "bizdate": bizdate,
        "tr_id": "FHKST01010900",
        "표본": {m: len(v) for m, v in got.items()},
        "부른 종목": total,
        "걸린 시간(초)": round(elapsed),
        "주의": ("거래소 전종목이 아니라 **거래대금 상위 표본** 안에서의 순위입니다. "
                 f"시장별 상위 {args.per_market} 종목을 불렀습니다."),
        "검산": {
            "규칙": ["순매수 = 매수 − 매도 (수량·금액 양쪽)",
                     "순매수금액 ≈ 순매수수량 × 종가 (자릿수 — 단위 착오를 잡는다)"],
            "금액 단위": "원천의 *_tr_pbmn 은 **백만원**이다. 억원 = 값 / 100.",
            "어긋나 버린 종목": dropped[:50],
            "어긋난 수": len(dropped),
        },
        "못 받은 종목": failed[:50],
        "못 받은 수": len(failed),
        "수급 칸이 비어 뺀 종목": len(empty),
        "기준일이 갈린 것": mixed,
        "rank": rank,
        "rows": got,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)

    print(f"\n기준일 {bizdate} · 표본 "
          + " · ".join(f"{m} {len(v)}" for m, v in got.items())
          + f" · {elapsed:.0f}초")
    if dropped:
        print(f"::warning::검산에 걸려 뺀 종목 {len(dropped)} — 예: {dropped[0]}")
    if failed:
        print(f"::warning::못 받은 종목 {len(failed)} — 예: {failed[0]}")
    if mixed:
        print(f"::warning::기준일이 갈렸습니다 {mixed} — 원천이 갱신 중일 수 있습니다")
    for mkt in rank:
        for who in ("외국인", "기관"):
            b = rank[mkt][who]["매수"]
            if b:
                print(f"  {mkt} {who} 매수 1위 {b[0]['name']} {b[0]['value_eok']:,.0f}억원")
    print(f"기록: {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
