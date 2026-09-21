#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""**16:00 에 기관 종목별 수급을 받을 수 있는가**를 잰다.

네이버(`trend/trendForeignOrg`)는 못 준다. 2026-09-21 에 여섯 번 재어 확인했다 —
11:51·16:07·16:52·18:07·19:26 까지 기관 칸이 전 거래일이었고 23:45 에야 당일
확정치가 들어왔다. 외국인에게만 장중 잠정치를 주고 기관에는 주지 않기 때문이다.

한국투자증권 오픈API 에는 **가집계·추정집계**라는 다른 계열이 있다. HTS 가 장중과
마감 직후에 보여 주는 바로 그 숫자다. 이름만 보면 16:00 에 찰 것 같지만,
**이름을 믿지 않고 시각별로 재서 가린다.** 이 저장소가 네이버에 했던 것과 같다.

재는 것 셋 (2026-09-18 탐사에서 셋 다 rt_cd=0 으로 열리는 것은 확인했다)

  FHPTJ04400000  외국인·기관 매매종목 가집계 — **종목 순위**. 시장일지의
                 「매수 상위 20」이 필요로 하는 바로 그 표다.
  HHPTJ04160200  종목별 외인·기관 추정가집계 — 한 종목의 추정 순매수.
  FHKST01010900  주식현재가 투자자 — 한 종목의 일자별 개인·외국인·기관.
                 **날짜가 붙어 있어** 「오늘 것이 있는가」를 바로 가린다.

쓰는 법
  python3 scripts/probe_journal_kis.py            # 한 번 재고 기록
  python3 scripts/probe_journal_kis.py --label 16:00

기록은 `data/journal/kis-timing.json` 에 **덧붙인다.** 하루치 한 점이 아니라
시각별 곡선이 있어야 「16:00 에 되는가」를 답할 수 있다.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

KST = timezone(timedelta(hours=9))
OUT = "data/journal/kis-timing.json"
SAMSUNG = "005930"          # 코스피 대표 — 수급이 늘 크게 잡힌다
KOSDAQ_SAMPLE = "247540"    # 에코프로비엠 — 코스닥 쪽도 함께 본다


def today() -> str:
    return datetime.now(KST).strftime("%Y%m%d")


def dig(d, *path):
    for p in path:
        if d is None:
            return None
        d = d[p] if isinstance(d, list) else d.get(p)
    return d


def probe(kis, label: str) -> dict:
    now = datetime.now(KST)
    r = {"잰때": now.strftime("%Y-%m-%d %H:%M:%S KST"), "이름표": label,
         "오늘": today(), "칸": {}}

    # ── ① 종목 순위 (시장일지가 실제로 쓸 표) ───────────────────────────
    # FID_DIV_CLS_CODE 0=수량 1=금액 / FID_RANK_SORT_CLS_CODE 0=순매수상위
    # FID_ETC_CLS_CODE 0=전체 1=외국인 2=기관계 — **기관만 따로 물어본다.**
    for who, etc in (("외국인", "1"), ("기관", "2"), ("전체", "0")):
        try:
            d = kis.get("/uapi/domestic-stock/v1/quotations/foreign-institution-total",
                        "FHPTJ04400000",
                        {"FID_COND_MRKT_DIV_CODE": "V", "FID_COND_SCR_DIV_CODE": "16449",
                         "FID_INPUT_ISCD": "0000", "FID_DIV_CLS_CODE": "1",
                         "FID_RANK_SORT_CLS_CODE": "0", "FID_ETC_CLS_CODE": etc})
            rows = d.get("output") or []
            top = rows[0] if rows else {}
            # **칸 이름을 자르지 않는다.** 첫 탐사에서 14개로 잘라 놓았더니
            # 투신·은행·보험까지만 보이고 사모펀드·연기금이 있는지 알 수 없었다.
            # 종목별 사모펀드 순매수는 시장일지가 NOT FOUND 로 비워 둔 칸이라,
            # 여기 있는지 없는지가 그대로 답이 된다.
            r["칸"][f"순위:{who}"] = {
                "됨": True, "줄수": len(rows),
                "1위": top.get("hts_kor_isnm"),
                "칸이름": sorted(top),
                "1위 줄 전체": top,
            }
        except Exception as e:  # noqa: BLE001
            r["칸"][f"순위:{who}"] = {"됨": False, "까닭": str(e)[:200]}

    # ── ② 한 종목의 추정 가집계 ────────────────────────────────────────
    for code, nm in ((SAMSUNG, "삼성전자"), (KOSDAQ_SAMPLE, "코스닥표본")):
        try:
            d = kis.get("/uapi/domestic-stock/v1/quotations/investor-trend-estimate",
                        "HHPTJ04160200", {"MKSC_SHRN_ISCD": code})
            rows = d.get("output2") or []
            r["칸"][f"추정집계:{nm}"] = {
                "됨": True, "줄수": len(rows),
                "맛보기": rows[0] if rows else None,
            }
        except Exception as e:  # noqa: BLE001
            r["칸"][f"추정집계:{nm}"] = {"됨": False, "까닭": str(e)[:200]}

    # ── ③ 일자별 투자자 — **여기 날짜가 붙어 있다** ────────────────────
    # 「오늘 날짜 줄이 있는가」가 이 탐사의 핵심 물음이다.
    try:
        d = kis.get("/uapi/domestic-stock/v1/quotations/inquire-investor",
                    "FHKST01010900",
                    {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": SAMSUNG})
        rows = d.get("output") or []
        days = [x.get("stck_bsop_date") for x in rows[:5]]
        first = rows[0] if rows else {}
        # **「오늘」과 견주지 않는다.** 자정을 넘겨 재면 달력의 오늘은 아직
        # 장이 열리지 않은 날이라, 맨 윗줄이 직전 거래일인 것이 정상인데도
        # 「오늘 것 아님」으로 잘못 읽힌다. 날짜를 그대로 적고, 곡선에서 이
        # 값이 **언제 다음 날로 넘어가는지**를 본다. 그것이 묻는 바다.
        r["칸"]["일자별투자자:삼성전자"] = {
            "됨": True,
            "맨위 날짜": first.get("stck_bsop_date"),
            "달력상 오늘과 같은가": first.get("stck_bsop_date") == today(),
            "최근 날짜들": days,
            "외국인 순매수수량": first.get("frgn_ntby_qty"),
            "기관 순매수수량": first.get("orgn_ntby_qty"),
            "개인 순매수수량": first.get("prsn_ntby_qty"),
        }
    except Exception as e:  # noqa: BLE001
        r["칸"]["일자별투자자:삼성전자"] = {"됨": False, "까닭": str(e)[:200]}

    return r


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--label", default="", help="잰 때를 부르는 이름 (예: 16:00)")
    args = ap.parse_args()

    if not os.environ.get("KIS_APP_KEY") or not os.environ.get("KIS_APP_SECRET"):
        print("KIS_APP_KEY·KIS_APP_SECRET 이 없습니다 — 러너에서만 됩니다"
              "(세션은 9443 포트를 못 엽니다)", file=sys.stderr)
        return 2

    from kis_lib import KisClient  # noqa: PLC0415

    kis = KisClient()
    r = probe(kis, args.label or datetime.now(KST).strftime("%H:%M"))

    hist = []
    if os.path.exists(OUT):
        try:
            with open(OUT, encoding="utf-8") as fh:
                hist = json.load(fh).get("잰것") or []
        except Exception:  # noqa: BLE001
            hist = []
    hist.append(r)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump({
            "무엇": "KIS 오픈API 가 기관 종목별 수급을 언제 채우는지 시각별로 잰 것",
            "왜": "네이버는 밤에야 채운다(2026-09-21 여섯 번 실측). 16:00 발행이 "
                  "되려면 다른 원천이 그때 차 있어야 한다.",
            "잰것": hist[-200:],
        }, fh, ensure_ascii=False, indent=1)

    # 사람이 읽을 요약
    print(f"[{r['이름표']}] {r['잰때']}")
    for k, v in r["칸"].items():
        if not v.get("됨"):
            print(f"  ✗ {k} — {v.get('까닭')}")
            continue
        if k.startswith("순위:"):
            print(f"  ○ {k} · {v['줄수']}줄 · 1위 {v['1위']} · 칸 {len(v['칸이름'])}개")
        elif k.startswith("일자별"):
            mark = f"맨위 {v['맨위 날짜']}"
            print(f"  ○ {k} · {mark} · 외국인 {v['외국인 순매수수량']} / "
                  f"기관 {v['기관 순매수수량']}")
        else:
            print(f"  ○ {k} · {v['줄수']}줄")
    print(f"기록: {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
