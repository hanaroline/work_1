#!/usr/bin/env bash
# 증권사 리포트 수집을 지금 돌려 달라고 요청한다.
#
# 브리핑 세션은 네이버에 직접 못 붙으므로 수집은 러너가 한다. 그런데 세션
# 토큰에는 Actions 쓰기 권한이 없어 workflow_dispatch 를 API 로 부르면 403 이다.
# 대신 git push 는 되므로, 워크플로가 지켜보는 파일 data/reports/REFRESH 를
# 한 줄 더 붙여 밀어 넣어 발동시킨다.
#
#   bash scripts/request_reports_refresh.sh "오늘 판 수집"
#
# 어느 브랜치에 밀어 넣는가 — 지금 브랜치다.
#   push 이벤트는 밀어 넣은 브랜치에 놓인 워크플로 파일로 돈다. 이 저장소의
#   .github/workflows/reports.yml 은 아직 작업 브랜치에만 있고 main 에는 없다.
#   예전 판은 시세 쪽 스크립트를 본떠 main 을 따로 클론해 거기에 올렸는데,
#   main 에는 이 워크플로가 없으므로 아무것도 돌지 않았다(9/8 08:03 에 확인).
#   그래서 지금 브랜치로 보낸다. reports.yml 이 main 에 들어가면 예약 실행도
#   함께 살아난다 — 그때는 이 스크립트를 손대지 않아도 된다.
#
# 요청 줄은 덮어쓰지 않고 쌓는다. 그날 몇 시 판을 왜 불렀는지가 기록이다.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
STAMP=$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S KST')
BRANCH=$(git rev-parse --abbrev-ref HEAD)
WHY="${1:-오늘 판 수집}"
FILE=data/reports/REFRESH

if [ ! -f .github/workflows/reports.yml ]; then
  echo "!! 지금 브랜치($BRANCH)에 .github/workflows/reports.yml 이 없다." >&2
  echo "   밀어 넣어도 수집은 돌지 않는다." >&2
  exit 1
fi

# 지금 브랜치에 커밋 못 한 다른 변경이 있으면 REFRESH 만 따로 올린다.
if ! git diff --quiet -- "$FILE" || ! git diff --staged --quiet -- "$FILE"; then
  echo "!! $FILE 에 커밋하지 않은 변경이 있다. 먼저 정리할 것." >&2
  exit 1
fi

mkdir -p data/reports
[ -f "$FILE" ] || printf '%s\n' \
  '# 이 파일이 바뀌면 증권사 리포트 수집 워크플로가 돕니다. 내용은 쓰이지 않습니다.' \
  > "$FILE"
printf '요청: %s (%s)\n' "$STAMP" "$WHY" >> "$FILE"

git add "$FILE"
git commit -q -m "리포트 수집 요청 $STAMP — $WHY

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JPV7nE6FdLsQmeCLywoRnf"

for wait in 0 2 4 8 16; do
  [ "$wait" -gt 0 ] && sleep "$wait"
  if git push -q -u origin "$BRANCH" 2>/dev/null; then
    echo "요청 보냄: $STAMP — $WHY (브랜치 $BRANCH)"
    echo "수집은 보통 3~6분 걸린다. 끝나면 러너가 data/reports 를 커밋한다."
    exit 0
  fi
  echo "  밀어넣기 실패, 다시 시도한다..." >&2
  git pull -q --rebase origin "$BRANCH" 2>/dev/null || true
done

echo "요청을 보내지 못했다." >&2
exit 1
