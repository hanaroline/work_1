#!/usr/bin/env python3
"""국내 100대 기업 시세·지표·실적·일정을 모아 data/kr100/ 에 JSON 으로 저장한다.

받아오는 방법과 정규화 규칙은 미국 화면의 수집기(`scripts/fetch_us100.py`)와 같다.
시장마다 다른 것은 여덟 가지뿐이므로 코드를 두 벌 두지 않고, 그 모듈의 시장 프로필만
바꿔 끼워 main() 을 부른다. 야후 API 는 국내 종목을 `005930.KS`(유가증권)·
`247540.KQ`(코스닥) 형태로 받는다.

종목 목록은 `kr-top100.html` 의 COMPANIES 배열을 그대로 읽는다 — 목록을 두 곳에
두면 반드시 어긋나므로 화면 파일을 유일한 원본으로 삼는다.

산출물
  data/kr100/latest.json        전 종목 요약(시세·지표·일정·실적) + 수집 상태
  data/kr100/chart/{SYM}.json   종목별 일봉 2년 + 월봉 10년

국내 종목에서 미리 알아 둘 것
  야후는 국내 종목의 **증권사 목표주가·투자의견·확정 실적발표일**을 대부분 담고 있지
  않다. 그래서 latest.json 의 target·calendar 가 비는 종목이 많고, 화면은 그 자리를
  "미조회" 로 비워 둔다(없는 값을 지어내지 않는다). 시세·시가총액·PER·PBR·손익계산서는
  대체로 들어온다.

쓰는 법
  python scripts/fetch_kr100.py                 # 전 종목
  python scripts/fetch_kr100.py 005930.KS       # 디버그 — 특정 종목만
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_us100 as engine                                # noqa: E402  시장 중립 수집 엔진

ROOT = engine.ROOT
PAGE = os.path.join(ROOT, "kr-top100.html")
OUT_DIR = os.path.join(ROOT, "data", "kr100")


def configure():
    engine.configure(
        market="kr",
        page=PAGE,
        out_dir=OUT_DIR,
        currency="KRW",
        # Stooq 의 한국 주식 접미사. 야후 차트가 막힌 종목의 마지막 대체 경로일 뿐이고,
        # 실패하면 그 종목의 시계열만 비운다(수집 자체는 계속 간다).
        stooq_suffix=".kr",
        # 야후 search 가 국내 종목에 주는 거래소 코드 — KSC(유가증권)·KOE/KDQ(코스닥).
        # 심볼을 회사명으로 다시 찾을 때만 쓴다.
        exchanges=("KSC", "KOE", "KDQ"),
        note="GitHub Actions 러너가 수집한 스냅샷. kr-top100.html 이 읽는다.",
    )


if __name__ == "__main__":
    configure()
    engine.main()
