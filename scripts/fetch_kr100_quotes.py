#!/usr/bin/env python3
"""국내 100대 기업 **가격만** 빠르게 받아 data/kr100/quotes.json 에 저장한다.

`fetch_kr100.py` 는 종목별로 5번씩 요청해 5~8분이 걸린다(지표·실적·일정까지 받는다).
장중에 가격만 자주 갱신하려면 그 무게로는 안 되므로 이 스크립트를 따로 둔다.

받아오는 경로는 미국 화면의 가격 수집기와 같다(`scripts/fetch_us100_quotes.py`) —
시장 프로필만 바꿔 끼워 그 모듈의 main() 을 부른다.

쓰는 법
  python scripts/fetch_kr100_quotes.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_kr100                                          # noqa: E402  국내 시장 프로필
import fetch_us100_quotes as quotes                         # noqa: E402  가격 수집 엔진

if __name__ == "__main__":
    fetch_kr100.configure()          # 반드시 먼저 — 출력 경로·심볼 규칙이 여기서 정해진다
    quotes.main()
