#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""선물 투자자별 단위 — 데스크톱 화면의 단위 표기로 가린다. 결과는 probe.txt.

모바일 화면과 API 는 단위를 안 적는다. 데스크톱 네이버 화면들은
'단위 : 억원' / '단위 : 계약' 같은 머리말을 대개 붙인다. 거기서 확인한다.
과거치 경로는 없다(그 API 는 최신 영업일만 준다).
"""
import re
import urllib.error
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def get(url, encoding="cp949", timeout=25):
    h = {"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9",
         "Referer": "https://finance.naver.com/"}
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
        return r.read().decode(encoding, "replace")


def text(html):
    t = re.sub(r"(?is)<(script|style).*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"&nbsp;?", " ", t)).strip()


TARGETS = [
    ("선물 시세 화면", "https://finance.naver.com/sise/sise_index.naver?code=FUT"),
    ("투자자별매매동향", "https://finance.naver.com/sise/investorDealTrendDay.naver?bizdate=20260807"),
    ("프로그램매매동향", "https://finance.naver.com/sise/programDeal.naver"),
    ("선물 일별시세", "https://finance.naver.com/sise/sise_index_day.naver?code=FUT"),
]
for label, url in TARGETS:
    print("=" * 78)
    print("%s  %s" % (label, url))
    print("=" * 78)
    try:
        html = get(url)
    except urllib.error.HTTPError as e:
        print("  HTTP %s\n" % e.code)
        continue
    except Exception as e:                                         # noqa: BLE001
        print("  %s\n" % str(e)[:60])
        continue
    body = text(html)
    print("  %d bytes" % len(html))
    for kw in ("단위", "계약"):
        for m in list(re.finditer(kw, body))[:4]:
            print("   [%s] …%s…" % (kw, body[max(0, m.start() - 90):m.start() + 110]))
    caps = re.findall(r"(?is)<caption[^>]*>(.*?)</caption>", html)
    print("   캡션: %s" % [re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", "", c)).strip()
                          for c in caps][:8])
    print()

print("=" * 78)
print("선물 투자자별을 실은 다른 네이버 화면이 있는지 목차에서 다시 확인")
print("=" * 78)
try:
    idx = get("https://finance.naver.com/sise/")
    links = sorted(set(re.findall(r'href="(/sise/[^"]*)"', idx)))
    print("  선물/파생 관련 링크: %s"
          % [l for l in links if re.search(r"fut|deriv|option|FUT", l, re.I)])
    print("  투자자 관련 링크: %s"
          % [l for l in links if re.search(r"invest|deal|program", l, re.I)])
except Exception as e:                                             # noqa: BLE001
    print("  실패:", e)

print()
print("탐색 종료")
