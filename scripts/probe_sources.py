#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""공표일정의 날짜-제목 짝을 마크업에서 확인한다. 결과는 data/market/probe.txt.

평문으로 훑으면 '2026-08-14 12:00 6월 통화 및 유동성' 처럼 보이지만,
날짜가 앞 제목에 붙는지 뒤 제목에 붙는지는 평문만으로 단정할 수 없다.
표를 잘못 읽어 일정을 틀리게 쓰는 것보다, 마크업을 직접 보고 정하는 편이 낫다.
"""
import re
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
URL = ("https://www.bok.or.kr/portal/stats/statsPublictSchdul/listCldr.do"
       "?menuNo=200775")

req = urllib.request.Request(URL, headers={"User-Agent": UA,
                                           "Accept-Language": "ko-KR,ko;q=0.9"})
with urllib.request.urlopen(req, timeout=40) as r:
    html = r.read().decode("utf-8", "replace")

print("%d bytes" % len(html))

print("\n=== '수출입물가' 주변 원본 마크업 ===")
i = html.find("수출입물가")
print(html[max(0, i - 1400):i + 400])

print("\n=== '통화 및 유동성' 주변 원본 마크업 ===")
i = html.find("통화 및 유동성")
print(html[max(0, i - 900):i + 300])

print("\n=== 날짜가 든 태그 패턴 ===")
for m in list(re.finditer(r"2026-08-1[0-9]", html))[:6]:
    print("---")
    print(html[max(0, m.start() - 300):m.start() + 300])

print("\n탐색 종료")
