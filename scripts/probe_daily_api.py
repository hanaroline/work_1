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
import glob
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
    # ── 다음 금융 — 거래대금 계열이 살아 있는 자리 ────────────────────
    # 2026-09-18 세 번째 관찰에서 잡았다. 네이버가 지수 거래대금을 걷어내고
    # KRX 통계가 로그인 벽으로 막힌 뒤, 계열을 주는 곳은 여기뿐이다.
    # 다음은 거래대금을 `accTradePrice`/`candleAccTradePrice` 로 적는다 —
    # 네이버와 이름이 달라 앞선 관찰의 낱말 검사에 안 걸렸을 뿐이었다.
    #
    # 보는 것 둘. ① 브라우저 없이도 열리는가(다음은 Referer 를 따진다).
    # ② **단위가 우리 기록과 맞는가** — 저장소에 남은 2026-09-16 코스피
    # 거래대금은 16,685,829(백만원)이다. 같은 날 값이 이와 맞으면 백만원이
    # 확정되고, 어긋나면 환산이 필요하다. 짐작하지 않고 대조한다.
    ("다음 지수 일별 KOSPI",
     "https://finance.daum.net/api/market_index/days"
     "?page=1&perPage=10&market=KOSPI&pagination=true",
     "https://finance.daum.net/domestic/kospi"),
    ("다음 지수 일별 KOSDAQ",
     "https://finance.daum.net/api/market_index/days"
     "?page=1&perPage=10&market=KOSDAQ&pagination=true",
     "https://finance.daum.net/domestic/kosdaq"),
    ("다음 지수 일봉 KOSPI (200일)",
     "https://finance.daum.net/api/charts/KGG01P/days?limit=10&adjusted=true",
     "https://finance.daum.net/domestic/kospi"),
]


def get(url, referer="https://stock.naver.com/"):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "application/json",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "Referer": referer,
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


def _known():
    """저장소에 남은 코스피 거래대금(백만원)을 날짜별로 모은다.

    **단위를 짐작하지 않으려는 것이다.** 새 원천이 주는 숫자가 무엇인지는
    같은 날 우리가 이미 가진 값과 맞춰 보면 바로 드러난다 — 투자자별
    구분값을 이 방법으로 확정했고, 그때 짐작이 틀렸음을 알았다.
    """
    out = {}
    for path in sorted(glob.glob("data/market/20??-??-??.json")):
        try:
            with open(path, encoding="utf-8") as fh:
                d = json.load(fh)
        except Exception:                                         # noqa: BLE001
            continue
        ser = ((d.get("index_daily") or {}).get("kospi") or {}).get("series") or []
        for r in ser:
            v = r.get("value_mn_krw")
            if r.get("date") and v:
                out.setdefault(r["date"], v)
    return out


def unit_check(j):
    """새 원천의 값이 우리 기록과 맞는지 같은 날로 대조한다."""
    rows = j.get("data") if isinstance(j, dict) else None
    if not isinstance(rows, list) or not rows or not isinstance(rows[0], dict):
        return []
    known = _known()
    if not known:
        return ["대조할 옛 값이 저장소에 없다"]
    notes = []
    for r in rows:
        day = str(r.get("date") or r.get("candleTime") or "")[:10]
        val = r.get("accTradePrice") or r.get("candleAccTradePrice")
        if day not in known or not val:
            continue
        ours, theirs = float(known[day]), float(val)
        gap = abs(ours - theirs) / ours if ours else 1.0
        notes.append("단위 대조 %s — 우리 %.0f · 새 원천 %.0f · 차이 %.2f%%%s"
                     % (day, ours, theirs, gap * 100,
                        "  ★ 같다(백만원)" if gap < 0.01 else "  ⚠ 어긋난다"))
        if len(notes) >= 3:
            break
    return notes or ["겹치는 날짜가 없어 대조하지 못했다"]


def main():
    os.makedirs(OUT, exist_ok=True)
    lines = ["후보 주소 확인 %s (직전 영업일 어림 %s)"
             % (datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"), BIZ),
             "브라우저 없이 평범한 요청으로 열리는지, 필요한 항목이 있는지 본다.", ""]
    for i, cand in enumerate(CANDIDATES):
        label, url = cand[0], cand[1]
        ref = cand[2] if len(cand) > 2 else "https://stock.naver.com/"
        lines.append("### %s" % label)
        lines.append("    %s" % url)
        try:
            body = get(url, ref)
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
                     "acctradeprice", "candleacctradeprice",
                     "tradevalue", "transactionamount", "거래대금",
                     "tradingvolume", "diffvalue"):
            # 바깥의 `i`(후보 번호)를 덮어쓰지 않도록 이름을 따로 쓴다 —
            # 앞선 판에서 이것을 덮어쓰는 바람에 본문이 전부
            # `daily_api_-1.json` 한 자리에 겹쳐 쓰였다.
            at = low.find(want)
            if at < 0:
                continue
            lines.append("    낱말 있음: %s → …%s…"
                         % (want, body[max(0, at - 30):at + 90].replace("\n", " ")))
        lines.append("    모양: %s" % json.dumps(keys_of(j), ensure_ascii=False)[:700])
        for note in unit_check(j):
            lines.append("    %s" % note)
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
