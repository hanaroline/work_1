#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""MARKET DAILY — 모닝시황·마감시황 카드뉴스를 만든다.

    python3 scripts/build_market_daily.py --edition morning
    python3 scripts/build_market_daily.py --edition close --date 2026-09-18

무엇을 만드는가
---------------
세로로 스크롤하는 단일 HTML 카드뉴스 한 장과, 그 안에 인쇄된 **모든 숫자**를
등록한 주장 대장(`*.claims.json`)을 함께 낸다. 대장은
`fin-data-integrity` 스킬의 `check_claims.py` 가 읽는 형식이다.

구성(사양)
    표지        MARKET DAILY + 날짜 + 헤드라인 5줄
    마켓보드    1단 기준선 7종 · 2단 어제의 무빙 3종목(+공통 배경 한 줄)
    빅테크보드  종목·종가·등락률·코멘트 + 기억할 포인트 3~4줄
    뉴스카드    5장
    검증 노트   표마다 기준 시점과 출처
    고지문      내부 참고용, 특정종목 매매 권유 아님

숫자와 글은 어디서 오는가
-------------------------
**숫자는 자료에서만 옵니다.** 이 스크립트는 수집 파일에서 값을 읽어 표를
세우고, 같은 값을 대장에 등록한다. 손으로 적을 자리가 없다.

**글은 narrative 파일에서 옵니다.**
`data/market_daily/narrative-<날짜>-<판>.json` 에 헤드라인·코멘트·뉴스카드
본문을 한/영 쌍으로 적어 둔다. 글에 숫자를 박아야 하면 그 파일의 `claims`
배열에 출처와 함께 등록한다 — 등록하지 않은 숫자가 글에 있으면 검산이
잡아내지 못하므로, 되도록 표에 맡기고 글에서는 방향만 말한다.

표 하나는 한 출처로
-------------------
사양은 "지수·개별 종목 시세는 각 표 안에서 반드시 한 출처로 통일" 을
요구한다. 그래서 지수 표는 **한 스냅샷 파일**에서만 값을 읽고, 그 파일에
대상 거래일 값이 없는 항목은 비워 둔다(다른 파일에서 끌어오지 않는다).
어느 파일을 썼는지는 표 밑과 검증 노트에 적는다.
"""

from __future__ import annotations

import argparse
import datetime as dt
import glob
import hashlib
import html
import json
import os
import re
import sys
import zoneinfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = zoneinfo.ZoneInfo("Asia/Seoul")

MARKET_DIR = os.path.join(ROOT, "data", "market")
NARR_DIR = os.path.join(ROOT, "data", "market_daily")
OUT_DIR = os.path.join(ROOT, "docs", "market-daily")

# 사양이 정한 색. 상승은 빨강, 하락은 남색(국내 관행).
C_PRIMARY = "#F58220"      # 미래에셋 주황 — 메인
C_SECOND = "#043B72"       # 미래에셋 남색 — 보조, 하락
C_UP = "#C62828"           # 상승

# 1단 '기준선'. 사양의 7종(모닝) / 국내판 대응(마감).
BASELINE = {
    "morning": [
        ("dow", "다우", "Dow Jones", "pt"),
        ("sp500", "S&P 500", "S&P 500", "pt"),
        ("nasdaq", "나스닥", "Nasdaq Composite", "pt"),
        ("russell", "러셀 2000", "Russell 2000", "pt"),
        ("vix", "VIX", "VIX", "pt"),
        ("wti", "WTI", "WTI crude", "USD/bbl"),
        ("gold", "금", "Gold", "USD/oz"),
    ],
    # 마감시황 기준선은 **아시아 마감**으로 맞춘다. 같은 날 같은 시간대에
    # 닫히는 지수들이라 한 표에 나란히 놓아도 시점이 어긋나지 않는다.
    # `usdkrw` 는 넣지 않는다 — 야후 `KRW=X` 는 24시간 시세라 서울 외환시장
    # 마감이 아니다(플레이북 0-1절). 원/달러는 뉴스카드에서 매매기준율로 쓴다.
    "close": [
        ("kospi", "코스피", "KOSPI", "pt"),
        ("kosdaq", "코스닥", "KOSDAQ", "pt"),
        ("kospi200", "코스피 200", "KOSPI 200", "pt"),
        ("nikkei", "니케이 225", "Nikkei 225", "pt"),
        ("hangseng", "항셍", "Hang Seng", "pt"),
        ("shanghai", "상하이종합", "Shanghai Composite", "pt"),
        ("taiwan", "대만 가권", "TAIEX", "pt"),
    ],
}

# 마감시황 대형주 보드 10종목. 미국판 빅테크 보드와 같이 **고정**이다 —
# 편입·제외를 하지 않아야 날짜별 비교가 그대로 된다. 사업 설명은 시세
# 파일의 `note_ko` 를 그대로 쓴다(지어내지 않는다).
KR_BOARD = ["삼성전자", "SK하이닉스", "LG에너지솔루션", "삼성바이오로직스",
            "현대차", "기아", "셀트리온", "KB금융", "NAVER", "한화에어로스페이스"]

# 영문판 종목명. 없으면 한글을 그대로 두지만, 그러면 영문 모드에 한글이
# 남으므로 자주 쓰는 이름은 여기에 채워 둔다.
KR_NAME_EN = {
    "삼성전자": "Samsung Electronics", "SK하이닉스": "SK Hynix",
    "LG에너지솔루션": "LG Energy Solution", "삼성바이오로직스": "Samsung Biologics",
    "현대차": "Hyundai Motor", "기아": "Kia", "셀트리온": "Celltrion",
    "KB금융": "KB Financial", "NAVER": "NAVER",
    "한화에어로스페이스": "Hanwha Aerospace", "SK스퀘어": "SK Square",
    "리노공업": "Leeno Industrial", "삼성전기": "Samsung Electro-Mechanics",
    "LG이노텍": "LG Innotek", "한미반도체": "Hanmi Semiconductor",
    "POSCO홀딩스": "POSCO Holdings", "LG화학": "LG Chem", "삼성SDI": "Samsung SDI",
    "신한지주": "Shinhan Financial", "하나금융지주": "Hana Financial",
    "현대모비스": "Hyundai Mobis", "카카오": "Kakao", "크래프톤": "Krafton",
    "삼성물산": "Samsung C&T", "SK이노베이션": "SK Innovation",
    "한국전력": "KEPCO", "HMM": "HMM", "알테오젠": "Alteogen",
    "에코프로비엠": "EcoPro BM", "에코프로": "EcoPro", "HLB": "HLB",
    "두산에너빌리티": "Doosan Enerbility", "한화오션": "Hanwha Ocean",
    "삼성중공업": "Samsung Heavy Industries", "HD현대중공업": "HD Hyundai Heavy",
    "HD한국조선해양": "HD Korea Shipbuilding", "현대로템": "Hyundai Rotem",
}


def kr_en(name):
    return KR_NAME_EN.get(name, name)

EDITION_KO = {"morning": "모닝시황", "close": "마감시황"}
EDITION_EN = {"morning": "Morning Brief", "close": "Closing Brief"}


# ---------------------------------------------------------------- 유틸

def log(m):
    print(m, flush=True)


def esc(s):
    return html.escape(str(s if s is not None else ""), quote=True)


def bi(ko, en, cls=""):
    """한/영 쌍. 토글은 html[lang] 으로 갈린다."""
    c = (" " + cls) if cls else ""
    return ('<span class="ko%s">%s</span><span class="en%s">%s</span>'
            % (c, esc(ko), c, esc(en or ko)))


def fmt(v, nd=2):
    if v is None:
        return "—"
    return "{:,.{nd}f}".format(v, nd=nd)


def fmt_pct(v):
    if v is None:
        return "—"
    return "{:+.2f}%".format(v)


def cls_of(v):
    if v is None:
        return "flat"
    return "up" if v > 0 else ("down" if v < 0 else "flat")


def money_usd(v):
    """시가총액·거래대금을 읽기 쉬운 달러 단위로.

    「$611.5억」처럼 기호를 앞에 붙이면 611.5달러인지 611.5억 달러인지가
    한눈에 갈리지 않는다. 한국어 어순대로 「611억 달러」로 적는다.
    """
    if not v:
        return "—"
    if v >= 1e12:
        return "%.2f조 달러" % (v / 1e12)
    if v >= 1e10:
        return "{:,.0f}억 달러".format(v / 1e8)
    return "%.1f억 달러" % (v / 1e8)


def money_usd_en(v):
    if not v:
        return "—"
    if v >= 1e12:
        return "$%.2fT" % (v / 1e12)
    if v >= 1e9:
        return "$%.1fB" % (v / 1e9)
    return "$%.0fM" % (v / 1e6)


def money_krw(v):
    if not v:
        return "—"
    if v >= 1e12:
        return "%.1f조원" % (v / 1e12)
    return "%.0f억원" % (v / 1e8)


# ---------------------------------------------------------------- 자료 읽기

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def pick_snapshot(keys, target_date):
    """지수 표를 **한 파일**로 채울 수 있는 스냅샷을 고른다.

    같은 날짜의 값이라도 24시간 거래되는 항목(원자재·환율)은 수집 시각에
    따라 갱신되므로, 대상 거래일을 **전부** 담은 스냅샷 중 **가장 이른
    것**(마감 직후 수집분)을 쓴다. 뒤늦은 스냅샷일수록 그 봉이 손질돼 있다.
    """
    best = None
    for path in sorted(glob.glob(os.path.join(MARKET_DIR, "20??-??-??.json"))):
        try:
            d = load_json(path)
        except Exception:                      # noqa: BLE001
            continue
        ind = d.get("indices") or {}
        hit = sum(1 for k in keys if (ind.get(k) or {}).get("date") == target_date)
        if best is None or hit > best[0]:
            best = (hit, path, d)
        if hit == len(keys):                   # 전부 맞으면 더 볼 것 없다
            break
    if best is None:
        raise SystemExit("data/market 스냅샷을 찾지 못했다")
    hit, path, d = best
    log("기준선 스냅샷: %s (%s 적중 %d/%d, 수집 %s)"
        % (os.path.relpath(path, ROOT), target_date, hit, len(keys),
           d.get("generated_at_kst")))
    return d, os.path.relpath(path, ROOT), hit


def prev_trading_day(edition, latest):
    """그 판이 다루는 거래일."""
    if edition == "morning":
        # 모닝은 **간밤 미국 마감**이 기준이다.
        return (latest.get("indices", {}).get("sp500") or {}).get("date")
    return (latest.get("indices", {}).get("kospi") or {}).get("date")


# ---------------------------------------------------------------- 주장 대장

class Ledger:
    """인쇄되는 모든 숫자를 모은다. check_claims.py 가 읽는 형식."""

    def __init__(self, deliverable, as_of):
        self.doc = {
            "deliverable": deliverable,
            "as_of": as_of,
            "series_policy": {},
            "claims": [],
            "derived": [],
            "unit_policy": {},
        }
        self._ids = set()

    def series(self, metric, name):
        self.doc["series_policy"][metric] = name

    def unit(self, metric, u):
        self.doc["unit_policy"][metric] = u

    def add(self, cid, **kw):
        if cid in self._ids:
            return cid
        self._ids.add(cid)
        kw.setdefault("verdict", "confirmed")
        kw.setdefault("render", "assert")
        self.doc["claims"].append(dict(id=cid, **kw))
        return cid

    def pct(self, did, frm, to, printed, tol=0.02):
        self.doc["derived"].append({"id": did, "kind": "pct_change",
                                    "from": frm, "to": to,
                                    "printed": round(printed, 2),
                                    "tolerance": tol})

    def level(self, cid, *, metric, text, value, unit, series, as_of,
              tier, source_url, where, **extra):
        self.unit(metric, unit)
        self.series(metric, series)
        return self.add(cid, kind="market_level", metric=metric, text=text,
                        value=value, unit=unit, series=series, as_of=as_of,
                        tier=tier, source_url=source_url,
                        printed_on=[where], **extra)

    def write(self, path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.doc, f, ensure_ascii=False, indent=1)
        return path


def sid(prefix, key):
    """대장 항목 id. **한글 이름에서 충돌하지 않아야 한다.**

    예전에는 영숫자가 아닌 글자를 `_` 로 바꾸기만 했다. 그러면 「삼성전자」·
    「현대차」·「기아」가 **모두 `BT__` 한 덩어리**가 되어 서로를 덮어썼고,
    검산기가 삼성전자의 등락률로 기아의 인쇄값을 대조하며 불일치를 냈다.
    비ASCII가 섞이면 짧은 해시를 붙여 갈라 둔다.
    """
    key = str(key)
    ascii_part = re.sub(r"[^A-Za-z0-9]+", "_", key).strip("_")
    if re.search(r"[^\x00-\x7F]", key):
        tag = hashlib.md5(key.encode("utf-8")).hexdigest()[:6]
        ascii_part = (ascii_part + "_" + tag) if ascii_part else tag
    return (prefix + "_" + ascii_part).upper()[:48]


# ---------------------------------------------------------------- 표 세우기

def baseline_rows(snap, edition, target_date, led, extras):
    """1단 기준선. **한 스냅샷 파일**에서만 읽는다."""
    ind = snap.get("indices") or {}
    src = "야후 파이낸스 (수집기 data/market)"
    url = "https://finance.yahoo.com/"
    rows = []
    for key, ko, en, unit in BASELINE[edition]:
        v = ind.get(key) or {}
        date = v.get("date")
        close, prev = v.get("close"), v.get("prev_close")
        pct = v.get("change_pct")
        ok = (date == target_date) and close is not None
        if ok:
            cid = sid("BL", key)
            led.level(cid, metric=ko, text="%s 종가" % ko, value=round(close, 4),
                      unit=unit, series=src, as_of=date, tier=2,
                      source_url=url, where="baseline")
            if prev:
                pid = led.add(sid("BLP", key), kind="market_level", metric=ko,
                              text="%s 전일 종가" % ko, value=round(prev, 4),
                              unit=unit, series=src, as_of=date, tier=2,
                              source_url=url, render="omit", printed_on=[])
                if pct is not None:
                    led.pct(sid("D_BL", key), pid, cid, pct)
        rows.append({"ko": ko, "en": en, "close": close if ok else None,
                     "pct": pct if ok else None, "unit": unit,
                     "date": date, "ok": ok})
        if not ok:
            extras.append({
                "ko": "%s 은(는) 기준 스냅샷에 %s 값이 없어 비워 두었습니다 (파일의 날짜: %s)."
                      % (ko, target_date, date or "없음"),
                "en": "%s left blank: the reference snapshot has no %s value (file date: %s)."
                      % (en, target_date, date or "none")})
    return rows


def kr_stock_movers(snap, target, led, n=3):
    """국내 전 종목 스크리너가 없을 때 쓰는 대체 유니버스.

    시세 파일의 `stocks`(코스피 대형주 + 코스닥 상위)를 등락률로 세운다.
    **전 종목이 아니므로** 산출물에 그 사실을 반드시 적는다 — 「시장 전체
    1위」로 읽히면 틀린 말이 된다.
    """
    src = "네이버 증시 · 수집 스냅샷 (stocks)"
    url = "https://stock.naver.com/"
    rows = [(k, v) for k, v in (snap.get("stocks") or {}).items()
            if v.get("date") == target and v.get("change_pct") is not None]
    rows.sort(key=lambda kv: kv[1]["change_pct"], reverse=True)
    out = []
    for name, v in rows[:n]:
        cid = sid("MV", name)
        led.level(cid, metric=name, text="%s 종가" % name, value=round(v["close"], 2),
                  unit="KRW", series=src, as_of=target, tier=2, source_url=url,
                  where="movers")
        prev = v.get("prev_close")
        if prev:
            pid = led.add(sid("MVP", name), kind="market_level", metric=name,
                          text="%s 전일 종가" % name, value=round(prev, 2),
                          unit="KRW", series=src, as_of=target, tier=2,
                          source_url=url, render="omit", printed_on=[])
            led.pct(sid("D_MV", name), pid, cid, v["change_pct"], tol=0.05)
        out.append({"key": name, "name": name, "name_en": kr_en(name),
                    "sub_ko": v.get("note_ko"),
                    "sub_en": v.get("note_en") or kr_en(name),
                    "price": v["close"], "pct": v["change_pct"],
                    "cap_ko": "—", "cap_en": "—",
                    "liq_ko": "—", "liq_en": "—",
                    "date": target, "ccy": "KRW"})
    return out


def movers_rows(mv, led, edition):
    """2단 어제의 무빙 — 등락률 상위 3종목."""
    out = []
    if not mv:
        return out
    if edition == "morning":
        src = mv.get("printed_from", "yahoo:quote")
        url = "https://finance.yahoo.com/"
        for r in (mv.get("gainers") or [])[:3]:
            cid = sid("MV", r["sym"])
            led.level(cid, metric=r["sym"], text="%s 종가" % r["sym"],
                      value=round(r["price"], 4), unit="USD", series=src,
                      as_of=r["date"], tier=2, source_url=url, where="movers")
            pid = led.add(sid("MVP", r["sym"]), kind="market_level", metric=r["sym"],
                          text="%s 전일 종가" % r["sym"],
                          value=round(r["prev_close"], 4), unit="USD", series=src,
                          as_of=r["date"], tier=2, source_url=url,
                          render="omit", printed_on=[])
            led.pct(sid("D_MV", r["sym"]), pid, cid, r["change_pct"])
            out.append({"key": r["sym"], "name": r["sym"],
                        "sub_ko": r.get("name_en"), "sub_en": r.get("name_en"),
                        "price": r["price"], "pct": r["change_pct"],
                        "cap_ko": money_usd(r.get("cap")),
                        "cap_en": money_usd_en(r.get("cap")),
                        "liq_ko": money_usd(r.get("avg_dollar_volume")),
                        "liq_en": money_usd_en(r.get("avg_dollar_volume")),
                        "date": r["date"], "ccy": "USD"})
    else:
        src = mv.get("printed_from", "naver:stocklist")
        url = "https://stock.naver.com/"
        for r in (mv.get("gainers") or [])[:3]:
            cid = sid("MV", r["code"])
            led.level(cid, metric=r["name"], text="%s 종가" % r["name"],
                      value=round(r["price"], 2), unit="KRW", series=src,
                      as_of=mv.get("trade_date_kst"), tier=2, source_url=url,
                      where="movers")
            prev = r["price"] - (r.get("change") or 0)
            pid = led.add(sid("MVP", r["code"]), kind="market_level",
                          metric=r["name"], text="%s 전일 종가" % r["name"],
                          value=round(prev, 2), unit="KRW", series=src,
                          as_of=mv.get("trade_date_kst"), tier=2,
                          source_url=url, render="omit", printed_on=[])
            led.pct(sid("D_MV", r["code"]), pid, cid, r["change_pct"], tol=0.05)
            out.append({"key": r["code"], "name": r["name"],
                        "name_en": kr_en(r["name"]),
                        "sub_ko": r.get("market"),
                        "sub_en": {"코스피": "KOSPI", "코스닥": "KOSDAQ"}.get(
                            r.get("market"), r.get("market")),
                        "price": r["price"], "pct": r["change_pct"],
                        "cap_ko": money_krw(r.get("cap")),
                        "cap_en": money_krw(r.get("cap")),
                        "liq_ko": money_krw(r.get("trade_amount")),
                        "liq_en": money_krw(r.get("trade_amount")),
                        "date": mv.get("trade_date_kst"), "ccy": "KRW"})
    return out


def board_rows(mv, led, edition):
    """빅테크 보드(모닝) / 시총 상위 보드(마감)."""
    out = []
    if not mv:
        return out
    if edition == "morning":
        src = mv.get("printed_from", "yahoo:quote")
        url = "https://finance.yahoo.com/"
        for r in mv.get("bigtech") or []:
            cid = sid("BT", r["sym"])
            led.level(cid, metric=r["sym"], text="%s 종가" % r["sym"],
                      value=round(r["price"], 4), unit="USD", series=src,
                      as_of=r["date"], tier=2, source_url=url, where="board")
            pid = led.add(sid("BTP", r["sym"]), kind="market_level", metric=r["sym"],
                          text="%s 전일 종가" % r["sym"],
                          value=round(r["prev_close"], 4), unit="USD", series=src,
                          as_of=r["date"], tier=2, source_url=url,
                          render="omit", printed_on=[])
            led.pct(sid("D_BT", r["sym"]), pid, cid, r["change_pct"])
            out.append({"key": r["sym"], "name_ko": r.get("name_ko") or r["sym"],
                        "name_en": r["sym"], "price": r["price"],
                        "pct": r["change_pct"], "note": r.get("note_ko"),
                        "date": r["date"], "ccy": "USD"})
    return out


def kr_board_rows(snap, target, led):
    """마감시황 대형주 보드 — 고정 10종목을 시세 파일 한 곳에서 읽는다.

    국내 스크리너의 `top_cap` 을 쓰지 않는 이유가 있다. 네이버 목록 API 는
    한 번에 100건까지만 주고 그 100건은 **등락률 상위**라, 거기서 시총으로
    다시 세우면 「급등락한 종목 중 시총 상위」가 나온다. 실제로 삼성전자
    대신 삼성전자우·가온전선이 올라왔다. 시총 상위 보드가 아니다.
    """
    src = "네이버 증시 · 수집 스냅샷 (stocks)"
    url = "https://stock.naver.com/"
    out = []
    for name in KR_BOARD:
        v = (snap.get("stocks") or {}).get(name)
        if not v or v.get("date") != target or v.get("close") is None:
            log("  ! 대형주 보드 결측: %s" % name)
            continue
        cid = sid("BT", name)
        led.level(cid, metric=name, text="%s 종가" % name, value=round(v["close"], 2),
                  unit="KRW", series=src, as_of=target, tier=2, source_url=url,
                  where="board")
        prev = v.get("prev_close")
        if prev:
            pid = led.add(sid("BTP", name), kind="market_level", metric=name,
                          text="%s 전일 종가" % name, value=round(prev, 2),
                          unit="KRW", series=src, as_of=target, tier=2,
                          source_url=url, render="omit", printed_on=[])
            led.pct(sid("D_BT", name), pid, cid, v["change_pct"], tol=0.05)
        out.append({"key": name, "name_ko": name, "name_en": kr_en(name),
                    "price": v["close"], "pct": v["change_pct"],
                    "note": v.get("note_ko"), "note_en": v.get("note_en"),
                    "date": target, "ccy": "KRW"})
    return out


# ---------------------------------------------------------------- HTML

CSS = """
:root{
  --primary:%(primary)s; --second:%(second)s; --up:%(up)s;
  --ink:#1A1A1A; --body:#3D3D3D; --muted:#6C6C6C;
  --hair:#CDCECB; --hair-soft:#E5E4E1; --soft:#F7F8FA; --tint:#ECEFF4;
  --thead:#FAB072;
  --font-ko:'Spoqa Han Sans Neo','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;
  --font-en:'Inter','Aptos','Segoe UI',system-ui,-apple-system,sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:#fff;color:var(--body);font-family:var(--font-ko);
     font-size:19px;line-height:1.65;-webkit-text-size-adjust:100%%;
     font-variant-numeric:tabular-nums}
html[lang="en"] body{font-family:var(--font-en)}
html[lang="ko"] .en{display:none}
html[lang="en"] .ko{display:none}
.wrap{max-width:900px;margin:0 auto;padding:0 24px}
@media (max-width:768px){ .wrap{padding:0 16px} body{font-size:19px} }

/* ---- 한/영 토글 : 우상단, 스크롤 따라 흐름 ---- */
.topbar{display:flex;justify-content:flex-end;padding:14px 0 0}
.lang{display:inline-flex;border:1px solid var(--hair);border-radius:2px;
      overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);background:#fff}
.lang button{font-family:var(--font-en);font-size:14px;font-weight:500;
      letter-spacing:.5px;padding:10px 17px;border:0;background:#fff;
      color:var(--muted);cursor:pointer}
.lang button+button{border-left:1px solid var(--hair)}
.lang button[aria-checked="true"]{background:var(--primary);color:#fff}
.lang button:hover[aria-checked="false"]{background:var(--soft);color:var(--ink)}

/* ---- 표지 ---- */
.cover{background:var(--primary);color:#fff;padding:44px 0 48px;margin-top:14px}
.cover .tag{font-size:14px;letter-spacing:1.4px;opacity:.92;margin:0 0 10px}
.cover h1{font-family:var(--font-en);font-size:58px;line-height:1.02;
      letter-spacing:-1px;font-weight:700;margin:0}
@media (max-width:768px){ .cover h1{font-size:40px} }
.cover .sub{font-size:21px;margin:12px 0 0;font-weight:500}
.cover .meta{font-size:15px;opacity:.94;margin:4px 0 0}
.heads{list-style:none;margin:26px 0 0;padding:0;counter-reset:h}
.heads li{counter-increment:h;position:relative;padding:11px 0 11px 44px;
      border-top:1px solid rgba(255,255,255,.34);font-size:19px;line-height:1.45}
.heads li:last-child{border-bottom:1px solid rgba(255,255,255,.34)}
.heads li::before{content:counter(h,decimal-leading-zero);position:absolute;
      left:0;top:11px;font-family:var(--font-en);font-weight:700;font-size:15px;
      opacity:.95;letter-spacing:.5px}

/* ---- 카드 ---- */
.card{padding:44px 0 0}
.rule{height:1px;background:var(--primary);margin:0 0 16px}
.card h2{font-size:26px;font-weight:700;color:var(--ink);margin:0 0 4px;letter-spacing:-.2px}
@media (max-width:768px){ .card h2{font-size:22px} }
.card h3{font-size:21px;font-weight:600;color:var(--ink);margin:30px 0 8px}
.kicker{font-family:var(--font-en);font-size:13px;letter-spacing:1.3px;
      color:var(--primary);font-weight:700;margin:0 0 6px}
.asof{font-size:14px;color:var(--muted);margin:2px 0 14px;line-height:1.45}
.lede{font-size:19px;margin:0 0 14px}

/* ---- 표 ---- */
table{width:100%%;border-collapse:collapse;border:1px solid var(--hair);
      font-size:17px;margin:0 0 10px}
caption{caption-side:bottom;text-align:left;font-size:14px;color:var(--muted);
      padding:8px 2px 0;line-height:1.5}
th,td{padding:10px 12px;border-bottom:1px solid var(--hair-soft);text-align:left}
thead th{background:var(--thead);color:#1A1A1A;font-weight:700;font-size:16px;
      white-space:nowrap}
tbody tr:hover{background:var(--soft)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.up{color:var(--up);font-weight:600}
.down{color:var(--second);font-weight:600}
.flat{color:var(--muted)}
.nm{font-weight:600;color:var(--ink)}
.nm .sub{display:block;font-weight:400;font-size:14px;color:var(--muted);
      line-height:1.35;margin-top:2px}
.note{font-size:15px;color:var(--body);line-height:1.5}
@media (max-width:640px){
  table{font-size:16px} th,td{padding:9px 8px}
  .hide-sm{display:none}
}

/* ---- 무빙 카드 ---- */
.movers{display:grid;gap:12px;grid-template-columns:repeat(3,1fr);margin:0 0 12px}
@media (max-width:768px){ .movers{grid-template-columns:1fr} }
.mv{border:1px solid var(--hair);border-radius:4px;padding:16px}
.mv .rank{font-family:var(--font-en);font-size:12px;letter-spacing:1.2px;
      color:var(--primary);font-weight:700}
.mv .sym{font-size:22px;font-weight:700;color:var(--ink);margin:2px 0 0}
.mv .co{font-size:14px;color:var(--muted);line-height:1.35;margin:1px 0 8px}
.mv .pc{font-size:30px;font-weight:700;line-height:1.1;
      font-variant-numeric:tabular-nums}
.mv .px{font-size:15px;color:var(--muted);margin:2px 0 8px;
      font-variant-numeric:tabular-nums}
.mv .cm{font-size:15px;line-height:1.5;border-top:1px solid var(--hair-soft);
      padding-top:8px}
.mv dl{margin:8px 0 0;font-size:13px;color:var(--muted);display:flex;gap:14px}
.mv dl{flex-wrap:wrap;row-gap:4px}
.mv dl div{display:flex;gap:5px;white-space:nowrap}
.mv dt{font-weight:500;white-space:nowrap}
.mv dd{margin:0;font-variant-numeric:tabular-nums;white-space:nowrap}

/* ---- 콜아웃 ---- */
.common{background:var(--tint);border-left:3px solid var(--primary);
      padding:14px 18px;font-size:18px;line-height:1.6;margin:0 0 6px}
.points{background:var(--soft);border:1px solid var(--hair-soft);border-radius:4px;
      padding:16px 20px;margin:12px 0 0}
.points p{margin:0 0 8px;font-size:18px;line-height:1.6;padding-left:18px;
      position:relative}
.points p:last-child{margin-bottom:0}
.points p::before{content:"";position:absolute;left:0;top:11px;width:7px;height:7px;
      background:var(--primary);border-radius:50%%}

/* ---- 뉴스카드 ---- */
.news{border:1px solid var(--hair);border-radius:4px;padding:22px 24px;margin:0 0 14px}
.news .cat{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.6px;
      color:#fff;background:var(--second);padding:3px 10px;border-radius:2px;
      margin:0 0 10px}
.news h3{margin:0 0 8px;font-size:21px}
.news ul{margin:10px 0 0;padding:0;list-style:none}
.news li{position:relative;padding:0 0 0 18px;margin:0 0 9px;font-size:18px;
      line-height:1.6}
.news li::before{content:"";position:absolute;left:0;top:11px;width:6px;height:6px;
      background:var(--primary);border-radius:50%%}
.news li:last-child{margin-bottom:0}
@media (max-width:640px){ .news{padding:18px 16px} }

/* ---- 배지 ---- */
.vf{display:inline-block;font-family:var(--font-en);font-size:11px;font-weight:700;
    letter-spacing:.6px;padding:1px 6px;border-radius:2px;vertical-align:2px;
    margin-left:6px;white-space:nowrap}
.vf.ok{background:#E8F1E9;color:#2E8540;border:1px solid #BFD9C4}
.vf.solo{background:#FBF2E0;color:#8A6400;border:1px solid #E6D3A3}
.vf.none{background:#EFEFEF;color:#6C6C6C;border:1px solid #DDD}

/* ---- 검증·고지 ---- */
.verify{font-size:16px;line-height:1.6}
.verify li{margin:0 0 8px}
.foot{margin:44px 0 0;border-top:1px solid var(--hair);padding:18px 0 40px;
      font-size:14px;color:var(--muted);line-height:1.6}
.disc{border:1px solid var(--second);border-left-width:3px;border-radius:2px;
      padding:14px 18px;margin:0 0 14px;font-size:15px;color:var(--ink);
      line-height:1.6}

@media print{
  .lang,.topbar{display:none!important}
  body{font-size:12pt;line-height:1.4}
  .wrap{max-width:100%%;padding:0}
  .card,.news,table,.mv{page-break-inside:avoid}
  h2,h3{page-break-after:avoid}
  .cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
"""

JS = """
(function(){
  var K=document.getElementById('b-ko'), E=document.getElementById('b-en');
  function set(l){
    document.documentElement.lang=l;
    K.setAttribute('aria-checked', String(l==='ko'));
    E.setAttribute('aria-checked', String(l==='en'));
    try{ localStorage.setItem('md-lang', l); }catch(e){}
  }
  K.addEventListener('click', function(){ set('ko'); });
  E.addEventListener('click', function(){ set('en'); });
  var saved=null; try{ saved=localStorage.getItem('md-lang'); }catch(e){}
  set(saved==='en' ? 'en' : 'ko');
})();
"""


def render(ctx):
    P = []
    a = P.append
    ed = ctx["edition"]
    d = ctx["date_ko"]

    a("<!DOCTYPE html>")
    a('<html lang="ko">')
    a("<head>")
    a('<meta charset="utf-8">')
    a('<meta name="viewport" content="width=device-width, initial-scale=1">')
    a("<title>MARKET DAILY %s · %s</title>" % (esc(ctx["date_iso"]), esc(EDITION_KO[ed])))
    a('<meta name="description" content="%s">'
      % esc("미래에셋증권 내부 참고용 %s 카드뉴스 (%s)" % (EDITION_KO[ed], ctx["date_iso"])))
    a("<style>%s</style>" % (CSS % {"primary": C_PRIMARY, "second": C_SECOND, "up": C_UP}))
    a("</head><body>")

    # --- 토글 -----------------------------------------------------
    a('<div class="wrap"><div class="topbar">')
    a('<div class="lang" role="radiogroup" aria-label="Language">')
    a('<button id="b-ko" role="radio" aria-checked="true">KO</button>')
    a('<button id="b-en" role="radio" aria-checked="false">EN</button>')
    a("</div></div></div>")

    # --- 표지 -----------------------------------------------------
    a('<header class="cover"><div class="wrap">')
    a('<p class="tag">%s</p>' % bi("미래에셋증권 · 내부 참고용",
                                   "Mirae Asset Securities · Internal reference"))
    a("<h1>MARKET DAILY</h1>")
    a('<p class="sub">%s</p>' % bi("%s · %s" % (d, EDITION_KO[ed]),
                                   "%s · %s" % (ctx["date_en"], EDITION_EN[ed])))
    a('<p class="meta">%s</p>' % bi(ctx["cover_meta_ko"], ctx["cover_meta_en"]))
    a('<ol class="heads">')
    for h in ctx["headlines"]:
        a("<li>%s</li>" % bi(h["ko"], h["en"]))
    a("</ol>")
    a("</div></header>")

    a('<main class="wrap">')

    # --- 마켓보드 1단 ---------------------------------------------
    a('<section class="card">')
    a('<div class="rule"></div>')
    a('<p class="kicker">MARKET BOARD</p>')
    a("<h2>%s</h2>" % bi("1단 · 기준선", "Part 1 · Benchmarks"))
    a('<p class="asof">%s</p>' % bi(ctx["baseline_asof_ko"], ctx["baseline_asof_en"]))
    a("<table><thead><tr>")
    a("<th>%s</th>" % bi("지표", "Index"))
    a('<th class="num">%s</th>' % bi("종가", "Close"))
    a('<th class="num">%s</th>' % bi("등락률", "Change"))
    a("</tr></thead><tbody>")
    for r in ctx["baseline"]:
        nd = 2 if r["unit"] != "pt" else 2
        a("<tr>")
        a('<td class="nm">%s</td>' % bi(r["ko"], r["en"]))
        a('<td class="num">%s</td>' % (fmt(r["close"], nd)))
        a('<td class="num %s">%s</td>' % (cls_of(r["pct"]), fmt_pct(r["pct"])))
        a("</tr>")
    a("</tbody>")
    a("<caption>%s</caption>" % bi(ctx["baseline_cap_ko"], ctx["baseline_cap_en"]))
    a("</table>")
    a("</section>")

    # --- 마켓보드 2단 ---------------------------------------------
    a('<section class="card">')
    a('<div class="rule"></div>')
    a('<p class="kicker">TOP MOVERS</p>')
    a("<h2>%s</h2>" % bi(ctx["movers_title_ko"], ctx["movers_title_en"]))
    a('<p class="asof">%s</p>' % bi(ctx["movers_asof_ko"], ctx["movers_asof_en"]))
    a('<div class="movers">')
    for i, m in enumerate(ctx["movers"], 1):
        a('<div class="mv">')
        a('<p class="rank">NO.%d</p>' % i)
        a('<p class="sym">%s</p>' % bi(m["name"], m.get("name_en") or m["name"]))
        a('<p class="co">%s</p>' % bi(m["sub_ko"] or "", m["sub_en"] or ""))
        a('<p class="pc %s">%s</p>' % (cls_of(m["pct"]), fmt_pct(m["pct"])))
        a('<p class="px">%s</p>' % bi(
            ("%s원" % fmt(m["price"], 0)) if m["ccy"] == "KRW" else ("$%s" % fmt(m["price"])),
            ("KRW %s" % fmt(m["price"], 0)) if m["ccy"] == "KRW" else ("$%s" % fmt(m["price"]))))
        a('<p class="cm">%s</p>' % bi(m["comment_ko"], m["comment_en"]))
        pairs = []
        if m["cap_ko"] != "—":
            pairs.append((bi("시총", "Cap"), bi(m["cap_ko"], m["cap_en"])))
        if m["liq_ko"] != "—":
            pairs.append((bi(ctx["liq_label_ko"], ctx["liq_label_en"]),
                          bi(m["liq_ko"], m["liq_en"])))
        if pairs:
            a("<dl>")
            for dt_, dd_ in pairs:
                a("<div><dt>%s</dt><dd>%s</dd></div>" % (dt_, dd_))
            a("</dl>")
        a("</div>")
    a("</div>")
    a('<p class="common"><strong>%s</strong> %s</p>'
      % (bi("공통 배경", "Common thread"),
         bi(ctx["movers_common"]["ko"], ctx["movers_common"]["en"])))
    a('<p class="asof">%s</p>' % bi(ctx["movers_filter_ko"], ctx["movers_filter_en"]))
    a("</section>")

    # --- 빅테크 보드 ----------------------------------------------
    a('<section class="card">')
    a('<div class="rule"></div>')
    a('<p class="kicker">%s</p>' % ("BIG TECH BOARD" if ed == "morning" else "LARGE CAP BOARD"))
    a("<h2>%s</h2>" % bi(ctx["board_title_ko"], ctx["board_title_en"]))
    a('<p class="asof">%s</p>' % bi(ctx["board_asof_ko"], ctx["board_asof_en"]))
    a("<table><thead><tr>")
    a("<th>%s</th>" % bi("종목", "Name"))
    a('<th class="num">%s</th>' % bi("종가", "Close"))
    a('<th class="num">%s</th>' % bi("등락률", "Change"))
    a('<th class="hide-sm">%s</th>' % bi("코멘트", "Comment"))
    a("</tr></thead><tbody>")
    for r in ctx["board"]:
        a("<tr>")
        a('<td class="nm">%s</td>' % bi(r["name_ko"], r["name_en"]))
        a('<td class="num">%s</td>' % (fmt(r["price"], 0) if r["ccy"] == "KRW"
                                       else fmt(r["price"])))
        a('<td class="num %s">%s</td>' % (cls_of(r["pct"]), fmt_pct(r["pct"])))
        a('<td class="note hide-sm">%s</td>' % bi(r["comment_ko"], r["comment_en"]))
        a("</tr>")
    a("</tbody>")
    a("<caption>%s</caption>" % bi(ctx["board_cap_ko"], ctx["board_cap_en"]))
    a("</table>")
    a('<div class="points">')
    for p in ctx["board_points"]:
        a("<p>%s</p>" % bi(p["ko"], p["en"]))
    a("</div>")
    a("</section>")

    # --- 뉴스카드 5장 ---------------------------------------------
    a('<section class="card">')
    a('<div class="rule"></div>')
    a('<p class="kicker">NEWS CARDS</p>')
    a("<h2>%s</h2>" % bi("뉴스카드 5장", "Five news cards"))
    a('<p class="asof">%s</p>' % bi(ctx["news_asof_ko"], ctx["news_asof_en"]))
    for c in ctx["cards"]:
        a('<article class="news">')
        a('<span class="cat">%s</span>' % bi(c["cat"]["ko"], c["cat"]["en"]))
        a("<h3>%s</h3>" % bi(c["title"]["ko"], c["title"]["en"]))
        a('<p class="lede">%s</p>' % bi(c["lede"]["ko"], c["lede"]["en"]))
        a("<ul>")
        for b in c["bullets"]:
            badge = ""
            if b.get("badge"):
                lab = {"ok": "2 SOURCES", "solo": "1 SOURCE", "data": "MARKET DATA",
                       "none": "NOT FOUND"}.get(b["badge"], b["badge"])
                k = {"ok": "ok", "data": "ok", "solo": "solo"}.get(b["badge"], "none")
                badge = '<span class="vf %s">%s</span>' % (k, esc(lab))
            a("<li>%s%s</li>" % (bi(b["ko"], b["en"]), badge))
        a("</ul>")
        a("</article>")
    a("</section>")

    # --- 검증 노트 -------------------------------------------------
    a('<section class="card">')
    a('<div class="rule"></div>')
    a('<p class="kicker">VERIFICATION</p>')
    a("<h2>%s</h2>" % bi("검증 노트", "Verification notes"))
    a('<ul class="verify">')
    for v in ctx["verify"]:
        a("<li>%s</li>" % bi(v["ko"], v["en"]))
    a("</ul>")
    a("</section>")

    # --- 고지문 ----------------------------------------------------
    a('<footer class="foot">')
    a('<p class="disc"><strong>%s</strong> %s</p>'
      % (bi("고지", "Disclaimer"),
         bi("본 자료는 내부 참고용으로 작성되었으며, 특정 종목의 매매를 권유하는 자료가 아닙니다. "
            "수록된 시세와 정보는 작성 시점 기준이며 오류가 있을 수 있습니다. "
            "투자 판단의 최종 책임은 투자자 본인에게 있습니다.",
            "This material is prepared for internal reference only and is not a "
            "recommendation to buy or sell any security. Prices and information are as of "
            "the stated time and may contain errors. Investment decisions remain the sole "
            "responsibility of the investor.")))
    a("<p>%s</p>" % bi(ctx["foot_ko"], ctx["foot_en"]))
    a("</footer>")

    a("</main>")
    a("<script>%s</script>" % JS)
    a("</body></html>")
    return "\n".join(P)


# ---------------------------------------------------------------- 조립

def build(edition, date_arg):
    latest = load_json(os.path.join(MARKET_DIR, "latest.json"))

    target = date_arg or prev_trading_day(edition, latest)
    if not target:
        raise SystemExit("대상 거래일을 정하지 못했다 — --date 로 지정하십시오")

    keys = [k for k, _ko, _en, _u in BASELINE[edition]]
    snap, snap_path, hit = pick_snapshot(keys, target)

    mv_path = os.path.join(ROOT, "data",
                           "us_movers" if edition == "morning" else "kr_movers",
                           "latest.json")
    mv = load_json(mv_path) if os.path.exists(mv_path) else None
    mv_rel = os.path.relpath(mv_path, ROOT) if mv else None

    # 무빙 자료의 기준일이 어긋나면 쓰지 않는다 — 하루 어긋난 표가 가장 나쁘다.
    if mv:
        mv_date = mv.get("session_date") or mv.get("trade_date_kst")
        if mv_date != target:
            log("무빙 자료 기준일(%s)이 대상(%s)과 달라 쓰지 않는다" % (mv_date, target))
            mv = None
        elif edition == "close" and mv.get("market_status") != "CLOSE":
            log("무빙 자료가 장중(%s) 수집분이라 마감시황에 쓰지 않는다"
                % mv.get("market_status"))
            mv = None

    narr_path = os.path.join(NARR_DIR, "narrative-%s-%s.json" % (target, edition))
    if not os.path.exists(narr_path):
        raise SystemExit("narrative 파일이 없다: %s" % os.path.relpath(narr_path, ROOT))
    narr = load_json(narr_path)

    now = dt.datetime.now(KST)
    tdate = dt.date.fromisoformat(target)
    wd = "월화수목금토일"[tdate.weekday()]
    date_ko = "%d년 %d월 %d일(%s)" % (tdate.year, tdate.month, tdate.day, wd)
    date_en = tdate.strftime("%B %d, %Y (%a)")

    led = Ledger("MARKET DAILY %s %s" % (target, EDITION_KO[edition]),
                 now.date().isoformat())
    extras = []

    baseline = baseline_rows(snap, edition, target, led, extras)
    movers = movers_rows(mv, led, edition)
    board = board_rows(mv, led, edition)

    # 마감시황은 보드를 시세 파일의 고정 10종목에서 읽는다(kr_board_rows 주석 참고).
    # 무빙은 전 종목 스크리너가 있으면 그것을, 없으면 시세 파일 유니버스를 쓴다.
    movers_narrow = False
    if edition == "close":
        board = kr_board_rows(snap, target, led)
        if not movers:
            movers = kr_stock_movers(snap, target, led)
            movers_narrow = bool(movers)
            if movers_narrow:
                log("무빙을 시세 파일 유니버스(stocks)로 대체했다 — 전 종목이 아니다")

    # narrative 의 코멘트를 붙인다. 없으면 빈 칸으로 두고 경고한다.
    mc = narr.get("mover_comments") or {}
    for m in movers:
        c = mc.get(m["key"]) or {}
        m["comment_ko"] = c.get("ko", "")
        m["comment_en"] = c.get("en", c.get("ko", ""))
        if not m["comment_ko"]:
            log("  ! 무빙 코멘트 없음: %s" % m["key"])
    bc = narr.get("board_comments") or {}
    for r in board:
        c = bc.get(r["key"]) or {}
        r["comment_ko"] = c.get("ko") or (r.get("note") or "")
        r["comment_en"] = (c.get("en") or r.get("note_en") or c.get("ko")
                           or (r.get("note") or ""))

    # narrative 가 직접 등록한 주장(글에 박힌 숫자)을 대장에 합친다.
    # 단위·계열 정책은 여기서 함께 채운다 — 손으로 적게 두면 빠뜨리고,
    # 빠뜨리면 「USD/BRL 4.50 을 4.50원으로」 같은 단위 사고를 못 잡는다.
    for c in narr.get("claims") or []:
        led.doc["claims"].append(c)
        if c.get("metric") and c.get("unit"):
            led.unit(c["metric"], c["unit"])
        if c.get("metric") and c.get("series"):
            led.series(c["metric"], c["series"])
    for dv in narr.get("derived") or []:
        led.doc["derived"].append(dv)

    snap_when = snap.get("generated_at_kst")
    if edition == "morning":
        base_src_ko = "야후 파이낸스 · 수집 스냅샷 %s (%s 수집)" % (snap_path, snap_when)
        base_src_en = "Yahoo Finance · snapshot %s (collected %s)" % (snap_path, snap_when)
        mv_asof_ko = "미국 %s 정규장 마감 기준" % date_ko
        mv_asof_en = "US regular session close, %s" % date_en
        liq_ko, liq_en = "일평균 거래대금", "Avg $ volume"
        movers_title_ko, movers_title_en = "2단 · 어제의 무빙", "Part 2 · Yesterday's movers"
        board_title_ko, board_title_en = "빅테크 보드", "Big tech board"
        _c = (mv or {}).get("counts", {})
        filt_ko = ("대상: 미국 상장 보통주. 시가총액 100억 달러 이상인 {uni}종목을 추린 뒤, "
                   "등락률 상·하위 {cand}종목을 시세로 다시 받아 일평균 거래대금(3개월) "
                   "3억 달러 이상까지 통과한 {ok}종목에서 골랐습니다."
                   .format(uni="{:,}".format(_c.get("universe", 0)),
                           cand="{:,}".format(_c.get("candidates", 0)),
                           ok="{:,}".format(_c.get("passed_all", 0))))
        filt_en = ("Universe: US-listed common stocks. {uni} names cleared the $10B market-cap "
                   "threshold; the {cand} largest movers were re-quoted and {ok} also cleared "
                   "$300M in 3-month average dollar volume. The top three come from those."
                   .format(uni="{:,}".format(_c.get("universe", 0)),
                           cand="{:,}".format(_c.get("candidates", 0)),
                           ok="{:,}".format(_c.get("passed_all", 0))))
    else:
        base_src_ko = "야후 파이낸스 · 수집 스냅샷 %s (%s 수집)" % (snap_path, snap_when)
        base_src_en = "Yahoo Finance · snapshot %s (collected %s)" % (snap_path, snap_when)
        mv_asof_ko = "국내 %s 정규장 마감 기준" % date_ko
        mv_asof_en = "Korea regular session close, %s" % date_en
        liq_ko, liq_en = "거래대금(당일)", "Turnover (day)"
        movers_title_ko, movers_title_en = "2단 · 오늘의 무빙", "Part 2 · Today's movers"
        board_title_ko, board_title_en = "대형주 보드", "Large cap board"
        if movers_narrow:
            # 좁은 유니버스를 넓은 것처럼 적으면 「시장 1위」라는 틀린 말이 된다.
            filt_ko = ("대상: 시세 파일에 실린 국내 주요 %d종목(코스피 대형주·코스닥 상위)입니다. "
                       "시장 전체 순위가 아닙니다 — 전 종목 스크리너(시가총액 1조원 이상 · "
                       "당일 거래대금 300억원 이상)는 다음 마감 수집분부터 적용됩니다."
                       % len([1 for v in (snap.get("stocks") or {}).values()
                              if v.get("date") == target]))
            filt_en = ("Universe: the %d major Korean names carried in the price file "
                       "(KOSPI large caps and KOSDAQ leaders). This is NOT a whole-market "
                       "ranking — the full screener (cap ≥ KRW 1tn, turnover ≥ KRW 30bn) "
                       "applies from the next post-close collection."
                       % len([1 for v in (snap.get("stocks") or {}).values()
                              if v.get("date") == target]))
        else:
            filt_ko = ("대상: 국내 상장 보통주 중 시가총액 1조원 이상 · "
                       "당일 거래대금 300억원 이상. 평균이 아니라 당일 거래대금입니다.")
            filt_en = ("Universe: KRX-listed common stocks with market cap ≥ KRW 1tn and "
                       "same-day turnover ≥ KRW 30bn. This is same-day turnover, not an average.")

    ctx = {
        "edition": edition,
        "date_iso": target, "date_ko": date_ko, "date_en": date_en,
        "cover_meta_ko": narr.get("cover_meta", {}).get("ko",
                          "작성 %s KST" % now.strftime("%Y-%m-%d %H:%M")),
        "cover_meta_en": narr.get("cover_meta", {}).get("en",
                          "Compiled %s KST" % now.strftime("%Y-%m-%d %H:%M")),
        "headlines": narr["headlines"],
        "baseline": baseline,
        "baseline_asof_ko": "기준 시점 — %s 마감" % date_ko,
        "baseline_asof_en": "As of — close, %s" % date_en,
        "baseline_cap_ko": "출처: %s. 표 안의 모든 값은 이 파일 하나에서 읽었습니다." % base_src_ko,
        "baseline_cap_en": "Source: %s. Every value in this table comes from that single file." % base_src_en,
        "movers": movers,
        "movers_title_ko": movers_title_ko, "movers_title_en": movers_title_en,
        "movers_asof_ko": "기준 시점 — %s" % mv_asof_ko,
        "movers_asof_en": "As of — %s" % mv_asof_en,
        "movers_common": narr["movers_common"],
        "movers_filter_ko": filt_ko, "movers_filter_en": filt_en,
        "liq_label_ko": liq_ko, "liq_label_en": liq_en,
        "board": board,
        "board_title_ko": board_title_ko, "board_title_en": board_title_en,
        "board_asof_ko": "기준 시점 — %s" % mv_asof_ko,
        "board_asof_en": "As of — %s" % mv_asof_en,
        "board_cap_ko": ("출처: %s. 표 안의 종가·등락률은 한 곳에서만 읽었습니다."
                         % ((mv or {}).get("printed_from") if edition == "morning"
                            else "네이버 증시 · 수집 스냅샷 %s" % snap_path)),
        "board_cap_en": ("Source: %s. Closes and changes in this table were read from one place."
                         % ((mv or {}).get("printed_from") if edition == "morning"
                            else "Naver · snapshot %s" % snap_path)),
        "board_points": narr["board_points"],
        "cards": narr["cards"],
        "news_asof_ko": narr.get("news_asof", {}).get("ko", ""),
        "news_asof_en": narr.get("news_asof", {}).get("en", ""),
        "verify": (narr.get("verify") or []) + extras,
        "foot_ko": "MARKET DAILY · 미래에셋증권 · 작성 %s KST · 자료 %s / %s"
                   % (now.strftime("%Y-%m-%d %H:%M"), snap_path, mv_rel or "—"),
        "foot_en": "MARKET DAILY · Mirae Asset Securities · compiled %s KST · data %s / %s"
                   % (now.strftime("%Y-%m-%d %H:%M"), snap_path, mv_rel or "—"),
    }

    os.makedirs(OUT_DIR, exist_ok=True)
    stem = os.path.join(OUT_DIR, "%s-%s" % (target, edition))
    html_path = stem + ".html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(render(ctx))
    claims_path = led.write(stem + ".claims.json")

    log("씀: %s" % os.path.relpath(html_path, ROOT))
    log("씀: %s (주장 %d · 파생 %d)"
        % (os.path.relpath(claims_path, ROOT),
           len(led.doc["claims"]), len(led.doc["derived"])))
    if not movers:
        log("  ! 무빙 절이 비었습니다")
    if not board:
        log("  ! 보드 절이 비었습니다")
    return html_path, claims_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--edition", choices=["morning", "close"], default="morning")
    ap.add_argument("--date", default=None, help="대상 거래일 (YYYY-MM-DD)")
    args = ap.parse_args()
    build(args.edition, args.date)
    return 0


if __name__ == "__main__":
    sys.exit(main())
