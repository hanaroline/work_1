#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""선물 투자자별 단위 확정 — 마지막 한 걸음. 결과는 data/market/probe.txt.

11차까지 확정:
  엔드포인트 https://m.stock.naver.com/api/index/FUT/integration (JSON, 1KB)
  dealTrendInfo = {bizdate 20260807, 개인 -1,444, 외국인 +9,624, 기관 -7,662}
  같은 필드가 코스피 현물에서는 억원이다(외국인 -8,651 = 이미 검증된 억원 값).

단위가 억원인지 계약인지가 남았다. 추론으로 정하면 안 되므로 두 가지로 친다.
  (1) 응답 전문을 떠서 단위 표기가 붙은 필드가 있는지 본다.
  (2) 8월 7일자가 확실한 기사(종가 6,258.77 이 본문에 있는 기사)에서
      선물 계약 수를 찾아 대조한다.
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
print("A. integration 응답 전문 — 단위 표기가 붙은 필드가 있는가")
print("=" * 78)
for code in ("FUT", "KOSPI"):
    try:
        r = get("https://m.stock.naver.com/api/index/%s/integration" % code,
                referer="https://m.stock.naver.com/", ua=MUA)
        print("\n  --- %s (%d bytes) ---" % (code, len(r)))
        print("  %s" % json.dumps(json.loads(r), ensure_ascii=False, indent=1)[:2600])
    except Exception as e:                                         # noqa: BLE001
        print("  [%s] 실패 %s" % (code, str(e)[:60]))

print()
print("=" * 78)
print("B. 8월 7일자가 확실한 기사에서 선물 계약 수 찾기")
print("=" * 78)
# 8/7 종가 6,258.77 은 그날에만 나오는 숫자다. 이걸로 날짜를 확정한다.
MARK = ("6,258.77", "6258.77")
FUT = re.compile(r"[^.。\n]{0,140}선물[^.。\n]{0,190}?계약[^.。\n]{0,70}")
CONTRACT = re.compile(r"([-+]?[\d,]{3,})\s*계약")
QUERIES = [
    "코스피 6,258.77 마감", "코스피 6258.77 외국인", "코스피 마감 선물시장 계약",
    "코스피200 선물 9월물 마감 외국인", "증시 마감 외국인 선물 순매수 8월 7일",
    "코스피 7주 연속 하락 마감 선물",
]
seen, found = set(), 0
for q in QUERIES:
    for extra in ("&sort=1", "&sort=0&ds=2026.08.07&de=2026.08.08"):
        u = ("https://search.naver.com/search.naver?where=news&query="
             + urllib.parse.quote(q) + extra)
        try:
            page = get(u)
        except Exception:                                          # noqa: BLE001
            continue
        links = sorted(set(re.findall(
            r'https://n\.news\.naver\.com/mnews/article/\d+/\d+', page)))
        for url in links[:10]:
            if url in seen:
                continue
            seen.add(url)
            try:
                raw = get(url, referer="https://search.naver.com/")
            except Exception:                                      # noqa: BLE001
                continue
            b = text(raw)
            if not any(mk in b for mk in MARK):
                continue
            hits = [m.group(0).strip() for m in FUT.finditer(b)
                    if CONTRACT.search(m.group(0))]
            print("  [8/7 확인] %s" % url)
            if hits:
                for h in hits[:3]:
                    print("      · %s" % h[:250])
                found += 1
            else:
                print("      (선물 계약 문장 없음)")
print("  8/7 확인된 기사 중 선물 계약 수가 있는 기사 %d건, 확인한 기사 %d건"
      % (found, len(seen)))

print()
print("=" * 78)
print("C. 파생 전문 매체 — 8/7 언급 기사")
print("=" * 78)
for q in ("선물 외국인 순매수 계약", "코스피200 선물 외국인"):
    u = ("https://news.einfomax.co.kr/news/articleList.html?sc_word=%s"
         "&view_type=sm&sc_order_by=E" % urllib.parse.quote(q))
    try:
        lst = get(u)
    except Exception as e:                                         # noqa: BLE001
        print("  [%s] 실패 %s" % (q[:20], str(e)[:40]))
        continue
    arts = sorted(set(re.findall(r'/news/articleView\.html\?idxno=(\d+)', lst)),
                  key=lambda x: -int(x))
    print("  [%s] 기사 %d건" % (q[:20], len(arts)))
    for idx in arts[:10]:
        a = "https://news.einfomax.co.kr/news/articleView.html?idxno=" + idx
        try:
            raw = get(a)
        except Exception:                                          # noqa: BLE001
            continue
        b = text(raw)
        d = re.search(r"(2026[.\-]\d\d[.\-]\d\d)", raw)
        hits = [m.group(0).strip() for m in FUT.finditer(b) if CONTRACT.search(m.group(0))]
        if hits:
            print("    [%s] %s" % (d.group(1) if d else "날짜?", a))
            print("      · %s" % hits[0][:240])

print()
print("탐색 종료")
