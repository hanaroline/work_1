#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""남은 공백을 채울 경로를 찾는 탐색 스크립트. 결과는 data/market/probe.txt.

지금까지:
  1~2차 — KRX 정보데이터시스템은 공개 리더를 거쳐도 막힌다. 네이버 선물 화면엔 시세뿐.
  3차   — 증시자금동향에서 고객예탁금·신용잔고를 얻었다(수집기에 반영 완료).
  4~5차 — 기사 본문은 n.news.naver.com 으로 받으면 잘 들어온다(수집기에 반영 완료).
          다만 그날 기사 30건에 선물 계약 수를 적은 문장은 하나도 없었다.
  6차(지금) — 국내 경제지표 공표일정. 브리핑 세션은 한국은행·통계청에 직접 못 붙는다.
"""
import re
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def get(url, encoding="utf-8", timeout=30):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode(encoding, "replace")


def text(html):
    t = re.sub(r"(?is)<(script|style).*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", re.sub(r"&nbsp;?", " ", t)).strip()


TARGETS = [
    ("한은 공표일정 달력",
     "https://www.bok.or.kr/portal/stats/statsPublictSchdul/listCldr.do?menuNo=200775"),
    ("한은 공표일정 목록",
     "https://www.bok.or.kr/portal/stats/statsPublictSchdul/list.do?menuNo=200776"),
    ("통계청 공표일정",
     "https://kostat.go.kr/board.es?mid=a10302010000&bid=219"),
    ("e-나라지표", "https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1063"),
]

for label, url in TARGETS:
    print("=" * 78)
    print(label)
    print("=" * 78)
    try:
        html = get(url)
    except Exception as e:
        print("  실패: %s: %s" % (type(e).__name__, str(e)[:90]))
        continue
    body = text(html)
    print("  %d bytes / 본문 %d자" % (len(html), len(body)))
    # 8월 10~14일이 들어간 대목만 추린다
    hits = 0
    for m in re.finditer(r"(8\s*월\s*1[0-4]\s*일|2026[-./]0?8[-./]1[0-4]|0?8[-./]1[0-4])", body):
        s = body[max(0, m.start() - 90):m.start() + 170]
        print("    · %s" % s.strip()[:250])
        hits += 1
        if hits >= 8:
            break
    if not hits:
        print("  8월 10~14일 언급 없음. 본문 앞머리: %s" % body[:300])
    print()

print("탐색 종료")
