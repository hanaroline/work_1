#!/usr/bin/env bash
# 오프라인 판(market-calendar-offline.html)을 데이터 전용 브랜치(calendar-data)에
# 단일 커밋으로 갈아끼운다.
#
# 왜 코드 브랜치(main)가 아니라 여기인가
#   이 파일은 일정 데이터를 통째로 품고 있어 주 1회 수집마다 500KB 가 전부 바뀐다.
#   main 히스토리에 쌓으면 1년이면 26MB 가 붇는데, 지난주 판을 되짚을 일은 없다.
#   그래서 히스토리를 남기지 않는 데이터 브랜치에 두고 **고정 주소**로 내려받게 한다.
#
#     https://raw.githubusercontent.com/hanaroline/work_1/calendar-data/data/calendar/market-calendar-offline.html
#
#   latest.json 은 여기 올리지 않는다 — 인터넷판이 main 에서 직접 받으므로 main 에 있어야 한다.
#
# 실제 일은 시장 중립인 scripts/publish_data_branch.sh 가 한다.
# 쓰는 곳: .github/workflows/calendar-data.yml
# 환경변수: CALENDAR_DATA_BRANCH (기본 calendar-data), COMMIT_LABEL

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

KEEP_FILES="${KEEP_FILES:-market-calendar-offline.html}" \
PUBLISH_FILES="${PUBLISH_FILES:-market-calendar-offline.html}" \
DATA_DIR="data/calendar" \
DATA_BRANCH="${CALENDAR_DATA_BRANCH:-calendar-data}" \
COMMIT_TITLE="증시 일정 오프라인판" \
COMMIT_LABEL="${COMMIT_LABEL:-갱신}" \
FETCHERS="scripts/fetch_calendar.py · scripts/build_calendar.py · scripts/inline_calendar.py" \
exec bash "$HERE/publish_data_branch.sh"
