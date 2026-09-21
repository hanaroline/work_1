#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""미국 시장 등락률 상위 종목(무빙)과 빅테크 보드를 수집한다.

MARKET DAILY 카드뉴스(`scripts/build_market_daily.py`)가 읽는 파일을 만든다.

브리핑 세션은 사내 이그레스 정책 때문에 야후·나스닥에 직접 붙지 못한다
(CONNECT 000/403). GitHub 러너는 그 정책 밖에서 도므로 여기서 대신 받아
저장소에 커밋하고, 세션은 커밋된 `data/us_movers/latest.json` 을 읽는다.
`scripts/fetch_market.py` 와 같은 구조다.

무엇을 거르는가
---------------
사양이 요구하는 '어제의 무빙' 기준은 두 가지다.

  * 시가총액 100억 달러 이상
  * **일평균** 거래대금 3억 달러 이상

두 번째가 까다롭다. 스크리너는 당일 거래량만 주므로, 급등한 날 하루만
거래가 터진 종목이 그대로 통과한다. 그래서 **2단으로** 거른다.

  1단 — 미국 전 상장주 스크리너에서 시총 100억 달러 이상만 남긴다.
  2단 — 등락률 상·하위 후보만 야후 시세로 다시 받아
        `averageDailyVolume3Month × 주가` 로 **일평균** 거래대금을 구해 거른다.

2단을 후보에만 돌리는 것은 야후가 한 번에 받아 주는 심볼 수에 한계가
있어서다. 전 종목을 다 받을 이유도 없다 — 상위 3종목만 쓰기 때문이다.

표 하나는 한 출처로
-------------------
사양은 "각 표 안에서 반드시 한 출처로 통일" 을 요구한다. 그래서 무빙 표와
빅테크 표에 **실제로 인쇄되는 값**(종가·등락률)은 둘 다 2단의 야후 시세
한 번의 응답에서 나온다. 나스닥 스크리너는 **후보를 고르는 데만** 쓰고
그 숫자는 인쇄하지 않는다. `printed_from` 에 그 사실을 적어 둔다.

사용법
------
    python3 scripts/fetch_us_movers.py            # 러너에서
"""

from __future__ import annotations

import csv
import datetime as dt
import http.cookiejar
import io
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zoneinfo

# ---------------------------------------------------------------- 설정

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "data", "us_movers")

KST = zoneinfo.ZoneInfo("Asia/Seoul")
ET = zoneinfo.ZoneInfo("America/New_York")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")
TIMEOUT = 30
RETRY = 3

# 사양이 정한 문턱. 바꾸면 산출물 각주도 같이 바뀐다.
MIN_CAP_USD = 10_000_000_000          # 시총 100억 달러
MIN_AVG_DOLLAR_VOL_USD = 300_000_000  # 일평균 거래대금 3억 달러

# 2단으로 넘길 후보 수(등락률 상·하위 각각). 넉넉히 잡아도 야후 배치로 감당된다.
CANDIDATES_PER_SIDE = 150

# 빅테크 보드 10종목. `note_ko` 는 사업 내용만 담는다 — 실적·전망을 섞지 않는다.
BIGTECH = [
    ("NVDA",  "엔비디아",       "AI 가속기 GPU. 데이터센터 학습·추론 칩의 표준"),
    ("MSFT",  "마이크로소프트", "애저 클라우드와 오피스. AI 구독으로 단가를 올린다"),
    ("AAPL",  "애플",           "아이폰과 서비스. 기기 설치대수가 곧 해자"),
    ("GOOGL", "알파벳",         "검색 광고와 구글 클라우드, 자체 TPU"),
    ("AMZN",  "아마존",         "전자상거래와 AWS. 이익은 대부분 클라우드에서"),
    ("META",  "메타",           "인스타그램·페이스북 광고. AI 추천이 단가를 끌어올린다"),
    ("AVGO",  "브로드컴",       "맞춤형 AI 칩(ASIC)과 네트워크 반도체, 인프라 SW"),
    ("TSLA",  "테슬라",         "전기차와 에너지 저장. 자율주행 소프트웨어가 변수"),
    ("TSM",   "TSMC",           "세계 최대 파운드리. 최선단 공정을 사실상 독점"),
    ("AMD",   "AMD",            "서버 CPU와 AI 가속기. 엔비디아의 유일한 대안 축"),
]

NOTE = "GitHub Actions 러너가 수집한 스냅샷. scripts/build_market_daily.py 가 읽는다."

# ---------------------------------------------------------------- HTTP

_CJ = http.cookiejar.CookieJar()
_OPENER = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_CJ))
CRUMB = None

HDRS = {"User-Agent": UA,
        "Accept": "application/json,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9"}


def _open(url, headers=None, timeout=None):
    req = urllib.request.Request(url, headers=headers or HDRS)
    return _OPENER.open(req, timeout=timeout or TIMEOUT)


def _get(url, headers=None):
    """실패하면 잠깐 쉬고 다시. 429·5xx 는 기다릴수록 나아지고 404 는 아니다."""
    last = None
    for attempt in range(RETRY):
        if attempt:
            time.sleep(1.5 * (2 ** (attempt - 1)))
        try:
            with _open(url, headers=headers) as r:
                return r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            last = "HTTP %s" % e.code
            if e.code in (401, 403, 404):
                break
        except Exception as e:                    # noqa: BLE001
            last = str(e)
    raise RuntimeError(last or "unknown error")


def init_crumb(rounds=3):
    """야후 쿠키 + crumb. `scripts/fetch_us100.py` 와 같은 방식이다."""
    global CRUMB
    for attempt in range(1, rounds + 1):
        _CJ.clear()
        for url in ("https://fc.yahoo.com/", "https://finance.yahoo.com/quote/AAPL/"):
            try:
                _open(url).read(64)
            except Exception:                     # noqa: BLE001 — 쿠키만 필요하다
                pass
        for host in ("query2.finance.yahoo.com", "query1.finance.yahoo.com"):
            try:
                v = _open("https://%s/v1/test/getcrumb" % host).read().decode("utf-8", "replace").strip()
                if v and len(v) < 40 and "<" not in v:
                    CRUMB = v
                    log("crumb 확보: %s (쿠키 %d개, 시도 %d)" % (v, len(_CJ), attempt))
                    return CRUMB
            except Exception as e:                # noqa: BLE001
                log("crumb 실패(%s, 시도 %d): %s" % (host, attempt, e))
        time.sleep(2 * attempt)
    CRUMB = None
    log("crumb 을 얻지 못했다")
    return None


def yget(path):
    """query1 이 막히면 query2 로 한 번 더."""
    err = None
    for host in ("query1.finance.yahoo.com", "query2.finance.yahoo.com"):
        try:
            return json.loads(_get("https://%s%s" % (host, path)))
        except Exception as e:                    # noqa: BLE001
            err = e
    raise RuntimeError(str(err))


def log(msg):
    print(msg, flush=True)


def num(v):
    if v is None or isinstance(v, bool):
        return None
    if isinstance(v, str):
        s = v.strip().replace(",", "").replace("$", "").replace("%", "")
        if not s or s in ("--", "N/A", "NA"):
            return None
        v = s
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if f != f or f in (float("inf"), float("-inf")):
        return None
    return f


# ---------------------------------------------------------------- 1단: 유니버스

def universe_nasdaq():
    """나스닥 스크리너 — 미국 3대 거래소 상장주 전체. 시총이 함께 온다."""
    url = ("https://api.nasdaq.com/api/screener/stocks"
           "?tableonly=true&limit=25000&download=true")
    hdrs = dict(HDRS)
    hdrs["Referer"] = "https://www.nasdaq.com/"
    hdrs["Origin"] = "https://www.nasdaq.com"
    raw = _get(url, headers=hdrs)
    data = json.loads(raw)
    rows = (data.get("data") or {}).get("rows") or []
    if not rows:
        raise RuntimeError("rows 가 비었다 (%s)" % raw[:160])
    out = []
    for r in rows:
        sym = (r.get("symbol") or "").strip().upper()
        if not sym or any(c in sym for c in "^/ "):
            continue
        cap = num(r.get("marketCap"))
        if cap is None or cap < MIN_CAP_USD:
            continue
        out.append({"sym": sym,
                    "name": (r.get("name") or "").strip(),
                    "cap_screen": cap,
                    "pct_screen": num(r.get("pctchange"))})
    if len(out) < 200:
        raise RuntimeError("시총 문턱 통과가 %d개뿐이다 — 응답 형태를 확인해야 한다" % len(out))
    return out


def universe_github_csv():
    """대체 경로 — S&P500 구성종목. 나스닥이 막힐 때만 쓴다.

    시총이 없으므로 여기서는 심볼만 얻고, 시총은 2단 야후 시세로 채운다.
    """
    url = ("https://raw.githubusercontent.com/datasets/s-and-p-500-companies"
           "/main/data/constituents.csv")
    txt = _get(url)
    rows = list(csv.DictReader(io.StringIO(txt)))
    out = []
    for r in rows:
        sym = (r.get("Symbol") or "").strip().upper().replace(".", "-")
        if not sym:
            continue
        out.append({"sym": sym, "name": (r.get("Security") or "").strip(),
                    "cap_screen": None, "pct_screen": None})
    if len(out) < 400:
        raise RuntimeError("S&P500 구성종목이 %d개뿐이다" % len(out))
    return out


# ---------------------------------------------------------------- 2단: 야후 시세

QUOTE_FIELDS = ",".join([
    "symbol", "shortName", "longName", "quoteType", "currency",
    "fullExchangeName", "marketState",
    "regularMarketPrice", "regularMarketChange", "regularMarketChangePercent",
    "regularMarketPreviousClose", "regularMarketVolume", "regularMarketTime",
    "averageDailyVolume3Month", "averageDailyVolume10Day", "marketCap",
])


def fetch_quotes(symbols, chunk=60):
    """`v7/finance/quote` 배치. crumb 이 필요하다."""
    got = {}
    syms = list(dict.fromkeys(symbols))
    for i in range(0, len(syms), chunk):
        part = syms[i:i + chunk]
        path = ("/v7/finance/quote?symbols=" + urllib.parse.quote(",".join(part)) +
                "&fields=" + QUOTE_FIELDS + "&formatted=false")
        if CRUMB:
            path += "&crumb=" + urllib.parse.quote(CRUMB)
        try:
            d = yget(path)
        except Exception as e:                    # noqa: BLE001
            log("  시세 묶음 %d~%d 실패: %s" % (i, i + len(part), e))
            time.sleep(1.0)
            continue
        for q in ((d.get("quoteResponse") or {}).get("result") or []):
            s = (q.get("symbol") or "").upper()
            if s:
                got[s] = q
        time.sleep(0.35)
    return got


def session_date_of(q):
    """`regularMarketTime` 을 뉴욕 현지 날짜로 바꾼다 — 그날의 거래일이다."""
    t = num(q.get("regularMarketTime"))
    if not t:
        return None
    return dt.datetime.fromtimestamp(int(t), tz=dt.timezone.utc).astimezone(ET).date().isoformat()


def shape(q, note_ko=None):
    price = num(q.get("regularMarketPrice"))
    avg3m = num(q.get("averageDailyVolume3Month"))
    row = {
        "sym": (q.get("symbol") or "").upper(),
        "name_en": q.get("shortName") or q.get("longName"),
        "price": price,
        "change": num(q.get("regularMarketChange")),
        "change_pct": num(q.get("regularMarketChangePercent")),
        "prev_close": num(q.get("regularMarketPreviousClose")),
        "volume": num(q.get("regularMarketVolume")),
        "avg_volume_3m": avg3m,
        "cap": num(q.get("marketCap")),
        "exchange": q.get("fullExchangeName"),
        "currency": q.get("currency"),
        "market_state": q.get("marketState"),
        "date": session_date_of(q),
    }
    row["avg_dollar_volume"] = (avg3m * price) if (avg3m and price) else None
    row["dollar_volume"] = (row["volume"] * price) if (row["volume"] and price) else None
    if note_ko:
        row["note_ko"] = note_ko
    return row


def eligible(row):
    """사양의 두 문턱을 통과하는가."""
    if row.get("change_pct") is None or row.get("price") is None:
        return False
    if not row.get("cap") or row["cap"] < MIN_CAP_USD:
        return False
    if not row.get("avg_dollar_volume") or row["avg_dollar_volume"] < MIN_AVG_DOLLAR_VOL_USD:
        return False
    return True


# ---------------------------------------------------------------- main

def main():
    started = time.time()
    now_utc = dt.datetime.now(dt.timezone.utc)
    sources = {}

    # --- 1단 ------------------------------------------------------
    uni, uni_src = [], None
    for name, fn in (("nasdaq:screener", universe_nasdaq),
                     ("github:sp500-csv", universe_github_csv)):
        try:
            uni = fn()
            uni_src = name
            sources[name] = {"ok": True, "rows": len(uni)}
            log("유니버스 %s — %d종목" % (name, len(uni)))
            break
        except Exception as e:                    # noqa: BLE001
            sources[name] = {"ok": False, "error": str(e)}
            log("유니버스 %s 실패: %s" % (name, e))
    if not uni:
        log("::error::유니버스를 얻지 못했다")
        return 1

    # --- 후보 추리기 ----------------------------------------------
    if uni_src == "nasdaq:screener":
        rated = [u for u in uni if u.get("pct_screen") is not None]
        rated.sort(key=lambda u: u["pct_screen"], reverse=True)
        cands = rated[:CANDIDATES_PER_SIDE] + rated[-CANDIDATES_PER_SIDE:]
        log("후보 %d종목 (시총 통과 %d 중 등락률 상·하위 각 %d)"
            % (len(cands), len(rated), CANDIDATES_PER_SIDE))
    else:
        cands = uni                                # CSV 경로는 전부 받아 본다
        log("후보 %d종목 (대체 경로라 전부 조회한다)" % len(cands))

    want = [c["sym"] for c in cands] + [s for s, _ko, _n in BIGTECH]

    # --- 2단 ------------------------------------------------------
    init_crumb()
    quotes = fetch_quotes(want)
    sources["yahoo:quote"] = {"ok": bool(quotes), "rows": len(quotes)}
    log("야후 시세 %d/%d종목" % (len(quotes), len(set(want))))
    if not quotes:
        log("::error::야후 시세를 받지 못했다")
        return 1

    # 거래일 — 받아온 시세에서 가장 흔한 날짜를 그 판의 기준일로 삼는다.
    dates = {}
    for q in quotes.values():
        d = session_date_of(q)
        if d:
            dates[d] = dates.get(d, 0) + 1
    session_date = max(dates, key=dates.get) if dates else None
    log("기준 거래일 %s %s" % (session_date, dict(sorted(dates.items()))))

    # --- 거르기 ---------------------------------------------------
    rows, after_cap = [], 0
    for c in cands:
        q = quotes.get(c["sym"])
        if not q or (q.get("quoteType") or "").upper() != "EQUITY":
            continue
        r = shape(q)
        if r["date"] != session_date:              # 다른 날 값을 섞지 않는다
            continue
        if r.get("cap") and r["cap"] >= MIN_CAP_USD:
            after_cap += 1
        if eligible(r):
            rows.append(r)

    rows.sort(key=lambda r: r["change_pct"], reverse=True)
    gainers = rows[:10]
    losers = list(reversed(rows[-10:]))
    log("문턱 통과 %d종목 (시총만 통과 %d)" % (len(rows), after_cap))
    if gainers:
        log("  상위: " + ", ".join("%s %+.2f%%" % (r["sym"], r["change_pct"]) for r in gainers[:5]))
    if losers:
        log("  하위: " + ", ".join("%s %+.2f%%" % (r["sym"], r["change_pct"]) for r in losers[:5]))

    # --- 빅테크 보드 ----------------------------------------------
    bigtech = []
    for sym, ko, note in BIGTECH:
        q = quotes.get(sym)
        if not q:
            log("  빅테크 %s 시세 없음" % sym)
            continue
        r = shape(q, note_ko=note)
        r["name_ko"] = ko
        bigtech.append(r)
    bt_dates = sorted({r["date"] for r in bigtech if r.get("date")})
    log("빅테크 %d/%d종목, 기준일 %s" % (len(bigtech), len(BIGTECH), bt_dates))

    # --- 쓰기 -----------------------------------------------------
    out = {
        "note": NOTE,
        "generated_at_utc": now_utc.isoformat(timespec="seconds"),
        "generated_at_kst": now_utc.astimezone(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "session_date": session_date,
        "session_date_counts": dict(sorted(dates.items())),
        "universe_source": uni_src,
        # 인쇄되는 숫자가 어디서 왔는지 — 사양의 '한 출처로 통일' 은 이걸 말한다.
        "printed_from": "yahoo:quote (v7/finance/quote, 단일 응답)",
        "screened_by": uni_src,
        "filters": {
            "min_cap_usd": MIN_CAP_USD,
            "min_avg_dollar_volume_usd": MIN_AVG_DOLLAR_VOL_USD,
            "avg_volume_basis": "averageDailyVolume3Month",
        },
        "counts": {
            "universe": len(uni),
            "candidates": len(cands),
            "quoted": len(quotes),
            "passed_cap": after_cap,
            "passed_all": len(rows),
        },
        "gainers": gainers,
        "losers": losers,
        "bigtech": bigtech,
        "bigtech_dates": bt_dates,
        "sources": sources,
        "elapsed_sec": round(time.time() - started, 1),
    }

    os.makedirs(OUT_DIR, exist_ok=True)
    for path in (os.path.join(OUT_DIR, "latest.json"),
                 os.path.join(OUT_DIR, "%s.json" % (session_date or now_utc.date().isoformat()))):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=1, sort_keys=False)
        log("씀: %s" % os.path.relpath(path, ROOT))

    ok = bool(gainers) and len(bigtech) == len(BIGTECH)
    log("끝 (%.1fs) — %s" % (out["elapsed_sec"], "정상" if ok else "일부 비었다"))
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
