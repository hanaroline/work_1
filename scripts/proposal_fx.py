#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""달러 일봉을 **원화로 환산**한다.

왜
──────────────────────────────────────────────────────────────────────
해외 종목의 일봉은 달러다. 그대로 재면 달러 기준 수익률·변동성이 나오는데,
**고객은 원화로 사고 원화로 판다.** 애플이 달러로 20% 올라도 그해 원화가
10% 절상되면 고객 손에 남는 것은 8% 다. 반대로 원화가 약해지면 더 남는다.
그 차이를 빼놓고 「연평균 24%」라고 적으면 고객이 겪을 숫자가 아니다.

변동성도 달라진다. 환율이 주가와 같이 움직이면 커지고, 반대로 움직이면
상쇄된다. 미국 주식과 원/달러는 위험회피 때 반대로 가므로 환산 변동성이
낮아지리라 짐작했는데, **실제로 재어 보니 대체로 조금 높아졌다** —
애플 27.9→29.1%, 코카콜라 16.6→18.9%, 존슨앤드존슨 17.6→20.1%. 상쇄보다
환율 자체의 출렁임이 컸다는 뜻이다. 최대낙폭은 반대로 대체로 얕아졌다.
어느 쪽이든 그것이 고객이 실제로 겪는 값이므로 손보지 않는다.

쉬는 날이 다르다
──────────────────────────────────────────────────────────────────────
주가와 환율은 달력이 다르다 — 미국 장이 열린 날 서울 환시가 쉴 수 있고,
그 반대도 있다. 없는 날을 지어내지 않고 **그날 이전의 가장 가까운 환율**을
쓴다. 앞의 값을 끌어다 쓰는 것이지, 만들어 넣는 것이 아니다.

환율보다 **앞선** 주가 봉은 환산하지 않고 버린다. 뒤의 환율을 끌어다 쓰면
그때 있지도 않았던 환율로 과거를 칠하는 셈이 된다.
"""

import bisect
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FX_PATH = os.path.join(ROOT, "data", "proposal", "fx_daily.json")

_CACHE = [None]


def load(path=FX_PATH):
    """환율 계열을 읽는다. 없으면 None — 부른 쪽이 환산을 건너뛴다."""
    if _CACHE[0] is None:
        if not os.path.exists(path):
            _CACHE[0] = False
        else:
            try:
                doc = json.load(open(path, encoding="utf-8"))
                d, r = doc.get("d") or [], doc.get("r") or []
                _CACHE[0] = {"d": d, "r": r, "src": doc.get("source"),
                             "from": doc.get("from"), "to": doc.get("to")} \
                    if len(d) == len(r) and d else False
            except (OSError, ValueError):
                _CACHE[0] = False
    return _CACHE[0] or None


def rate_on(fx, day):
    """그날, 없으면 **그 이전 가장 가까운 날**의 환율. 앞서면 None."""
    i = bisect.bisect_right(fx["d"], day) - 1
    return fx["r"][i] if i >= 0 else None


def to_krw(dates, closes, fx=None):
    """달러 종가를 원화로 바꾼다.

    돌려주는 것은 (날짜, 원화종가, 덮은 비율). 환율보다 앞선 봉은 버리므로
    길이가 줄 수 있다 — 얼마나 덮었는지 함께 돌려주어 부른 쪽이 판단한다.
    """
    fx = fx or load()
    if not fx or not dates or len(dates) != len(closes):
        return dates, closes, 0.0
    d2, c2 = [], []
    for day, c in zip(dates, closes):
        rate = rate_on(fx, day)
        if rate is None or not c:
            continue                      # 환율보다 앞선 봉 — 칠하지 않는다
        d2.append(day)
        c2.append(c * rate)
    return d2, c2, (len(d2) / float(len(dates)) if dates else 0.0)
