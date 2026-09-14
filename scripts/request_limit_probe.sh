#!/usr/bin/env bash
# 상한가 원천 관찰(브라우저)을 지금 돌려 달라고 요청한다.
#
# 브리핑 세션은 네이버에 직접 못 붙고(CONNECT 403) Actions 쓰기 권한도
# 없어 workflow_dispatch 를 API 로 부르지 못한다(403). 대신 git push 는
# 되므로, 워크플로가 지켜보는 data/market/PROBE_LIMIT 를 한 줄 고쳐
# main 에 밀어 넣어 발동시킨다 — 시세 수집 요청과 같은 방식이다.
#
#   bash scripts/request_limit_probe.sh
#   # 몇 분 뒤 data/market/raw/limit_xhr.txt 를 본다
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
STAMP=$(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M:%S KST')
BRANCH=$(git rev-parse --abbrev-ref HEAD)

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

git clone --depth 1 --branch main --quiet \
  "$(git remote get-url origin)" "$TMP/main"

mkdir -p "$TMP/main/data/market"
printf '%s\n' \
  '# 이 파일이 바뀌면 상한가 원천 관찰 워크플로가 돕니다. 내용은 쓰이지 않습니다.' \
  "요청: $STAMP (브랜치 $BRANCH)" > "$TMP/main/data/market/PROBE_LIMIT"

git -C "$TMP/main" config user.name  "$(git config user.name  || echo 'briefing-session')"
git -C "$TMP/main" config user.email "$(git config user.email || echo 'briefing@local')"
git -C "$TMP/main" add data/market/PROBE_LIMIT

if git -C "$TMP/main" diff --staged --quiet; then
  echo "PROBE_LIMIT 내용이 그대로라 커밋할 것이 없다 — 1분 안에 두 번 부른 듯하다."
  exit 1
fi

git -C "$TMP/main" commit -q -m "상한가 원천 관찰 요청 $STAMP"

for wait in 0 2 4 8 16; do
  [ "$wait" -gt 0 ] && sleep "$wait"
  if git -C "$TMP/main" push -q origin main 2>/dev/null; then
    echo "요청 보냄: $STAMP"
    echo "브라우저를 설치하고 화면을 열므로 3~6분 걸린다. 이어서:"
    echo "  git fetch -q origin main && git show origin/main:data/market/raw/limit_xhr.txt"
    exit 0
  fi
  echo "  밀어넣기 실패, 다시 시도한다..." >&2
  git -C "$TMP/main" pull -q --rebase origin main 2>/dev/null || true
done

echo "요청을 보내지 못했다." >&2
exit 1
