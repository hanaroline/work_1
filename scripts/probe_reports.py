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
#
# 3차 탐색 — 출처를 넓히려고 다시 돈다. 앞선 두 차례에서 네이버 모바일 API 와
# 미래에셋 게시판만 살아남았다. 이번에는 (가) 앞서 죽었던 곳을 다른 길로 다시,
# (나) 증권사 자체 리서치 게시판, (다) 외국계·해외 리포트를 본다.
CANDIDATES = [
    # ── (가) 앞서 죽었던 곳 다시 ────────────────────────────────
    # 한경 컨센서스: 목표주가·투자의견을 **열로** 주는 유일한 곳이다.
    # 앞서 https 로 500 이 났다. 호스트와 얼개를 바꿔 가며 찔러 본다.
    ("한경 consensus http", "http://consensus.hankyung.com/analysis/list?report_type=CO&pagenum=40&now_page=1",
     "utf-8", "http://consensus.hankyung.com/", ["목표주가", "투자의견"]),
    ("한경 hkconsensus", "https://hkconsensus.hankyung.com/analysis/list?report_type=CO",
     "utf-8", "https://www.hankyung.com/", ["목표주가", "투자의견"]),
    ("한경 apps.hankyung", "https://consensus.hankyung.com/apps.analysis/analysis.list?report_type=CO",
     "utf-8", "https://consensus.hankyung.com/", ["목표주가", "투자의견"]),
    ("한경 analysis.total", "https://consensus.hankyung.com/analysis/total",
     "utf-8", "https://www.hankyung.com/", ["리포트", "증권"]),

    ("IR협의회 기업리서치", "https://www.kirs.or.kr/information/tech_report.html",
     "utf-8", "https://www.kirs.or.kr/", ["기업", "리서치"]),
    ("IR협의회 목록2", "https://www.kirs.or.kr/information/tech_report2.html",
     "utf-8", "https://www.kirs.or.kr/", ["기업", "리서치"]),
    ("IR협의회 첫 화면", "https://www.kirs.or.kr/", "utf-8", "https://www.google.com/", ["IR", "협의회"]),

    ("다음 리서치 api", "https://finance.daum.net/api/research/list?page=1&perPage=30",
     "utf-8", "https://finance.daum.net/domestic/research", ["title", "brokerName"]),
    ("다음 리서치 화면", "https://finance.daum.net/domestic/research",
     "utf-8", "https://finance.daum.net/", ["리서치", "증권"]),

    # ── (나) 증권사 자체 리서치 게시판 ───────────────────────────
    # 미래에셋이 이 길로 붙었다. 같은 얼개를 쓰는 곳이 더 있는지 본다.
    # 붙으면 애널리스트 실명과 원문 PDF 를 바로 얻는다.
    ("삼성증권 리서치", "https://www.samsungpop.com/mbw/research/reportList.do?cmd=W101100R",
     "utf-8", "https://www.samsungpop.com/", ["리포트", "리서치"]),
    ("NH투자 리서치", "https://www.nhqv.com/servlet/EQ/EQAA/EQAA0001R",
     "utf-8", "https://www.nhqv.com/", ["리포트", "리서치"]),
    ("한국투자 리서치", "https://securities.koreainvestment.com/main/research/report/list.jsp",
     "utf-8", "https://securities.koreainvestment.com/", ["리포트", "리서치"]),
    ("키움 리서치", "https://www.kiwoom.com/h/invest/research/VAnalysisRVwList",
     "utf-8", "https://www.kiwoom.com/", ["리포트", "리서치"]),
    ("신한투자 리서치", "https://open.shinhansec.com/phls/rsch/imTot/list.do",
     "utf-8", "https://open.shinhansec.com/", ["리포트", "리서치"]),
    ("하나증권 리서치", "https://www.hanaw.com/main/research/research/list.cmd",
     "utf-8", "https://www.hanaw.com/", ["리포트", "리서치"]),
    ("KB증권 리서치", "https://rc.kbsec.com/rc/research/list.able",
     "utf-8", "https://rc.kbsec.com/", ["리포트", "리서치"]),
    ("대신증권 리서치", "https://www.daishin.com/g.ds?m=1400&p=3311&v=3312",
     "utf-8", "https://www.daishin.com/", ["리포트", "리서치"]),
    ("유안타 리서치", "https://www.myasset.com/myasset/research/main.cmd",
     "utf-8", "https://www.myasset.com/", ["리포트", "리서치"]),
    ("메리츠 리서치", "https://home.imeritz.com/include/resource/research/main/list.do",
     "utf-8", "https://home.imeritz.com/", ["리포트", "리서치"]),
    ("미래에셋 글로벌", "https://securities.miraeasset.com/bbs/board/message/list.do?categoryId=1525",
     "cp949", "https://securities.miraeasset.com/", ["리포트", "글로벌", "해외"]),
    ("미래에셋 해외주식", "https://securities.miraeasset.com/bbs/board/message/list.do?categoryId=1571",
     "cp949", "https://securities.miraeasset.com/", ["리포트", "해외"]),

    # ── (다) 외국계·해외 리포트 ────────────────────────────────
    # 외국계 IB 의 한국물 리포트는 대개 기관 전용이라 공개 목록이 없다.
    # 그래도 (1) 해외 종목을 다루는 국내 리포트, (2) 해외 애널리스트 투자의견을
    # 모아 주는 곳이 있는지 본다.
    ("네이버 해외 리서치", "https://m.stock.naver.com/api/research/global?page=1&pageSize=10",
     "utf-8", "https://m.stock.naver.com/", ["title", "brokerName"]),
    ("네이버 해외증시 리서치", "https://m.stock.naver.com/api/research/overseas?page=1&pageSize=10",
     "utf-8", "https://m.stock.naver.com/", ["title", "brokerName"]),
    ("네이버 worldResearch", "https://m.stock.naver.com/api/research/world?page=1&pageSize=10",
     "utf-8", "https://m.stock.naver.com/", ["title", "brokerName"]),
    ("네이버 해외 목록 html", "https://finance.naver.com/research/global_list.naver",
     "cp949", "https://finance.naver.com/research/", ["해외", "리포트"]),
    ("한경 글로벌마켓", "https://www.hankyung.com/globalmarket",
     "utf-8", "https://www.hankyung.com/", ["글로벌", "증시"]),
    ("KRX 기업분석보고서", "https://kind.krx.co.kr/valueup/reportList.do?method=searchValueupReportMain",
     "utf-8", "https://kind.krx.co.kr/", ["보고서", "기업"]),
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
