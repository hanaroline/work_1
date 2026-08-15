#!/usr/bin/env python3
"""리포트 원천 후보에 붙어 본다 — 무엇이 응답하는지만 본다.

브리핑 세션은 사내 이그레스 정책 때문에 어디에도 직접 못 붙는다. 새 원천을
수집기에 넣기 전에 **러너에서** 어디가 살아 있고 무엇이 돌아오는지 먼저
본다(시세 쪽 scripts/probe_sources.py 와 같은 자리).

작업 브랜치에서만 돈다. 응답은 data/reports/raw/probe_*.html 로 남겨
세션이 마크업을 보고 파서를 붙일 수 있게 한다.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fetch_market import _get, _text                          # noqa: E402

RAW = "data/reports/raw"

# (이름, URL, 인코딩, 리퍼러, 여기 있으면 반가운 글자)
CANDIDATES = [
    # 한경 컨센서스 — 증권사 리포트를 한자리에 모으고 **목표주가·투자의견을
    # 열로 준다**. 네이버 리서치에 없는 값이라 붙일 값어치가 크다.
    ("한경컨센서스 기업",
     "https://consensus.hankyung.com/analysis/list?report_type=CO&pagenum=40&now_page=1",
     "utf-8", "https://consensus.hankyung.com/", ["목표주가", "투자의견", "다운로드"]),
    ("한경컨센서스 산업",
     "https://consensus.hankyung.com/analysis/list?report_type=IN&pagenum=40&now_page=1",
     "utf-8", "https://consensus.hankyung.com/", ["산업", "다운로드"]),
    ("한경컨센서스 시장",
     "https://consensus.hankyung.com/analysis/list?report_type=MA&pagenum=40&now_page=1",
     "utf-8", "https://consensus.hankyung.com/", ["시장"]),
    ("한경컨센서스 경제",
     "https://consensus.hankyung.com/analysis/list?report_type=EC&pagenum=40&now_page=1",
     "utf-8", "https://consensus.hankyung.com/", ["경제"]),
    ("한경컨센서스 채권",
     "https://consensus.hankyung.com/analysis/list?report_type=DB&pagenum=40&now_page=1",
     "utf-8", "https://consensus.hankyung.com/", ["채권"]),

    # 미래에셋증권 리서치 — 우리 하우스 리포트. 붙으면 「하우스 시각」을
    # 남의 매체를 거치지 않고 바로 실을 수 있다.
    ("미래에셋 리서치 목록",
     "https://securities.miraeasset.com/bbs/board/message/list.do?messageId=&searchType=&searchText=&categoryId=1521",
     "utf-8", "https://securities.miraeasset.com/", ["리포트", "기업분석", "종목"]),
    ("미래에셋 투자정보",
     "https://securities.miraeasset.com/bbs/board/message/list.do?categoryId=1571",
     "utf-8", "https://securities.miraeasset.com/", ["리포트", "시황"]),

    # 네이버 모바일 리서치 API — 목록이 JSON 이면 파싱이 훨씬 튼튼해진다.
    ("네이버 모바일 리서치 API",
     "https://m.stock.naver.com/api/research/company?page=1&pageSize=30",
     "utf-8", "https://m.stock.naver.com/", ["title", "brokerName", "researchId"]),
    ("네이버 모바일 산업 리서치 API",
     "https://m.stock.naver.com/api/research/industry?page=1&pageSize=30",
     "utf-8", "https://m.stock.naver.com/", ["title", "brokerName"]),

    # 한국IR협의회 기업리서치 — 커버리지가 없는 중소형주를 메운다.
    ("한국IR협의회 리서치",
     "https://www.kirs.or.kr/information/tech_report.html",
     "utf-8", "https://www.kirs.or.kr/", ["기업", "리서치", "보고서"]),

    # 다음 금융 — 네이버가 막힐 때의 대비책.
    ("다음 금융 리서치",
     "https://finance.daum.net/api/research/list?page=1&perPage=30",
     "utf-8", "https://finance.daum.net/", ["title", "brokerName"]),
]


def probe(name, url, enc, ref, wants):
    print("\n=== %s\n    %s" % (name, url))
    try:
        body = _get(url, encoding=enc, referer=ref,
                    headers={"Accept": "text/html,application/json,*/*"})
    except Exception as e:                                     # noqa: BLE001
        print("    실패 %s: %s" % (type(e).__name__, str(e)[:160]))
        return None
    print("    %d bytes" % len(body))
    hits = [w for w in wants if w in body]
    print("    찾던 글자: %s" % (", ".join(hits) if hits else "(하나도 없음)"))
    # 표가 있는지, 링크가 몇 개인지 — 파서를 붙일 만한지 가늠한다.
    rows = len(re.findall(r"(?is)<tr[^>]*>", body))
    pdfs = len(re.findall(r'(?i)href="[^"]*\.pdf"', body))
    print("    <tr> %d개 · pdf 링크 %d개" % (rows, pdfs))
    head = _text(body[:1500]).replace("\n", " ")[:220]
    print("    첫 글자: %s" % head)
    try:
        os.makedirs(RAW, exist_ok=True)
        fn = re.sub(r"[^0-9A-Za-z가-힣]+", "_", name)[:40]
        with open(os.path.join(RAW, "probe_%s.html" % fn), "w", encoding="utf-8") as f:
            f.write(body[:400_000])
    except OSError:
        pass
    return body


def main():
    print("리포트 원천 후보 탐색")
    alive = 0
    for name, url, enc, ref, wants in CANDIDATES:
        if probe(name, url, enc, ref, wants) is not None:
            alive += 1
    print("\n살아 있는 후보 %d/%d" % (alive, len(CANDIDATES)))


if __name__ == "__main__":
    main()
