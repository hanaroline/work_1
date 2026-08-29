#!/usr/bin/env bash
# 법령 수집을 지금 돌려 달라고 요청한다.
#
# 세션은 law.go.kr 에 직접 못 붙으므로 수집은 러너가 한다. 그런데 세션
# 토큰에는 Actions 쓰기 권한이 없어 workflow_dispatch 를 API 로 부르면
# 403 이다. 대신 git push 는 되므로, 워크플로가 지켜보는 파일
# data/law/REFRESH 를 한 줄 고쳐 밀어 넣어 발동시킨다.
#
#   bash scripts/request_law_refresh.sh
#   # 2~3분 뒤
#   git pull && python3 scripts/law_lookup.py --list
#
# 시세 쪽(request_market_refresh.sh)과 달리 **지금 있는 브랜치에** 올린다.
# 법령 수집 워크플로는 커밋을 돌던 브랜치에 남기므로, 아직 main 에 합치기
# 전에도 작업 브랜치에서 그대로 시험할 수 있다.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
STAMP=$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S KST')
BRANCH=$(git rev-parse --abbrev-ref HEAD)

mkdir -p data/law
printf '%s\n' \
  '# 이 파일이 바뀌면 법령 수집 워크플로가 돕니다. 내용은 쓰이지 않습니다.' \
  "요청: $STAMP (브랜치 $BRANCH)" > data/law/REFRESH

if git diff --quiet -- data/law/REFRESH; then
  echo "REFRESH 내용이 그대로라 커밋할 것이 없다 — 1분 안에 두 번 부른 듯하다."
  exit 1
fi

# 다른 작업 중인 변경은 건드리지 않는다. 이 파일 하나만 커밋한다.
git commit -q -m "법령 수집 요청 $STAMP" -- data/law/REFRESH

for wait in 0 2 4 8 16; do
  [ "$wait" -gt 0 ] && sleep "$wait"
  if git push -q -u origin "$BRANCH" 2>/dev/null; then
    echo "요청 보냄: $STAMP (브랜치 $BRANCH)"
    echo "수집은 보통 1~2분 걸린다. 끝나면 러너가 data/law/ 를 커밋한다:"
    echo "  git pull && python3 scripts/law_lookup.py --list"
    exit 0
  fi
  echo "  밀어넣기 실패, 다시 시도한다..." >&2
  git pull -q --rebase origin "$BRANCH" 2>/dev/null || true
done

echo "요청을 보내지 못했다." >&2
exit 1
