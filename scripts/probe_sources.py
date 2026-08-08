#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""남은 공백을 채울 경로를 찾는 탐색 스크립트. 결과는 data/market/probe.txt.

지금까지:
  1차 — KRX 는 공개 리더를 거쳐도 막힌다. 네이버 목차에 증시자금동향·공매도가 있다.
  2차 — 선물 화면에는 시세뿐. freeSis 는 SPA 라 조회 파라미터가 안 드러난다.
  3차 — 증시자금동향에서 고객예탁금·신용잔고를 얻었다(표 확인 완료).
        마감시황 기사 본문 추출이 76자로 실패 — news_read 는 껍데기였다.
  4차(지금) — 기사 본문을 n.news.naver.com 으로 직접 받아 선물 외국인 계약 수를 찾는다.
        공매도 화면 구조도 다시 본다.
"""
import re
import urllib.error
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


# 선물시장 수급 문장. '외국인은 선물시장에서 3,000계약 순매도' 같은 형태를 노린다.
FUT = re.compile(r"[^.。\n]{0,100}선물[^.。\n]{0,140}?(?:계약|억원)[^.。\n]{0,50}")
CREDIT = re.compile(r"[^.。\n]{0,80}(?:반대매매|미수금|신용융자|신용거래융자)[^.。\n]{0,120}")


def articles_from(url, label, enc="cp949"):
    """네이버 금융 뉴스 목록에서 (제목, 기사 URL) 을 뽑는다."""
    try:
        lst = get(url, encoding=enc)
    except Exception as e:
        print("  [%s] 목록 실패 %s" % (label, e))
        return []
    out = []
    for oid, aid, title in re.findall(
            r'article_id=(\d+)[^"]*?office_id=(\d+)[^"]*"[^>]*>\s*([^<]{4,90})', lst):
        out.append((title.strip(), "https://n.news.naver.com/mnews/article/%s/%s" % (aid, oid)))
    for oid, aid, title in re.findall(
            r'office_id=(\d+)[^"]*?article_id=(\d+)[^"]*"[^>]*>\s*([^<]{4,90})', lst):
        out.append((title.strip(), "https://n.news.naver.com/mnews/article/%s/%s" % (oid, aid)))
    seen, uniq = set(), []
    for t, u in out:
        if u not in seen:
            seen.add(u)
            uniq.append((t, u))
    print("  [%s] 기사 %d건" % (label, len(uniq)))
    return uniq


print("=" * 78)
print("A. 마감시황 기사 본문에서 선물 외국인 계약 수 찾기")
print("=" * 78)
cands = []
cands += articles_from(
    "https://finance.naver.com/news/mainnews.naver?date=" + DAY_DOT, "주요뉴스")
cands += articles_from(
    "https://finance.naver.com/news/news_list.naver?mode=LSS3D&section_id=101"
    "&section_id2=258&date=" + DAY, "시황·전망")

seen, checked, fut_hit = set(), 0, 0
for title, url in cands:
    if url in seen:
        continue
    seen.add(url)
    if not re.search(r"마감|증시|코스피|코스닥|시황|외국인|수급", title):
        continue
    if checked >= 12:
        break
    checked += 1
    try:
        body = text(get(url, referer="https://finance.naver.com/"))
    except Exception as e:
        print("    [%-32s] 본문 실패 %s" % (title[:32], str(e)[:40]))
        continue
    hits = [m.group(0).strip() for m in FUT.finditer(body)][:3]
    print("    [%-32s] %5d자  선물문장 %d" % (title[:32], len(body), len(hits)))
    for h in hits:
        print("        · %s" % h[:200])
    fut_hit += bool(hits)
print("  본문 확인 %d건 / 선물 문장 있는 기사 %d건" % (checked, fut_hit))

print()
print("=" * 78)
print("B. 반대매매·미수금이 적힌 기사")
print("=" * 78)
cr = 0
for title, url in cands:
    if not re.search(r"신용|빚투|반대매매|미수|예탁금", title):
        continue
    if cr >= 5:
        break
    cr += 1
    try:
        body = text(get(url, referer="https://finance.naver.com/"))
    except Exception as e:
        print("    [%-32s] 실패 %s" % (title[:32], str(e)[:40]))
        continue
    print("    [%-32s] %5d자" % (title[:32], len(body)))
    for m in list(CREDIT.finditer(body))[:3]:
        print("        · %s" % m.group(0).strip()[:200])
if not cr:
    print("  제목에 신용/반대매매가 걸린 기사 없음")

print()
print("=" * 78)
print("C. 공매도 화면 구조 다시 보기")
print("=" * 78)
try:
    sh = get("https://finance.naver.com/sise/short_trade.naver", encoding="cp949")
    print("  <table> %d개, <tr> %d개" % (sh.count("<table"), sh.count("<tr")))
    body = text(sh)
    i = body.find("공매도")
    print("  본문 일부: %s" % body[max(0, i - 40):i + 700])
except Exception as e:
    print("  실패:", e)

print()
print("탐색 종료")
