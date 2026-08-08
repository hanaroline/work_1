#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""남은 공백을 채울 경로를 찾는 탐색 스크립트. 결과는 data/market/probe.txt.

지금까지:
  1~2차 — KRX 는 공개 리더를 거쳐도 막힌다. 네이버 선물 화면에는 시세뿐이다.
  3차   — 증시자금동향에서 고객예탁금·신용잔고를 얻었다.
  4차   — 기사 본문은 n.news.naver.com 으로 받으면 9천자씩 잘 들어온다.
          다만 제목으로 거르니 마감시황 기사가 안 걸려 선물 문장을 못 찾았다.
  5차(지금) — 제목으로 거르지 말고 그날 기사 본문을 전부 훑어 선물 수급 문장을 찾는다.
          네이버 뉴스 검색도 함께 쓴다.
"""
import re
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
DAY_DOT, DAY = "2026-08-07", "20260807"


def get(url, referer=None, encoding="utf-8", timeout=30):
    h = {"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
    if referer:
        h["Referer"] = referer
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
        return r.read().decode(encoding, "replace")


def text(html):
    t = re.sub(r"(?is)<(script|style).*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"&nbsp;?", " ", t)).strip()


# 선물 수급 문장: '외국인은 선물시장에서 3,000계약 순매도' 형태를 노린다.
FUT = re.compile(r"[^.。\n]{0,110}선물[^.。\n]{0,150}?(?:계약|억원)[^.。\n]{0,60}")
NUM_CONTRACT = re.compile(r"([-+]?[\d,]{3,})\s*계약")


def collect(url, label, enc="cp949"):
    try:
        lst = get(url, encoding=enc)
    except Exception as e:
        print("  [%s] 목록 실패 %s" % (label, str(e)[:60]))
        return []
    out = []
    for a, b, title in re.findall(
            r'article_id=(\d+)[^"]*?office_id=(\d+)[^"]*"[^>]*>\s*([^<]{4,90})', lst):
        out.append((title.strip(), "https://n.news.naver.com/mnews/article/%s/%s" % (b, a)))
    for a, b, title in re.findall(
            r'office_id=(\d+)[^"]*?article_id=(\d+)[^"]*"[^>]*>\s*([^<]{4,90})', lst):
        out.append((title.strip(), "https://n.news.naver.com/mnews/article/%s/%s" % (a, b)))
    for oid, aid in re.findall(r'n\.news\.naver\.com/mnews/article/(\d+)/(\d+)', lst):
        out.append(("(검색)", "https://n.news.naver.com/mnews/article/%s/%s" % (oid, aid)))
    print("  [%s] 기사 %d건" % (label, len(out)))
    return out


cands = []
cands += collect("https://finance.naver.com/news/mainnews.naver?date=" + DAY_DOT, "주요뉴스")
for page in (2, 3):
    cands += collect("https://finance.naver.com/news/mainnews.naver?date=%s&page=%d"
                     % (DAY_DOT, page), "주요뉴스 %d쪽" % page)
q = urllib.parse.quote("코스피 마감 외국인 선물 순매도")
cands += collect("https://search.naver.com/search.naver?where=news&query=%s"
                 "&sort=0&ds=2026.08.07&de=2026.08.07"
                 "&nso=so:r,p:from20260807to20260807" % q, "뉴스검색", enc="utf-8")

seen, bodies = set(), []
print()
print("=" * 78)
print("A. 그날 기사 본문 전수 조사 — 선물 수급 문장")
print("=" * 78)
for title, url in cands:
    if url in seen or len(seen) >= 30:
        continue
    seen.add(url)
    try:
        body = text(get(url, referer="https://finance.naver.com/"))
    except Exception:
        continue
    bodies.append((title, url, body))
    hits = [m.group(0).strip() for m in FUT.finditer(body)]
    hits = [h for h in hits if NUM_CONTRACT.search(h) or "선물시장" in h]
    if hits:
        print("  [%s]" % title[:50])
        print("    %s" % url)
        for h in hits[:4]:
            print("      · %s" % h[:230])
print("  본문 %d건 확인" % len(bodies))

print()
print("=" * 78)
print("B. '계약' 이 들어간 문장 전체 (선물 단어가 없어도)")
print("=" * 78)
n = 0
for title, url, body in bodies:
    for m in NUM_CONTRACT.finditer(body):
        s = body[max(0, m.start() - 120):m.end() + 60]
        if re.search(r"선물|옵션|외국인|기관|미결제", s):
            print("  [%s] · %s" % (title[:34], s.strip()[:220]))
            n += 1
            break
print("  %d건" % n)

print()
print("=" * 78)
print("C. 증시자금동향·신용 관련 수치가 적힌 문장")
print("=" * 78)
CR = re.compile(r"[^.。\n]{0,90}(?:반대매매|미수금|신용거래융자|신용융자|예탁금)[^.。\n]{0,140}")
n = 0
for title, url, body in bodies:
    hits = [m.group(0).strip() for m in CR.finditer(body) if re.search(r"\d", m.group(0))]
    if hits:
        print("  [%s]" % title[:50])
        for h in hits[:3]:
            print("      · %s" % h[:230])
        n += 1
    if n >= 6:
        break

print()
print("탐색 종료")
