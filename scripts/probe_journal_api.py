#!/usr/bin/env python3
"""시장일지에 필요한 순위 원천을 **브라우저 없이** 열 수 있는지 본다.

상한가 때와 같은 순서를 따른다 — 브라우저로 관찰해 후보를 찾고
(`scripts/probe_journal_xhr.mjs`), 그 후보를 평범한 요청으로도 받을 수
있는지 여기서 확인한 뒤에야 수집기에 붙인다.

여기서 확인하려는 것은 셋이다.

  ① `stock/default` 를 **끝까지 넘길 수 있는가.**
     넘길 수 있으면 전종목 한 벌을 받아 순위를 우리가 매기면 된다.
     등락률·거래대금·거래량·전일대비 거래량증가율·52주 최고가가 모두
     한 줄에 들어 있으므로, 상승률 상위·거래대금 상위·거래량 급증·신고가가
     **주소 하나로** 풀린다.
  ② `orderType` · `marketType` 에 어떤 값이 먹는가. 특히 ETF.
  ③ 기관·외국인 **종목별** 순매수 순위를 주는 자리가 있는가.
     이것만 `stock/default` 에 없다.

세션은 네이버에 직접 못 붙으므로(CONNECT 403) 러너에서만 돈다.
결과는 data/journal/raw/journal_api.txt 와 응답 본문으로 남는다.
"""
from __future__ import annotations

import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
OUT = "data/journal/raw"
os.makedirs(OUT, exist_ok=True)

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
CTX = ssl.create_default_context()
lines: list[str] = []
saved = 0


def say(s: str = "") -> None:
    lines.append(s)
    print(s, flush=True)


def get(url: str, referer: str = "https://stock.naver.com/") -> tuple[int, bytes, str]:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "ko-KR,ko;q=0.9",
            "Referer": referer,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
            return r.status, r.read(), ""
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:2000], str(e)
    except Exception as e:  # noqa: BLE001 — 무엇이 막든 기록만 하고 넘어간다
        return 0, b"", str(e)


def shape(obj, depth: int = 0):
    """응답의 생김새만 뽑는다. 값이 아니라 뼈대를 본다."""
    if depth > 2:
        return "…"
    if isinstance(obj, dict):
        return {k: shape(v, depth + 1) for k, v in list(obj.items())[:14]}
    if isinstance(obj, list):
        return [f"[{len(obj)}개]", shape(obj[0], depth + 1)] if obj else "[]"
    return type(obj).__name__


def probe(name: str, url: str, keep: bool = True, referer: str = "https://stock.naver.com/") -> object | None:
    global saved
    say(f"### {name}")
    say(f"    {url}")
    status, body, err = get(url, referer)
    if status != 200:
        say(f"    실패 {status} {err[:120]}")
        say("")
        return None
    say(f"    200 · {len(body)} bytes")
    data = None
    try:
        data = json.loads(body)
        say(f"    모양: {json.dumps(shape(data), ensure_ascii=False)[:600]}")
    except Exception:
        txt = body.decode("utf-8", "replace")
        say(f"    JSON 아님 · 머리 200자: {txt[:200]!r}")
    if keep:
        f = os.path.join(OUT, f"api_{name.replace('/', '_').replace(' ', '_')}.json")
        with open(f, "wb") as fh:
            fh.write(body[:400_000])
        say(f"    → 본문을 {f} 에 남겼다")
        saved += 1
    say("")
    return data


STOCKLIST = "https://stock.naver.com/api/domestic/market/stock/default"

say(f"시장일지 순위 원천 확인 {datetime.now(KST):%Y-%m-%d %H:%M KST}")
say("")

# ── ① 전종목을 끝까지 넘길 수 있는가 ────────────────────────────────
say("========== ① 전종목 넘기기 ==========")
say("")
for idx, size in [(0, 100), (0, 300), (0, 1000), (2000, 100), (2600, 100)]:
    url = f"{STOCKLIST}?tradeType=KRX&marketType=ALL&orderType=marketSum&startIdx={idx}&pageSize={size}"
    d = probe(f"전종목 startIdx={idx} pageSize={size}", url, keep=(idx == 0 and size == 100))
    if isinstance(d, list):
        say(f"    → 실제로 {len(d)} 줄 왔다"
            + (f" · 첫 줄 {d[0].get('itemname')} · 끝 줄 {d[-1].get('itemname')}" if d else ""))
        say("")

# ── ② orderType · marketType 에 무엇이 먹는가 ───────────────────────
say("========== ② orderType · marketType ==========")
say("")
ORDER_TYPES = [
    "up", "down", "quant", "amount", "tradeAmount", "tradeVolume",
    "priceTop", "marketSum", "quantDiff", "quantDiffRate",
    "per", "pbr", "foreignRate", "high52", "newHigh",
]
for ot in ORDER_TYPES:
    url = f"{STOCKLIST}?tradeType=KRX&marketType=ALL&orderType={ot}&startIdx=0&pageSize=5"
    status, body, err = get(url)
    tag = f"orderType={ot}"
    if status != 200:
        say(f"    {tag:28s} 실패 {status} {err[:60]}")
        continue
    try:
        rows = json.loads(body)
    except Exception:
        say(f"    {tag:28s} 200 인데 JSON 아님")
        continue
    if not isinstance(rows, list) or not rows:
        say(f"    {tag:28s} 200 · 빈 응답")
        continue
    head = " / ".join(
        f"{r.get('itemname')}({r.get('prevChangeRate')}%, 대금 {r.get('tradeAmount')})"
        for r in rows[:3]
    )
    say(f"    {tag:28s} 200 · {head[:150]}")
say("")

for mt in ["ALL", "KOSPI", "KOSDAQ", "ETF", "ETN", "KONEX"]:
    url = f"{STOCKLIST}?tradeType=KRX&marketType={mt}&orderType=up&startIdx=0&pageSize=5"
    status, body, err = get(url)
    if status != 200:
        say(f"    marketType={mt:8s} 실패 {status} {err[:60]}")
        continue
    try:
        rows = json.loads(body)
    except Exception:
        say(f"    marketType={mt:8s} 200 인데 JSON 아님")
        continue
    names = ", ".join(str(r.get("itemname")) for r in rows[:4])
    sosok = {str(r.get("sosok")) for r in rows}
    types = {str(r.get("type")) for r in rows}
    say(f"    marketType={mt:8s} 200 · {len(rows)} 줄 · sosok={sosok} type={types} · {names[:90]}")
say("")

# ETF 한 줄은 따로 남긴다 — nav·괴리율 칸이 실제로 차는지 봐야 한다.
probe("ETF 상승률", f"{STOCKLIST}?tradeType=KRX&marketType=ETF&orderType=up&startIdx=0&pageSize=100")

# ── ③ 종목별 투자자 순매수 순위 ─────────────────────────────────────
say("========== ③ 기관·외국인 종목별 순매수 순위 ==========")
say("")
probe(
    "aggregateInvestorRanking",
    "https://stock.naver.com/api/domestic/home/marketaggregate/aggregateInvestorRanking",
)
probe(
    "aggregateInvestor",
    "https://stock.naver.com/api/domestic/home/marketaggregate/aggregateInvestor",
)
# 옛 화면. 껍데기만 오면 바이트 수로 드러난다.
probe(
    "옛 투자자별매매상위 외국인매수 코스피",
    "https://finance.naver.com/sise/sise_deal_rank.naver?investor_gubun=9000&type=buy&sosok=01",
    referer="https://finance.naver.com/sise/",
)
for cand in [
    "https://stock.naver.com/api/domestic/market/investor/ranking?tradeType=KRX&marketType=KOSPI&investorGubun=9000&type=buy&startIdx=0&pageSize=20",
    "https://stock.naver.com/api/domestic/market/trend/investorRanking?tradeType=KRX&marketType=KOSPI&startIdx=0&pageSize=20",
    "https://stock.naver.com/api/domestic/market/stock/investor?tradeType=KRX&marketType=KOSPI&startIdx=0&pageSize=20",
    "https://m.stock.naver.com/api/stocks/investor/foreigner/KOSPI?page=1&pageSize=20",
    "https://finance.daum.net/api/trend/investor/ranks?market=KOSPI&investor=FOREIGN&perPage=20",
    "https://finance.daum.net/api/investors/ranks?market=KOSPI&investor=foreign&perPage=20",
]:
    probe(cand.split("?")[0].rsplit("/", 2)[-2] + "_" + cand.split("?")[0].rsplit("/", 1)[-1], cand, keep=False,
          referer="https://finance.daum.net/" if "daum" in cand else "https://stock.naver.com/")

# ── ④ 테마 · 업종 ───────────────────────────────────────────────────
say("========== ④ 테마 · 업종 ==========")
say("")
probe(
    "테마 등락률",
    "https://stock.naver.com/api/stockSecurity/rankings/v2/domestic/themes"
    "?sortType=changeRate&size=20&excludeCodes=25&period=daily",
)
probe(
    "업종 등락률",
    "https://stock.naver.com/api/stockSecurity/rankings/v2/domestic/industries"
    "?sortType=changeRate&size=20&excludeCodes=25&period=daily",
)

dest = os.path.join(OUT, "journal_api.txt")
with open(dest, "w", encoding="utf-8") as fh:
    fh.write("\n".join(lines) + "\n")
print(f"\n기록을 {dest} 에 남겼다. 본문 {saved} 건.", file=sys.stderr)
