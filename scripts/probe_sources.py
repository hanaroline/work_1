#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""남은 공백(선물 투자자별 / 신용융자·반대매매)을 채울 경로를 찾는 탐색 스크립트.

수집 서버(깃허브 러너)에서 돌리고, 결과를 data/market/probe.txt 로 남긴다.

지금까지 알아낸 것:
  1차 — 네이버 /sise/ 목차에 증시자금동향·공매도 화면이 있다. KRX 는 리더를 거쳐도 막힌다.
  2차 — 선물 화면에는 '선물 주요시세' 표뿐이고 투자자별은 없다.
        freeSis 는 exbuilder SPA 라 조회 파라미터가 화면에 안 드러난다.
  3차(지금) — 증시자금동향 표를 직접 열어 신용잔고·미수금·반대매매 칸을 확인하고,
        선물 외국인은 마감시황 기사 본문에서 뽑을 수 있는지 본다.
"""
import re
import urllib.error
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def get(url, referer=None, encoding="utf-8", timeout=30):
    h = {"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
    if referer:
        h["Referer"] = referer
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode(encoding, "replace")


def cells(row):
    out = []
    for c in re.findall(r"(?is)<t[dh][^>]*>(.*?)</t[dh]>", row):
        c = re.sub(r"(?s)<[^>]+>", " ", c)
        c = re.sub(r"&nbsp;?", " ", c)
        out.append(re.sub(r"\s+", " ", c).strip())
    return out


def dump_tables(label, html, want=None, rows=4):
    """표마다 캡션·머리글·앞 몇 줄을 찍는다. 어떤 칸이 있는지 눈으로 확인하려는 것."""
    print("\n--- %s ---" % label)
    for tbl in re.findall(r"(?is)<table.*?</table>", html):
        cap = re.search(r"(?is)<caption[^>]*>(.*?)</caption>", tbl)
        cap = re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", "", cap.group(1))).strip() if cap else ""
        trs = re.findall(r"(?is)<tr[^>]*>.*?</tr>", tbl)
        body = [cells(t) for t in trs]
        body = [b for b in body if any(x for x in b)]
        if not body:
            continue
        if want and want not in cap and not any(want in " ".join(b) for b in body[:3]):
            continue
        print("  caption=%r  rows=%d" % (cap, len(body)))
        for b in body[:rows]:
            print("    %s" % (b[:12],))


print("=" * 78)
print("A. 증시자금동향 — 고객예탁금·신용잔고·미수금·반대매매가 이 표에 있는가")
print("=" * 78)
try:
    dep = get("https://finance.naver.com/sise/sise_deposit.naver", encoding="cp949")
    dump_tables("증시자금동향", dep, rows=6)
except Exception as e:
    print("  실패:", e)

print()
print("=" * 78)
print("B. 공매도 거래 현황")
print("=" * 78)
try:
    sh = get("https://finance.naver.com/sise/short_trade.naver", encoding="cp949")
    dump_tables("공매도", sh, rows=4)
except Exception as e:
    print("  실패:", e)

print()
print("=" * 78)
print("C. 마감시황 기사 본문 — 선물 외국인 계약 수가 적혀 있는가")
print("=" * 78)
FUT_PAT = re.compile(
    r"[^.。\n]{0,90}선물[^.。\n]{0,120}?(?:계약|억원)[^.。\n]{0,40}", re.S)
try:
    lst = get("https://finance.naver.com/news/mainnews.naver?date=2026-08-07",
              encoding="cp949")
    arts = []
    for href, title in re.findall(
            r'href="(/news/news_read\.naver\?[^"]+)"[^>]*>\s*([^<]{4,80})', lst):
        href = href.replace("&amp;", "&")
        if (href, title) not in arts:
            arts.append((href, title.strip()))
    print("  기사 %d건" % len(arts))
    hit = 0
    for href, title in arts[:14]:
        if not re.search(r"마감|증시|코스피|장중|시황", title):
            continue
        try:
            art = get("https://finance.naver.com" + href, encoding="cp949",
                      referer="https://finance.naver.com/news/mainnews.naver")
        except Exception as e:
            print("    [%s] 본문 실패 %s" % (title[:34], e))
            continue
        body = re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", " ", art))
        found = [m.group(0).strip() for m in FUT_PAT.finditer(body)][:3]
        print("    [%s] %d자" % (title[:34], len(body)))
        for f in found:
            print("        · %s" % f[:190])
        hit += bool(found)
    print("  선물 문장이 잡힌 기사 %d건" % hit)
except Exception as e:
    print("  실패:", e)

print()
print("탐색 종료")
