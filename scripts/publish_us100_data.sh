#!/usr/bin/env bash
# data/us100 를 데이터 전용 브랜치(us100-data)에 단일 커밋으로 갈아끼운다.
#
# 실제 일은 시장 중립인 scripts/publish_data_branch.sh 가 한다 — 국내 화면도 같은
# 방식으로 올리므로(scripts/publish_kr100_data.sh) 로직을 두 벌 두지 않는다.
# 이 파일은 미국 쪽 값을 채워 넘기는 진입점이다.
#
# 쓰는 곳: .github/workflows/us100-data.yml, us100-quotes.yml, us100-ranking.yml
# 환경변수: US100_DATA_BRANCH (기본 us100-data), COMMIT_LABEL, PUBLISH_FILES

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 오프라인 단일 파일도 데이터 브랜치에 올려 둔다(고정 주소로 내려받게).
# 여기서 KEEP_FILES 에 넣어 두어야 가격 갱신 판이 올릴 때 그 파일이 지워지지 않는다.
# bars8y 는 백테스트 전용 긴 일봉이다(fetch_us_bars_long.py). 다른 판들이
# KEEP_FILES 에서 빠뜨리면 그 순간 지워지고, 다음 수집까지 매매 타이밍이
# 화면용 2해치로 돌아간다 — 조용히 짧아지는 길이라 반드시 여기 둔다.
# ranking-top.json 은 목록을 넓힐 때 쓰는 줄 세운 판이다(한 번짜리지만 30KB 라 싸다).
# 오프라인 판은 두 이름으로 올라간다 — 새 이름(us-top200-offline.html)과, 알려 둔 주소를
# 적어 둔 사람을 위해 한동안 함께 두는 옛 이름(us-top100-offline.html). 둘 다 여기 있어야
# 가격 갱신 판이 올릴 때 지워지지 않는다. 옛 이름을 거둘 때 이 줄에서도 함께 지운다.
KEEP_FILES="${KEEP_FILES:-quotes.json latest.json chart ranking.json us-top200-offline.html us-top100-offline.html bars8y ranking-top.json}" \
DATA_DIR="data/us100" \
DATA_BRANCH="${US100_DATA_BRANCH:-us100-data}" \
COMMIT_TITLE="미국 100대 기업 데이터" \
FETCHERS="scripts/fetch_us100.py · scripts/fetch_us100_quotes.py" \
exec bash "$HERE/publish_data_branch.sh"
