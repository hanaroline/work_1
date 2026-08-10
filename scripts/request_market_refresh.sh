#!/usr/bin/env bash
# 시세 수집을 지금 돌려 달라고 요청한다.
#
# 브리핑 세션은 KRX·네이버·야후에 직접 못 붙으므로 수집은 러너가 한다.
# 그런데 세션 토큰에는 Actions 쓰기 권한이 없어 workflow_dispatch 를 API 로
# 부르면 403 이다. 대신 git push 는 되므로, 워크플로가 지켜보는 파일
# data/market/REFRESH 를 한 줄 고쳐 main 에 밀어 넣어 발동시킨다.
#
#   bash scripts/request_market_refresh.sh
#   python3 scripts/check_market_fresh.py --wait close
#
# 작업 브랜치에서 실행해도 된다. 이 스크립트는 REFRESH 파일 하나만
# 별도로 main 에 올리며, 현재 브랜치의 다른 변경은 건드리지 않는다.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
STAMP=$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S KST')
BRANCH=$(git rev-parse --abbrev-ref HEAD)

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# main 을 건드리지 않고 REFRESH 한 줄만 올리기 위해 얕게 따로 받는다.
git clone --depth 1 --branch main --quiet \
  "$(git remote get-url origin)" "$TMP/main"

mkdir -p "$TMP/main/data/market"
printf '%s\n' \
  '# 이 파일이 바뀌면 시세 수집 워크플로가 돕니다. 내용은 쓰이지 않습니다.' \
  "요청: $STAMP (브랜치 $BRANCH)" > "$TMP/main/data/market/REFRESH"

git -C "$TMP/main" config user.name  "$(git config user.name  || echo 'briefing-session')"
git -C "$TMP/main" config user.email "$(git config user.email || echo 'briefing@local')"
git -C "$TMP/main" add data/market/REFRESH

if git -C "$TMP/main" diff --staged --quiet; then
  echo "REFRESH 내용이 그대로라 커밋할 것이 없다 — 1분 안에 두 번 부른 듯하다."
  exit 1
fi

git -C "$TMP/main" commit -q -m "시세 수집 요청 $STAMP"

for wait in 0 2 4 8 16; do
  [ "$wait" -gt 0 ] && sleep "$wait"
  if git -C "$TMP/main" push -q origin main 2>/dev/null; then
    echo "요청 보냄: $STAMP"
    echo "수집은 보통 2~3분 걸린다. 이어서:"
    echo "  python3 scripts/check_market_fresh.py --wait <close|morning>"
    exit 0
  fi
  echo "  밀어넣기 실패, 다시 시도한다..." >&2
  git -C "$TMP/main" pull -q --rebase origin main 2>/dev/null || true
done

echo "요청을 보내지 못했다." >&2
exit 1
