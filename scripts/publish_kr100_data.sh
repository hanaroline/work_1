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

# 국내 화면은 오프라인 단일 파일도 데이터 브랜치에 올려 둔다(고정 주소로 내려받게).
# 여기서 KEEP_FILES 에 넣어 두어야 가격 갱신 판이 올릴 때 그 파일이 지워지지 않는다.
KEEP_FILES="${KEEP_FILES:-quotes.json latest.json chart ranking.json kr-top100-offline.html}" \
DATA_DIR="data/kr100" \
DATA_BRANCH="${KR100_DATA_BRANCH:-kr100-data}" \
COMMIT_TITLE="국내 100대 기업 데이터" \
FETCHERS="scripts/fetch_kr100.py · scripts/fetch_kr100_quotes.py" \
exec bash "$HERE/publish_data_branch.sh"
