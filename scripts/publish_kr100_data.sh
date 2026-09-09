#!/usr/bin/env bash
# data/kr100 을 데이터 전용 브랜치(kr100-data)에 단일 커밋으로 갈아끼운다.
#
# 실제 일은 시장 중립인 scripts/publish_data_branch.sh 가 한다.
# 이 파일은 국내 쪽 값을 채워 넘기는 진입점이다.
#
# 쓰는 곳: .github/workflows/kr100-data.yml, kr100-quotes.yml, kr100-ranking.yml
# 환경변수: KR100_DATA_BRANCH (기본 kr100-data), COMMIT_LABEL, PUBLISH_FILES

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DATA_DIR="data/kr100" \
DATA_BRANCH="${KR100_DATA_BRANCH:-kr100-data}" \
COMMIT_TITLE="국내 100대 기업 데이터" \
FETCHERS="scripts/fetch_kr100.py · scripts/fetch_kr100_quotes.py" \
exec bash "$HERE/publish_data_branch.sh"
