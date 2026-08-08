#!/usr/bin/env python3
"""장 마감 시세를 모아 data/market/ 아래에 JSON으로 저장한다.

이 스크립트는 GitHub Actions 러너에서 돈다. 브리핑을 만드는 Claude 세션은
사내 이그레스 정책 때문에 KRX·네이버·야후에 직접 붙지 못하므로, 러너가 대신
받아 저장소에 커밋하고 세션은 커밋된 파일을 읽는다.

원천이 하나 죽어도 나머지는 그대로 저장한다. 각 원천의 성공/실패는 결과
JSON의 "sources" 에 남기므로, 브리핑은 무엇이 확보됐고 무엇이 비었는지
그대로 알 수 있다.
"""

import html as html_mod
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")
TIMEOUT = 20

# 지수·환율·원자재 — 야후 심볼
YAHOO_INDEX = {
    "kospi": "^KS11", "kosdaq": "^KQ11", "usdkrw": "KRW=X",
    "sp500": "^GSPC", "nasdaq": "^IXIC", "dow": "^DJI", "sox": "^SOX",
    "vix": "^VIX", "dxy": "DX-Y.NYB", "usdjpy": "JPY=X",
    "wti": "CL=F", "brent": "BZ=F", "gold": "GC=F",
    "ust10y": "^TNX", "ust2y": "^IRX",
}

# 시가총액 상위 — 야후는 코스피 종목에 .KS, 코스닥에 .KQ 를 쓴다
YAHOO_STOCKS = {
    "삼성전자": "005930.KS", "SK하이닉스": "000660.KS",
    "LG에너지솔루션": "373220.KS", "삼성바이오로직스": "207940.KS",
    "현대차": "005380.KS", "KB금융": "105560.KS",
    "한화에어로스페이스": "012450.KS", "삼성전기": "009150.KS",
    "셀트리온": "068270.KS", "NAVER": "035420.KS",
}


def _get(url, data=None, headers=None, referer=None, encoding="utf-8"):
    """finance.naver.com 계열은 EUC-KR 이므로 encoding='cp949' 로 부른다."""
    h = {"User-Agent": UA, "Accept": "*/*",
         "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
    if referer:
        h["Referer"] = referer
    if headers:
        h.update(headers)
    body = urllib.parse.urlencode(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=h)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read().decode(encoding, "replace")


def _text(fragment):
    return html_mod.unescape(re.sub(r"<[^>]*>", " ", fragment)).replace("\xa0", " ").strip()


def _num(x):
    return round(x, 4) if isinstance(x, float) else x


def yahoo_quote(symbol):
    """일봉 2개를 받아 종가·전일대비·OHLC·거래량을 만든다."""
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol) + "?range=5d&interval=1d")
    j = json.loads(_get(url))
    res = j["chart"]["result"][0]
    meta = res["meta"]
    q = res["indicators"]["quote"][0]
    ts = res["timestamp"]

    # 마지막으로 종가가 있는 인덱스
    idx = [i for i, c in enumerate(q["close"]) if c is not None]
    if not idx:
        raise ValueError("no close data")
    last = idx[-1]
    prev = idx[-2] if len(idx) > 1 else None

    close = q["close"][last]
    prev_close = q["close"][prev] if prev is not None else meta.get("chartPreviousClose")
    change = close - prev_close if prev_close else None
    return {
        "symbol": symbol,
        "date": datetime.fromtimestamp(ts[last], KST).strftime("%Y-%m-%d"),
        "close": _num(close),
        "open": _num(q["open"][last]),
        "high": _num(q["high"][last]),
        "low": _num(q["low"][last]),
        "volume": q["volume"][last],
        "prev_close": _num(prev_close),
        "change": _num(change),
        "change_pct": _num(change / prev_close * 100) if prev_close else None,
        "currency": meta.get("currency"),
    }


def naver_sectors():
    """업종별 등락률 — 네이버 업종 시세 페이지(EUC-KR HTML)를 파싱한다."""
    s = _get("https://finance.naver.com/sise/sise_group.naver?type=upjong",
             referer="https://finance.naver.com/", encoding="cp949")
    out = []
    for row in re.findall(r"<tr>(.*?)</tr>", s, re.S):
        m = re.search(r"sise_group_detail[^>]*>(.*?)</a>", row, re.S)
        if not m:
            continue
        pct = re.search(r"([+\-]?\d+\.\d+)%", row)
        if not pct:
            continue
        out.append({"name": _text(m.group(1)), "change_pct": float(pct.group(1))})
    if not out:
        raise ValueError("업종 행을 찾지 못함")
    out.sort(key=lambda d: d["change_pct"], reverse=True)
    return out


def _investor_urls(now):
    """bizdate 없이 부르면 표 껍데기(1.6KB)만 오므로 날짜를 붙여 부른다."""
    base = "https://finance.naver.com/sise/investorDealTrendDay.naver"
    days = [(now - timedelta(days=i)).strftime("%Y%m%d") for i in range(0, 5)]
    return ["%s?bizdate=%s&sosok=" % (base, d) for d in days]


def naver_investors(now, dump_dir=None):
    """투자자별 매매동향 — 개인/외국인/기관 순매수, 단위 억원.

    페이지 구조가 바뀌면 파싱이 빗나가므로, 실패 시 원본 HTML을 남겨
    다음 실행 때 무엇을 봐야 하는지 알 수 있게 한다.
    """
    errors = []
    for n_url, url in enumerate(_investor_urls(now)):
        try:
            s = _get(url, referer="https://finance.naver.com/sise/", encoding="cp949")
        except Exception as e:                                # noqa: BLE001
            errors.append("%s -> %s" % (url.split("?")[0][-32:], e))
            continue

        out = []
        for row in re.findall(r"<tr[^>]*>(.*?)</tr>", s, re.S):
            cells = [c for c in
                     (_text(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)) if c]
            if len(cells) < 4:
                continue
            # 첫 칸이 날짜인 행만 (YY.MM.DD 또는 YYYY.MM.DD)
            if not re.match(r"^\d{2,4}\.\d{2}\.\d{2}$", cells[0]):
                continue

            def n(x):
                x = x.replace(",", "").replace("+", "").strip()
                try:
                    return int(x)
                except ValueError:
                    return None

            vals = [n(c) for c in cells[1:4]]
            if all(v is None for v in vals):
                continue
            out.append({"date": cells[0], "retail": vals[0],
                        "foreign": vals[1], "institution": vals[2],
                        "unit": "억원", "source_url": url})
        if out:
            return out[:6]
        errors.append("%s -> 날짜 행 없음(%d bytes)" % (url.split("?")[0][-32:], len(s)))
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            fn = os.path.join(dump_dir, "investors_try%d.html" % n_url)
            with open(fn, "w", encoding="utf-8") as f:
                f.write(s[:400000])
    raise ValueError(" | ".join(errors))



def _first_int(text, label, window=40):
    """라벨 뒤 window 글자 안에서 첫 정수를 뽑는다. 마크업이 아니라 텍스트를 본다."""
    i = text.find(label)
    if i < 0:
        return None
    m = re.search(r"([\d][\d,]*)", text[i + len(label): i + len(label) + window])
    return int(m.group(1).replace(",", "")) if m else None


def _first_float(text, label, window=40):
    i = text.find(label)
    if i < 0:
        return None
    m = re.search(r"([\d]+\.[\d]+)", text[i + len(label): i + len(label) + window])
    return float(m.group(1)) if m else None


def _signed(text, label):
    """라벨 뒤에서 부호 있는 정수를 뽑는다. 예: '외국인 -8,651 억'."""
    m = re.search(re.escape(label) + r"\s*([+\-\u2212]?[\d,]+)", text)
    if not m:
        return None
    v = m.group(1).replace(",", "").replace("\u2212", "-").lstrip("+")
    try:
        return int(v)
    except ValueError:
        return None


def _rate(text, *label_words):
    """공백이 들쭉날쭉한 라벨을 느슨하게 찾아 실수를 뽑는다."""
    pat = r"\s*".join(re.escape(w) for w in label_words) + r"\s*([\d,]+\.[\d]+)"
    m = re.search(pat, text)
    return float(m.group(1).replace(",", "")) if m else None


def naver_market_page(code, dump_dir=None):
    """sise_index.naver 한 장에서 네 가지를 한 번에 뽑는다.

    등락 종목 수, 투자자별 매매동향, 프로그램 매매동향, 장중 고저.
    code 는 KOSPI 또는 KOSDAQ.
    """
    url = "https://finance.naver.com/sise/sise_index.naver?code=%s" % code
    s = _get(url, referer="https://finance.naver.com/sise/", encoding="cp949")
    t = re.sub(r"\s+", " ", _text(s))

    breadth = {}
    for label, key in (("상한종목수", "limit_up"), ("상승종목수", "advancing"),
                       ("보합종목수", "unchanged"), ("하락종목수", "declining"),
                       ("하한종목수", "limit_down")):
        v = _signed(t, label)
        if v is not None:
            breadth[key] = v

    flows = {}
    if "투자자별 매매동향" in t:
        seg = t[t.index("투자자별 매매동향"):]
        for label, key in (("개인", "retail"), ("외국인", "foreign"),
                           ("기관", "institution")):
            v = _signed(seg, label)
            if v is not None:
                flows[key] = v

    program = {}
    if "프로그램 매매동향" in t:
        pseg = t[t.index("프로그램 매매동향"):]
        # '차익' 은 '비차익' 의 일부이므로 앞에 '비' 가 없는 경우만 잡는다
        m = re.search(r"(?<!비)차익\s*([+\-\u2212]?[\d,]+)", pseg)
        if m:
            program["arb"] = int(m.group(1).replace(",", "").replace("\u2212", "-").lstrip("+"))
        for label, key in (("비차익", "non_arb"), ("전체", "total")):
            v = _signed(pseg, label)
            if v is not None:
                program[key] = v

    out = {"source_url": url, "unit": "억원"}
    if breadth:
        out["breadth"] = breadth
    if flows:
        out["investor_flows"] = flows
    if program:
        out["program_trading"] = program
    hi, lo = _rate(t, "장중최고"), _rate(t, "장중최저")
    if hi and lo:
        out["intraday"] = {"high": hi, "low": lo}
    y_hi, y_lo = _rate(t, "52주최고"), _rate(t, "52주최저")
    if y_hi and y_lo:
        out["fifty_two_week"] = {"high": y_hi, "low": y_lo}

    if len(out) <= 2:
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "market_%s.html" % code), "w",
                      encoding="utf-8") as f:
                f.write(s[:400000])
        raise ValueError("아무 항목도 못 찾음 (%d bytes)" % len(s))
    return out


BOND_LABELS = (
    (("CD금리", "(91일)"), "cd91"),
    (("콜", "금리"), "call"),
    (("국고채", "(3년)"), "ktb3y"),
    (("회사채", "(3년)"), "corp3y"),
    (("COFIX", "잔액"), "cofix_balance"),
    (("COFIX", "신규취급액"), "cofix_new"),
)
KTB10Y_URLS = [
    "https://finance.naver.com/marketindex/interestDetail.naver?marketindexCd=IRR_GOVT10Y",
    "https://kr.investing.com/rates-bonds/south-korea-10-year-bond-yield",
]


def naver_rates(dump_dir=None):
    """국내 시장금리 — 네이버 시장지표의 국내시장금리 표."""
    url = "https://finance.naver.com/marketindex/"
    s = _get(url, referer="https://finance.naver.com/", encoding="cp949")
    t = re.sub(r"\s+", " ", _text(s))
    out = {}
    for words, key in BOND_LABELS:
        v = _rate(t, *words)
        if v is not None and 0 < v < 20:
            out[key] = v
    if not out:
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "rates.html"), "w", encoding="utf-8") as f:
                f.write(s[:400000])
        raise ValueError("금리 라벨 없음 (%d bytes)" % len(s))
    out["source_url"] = url
    out["unit"] = "%"

    # 국고채 10년은 이 표에 없다. 후보를 따로 시도하고 실패해도 넘어간다.
    for n, u10 in enumerate(KTB10Y_URLS):
        try:
            s10 = _get(u10, referer="https://finance.naver.com/marketindex/",
                       encoding="cp949" if "naver" in u10 else "utf-8")
        except Exception as e:                                # noqa: BLE001
            out.setdefault("ktb10y_errors", []).append("%s -> %s" % (u10[-34:], e))
            continue
        t10 = re.sub(r"\s+", " ", _text(s10))
        v = _rate(t10, "국고채", "(10년)") or _rate(t10, "10년")
        if v and 0 < v < 20:
            out["ktb10y"] = v
            out["ktb10y_source"] = u10
            break
        out.setdefault("ktb10y_errors", []).append(
            "%s -> 값 없음(%d bytes)" % (u10[-34:], len(s10)))
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "ktb10y_try%d.html" % n), "w",
                      encoding="utf-8") as f:
                f.write(s10[:300000])
    return out


LIMIT_URLS = {
    "upper": ["https://finance.naver.com/sise/sise_upper.naver"],
    "lower": ["https://finance.naver.com/sise/sise_lower.naver"],
}


def naver_limit_names(kind, dump_dir=None):
    """상한가·하한가 종목명. kind 는 'upper' 또는 'lower'."""
    errors = []
    for n, url in enumerate(LIMIT_URLS[kind]):
        try:
            s = _get(url, referer="https://finance.naver.com/sise/", encoding="cp949")
        except Exception as e:                                # noqa: BLE001
            errors.append("%s -> %s" % (url[-24:], e))
            continue
        names, seen = [], set()
        for m in re.finditer(r'/item/main\.naver\?code=(\d{6})"[^>]*>([^<]+)</a>', s):
            code, name = m.group(1), _text(m.group(2))
            if name and code not in seen:
                seen.add(code)
                names.append({"code": code, "name": name})
        if names:
            return {"names": names[:40], "count": len(names), "source_url": url}
        # 해당 종목이 하나도 없는 날은 링크가 없는 것이 정상이다.
        # 페이지가 온전히 내려왔으면 0건으로 처리하고, 껍데기만 왔으면 실패로 본다.
        if len(s) > 20000:
            return {"names": [], "count": 0, "source_url": url,
                    "note": "해당 종목 없음"}
        errors.append("%s -> 종목 링크 없음(%d bytes)" % (url[-24:], len(s)))
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "limit_%s_try%d.html" % (kind, n)), "w",
                      encoding="utf-8") as f:
                f.write(s[:300000])
    raise ValueError(" | ".join(errors))


def yahoo_intraday_at(symbol, target_date, hhmm="15:30"):
    """KST 특정 시각의 5분봉 종가. 유가·금의 '국내 마감 시점' 값을 만든다."""
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/"
           + urllib.parse.quote(symbol) + "?range=5d&interval=5m")
    j = json.loads(_get(url))
    res = j["chart"]["result"][0]
    q = res["indicators"]["quote"][0]
    ts = res["timestamp"]
    hh, mm = (int(x) for x in hhmm.split(":"))
    best, best_gap = None, None
    for i, t in enumerate(ts):
        if q["close"][i] is None:
            continue
        dt = datetime.fromtimestamp(t, KST)
        if dt.strftime("%Y-%m-%d") != target_date:
            continue
        gap = abs((dt.hour * 60 + dt.minute) - (hh * 60 + mm))
        if best_gap is None or gap < best_gap:
            best, best_gap = (dt, q["close"][i]), gap
    if best is None or best_gap > 30:
        raise ValueError("%s: %s %s 부근 5분봉 없음" % (symbol, target_date, hhmm))
    return {"symbol": symbol, "at_kst": best[0].strftime("%Y-%m-%d %H:%M"),
            "close": _num(best[1]), "minutes_off": best_gap}


def naver_usdkrw():
    """네이버 시장지표의 미국 USD 매매기준율 — 원/달러 두 번째 출처."""
    s = _get("https://finance.naver.com/marketindex/",
             referer="https://finance.naver.com/", encoding="cp949")
    t = re.sub(r"\s+", " ", _text(s))
    m = re.search(r"미국\s*USD\s*([\d,]+\.[\d]+)", t)
    if not m:
        raise ValueError("미국 USD 라벨 없음 (%d bytes)" % len(s))
    return {"rate": float(m.group(1).replace(",", "")),
            "source_url": "https://finance.naver.com/marketindex/",
            "note": "매매기준율"}


ECOS = "https://ecos.bok.or.kr/api/%s/sample/json/kr/1/10/%s"


def ecos_rates(now, dump_dir=None):
    """한국은행 ECOS 일별 시장금리(817Y002).

    샘플 인증키는 호출당 10건까지만 허용한다. 그래서 항목 목록을 먼저 받아
    국고채 계열 코드를 찾은 뒤, 항목별로 최근 10영업일을 따로 부른다.
    """
    end = now.strftime("%Y%m%d")
    start = (now - timedelta(days=12)).strftime("%Y%m%d")

    # 1) 항목 코드 목록
    items = {}
    try:
        j = json.loads(_get(ECOS % ("StatisticItemList", "817Y002")))
        for row in (j.get("StatisticItemList", {}) or {}).get("row", []):
            items[row.get("ITEM_NAME", "")] = row.get("ITEM_CODE", "")
    except Exception as e:                                    # noqa: BLE001
        items = {}
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "ecos_items_err.txt"), "w",
                      encoding="utf-8") as f:
                f.write(str(e))

    # 목록에서 못 찾으면 널리 쓰이는 코드를 후보로 쓴다
    wanted = {"ktb1y": ("국고채(1년)", "010190000"),
              "ktb3y": ("국고채(3년)", "010200000"),
              "ktb5y": ("국고채(5년)", "010200001"),
              "ktb10y": ("국고채(10년)", "010210000"),
              "corp3y": ("회사채(3년,AA-)", "010320000"),
              "cd91": ("CD(91일)", "010502000")}

    out, tried = {}, {}
    for key, (name, fallback) in wanted.items():
        code = next((c for n, c in items.items() if name.split("(")[0] in n
                     and name.split("(")[1].rstrip(")") in n), fallback)
        url = ECOS % ("StatisticSearch",
                      "817Y002/D/%s/%s/%s" % (start, end, code))
        tried[key] = code
        try:
            j = json.loads(_get(url))
        except Exception as e:                                # noqa: BLE001
            continue
        rows = (j.get("StatisticSearch", {}) or {}).get("row", [])
        if not rows:
            continue
        last = rows[-1]
        try:
            out[key] = {"value": float(last["DATA_VALUE"]),
                        "date": last.get("TIME"),
                        "item": last.get("ITEM_NAME1"), "code": code}
        except (KeyError, ValueError, TypeError):
            continue
    if not out:
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "ecos_debug.json"), "w",
                      encoding="utf-8") as f:
                json.dump({"items_found": items, "codes_tried": tried},
                          f, ensure_ascii=False, indent=2)
        raise ValueError("ECOS 에서 아무 항목도 못 받음 (항목목록 %d건)" % len(items))
    out["source"] = "한국은행 ECOS 817Y002 (샘플 인증키)"
    return out


def krx_futures_investors(now, dump_dir=None):
    """선물 투자자별 거래실적 — KRX OTP 발급 후 CSV 내려받는 정식 경로."""
    d = now.strftime("%Y%m%d")
    gen = "http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd"
    dl = "http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd"
    ref = "http://data.krx.co.kr/contents/MDC/MDI/mainChart/index.cmd"
    params = {"locale": "ko_KR", "trdDd": d, "prodId": "KRDRVFUK2I",
              "mktTpCd": "T", "share": "1", "money": "1", "csvxls_isNo": "false",
              "name": "fileDown", "url": "dbms/MDC/STAT/standard/MDCSTAT12502"}
    otp = _get(gen + "?" + urllib.parse.urlencode(params), referer=ref).strip()
    if not otp or "<" in otp[:20]:
        if dump_dir:
            os.makedirs(dump_dir, exist_ok=True)
            with open(os.path.join(dump_dir, "krx_otp.txt"), "w", encoding="utf-8") as f:
                f.write(otp[:20000])
        raise ValueError("OTP 발급 실패 (%d bytes)" % len(otp))
    csv = _get(dl, data={"code": otp}, referer=ref, encoding="cp949")
    rows = [r for r in csv.splitlines() if r.strip()]
    if len(rows) < 2:
        raise ValueError("CSV 행 없음 (%d bytes)" % len(csv))
    return {"header": rows[0], "rows": rows[1:20], "trdDd": d}


def krx_json(bld, **params):
    """KRX 정보데이터시스템 JSON 엔드포인트."""
    p = {"bld": bld, "locale": "ko_KR", "csvxls_isNo": "false"}
    p.update(params)
    j = json.loads(_get(
        "https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd",
        data=p, referer="https://data.krx.co.kr/contents/MDC/MDI/mainChart/index.cmd",
        headers={"X-Requested-With": "XMLHttpRequest",
                 "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                 "Origin": "https://data.krx.co.kr"}))
    rows = j.get("OutBlock_1") or j.get("output") or j.get("block1")
    if not rows:
        raise ValueError("빈 응답: keys=%s" % list(j)[:6])
    return rows


def run(label, fn, *a, **k):
    """원천 하나를 시도하고 (값, 상태) 를 돌려준다. 실패해도 죽지 않는다."""
    try:
        v = fn(*a, **k)
        return v, {"ok": True}
    except urllib.error.HTTPError as e:
        return None, {"ok": False, "error": "HTTP %s" % e.code}
    except Exception as e:                                    # noqa: BLE001
        return None, {"ok": False, "error": "%s: %s" % (type(e).__name__, e)}


def main():
    now = datetime.now(KST)
    out = {
        "generated_at_kst": now.strftime("%Y-%m-%d %H:%M:%S"),
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
        "sources": {},
        "indices": {},
        "stocks": {},
    }

    for name, sym in YAHOO_INDEX.items():
        v, st = run(name, yahoo_quote, sym)
        if v:
            out["indices"][name] = v
        out["sources"]["yahoo:" + name] = st

    for name, sym in YAHOO_STOCKS.items():
        v, st = run(name, yahoo_quote, sym)
        if v:
            out["stocks"][name] = v
        out["sources"]["yahoo:" + sym] = st

    # 네이버 — 야후에 없는 업종별 등락률과 투자자별 수급
    v, st = run("sectors", naver_sectors)
    out["sources"]["naver:sectors"] = st
    if v:
        out["sectors"] = {"all": v, "top5": v[:5], "bottom5": v[-5:]}

    v, st = run("investors", naver_investors, now, "data/market/raw")
    out["sources"]["naver:investors"] = st
    if v:
        out["investors_kospi"] = v

    # 지수 페이지 한 장에서 등락 종목 수·투자자별·프로그램 매매·장중 고저
    for code in ("KOSPI", "KOSDAQ"):
        v, st = run("market", naver_market_page, code, "data/market/raw")
        out["sources"]["naver:market:" + code] = st
        if v:
            out.setdefault("market_internals", {})[code.lower()] = v

    # 국내 시장금리
    v, st = run("rates", naver_rates, "data/market/raw")
    out["sources"]["naver:rates"] = st
    if v:
        out["rates_kr"] = v

    # 유가·금의 국내 마감(15:30 KST) 시점 값 — 5분봉에서 뽑는다
    kd = (out.get("indices", {}).get("kospi") or {}).get("date")
    if kd:
        for name, sym in (("wti", "CL=F"), ("brent", "BZ=F"), ("gold", "GC=F")):
            v, st = run(name, yahoo_intraday_at, sym, kd, "15:30")
            out["sources"]["yahoo:1530:" + name] = st
            if v:
                out.setdefault("at_kr_close", {})[name] = v

    # 원/달러 두 번째 출처
    v, st = run("usdkrw2", naver_usdkrw)
    out["sources"]["naver:usdkrw"] = st
    if v:
        out["usdkrw_naver"] = v

    # 국고채 만기별 — 한국은행 ECOS
    v, st = run("ecos", ecos_rates, now, "data/market/raw")
    out["sources"]["ecos:rates"] = st
    if v:
        out["rates_ecos"] = v
        for key in ("ktb1y", "ktb5y", "ktb10y"):
            if key in v:
                out.setdefault("rates_kr", {})[key] = v[key]["value"]

    # 선물 투자자별 — KRX OTP 정식 경로
    v, st = run("futures", krx_futures_investors, now, "data/market/raw")
    out["sources"]["krx:futures_investors"] = st
    if v:
        out["futures_investors"] = v

    # 상한가·하한가 종목명 (개수는 market_internals.breadth 에 있다)
    for kind in ("upper", "lower"):
        v, st = run("limit", naver_limit_names, kind, "data/market/raw")
        out["sources"]["naver:limit:" + kind] = st
        if v:
            out.setdefault("limit_names", {})[kind] = v

    # KRX — 러너 IP를 막는 것으로 보인다(400 -> 헤더 보강 후 403).
    # 한 번만 시도해 상태를 기록하고, 실패해도 나머지 원천으로 진행한다.
    v, st = run("allstocks", krx_json, "dbms/MDC/STAT/standard/MDCSTAT01501",
                mktId="ALL", trdDd=now.strftime("%Y%m%d"), share="1", money="1")
    out["sources"]["krx:allstocks"] = st
    if v:
        out.setdefault("krx", {})["allstocks"] = v[:60]

    ok = sum(1 for s in out["sources"].values() if s["ok"])
    out["summary"] = {"sources_tried": len(out["sources"]), "sources_ok": ok}

    os.makedirs("data/market", exist_ok=True)
    stamp = now.strftime("%Y-%m-%d")
    for path in ("data/market/latest.json", "data/market/%s.json" % stamp):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)

    print("=== 원천별 결과 ===")
    for k, v in sorted(out["sources"].items()):
        print(("  OK   " if v["ok"] else "  FAIL ") + k
              + ("" if v["ok"] else "  <- " + v["error"]))
    print("\n%d/%d 성공" % (ok, len(out["sources"])))
    for k in ("kospi", "kosdaq", "usdkrw"):
        if k in out["indices"]:
            i = out["indices"][k]
            print("  %s %s  close=%s  chg=%s (%s%%)  vol=%s"
                  % (k, i["date"], i["close"], i["change"], i["change_pct"], i["volume"]))

    # 아무것도 못 받으면 실패로 끝내 워크플로가 빨갛게 뜨도록 한다
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
