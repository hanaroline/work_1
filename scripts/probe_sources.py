#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""남은 공백(선물 투자자별 / 신용융자·반대매매)을 채울 경로를 찾는 탐색 스크립트.

수집 서버(깃허브 러너)에서 돌리고 로그를 읽어, 어느 경로가 실제로 응답하는지 확인한다.
본 수집기(fetch_market.py)에는 여기서 살아남은 경로만 옮긴다.
"""
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
DAY = "20260807"


def get(url, data=None, headers=None, referer=None, encoding="utf-8", timeout=30, method=None):
    h = {"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
    if referer:
        h["Referer"] = referer
    if headers:
        h.update(headers)
    body = None
    if data is not None:
        if isinstance(data, (dict, list)):
            if h.get("Content-Type", "").startswith("application/json"):
                body = json.dumps(data).encode()
            else:
                body = urllib.parse.urlencode(data).encode()
        else:
            body = data.encode() if isinstance(data, str) else data
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode(encoding, "replace")


def strip(html):
    t = re.sub(r"(?is)<(script|style).*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def probe(label, url, **kw):
    """응답하면 길이와 본문 앞부분을, 막히면 사유를 남긴다."""
    try:
        raw = get(url, **kw)
    except urllib.error.HTTPError as e:
        print("  [%-28s] HTTP %s" % (label, e.code))
        return None
    except Exception as e:
        print("  [%-28s] %s: %s" % (label, type(e).__name__, str(e)[:70]))
        return None
    txt = strip(raw)
    print("  [%-28s] OK %6d bytes | %s" % (label, len(raw), txt[:170]))
    return raw


print("=" * 78)
print("A. 선물 투자자별 — 네이버 계열")
print("=" * 78)
# 네이버가 어떤 선물 화면을 갖고 있는지 목록부터 확인한다(추측 대신 실물 확인).
idx = probe("sise 목차", "https://finance.naver.com/sise/", encoding="cp949")
if idx:
    links = sorted(set(re.findall(r'href="(/sise/[^"?#]+\.n?a?v?e?r?[^"]*)"', idx)))
    print("   └ /sise/ 링크 %d개" % len(links))
    for l in links:
        print("      %s" % l[:110])

probe("선물 지수", "https://finance.naver.com/sise/sise_index.naver?code=FUT", encoding="cp949")
probe("api 선물", "https://api.stock.naver.com/futures/domestic/101/basic",
      referer="https://m.stock.naver.com/")
probe("api 선물시세", "https://api.stock.naver.com/index/KOSPI200F/basic",
      referer="https://m.stock.naver.com/")
probe("api 투자자", "https://api.stock.naver.com/marketindex/investor/trend",
      referer="https://m.stock.naver.com/")

print()
print("=" * 78)
print("B. 선물 투자자별 — KRX 를 공개 리더 경유로 (러너 IP 차단 우회)")
print("=" * 78)
KRX_JSON = "https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd"
KRX_Q = {
    "bld": "dbms/MDC/STAT/standard/MDCSTAT12801",   # 파생상품 투자자별 거래실적
    "locale": "ko_KR", "trdDd": DAY, "prodId": "KRDRVFUK2I",
    "mktTpCd": "T", "rghtTpCd": "T", "share": "1", "money": "1", "csvxls_isNo": "false",
}
probe("krx 직접(대조)", KRX_JSON, data=KRX_Q,
      referer="https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd")

krx_get = KRX_JSON + "?" + urllib.parse.urlencode(KRX_Q)
probe("r.jina.ai 경유", "https://r.jina.ai/" + krx_get, timeout=60)
probe("allorigins 경유",
      "https://api.allorigins.win/raw?url=" + urllib.parse.quote(krx_get, safe=""), timeout=60)
probe("codetabs 경유",
      "https://api.codetabs.com/v1/proxy?quest=" + urllib.parse.quote(krx_get, safe=""), timeout=60)

print()
print("=" * 78)
print("C. 신용융자·반대매매 — 금융투자협회 freeSis")
print("=" * 78)
FS = "https://freesis.kofia.or.kr/meta/getMetaDataList.do"
JH = {"Content-Type": "application/json; charset=UTF-8",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest"}
for obj in ["STATSCU0100000140BO", "STATSCU0100000060BO", "STATSCU0100000070BO"]:
    body = {"dmSearch": {"tmpV40": "", "tmpV41": "", "tmpV1": "", "tmpV12": "",
                         "tmpV13": "", "tmpV45": "D", "tmpV46": "", "tmpV47": "",
                         "startDd": DAY, "endDd": DAY, "d1": DAY, "d2": DAY,
                         "OBJ_NM": obj}}
    probe("freeSis %s" % obj[-6:], FS, data=body, headers=JH,
          referer="https://freesis.kofia.or.kr/", timeout=45)

probe("freeSis 화면", "https://freesis.kofia.or.kr/", timeout=45)

print()
print("=" * 78)
print("D. 신용융자 — 다른 공개 경로")
print("=" * 78)
probe("네이버 신용", "https://finance.naver.com/sise/sise_credit.naver", encoding="cp949")
probe("KOSIS 신용공여",
      "https://kosis.kr/openapi/statisticsData.do?method=getList&apiKey=test&format=json")

print()
print("탐색 종료")
