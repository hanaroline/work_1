#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""모닝 브리핑에서 아직 안 잡히는 것을 찾는다. 결과는 data/market/probe.txt.

남은 것: VKOSPI(코스피200 변동성지수). 야후에 없고 네이버 모바일 API 는
VKOSPI/VKOSPI200/CBOEVKOSPI 셋 다 409 로 거절했다. 코드가 틀린 것이므로
네이버가 실제로 쓰는 코드를 화면에서 찾고, 없으면 다른 원천을 본다.
"""
import json
import re
import urllib.error
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
MUA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
       "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")


def get(url, encoding="utf-8", timeout=25, ua=UA, referer=None):
    h = {"User-Agent": ua, "Accept-Language": "ko-KR,ko;q=0.9"}
    if referer:
        h["Referer"] = referer
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
        return r.read().decode(encoding, "replace")


def text(html):
    t = re.sub(r"(?is)<(script|style).*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"&nbsp;?", " ", t)).strip()


def probe(label, url, show=140, **kw):
    try:
        raw = get(url, **kw)
    except urllib.error.HTTPError as e:
        print("  [%-30s] HTTP %s" % (label, e.code))
        return None
    except Exception as e:                                         # noqa: BLE001
        print("  [%-30s] %s: %s" % (label, type(e).__name__, str(e)[:50]))
        return None
    b = raw if raw.lstrip()[:1] in "{[" else text(raw)
    print("  [%-30s] OK %6d | %s" % (label, len(raw), b[:show]))
    return raw


print("=" * 78)
print("A. 네이버가 VKOSPI 를 어떤 코드로 부르는가")
print("=" * 78)
# 국내증시 화면과 검색에서 실제 링크를 찾는다
idx = probe("데스크톱 국내증시 목차", "https://finance.naver.com/sise/", encoding="cp949",
            show=60)
if idx:
    codes = sorted(set(re.findall(r'sise_index\.naver\?code=([A-Z0-9_]+)', idx)))
    print("     └ 데스크톱 지수 코드: %s" % codes)
srch = probe("네이버 검색 VKOSPI",
             "https://search.naver.com/search.naver?query=VKOSPI", show=200)
if srch:
    print("     └ 검색결과 속 지수 링크: %s"
          % sorted(set(re.findall(r'stock\.naver\.com/[A-Za-z0-9/_\-]*(?:VK|vol)[A-Za-z0-9/_\-]*',
                                  srch, re.I)))[:10])
for code in ("VKOSPI", "VKOSPI200", "KOSPI200VOL", "VKS", "KVX", "CBOEVKOSPI"):
    probe("모바일 " + code,
          "https://m.stock.naver.com/api/index/%s/integration" % code,
          ua=MUA, referer="https://m.stock.naver.com/", show=110)
probe("데스크톱 code=VKOSPI",
      "https://finance.naver.com/sise/sise_index.naver?code=VKOSPI",
      encoding="cp949", show=110)

print()
print("=" * 78)
print("B. VKOSPI 를 싣는 다른 원천")
print("=" * 78)
probe("인베스팅 VKOSPI",
      "https://kr.investing.com/indices/kospi-volatility", show=140)
probe("야후 검색 VKOSPI",
      "https://query1.finance.yahoo.com/v1/finance/search?q=VKOSPI", show=300)
probe("야후 KSVKOSPI",
      "https://query1.finance.yahoo.com/v8/finance/chart/%5EVKOSPI?range=5d&interval=1d",
      show=200)
probe("KRX 지수 오픈API(키없음)",
      "https://data-dbg.krx.co.kr/svc/apis/idx/krx_dd_trd?basDd=20260807", show=140)

print()
print("=" * 78)
print("C. FRED — cosd 를 주면 빨라지는지 확인")
print("=" * 78)
r = probe("FRED 최근 45일",
          "https://fred.stlouisfed.org/graph/fredgraph.csv"
          "?id=DGS2,DGS10,DGS30,DGS3MO&cosd=2026-06-25", show=120, timeout=60)
if r:
    lines = [l for l in r.splitlines() if l.strip()]
    print("     └ %d행. 머리글: %s" % (len(lines), lines[0]))
    for l in lines[-4:]:
        print("        %s" % l)

print()
print("탐색 종료")
