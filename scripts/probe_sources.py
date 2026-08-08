#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""마지막 공백(선물 투자자별)을 여는 경로를 찾는다. 결과는 data/market/probe.txt.

8차에서 새로 안 것:
  - 네이버 모바일에 선물 화면이 있다(코스피200 선물 978.75). SSR 이라 페이지 안에
    자료가 박혀 있을 수 있다.
  - 한경 외국인매매 화면이 열린다(441KB). 파생 화면으로 가는 링크가 있는지 본다.
  - 한국투자증권 화면은 UTF-8 인데 EUC-KR 로 읽어 깨졌다. 다시 읽는다.
  - KRX 오픈API 는 {"respMsg":"Unauthorized Key"} — 키 문제로 확정.
  - 뉴스 검색이 0건이었다. nso 파라미터가 검색을 깨뜨린 것으로 보인다.
"""
import json
import re
import urllib.error
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
MUA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
       "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")


def get(url, referer=None, encoding="utf-8", timeout=25, ua=UA, headers=None):
    h = {"User-Agent": ua, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
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


print("=" * 78)
print("A. 네이버 모바일 선물 화면 — 안에 투자자별이 박혀 있는가")
print("=" * 78)
try:
    p = get("https://m.stock.naver.com/domestic/index/FUT/total", ua=MUA)
    print("  %d bytes" % len(p))
    body = text(p)
    for kw in ("투자자", "외국인", "기관", "개인", "미결제"):
        idx = [m.start() for m in re.finditer(kw, body)][:2]
        for i in idx:
            print("   %s… %s" % (kw, body[max(0, i - 70):i + 130]))
    # SSR 페이지에 박힌 JSON 덩어리에서 키 이름을 본다
    for blob in re.findall(r'(?s)\{"[A-Za-z_]{3,}".{200,}?\}', p)[:3]:
        keys = sorted(set(re.findall(r'"([A-Za-z][A-Za-z0-9_]{2,26})"\s*:', blob)))
        print("   JSON 키: %s" % keys[:40])
    print("   화면 안 링크: %s" % sorted(set(
        re.findall(r'/domestic/[A-Za-z0-9/_\-]+', p)))[:24])
except Exception as e:                                             # noqa: BLE001
    print("  실패:", e)

print()
print("  -- 모바일 선물 하위 경로 --")
for sub in ("investor", "trend", "total?tab=investor", "chart"):
    u = "https://m.stock.naver.com/domestic/index/FUT/" + sub
    try:
        r = get(u, ua=MUA)
        t = text(r)
        has = "투자자" in t
        print("  [%-18s] OK %6d  투자자 표기=%s" % (sub, len(r), has))
    except urllib.error.HTTPError as e:
        print("  [%-18s] HTTP %s" % (sub, e.code))
    except Exception as e:                                         # noqa: BLE001
        print("  [%-18s] %s" % (sub, str(e)[:50]))

print()
print("=" * 78)
print("B. 연합인포맥스 — 선물 수급을 매일 쓰는 매체")
print("=" * 78)
for q in ("선물 외국인 순매수", "코스피200 선물"):
    u = ("https://news.einfomax.co.kr/news/articleList.html?sc_word=%s&view_type=sm"
         % urllib.parse.quote(q, encoding="utf-8"))
    try:
        r = get(u)
        arts = sorted(set(re.findall(r'/news/articleView\.html\?idxno=\d+', r)))
        print("  [%s] 목록 %d bytes, 기사 %d건" % (q, len(r), len(arts)))
        for a in arts[:4]:
            try:
                b = text(get("https://news.einfomax.co.kr" + a))
            except Exception:                                      # noqa: BLE001
                continue
            for m in re.finditer(r"[^.。\n]{0,110}선물[^.。\n]{0,150}?계약[^.。\n]{0,50}", b):
                s = m.group(0).strip()
                if re.search(r"[\d,]{3,}\s*계약", s):
                    print("      · %s" % s[:230])
                    print("        https://news.einfomax.co.kr%s" % a)
                    break
    except Exception as e:                                         # noqa: BLE001
        print("  [%s] 실패 %s" % (q, str(e)[:60]))

print()
print("=" * 78)
print("C. 네이버 뉴스 검색 — nso 파라미터 없이")
print("=" * 78)
FUT = re.compile(r"[^.。\n]{0,120}선물[^.。\n]{0,160}?계약[^.。\n]{0,60}")
seen = set()
for q in ("코스피 선물 외국인 순매도 계약", "외국인 선물시장 순매수 계약",
          "코스피200 선물 외국인"):
    u = ("https://search.naver.com/search.naver?where=news&query="
         + urllib.parse.quote(q))
    try:
        page = get(u)
    except Exception as e:                                         # noqa: BLE001
        print("  [%s] 검색 실패 %s" % (q[:20], str(e)[:40]))
        continue
    links = sorted(set(re.findall(
        r'https://n\.news\.naver\.com/mnews/article/\d+/\d+', page)))
    print("  [%s] 기사 %d건" % (q[:24], len(links)))
    for url in links[:8]:
        if url in seen:
            continue
        seen.add(url)
        try:
            b = text(get(url, referer="https://search.naver.com/"))
        except Exception:                                          # noqa: BLE001
            continue
        for m in FUT.finditer(b):
            s = m.group(0).strip()
            if re.search(r"[\d,]{3,}\s*계약", s):
                print("      · %s" % s[:240])
                print("        %s" % url)
                break

print()
print("=" * 78)
print("D. 한경 · 한국투자증권 화면의 파생 링크")
print("=" * 78)
try:
    hk = get("https://markets.hankyung.com/investment/foreigner-trading")
    links = sorted(set(re.findall(r'"(/[a-z0-9/\-]*(?:derivative|future|option)[a-z0-9/\-]*)"',
                                  hk, re.I)))
    print("  한경 파생 링크: %s" % (links[:20] or "없음"))
except Exception as e:                                             # noqa: BLE001
    print("  한경 실패:", e)
try:
    ki = get("https://www.truefriend.com/main/research/research/Sell.jsp")
    print("  한투(UTF-8): %s" % text(ki)[:260])
except Exception as e:                                             # noqa: BLE001
    print("  한투 실패:", e)

print()
print("탐색 종료")
