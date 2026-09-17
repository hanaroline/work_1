# -*- coding: utf-8 -*-
"""브라우저 관찰로 찾은 **후보 주소를 실제로 받아** 쓸 수 있는지 확인한다.

`probe_daily_xhr.mjs` 가 화면이 부르는 주소를 적어 줬다. 다음은 그 주소가
**브라우저 없이도 열리는지**, 그리고 **필요한 항목이 실제로 들어 있는지**를
보는 일이다 — 상한가 때도 이 두 가지를 확인한 뒤에야 파서를 붙였다.

확인할 것 둘.

  ① 일별시세 — 옛 `sise_index_day.naver` 가 주던 **거래대금**이 있는가.
     같이 잡힌 차트 API(`api.stock.naver.com/chart/...`)에는 거래량만 있고
     **거래대금이 없다.** 그래서 이쪽이 진짜 대체재인지 봐야 한다.

  ② 투자자별 — 관찰된 주소는 `tradeType=NXT`(넥스트레이드) 였다. 수집기가
     쓰는 값은 **거래소(KRX)** 기준이므로 `tradeType=KRX` 로도 열리는지,
     그리고 개인/외국인/기관 구분값이 무엇인지 확인해야 한다.

브리핑 세션은 네이버에 직접 못 붙으므로(CONNECT 403) **러너에서만** 돈다.

    python3 scripts/probe_daily_api.py
"""
import json
import os
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
OUT = "data/market/raw"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

# 직전 영업일 어림 — 주말이면 금요일로 당긴다. 정확한 휴장일까지는 보지
# 않는다(없는 날짜를 넣으면 빈 응답이 오고, 그것도 확인거리가 된다).
_d = datetime.now(KST)
while _d.weekday() >= 5:
    _d -= timedelta(days=1)
BIZ = _d.strftime("%Y%m%d")

CANDIDATES = [
    # ── 거래대금 후보 ────────────────────────────────────────────────
    # 아래 넷은 모두 **첫 관찰에서 실제로 오간 주소**다(daily_xhr.txt). 짐작해
    # 넣은 것이 아니라, 지수 화면이 부르는 것 가운데 거래대금이 있을 법한
    # 자리를 골라 항목을 들여다보는 것이다.
    ("일별시세 KOSPI (거래대금 없음을 확인한 자리)",
     "https://stock.naver.com/api/securityFe/api/index/KOSPI/price?page=1&pageSize=20"),
    ("지수 통합 KOSPI (거래대금 후보)",
     "https://stock.naver.com/api/securityFe/api/index/KOSPI/integration"),
    ("실시간 지수 KOSPI (오늘치 거래대금 후보)",
     "https://polling.finance.naver.com/api/realtime/domestic/index/KOSPI"),
    ("지수 차트 KOSPI (일봉 계열)",
     "https://stock.naver.com/api/securityService/chart/domestic/index/KOSPI?periodType=day"),
    ("일별시세 KOSDAQ",
     "https://stock.naver.com/api/securityFe/api/index/KOSDAQ/price?page=1&pageSize=20"),
    ("실시간 지수 KOSDAQ",
     "https://polling.finance.naver.com/api/realtime/domestic/index/KOSDAQ"),
    # ── 투자자별(이미 붙였다 — 계속 열리는지 지키는 뜻) ──────────────
    ("투자자별 KRX·KOSPI",
     "https://stock.naver.com/api/domestic/market/trend/daily"
     "?tradeType=KRX&marketType=KOSPI&bizdate=%s&startIdx=0&pageSize=30" % BIZ),
    ("투자자별 NXT·KOSPI (관찰된 그대로)",
     "https://stock.naver.com/api/domestic/market/trend/daily"
     "?tradeType=NXT&marketType=KOSPI&bizdate=%s&startIdx=0&pageSize=30" % BIZ),
    ("투자자별 KRX·KOSDAQ",
     "https://stock.naver.com/api/domestic/market/trend/daily"
     "?tradeType=KRX&marketType=KOSDAQ&bizdate=%s&startIdx=0&pageSize=30" % BIZ),
]


def get(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "application/json",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "Referer": "https://stock.naver.com/",
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")


def keys_of(obj, depth=0):
    """응답 모양을 한눈에 — 어떤 항목이 있는지 보려는 것이다."""
    if depth > 2:
        return "…"
    if isinstance(obj, dict):
        return {k: keys_of(v, depth + 1) for k, v in list(obj.items())[:14]}
    if isinstance(obj, list):
        return ["[%d개]" % len(obj)] + ([keys_of(obj[0], depth + 1)] if obj else [])
    return type(obj).__name__


def main():
    os.makedirs(OUT, exist_ok=True)
    lines = ["후보 주소 확인 %s (직전 영업일 어림 %s)"
             % (datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"), BIZ),
             "브라우저 없이 평범한 요청으로 열리는지, 필요한 항목이 있는지 본다.", ""]
    for i, (label, url) in enumerate(CANDIDATES):
        lines.append("### %s" % label)
        lines.append("    %s" % url)
        try:
            body = get(url)
        except Exception as e:                                    # noqa: BLE001
            lines.append("    실패: %s: %s" % (type(e).__name__, str(e)[:120]))
            lines.append("")
            continue
        lines.append("    200 · %d bytes" % len(body))
        try:
            j = json.loads(body)
        except ValueError:
            lines.append("    JSON 이 아니다 — 앞 200자: %s" % body[:200])
            lines.append("")
            continue
        # **거래대금이 있는지**가 일별시세의 핵심 확인 사항이다. 낱말이
        # 있다는 것만으로는 모자라니 **앞뒤를 같이 적어** 값까지 눈으로
        # 본다 — `value` 같은 흔한 낱말은 엉뚱한 자리에도 걸리기 때문이다.
        low = body.lower()
        for want in ("accumulatedtradingvalue", "acctradingvalue", "tradingvalue",
                     "tradevalue", "transactionamount", "거래대금",
                     "tradingvolume", "diffvalue"):
            i = low.find(want)
            if i < 0:
                continue
            lines.append("    낱말 있음: %s → …%s…"
                         % (want, body[max(0, i - 30):i + 90].replace("\n", " ")))
        lines.append("    모양: %s" % json.dumps(keys_of(j), ensure_ascii=False)[:700])
        f = os.path.join(OUT, "daily_api_%d.json" % i)
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(body[:400000])
        lines.append("    → 본문을 %s 에 남겼다" % f)
        lines.append("")
    dest = os.path.join(OUT, "daily_api.txt")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
