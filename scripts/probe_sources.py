#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""마지막 공백(선물 투자자별)을 여는 경로를 찾는다. 결과는 data/market/probe.txt.

지금까지 닫힌 문: KRX 정보데이터시스템(IP 차단), 네이버 선물 화면(시세만),
freeSis(SPA), 그날 네이버 주요뉴스 30건 본문(계약 수 문장 없음),
KRX 공식 오픈API(401 — 키 필요).

이번에 두드릴 문: 증권사·포털 파생 화면, 네이버 모바일 API, 다음 금융 API,
공공데이터포털, KRX 오픈API 다른 호스트, 뉴스 검색어 확장.
"""
import json
import re
import urllib.error
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
DAY = "20260807"


def get(url, referer=None, encoding="utf-8", timeout=25, headers=None):
    h = {"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
    if referer:
        h["Referer"] = referer
    if headers:
        h.update(headers)
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
        return r.read().decode(encoding, "replace")


def text(html):
    t = re.sub(r"(?is)<(script|style).*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"&nbsp;?", " ", t)).strip()


def probe(label, url, show=150, **kw):
    try:
        raw = get(url, **kw)
    except urllib.error.HTTPError as e:
        try:
            msg = e.read().decode("utf-8", "replace")[:150]
        except Exception:                                          # noqa: BLE001
            msg = ""
        print("  [%-24s] HTTP %s %s" % (label, e.code, msg.replace("\n", " ")))
        return None
    except Exception as e:                                         # noqa: BLE001
        print("  [%-24s] %s: %s" % (label, type(e).__name__, str(e)[:60]))
        return None
    body = raw if raw.lstrip()[:1] in "{[" else text(raw)
    print("  [%-24s] OK %6d | %s" % (label, len(raw), body[:show].replace("\n", " ")))
    return raw


print("=" * 78)
print("A. 증권사 · 포털 파생상품 화면")
print("=" * 78)
probe("한경 외국인매매", "https://markets.hankyung.com/investment/foreigner-trading")
probe("한경 선물", "https://markets.hankyung.com/derivative")
probe("인포스탁 투자자", "https://infostock.co.kr/Company/ForeignInstContinueRanking")
probe("한투 외국인", "https://www.truefriend.com/main/research/research/Sell.jsp", encoding="cp949")
probe("팍스넷 선물", "https://www.paxnet.co.kr/stock/infoStock/futureOption")
probe("미래에셋 파생", "https://securities.miraeasset.com/hks/hks3011/r01.do")

print()
print("=" * 78)
print("B. 다음 금융 · 네이버 모바일 API")
print("=" * 78)
DH = {"Referer": "https://finance.daum.net/domestic/futures",
      "X-Requested-With": "XMLHttpRequest"}
probe("다음 선물목록", "https://finance.daum.net/api/futures/list", headers=DH)
probe("다음 투자자", "https://finance.daum.net/api/investor/days?page=1&perPage=10", headers=DH)
m = probe("네이버 모바일 선물", "https://m.stock.naver.com/domestic/index/FUT/total", show=120)
if m:
    apis = sorted(set(re.findall(r'https://api\.stock\.naver\.com/[A-Za-z0-9/_.\-]+', m)))
    print("     └ 페이지에 박힌 api 경로 %d개" % len(apis))
    for a in apis[:20]:
        print("        %s" % a)
for path in ("index/FUT/basic", "index/FUT/investor", "futures/FUT/basic",
             "marketindex/futures/investor", "index/KPI200/investorTrend"):
    probe("api " + path[:18], "https://api.stock.naver.com/" + path,
          referer="https://m.stock.naver.com/", show=110)

print()
print("=" * 78)
print("C. KRX 오픈API 다른 호스트 · 공공데이터포털")
print("=" * 78)
for host in ("https://data-dbg.krx.co.kr/svc/apis/drv/fut_bydd_trd",
             "http://openapi.krx.co.kr/svc/apis/drv/fut_bydd_trd",
             "https://openapi.krx.co.kr/contents/OPP/USES/service/OPPUSES002_MAIN.cmd"):
    probe(host.split("//")[1][:22], host + ("?basDd=" + DAY if "apis" in host else ""))
probe("공공데이터 파생시세",
      "https://apis.data.go.kr/1160100/service/GetDerivativeProductInfoService/"
      "getFutureTradInfo?serviceKey=test&resultType=json&basDt=" + DAY)

print()
print("=" * 78)
print("D. 뉴스 검색 확장 — '선물시장' 문장을 직접 노린다")
print("=" * 78)
FUT = re.compile(r"[^.。\n]{0,120}선물[^.。\n]{0,160}?계약[^.。\n]{0,60}")
QUERIES = ["코스피200 선물 외국인 순매도 계약",
           "외국인 선물시장 순매수 계약 코스피 8월 7일",
           "선물 미결제약정 외국인 코스피200",
           "코스피 마감 외국인 현선물 순매도"]
seen = set()
for q in QUERIES:
    url = ("https://search.naver.com/search.naver?where=news&query=%s"
           "&sort=0&nso=so:r,p:from20260807to20260808" % urllib.parse.quote(q))
    try:
        page = get(url)
    except Exception as e:                                         # noqa: BLE001
        print("  [검색 실패] %s: %s" % (q[:24], str(e)[:50]))
        continue
    links = sorted(set(re.findall(r'https://n\.news\.naver\.com/mnews/article/\d+/\d+', page)))
    print("  [%s] 기사 %d건" % (q[:26], len(links)))
    for u in links[:6]:
        if u in seen:
            continue
        seen.add(u)
        try:
            body = text(get(u, referer="https://search.naver.com/"))
        except Exception:                                          # noqa: BLE001
            continue
        for mm in FUT.finditer(body):
            s = mm.group(0).strip()
            if re.search(r"[\d,]{3,}\s*계약", s):
                print("      · %s" % s[:240])
                print("        %s" % u)
                break

print()
print("탐색 종료")
