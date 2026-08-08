#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""선물 투자자별의 단위를 확정한다. 결과는 data/market/probe.txt.

10차에서 확정한 것:
  dealTrendInfo = {"bizdate":"20260807","personalValue":"-1,444",
                   "foreignValue":"+9,624","institutionalValue":"-7,662"}
  기준일 20260807 확인. 부호가 반대였던 기사는 2026-07-10 자였다(다른 날).

남은 문제: 이 값이 계약 수인가 억원인가. 틀린 단위로 고객 자료에 넣을 수는 없다.
검증법 — 같은 API 의 코스피 현물 화면 dealTrendInfo 를 이미 아는 억원 값
(외국인 약 -8,6xx억)과 대조한다. 현물이 억원이면 그 필드는 금액 단위다.
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
print("A. 같은 필드를 현물 지수에서 읽어 단위를 가늠한다")
print("=" * 78)
for code in ("KOSPI", "KOSDAQ", "KPI200", "FUT"):
    try:
        p = get("https://m.stock.naver.com/domestic/index/%s/total" % code, ua=MUA)
    except Exception as e:                                         # noqa: BLE001
        print("  [%-7s] 실패 %s" % (code, str(e)[:50]))
        continue
    m = re.search(r'"dealTrendInfo":(\{.*?\})', p)
    v = re.search(r'"accumulatedTradingValue","key":"대금","value":"([^"]+)"', p)
    vol = re.search(r'"accumulatedTradingVolume","key":"거래량","value":"([^"]+)"', p)
    cl = re.search(r'"closePrice"[^}]*?"value":"([^"]+)"', p)
    print("  [%-7s] %s" % (code, m.group(1) if m else "dealTrendInfo 없음"))
    print("            종가=%s 거래량=%s 대금=%s"
          % (cl.group(1) if cl else "?", vol.group(1) if vol else "?",
             v.group(1) if v else "?"))

print()
print("=" * 78)
print("B. 이 화면이 부르는 JSON 엔드포인트 찾기 (HTML 긁기보다 안전)")
print("=" * 78)
p = get("https://m.stock.naver.com/domestic/index/FUT/total", ua=MUA)
print("  queryHash: %s" % sorted(set(re.findall(r'"queryHash":"([^"]{4,90})"', p)))[:12])
for cand in ("https://api.stock.naver.com/index/FUT/basic",
             "https://api.stock.naver.com/index/FUT/integration",
             "https://api.stock.naver.com/futures/FUT/integration",
             "https://api.stock.naver.com/index/nation/KOR/FUT/integration",
             "https://m.stock.naver.com/api/index/FUT/integration"):
    try:
        r = get(cand, referer="https://m.stock.naver.com/", ua=MUA)
        ok = "dealTrendInfo" in r
        print("  [%-56s] OK %5d  dealTrendInfo=%s" % (cand[-56:], len(r), ok))
        if ok:
            j = json.loads(r)
            print("      %s" % json.dumps(
                j.get("dealTrendInfo") or j, ensure_ascii=False)[:200])
    except Exception as e:                                         # noqa: BLE001
        print("  [%-56s] %s" % (cand[-56:], str(e)[:44]))

print()
print("=" * 78)
print("C. 연합인포맥스 8월 7일자 기사에서 선물 계약 수 대조")
print("=" * 78)
FUT = re.compile(r"[^.。\n]{0,130}선물[^.。\n]{0,180}?계약[^.。\n]{0,60}")
u = ("https://news.einfomax.co.kr/news/articleList.html?sc_word=%s&view_type=sm"
     % urllib.parse.quote("선물 외국인"))
try:
    lst = get(u)
    arts = sorted(set(re.findall(r'/news/articleView\.html\?idxno=\d+', lst)),
                  key=lambda x: -int(x.split("=")[-1]))
    print("  기사 %d건 (최신순)" % len(arts))
    for a in arts[:12]:
        try:
            raw = get("https://news.einfomax.co.kr" + a)
        except Exception:                                          # noqa: BLE001
            continue
        b = text(raw)
        if "2026.08.07" not in raw and "2026-08-07" not in raw and "8월 7일" not in b:
            continue
        print("    [8/7자] https://news.einfomax.co.kr%s" % a)
        for m in FUT.finditer(b):
            s = m.group(0).strip()
            if re.search(r"[\d,]{3,}\s*계약", s):
                print("      · %s" % s[:240])
except Exception as e:                                             # noqa: BLE001
    print("  실패:", e)

print()
print("탐색 종료")
