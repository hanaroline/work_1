#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""시장일지에 **인쇄될 수치를 기계로 검산한다.**

`fin-data-integrity` 의 3단계다 — 검산이 빌드보다 먼저 온다. 여기서 걸리면
자료를 고치거나 그 수치를 빼고, 통과한 뒤에야 산출물을 짓는다.

여기서 잡는 것은 전부 **추가 조회가 필요 없는 것**들이다. 실제 사고의
절반이 이 자리에서 난다.

  · 기준일이 파일마다 어긋남 (금요일 값을 월요일 것이라 말하는 사고)
  · 인쇄될 등락률이 종가·전일대비와 맞지 않음
  · 거래량 증가율이 거래량·전일거래량과 맞지 않음
  · 「신고가」로 표시될 종목의 종가가 52주 최고가에 못 미침
  · 순위표가 실제로 그 열로 정렬되어 있지 않음
  · 투자자별 순매수의 합이 0 에서 크게 벗어남 (장중 집계와 확정치를 섞은 것)
  · 단위 뒤섞임 — 억원 자리에 원이 들어온 것
  · 표본이 전종목인 양 적혀 있음

끝 상태 0 이면 통과, 1 이면 **짓지 마십시오.**
  --warn-only 를 주면 경고만 하고 0 으로 끝낸다(장중 수집 확인용).
"""
from __future__ import annotations

import argparse
import json
import os
import sys

JOURNAL = "data/journal/latest.json"
MARKET = "data/market/latest.json"

errs: list[str] = []
warns: list[str] = []
oks: list[str] = []


def bad(msg: str) -> None:
    errs.append(msg)


def warn(msg: str) -> None:
    warns.append(msg)


def ok(msg: str) -> None:
    oks.append(msg)


def load(p: str):
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8") as fh:
        return json.load(fh)


def close_enough(a, b, tol) -> bool:
    if a is None or b is None:
        return True          # 없는 값은 여기서 따지지 않는다. 비었다고 따로 센다.
    return abs(a - b) <= tol


def check_rows(rows: list[dict], label: str) -> None:
    """한 줄 안에서 스스로 맞아떨어져야 하는 것들."""
    n_pct, n_vol, n_unit = 0, 0, 0
    for r in rows:
        close, chg, pctv = r.get("close"), r.get("change"), r.get("change_pct")
        if close is not None and chg is not None and pctv is not None:
            prev = close - chg
            if prev > 0:
                calc = chg / prev * 100.0
                # 원천이 소수 둘째 자리에서 끊으므로 0.05%p 까지 봐 준다.
                if not close_enough(calc, pctv, 0.05):
                    n_pct += 1
                    if n_pct <= 3:
                        bad("%s · %s 등락률이 맞지 않는다 — 적힌 값 %.2f%% · "
                            "종가 %s 와 전일대비 %s 로 셈하면 %.2f%%"
                            % (label, r.get("name"), pctv, close, chg, calc))
        vol, pv, vdp = r.get("volume"), r.get("prev_volume"), r.get("volume_diff_pct")
        if vol is not None and pv and vdp is not None:
            calc = (vol - pv) / pv * 100.0
            if not close_enough(calc, vdp, max(1.0, abs(calc) * 0.01)):
                n_vol += 1
                if n_vol <= 3:
                    bad("%s · %s 거래량 증가율이 맞지 않는다 — 적힌 값 %.1f%% · "
                        "셈하면 %.1f%%" % (label, r.get("name"), vdp, calc))
        # 단위 — 억원 자리에 원이 들어오면 자릿수가 터진다.
        v = r.get("value_eok")
        if v is not None and v > 5_000_000:
            n_unit += 1
            bad("%s · %s 거래대금 %s 억원 — 단위가 뒤섞인 듯하다" % (label, r.get("name"), v))
    if not (n_pct or n_vol or n_unit):
        ok("%s · %d 줄 — 등락률·거래량증가율·단위 이상 없음" % (label, len(rows)))


def check_sorted(rows: list[dict], key: str, label: str, reverse: bool = True) -> None:
    vals = [r.get(key) for r in rows if r.get(key) is not None]
    if len(vals) < 2:
        return
    srt = sorted(vals, reverse=reverse)
    if vals != srt:
        bad("%s 가 %s 로 정렬되어 있지 않다 — 표 머리와 차례가 어긋난다" % (label, key))
    else:
        ok("%s · %s 차례 이상 없음" % (label, key))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--warn-only", action="store_true")
    args = ap.parse_args()

    jr = load(JOURNAL)
    mk = load(MARKET)
    if not jr:
        print("data/journal/latest.json 이 없습니다", file=sys.stderr)
        return 1

    # ── ① 기준일 ────────────────────────────────────────────────────
    bd = jr.get("bizdate")
    kd = ((mk or {}).get("indices") or {}).get("kospi", {}).get("date")
    if kd and bd != kd:
        warn("순위 파일 기준일 %s · 지수 종가일 %s — 산출물에 두 날짜를 모두 달아야 한다"
             % (bd, kd))
    else:
        ok("기준일 %s — 순위 파일과 지수 종가일이 같다" % bd)

    if jr.get("market_status") == "OPEN":
        warn("장중(%s)에 받은 자료다 — 순위·상한가·신고가는 잠정값이다"
             % jr.get("generated_at_kst"))

    uni = jr.get("universe") or {}
    if (uni.get("표본") or 0) < 300:
        bad("표본이 %s 종목뿐이다 — 순위를 매길 만큼 받지 못했다" % uni.get("표본"))
    else:
        ok("표본 %s 종목 (코스피 %s · 코스닥 %s)"
           % (uni.get("표본"), uni.get("코스피"), uni.get("코스닥")))
    if "전종목" in json.dumps(uni, ensure_ascii=False):
        bad("universe 에 「전종목」이라 적혀 있다 — 표본이다. 이름을 고치십시오")

    # ── ② 줄 안의 셈 ────────────────────────────────────────────────
    for mkt, kinds in (jr.get("rank") or {}).items():
        for kind, rows in kinds.items():
            if not isinstance(rows, list) or not rows:
                continue
            check_rows(rows, f"{mkt} {kind}")
    for kind, key in (("상승률상위", "change_pct"), ("거래대금상위", "value_eok")):
        for mkt in ("코스피", "코스닥"):
            rows = ((jr.get("rank") or {}).get(mkt) or {}).get(kind) or []
            check_sorted(rows, key, f"{mkt} {kind}")

    # ── ③ 신고가 판정 ───────────────────────────────────────────────
    wrong = 0
    for mkt, kinds in (jr.get("rank") or {}).items():
        for r in (kinds.get("신고가") or []):
            if r.get("close") is None or r.get("w52_high") is None:
                wrong += 1
            elif r["close"] < r["w52_high"]:
                wrong += 1
                bad("%s · %s 를 신고가로 뽑았는데 종가 %s 가 52주 최고가 %s 에 못 미친다"
                    % (mkt, r.get("name"), r["close"], r["w52_high"]))
    if not wrong:
        ok("신고가 판정 이상 없음 (종가 ≥ 52주 최고가)")

    # ── ④ 상한가 판정 ───────────────────────────────────────────────
    for mkt, kinds in (jr.get("rank") or {}).items():
        for r in (kinds.get("상한가") or []):
            if (r.get("change_pct") or 0) < 20:
                bad("%s · %s 를 상한가로 뽑았는데 등락률이 %s%% 다"
                    % (mkt, r.get("name"), r.get("change_pct")))

    # ── ⑤ 투자자별 합계 ─────────────────────────────────────────────
    for mkt, o in (jr.get("investor_daily") or {}).items():
        if not o:
            warn("%s 투자자별 순매수 계열을 받지 못했다" % mkt)
            continue
        row = next((r for r in o["rows"] if r.get("date") == bd), None)
        if not row:
            warn("%s 투자자별 계열에 기준일 %s 줄이 없다" % (mkt, bd))
            continue
        parts = [row.get("retail"), row.get("foreign"), row.get("institution")]
        etc = (row.get("detail") or {}).get("기타법인")
        if all(v is not None for v in parts) and etc is not None:
            tot = sum(parts) + etc
            scale = max(abs(v) for v in parts) or 1
            # 개인+외국인+기관+기타법인 은 0 이어야 한다. 크게 어긋나면
            # 장중 집계와 확정치를 섞은 것이다(지침 3-4절).
            if abs(tot) > max(200, scale * 0.03):
                bad("%s 투자자별 순매수 합이 %+,.0f 억원 — 0 에서 너무 멀다. "
                    "장중 집계와 확정치가 섞였을 수 있다" % (mkt, tot))
            else:
                ok("%s 투자자별 순매수 합 %+,.0f 억원 — 0 언저리" % (mkt, tot))
        # 기관 안쪽 합이 기관계와 맞는가
        det = row.get("detail") or {}
        inner = [det.get(k) for k in ("금융투자", "보험", "투신", "사모펀드",
                                      "은행", "기타금융", "연기금")]
        if row.get("institution") is not None and all(v is not None for v in inner):
            s = sum(inner)
            if abs(s - row["institution"]) > max(50, abs(row["institution"]) * 0.02):
                bad("%s 기관 안쪽 합 %+,.0f 억원이 기관계 %+,.0f 억원과 다르다"
                    % (mkt, s, row["institution"]))
            else:
                ok("%s 기관 안쪽 합이 기관계와 맞는다" % mkt)

    # ── ⑥ 종목별 수급 ───────────────────────────────────────────────
    for mkt, o in (jr.get("investor_rank") or {}).items():
        if not o:
            warn("%s 종목별 기관·외국인 순매수를 받지 못했다 — 표를 비우고 "
                 "NOT FOUND 를 달아야 한다" % mkt)
            continue
        for side, s in (o.get("sides") or {}).items():
            dates = {r.get("bizdate") for r in (s.get("buy") or []) if r.get("bizdate")}
            if len(dates) > 1:
                warn("%s %s 매수상위의 기준일이 %s 로 갈린다" % (mkt, side, sorted(dates)))
            elif dates and bd and dates != {bd.replace("-", "")}:
                warn("%s %s 매수상위 기준일 %s 이 순위 파일 기준일 %s 과 다르다"
                     % (mkt, side, sorted(dates)[0], bd))
            if s.get("estimated"):
                warn("%s %s 매수상위가 장중 추정치(estimated)다" % (mkt, side))
            if s.get("rank_basis", "").startswith("수량"):
                warn("%s %s 매수상위가 **수량 기준**이다 — 금액 순위가 아니므로 "
                     "표 이름에 적어야 한다" % (mkt, side))

    # ── ⑦ ETF ──────────────────────────────────────────────────────
    etf = jr.get("etf") or {}
    if not (etf.get("상승률상위") or etf.get("거래대금상위")):
        warn("ETF 순위를 받지 못했다")
    else:
        check_rows(etf.get("거래대금상위") or [], "ETF 거래대금상위")
        check_sorted(etf.get("거래대금상위") or [], "value_eok", "ETF 거래대금상위")
        if str(etf.get("상승률_기준") or "").startswith("tradingValueDesc"):
            warn("ETF 상승률 순위가 거래대금 상위 100 안에서 매겨졌다 — 그 사실을 표에 적어야 한다")

    # ── 알림 ───────────────────────────────────────────────────────
    print("검산 — 통과 %d · 경고 %d · 오류 %d" % (len(oks), len(warns), len(errs)))
    for m in oks:
        print("  ○", m)
    for m in warns:
        print("  △", m)
    for m in errs:
        print("  ✕", m)
    if errs and not args.warn_only:
        print("\n오류가 있습니다 — **짓지 마십시오.** 자료를 고치거나 그 수치를 빼십시오.",
              file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
