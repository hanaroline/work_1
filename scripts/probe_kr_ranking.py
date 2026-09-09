#!/usr/bin/env python3
"""국내 시가총액 순위를 받아올 수 있는 경로를 러너에서 실제로 재 본다(일회성 조사).

`check_kr100_ranking.py` 가 쓰던 한국거래소 getJsonData 가 HTTP 400 을 돌려주는데,
세션에서는 이그레스가 막혀 원인을 볼 수 없다. 그래서 러너에서 후보 경로를 한 번씩
불러 보고 응답 앞부분을 그대로 찍는다. 무엇이 되는지 확인하면 이 파일은 지운다.
"""

import json
import os
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_us100 as F                                     # noqa: E402

UA = F.UA
KRX = "http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd"


def show(name, fn):
    print("\n" + "=" * 70)
    print("### " + name)
    try:
        body, extra = fn()
    except urllib.error.HTTPError as e:
        payload = ""
        try:
            payload = e.read().decode("utf-8", "replace")[:400]
        except Exception:                                   # noqa: BLE001
            pass
        print("  HTTP %s %s\n  본문: %s" % (e.code, e.reason, payload))
        return
    except Exception as e:                                  # noqa: BLE001
        print("  실패: %r" % (e,))
        return
    print("  길이 %d · %s" % (len(body), extra))
    print("  앞부분: " + body[:500].replace("\n", " "))


def krx(day, referer, extra_params=None, method="POST", opener=None):
    params = {"bld": "dbms/MDC/STAT/standard/MDCSTAT01501", "locale": "ko_KR",
              "mktId": "ALL", "trdDd": day, "share": "1", "money": "1",
              "csvxls_isNo": "false"}
    if extra_params:
        params.update(extra_params)
    data = urllib.parse.urlencode(params).encode("utf-8")
    hdr = {"User-Agent": UA, "Referer": referer,
           "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
           "Accept": "application/json, text/javascript, */*; q=0.01",
           "X-Requested-With": "XMLHttpRequest",
           "Origin": "http://data.krx.co.kr"}
    if method == "GET":
        req = urllib.request.Request(KRX + "?" + urllib.parse.urlencode(params), headers=hdr)
    else:
        req = urllib.request.Request(KRX, data=data, headers=hdr)
    op = opener or urllib.request.build_opener()
    with op.open(req, timeout=30) as r:
        raw = r.read().decode("utf-8", "replace")
    n = None
    try:
        j = json.loads(raw)
        for k in ("OutBlock_1", "output", "block1"):
            if isinstance(j.get(k), list):
                n = "%s %d행" % (k, len(j[k]))
                if j[k]:
                    n += " · 키 " + ",".join(sorted(j[k][0])[:12])
                break
        if n is None:
            n = "JSON 키: " + ",".join(sorted(j)[:10])
    except Exception:                                       # noqa: BLE001
        n = "JSON 아님"
    return raw, n


def main():
    day = sys.argv[1] if len(sys.argv) > 1 else "20260908"
    print("기준일 %s" % day)

    # (1) 지금 코드가 쓰는 형태
    show("KRX POST · Referer=mdiLoader/index.cmd",
         lambda: krx(day, "https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd"))

    # (2) 화면 메뉴 id 를 붙인 Referer — KRX 가 이것으로 요청 출처를 본다는 이야기가 있다
    show("KRX POST · Referer=…index.cmd?menuId=MDC0201020101",
         lambda: krx(day, "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101"))

    # (3) 먼저 화면을 GET 해 쿠키를 받고, 그 쿠키로 POST
    def with_cookie():
        import http.cookiejar
        cj = http.cookiejar.CookieJar()
        op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
        page = "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101"
        try:
            op.open(urllib.request.Request(page, headers={"User-Agent": UA}), timeout=30).read(2048)
        except Exception as e:                              # noqa: BLE001
            print("  (사전 GET 실패: %r)" % (e,))
        print("  쿠키 %d개" % len(cj))
        return krx(day, page, opener=op)
    show("KRX POST · 쿠키 먼저 받고", with_cookie)

    # (4) 상장종목 시가총액 전용 화면(MDCSTAT01501 대신 다른 bld)
    show("KRX POST · bld=…/MDCSTAT01901 (업종분류 현황)",
         lambda: krx(day, "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020506",
                     {"bld": "dbms/MDC/STAT/standard/MDCSTAT03901"}))

    # (5) 네이버 금융 시가총액 순위 — HTML 이지만 형태가 오래 안 바뀌었다
    def naver(sosok):
        url = ("https://finance.naver.com/sise/sise_market_sum.naver?sosok=%d&page=1" % sosok)
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read().decode("euc-kr", "replace")
        import re
        codes = re.findall(r"/item/main\.naver\?code=(\d{6})", raw)
        caps = re.findall(r'<td class="number">([\d,]+)</td>', raw)
        return raw, "종목코드 %d개(중복포함) · number칸 %d개" % (len(codes), len(caps))
    show("네이버 금융 시가총액 순위 · 코스피(sosok=0)", lambda: naver(0))
    show("네이버 금융 시가총액 순위 · 코스닥(sosok=1)", lambda: naver(1))

    # (6) 야후 스크리너 region=kr — 수집기가 이미 쓰는 인증/세션을 그대로 쓸 수 있다
    def yahoo_screener():
        F.init_crumb(rounds=2)
        body = {"size": 100, "offset": 0, "sortField": "intradaymarketcap", "sortType": "DESC",
                "quoteType": "EQUITY", "query": {"operator": "AND", "operands": [
                    {"operator": "eq", "operands": ["region", "kr"]}]},
                "userId": "", "userIdType": "guid"}
        url = ("https://query2.finance.yahoo.com/v1/finance/screener?lang=en-US&region=US"
               + ("&crumb=" + urllib.parse.quote(F.CRUMB) if F.CRUMB else ""))
        req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                     headers=dict(F.HDRS, **{"Content-Type": "application/json"}))
        with F._OPENER.open(req, timeout=30) as r:
            raw = r.read().decode("utf-8", "replace")
        j = json.loads(raw)
        res = (j.get("finance") or {}).get("result") or []
        rows = (res[0].get("quotes") if res else []) or []
        top = ["%s %s %s" % (q.get("symbol"), (q.get("shortName") or "")[:14], q.get("marketCap"))
               for q in rows[:8]]
        return raw, "총 %s · 받은 행 %d\n    " % ((res[0].get("total") if res else "?"), len(rows)) + "\n    ".join(top)
    show("야후 스크리너 region=kr (시총 내림차순)", yahoo_screener)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
