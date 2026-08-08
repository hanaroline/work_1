#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""선물 투자자별 — 값은 찾았고, 이제 기준일과 단위를 확정한다.

9차에서 네이버 모바일 선물 화면에 '개인 -1,444 / 외국인 +9,624 / 기관 -7,662' 가
박혀 있는 것을 확인했다. 그런데 뉴스 검색에서 나온 문장은
'기관 6309계약 순매수, 외국인 7738계약 순매도' 로 부호가 반대다.
둘 중 하나는 다른 날짜이거나 다른 지표다. 확정하지 않고 쓰면 안 된다.

확인할 것: (1) 네이버 값의 기준일과 필드명·단위, (2) 그 기사의 날짜.
"""
import json
import re
import urllib.parse
import urllib.request

MUA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
       "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def get(url, referer=None, timeout=25, ua=UA):
    h = {"User-Agent": ua, "Accept-Language": "ko-KR,ko;q=0.9"}
    if referer:
        h["Referer"] = referer
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def text(html):
    t = re.sub(r"(?is)<(script|style).*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"&nbsp;?", " ", t)).strip()


print("=" * 78)
print("A. 네이버 모바일 선물 — 숫자가 박힌 자리의 필드명과 날짜")
print("=" * 78)
page = get("https://m.stock.naver.com/domestic/index/FUT/total", ua=MUA)
print("  %d bytes" % len(page))
for token in ("9624", "9,624", "7662", "1444"):
    for m in list(re.finditer(re.escape(token), page))[:2]:
        print("\n  --- '%s' 주변 ---" % token)
        print("  %s" % page[max(0, m.start() - 700):m.start() + 320].replace("\\", ""))

print("\n  --- 날짜로 보이는 값들 ---")
for pat in (r'"(?:localTradedAt|tradeDate|baseDate|bizdate|stdDt|dataDate)"\s*:\s*"([^"]+)"',
            r'2026-08-\d\d[T ]?[\d:]*'):
    print("   %s -> %s" % (pat[:34], sorted(set(re.findall(pat, page)))[:8]))

print("\n  --- 투자자 관련 필드명 ---")
print("   %s" % sorted(set(re.findall(
    r'"([A-Za-z]*(?:[Ii]nvestor|[Ff]oreigner|[Ii]ndividual|[Oo]rganization|[Ii]nstitution)'
    r'[A-Za-z]*)"', page)))[:30])

print()
print("=" * 78)
print("B. 문제의 기사 — 며칠자인가")
print("=" * 78)
art = "https://n.news.naver.com/mnews/article/138/0002233864"
try:
    a = get(art, referer="https://search.naver.com/")
    b = text(a)
    print("  제목/날짜 후보: %s" % sorted(set(re.findall(
        r'(20\d\d[.\-/]\d\d[.\-/]\d\d(?:[ T]\d\d:\d\d)?)', a)))[:10])
    i = b.find("선물시장")
    print("  본문: %s" % b[max(0, i - 400):i + 300])
except Exception as e:                                             # noqa: BLE001
    print("  실패:", e)

print()
print("=" * 78)
print("C. 8월 7일자 마감 기사에서 선물 문장 다시 찾기 (날짜 지정 검색)")
print("=" * 78)
FUT = re.compile(r"[^.。\n]{0,130}선물[^.。\n]{0,170}?계약[^.。\n]{0,60}")
seen = set()
for q in ("코스피 마감 선물 외국인 계약", "증시 마감 선물 순매수 계약 8월 7일",
          "코스피 6258 마감"):
    u = ("https://search.naver.com/search.naver?where=news&query="
         + urllib.parse.quote(q) + "&sort=1")
    try:
        page2 = get(u)
    except Exception as e:                                         # noqa: BLE001
        print("  [%s] 검색 실패 %s" % (q[:22], str(e)[:40]))
        continue
    links = sorted(set(re.findall(
        r'https://n\.news\.naver\.com/mnews/article/\d+/\d+', page2)))
    print("  [%s] 기사 %d건" % (q[:24], len(links)))
    for url in links[:10]:
        if url in seen:
            continue
        seen.add(url)
        try:
            raw = get(url, referer="https://search.naver.com/")
        except Exception:                                          # noqa: BLE001
            continue
        b = text(raw)
        dates = sorted(set(re.findall(r'20\d\d[.\-]\d\d[.\-]\d\d', raw)))[:3]
        for m in FUT.finditer(b):
            s = m.group(0).strip()
            if re.search(r"[\d,]{3,}\s*계약", s):
                print("      · %s" % s[:240])
                print("        %s  날짜후보=%s" % (url, dates))
                break

print()
print("탐색 종료")
