#!/usr/bin/env bash
# data/us100 를 데이터 전용 브랜치에 **단일 커밋으로 갈아끼운다**(히스토리를 남기지 않는다).
#
# 왜 이렇게 하나
#   차트 100개(약 3MB)가 매일 통째로 바뀌고 가격 파일은 장중 10분마다 바뀐다.
#   이것을 main 히스토리에 쌓으면 저장소가 1년에 1GB 규모로 붇는다. 그런데 이 화면에서
#   중요한 것은 **지금 조회되는 값**이고 과거에 조회했던 값이 아니다. 그래서 데이터는
#   부모 없는 커밋(root commit) 하나로만 유지하고, 갱신할 때마다 그 커밋을 교체한다.
#   직전 커밋은 접근 불가 객체가 되어 GitHub 쪽 GC 때 회수된다.
#
# 하는 일
#   1) 원격 데이터 브랜치가 있으면 그 파일들을 먼저 깔고(다른 워크플로가 올린 파일 보존)
#   2) 이번 실행이 만든 data/us100 파일로 덮고
#   3) data/us100 만 담은 부모 없는 커밋을 만들어 --force-with-lease 로 올린다
#   4) 그 사이 다른 판이 올렸으면(lease 실패) 1)부터 다시 — 네 번까지
#
# 쓰는 곳: .github/workflows/us100-data.yml, us100-quotes.yml
# 환경변수: US100_DATA_BRANCH (기본 us100-data), COMMIT_LABEL (커밋 메시지에 붙는 설명)

set -euo pipefail

BRANCH="${US100_DATA_BRANCH:-us100-data}"
LABEL="${COMMIT_LABEL:-갱신}"
SRC="data/us100"

[ -d "$SRC" ] || { echo "$SRC 가 없다 — 수집이 먼저다" >&2; exit 1; }

GITDIR="$(git rev-parse --absolute-git-dir)"   # 별도 인덱스로 트리를 만들 때 쓴다

# git commit-tree 는 커밋 작성자 정보가 없으면 "empty ident name" 으로 죽는다.
# 워크플로가 git config 를 해 두지 않아도 돌게, 스크립트가 스스로 채운다.
export GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-github-actions[bot]}"
export GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-github-actions[bot]@users.noreply.github.com}"
export GIT_COMMITTER_NAME="${GIT_COMMITTER_NAME:-$GIT_AUTHOR_NAME}"
export GIT_COMMITTER_EMAIL="${GIT_COMMITTER_EMAIL:-$GIT_AUTHOR_EMAIL}"

TMP="$(mktemp -d)"
MINE="$TMP/mine"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$MINE"
cp -a "$SRC/." "$MINE/"

for attempt in 1 2 3 4; do
  # 러너의 체크아웃은 단일 브랜치 얕은 복제라 `git fetch origin <브랜치>` 만으로는
  # 원격 추적 ref 가 생기지 않는다(FETCH_HEAD 만 생긴다). refspec 을 명시해 받아온다.
  BASE=""
  if [ -n "$(git ls-remote --heads origin "$BRANCH")" ]; then
    if git fetch --quiet origin "+refs/heads/$BRANCH:refs/remotes/origin/$BRANCH" 2>/dev/null; then
      BASE="$(git rev-parse "refs/remotes/origin/$BRANCH")"
    else
      echo "데이터 브랜치를 받아오지 못했다 — 다시 시도한다 ($attempt/4)" >&2
      sleep $((attempt * 3))
      continue
    fi
  fi

  # (1) 원격 파일 먼저 깔고 (2) 내가 만든 파일로 덮는다
  STAGE="$TMP/stage"
  rm -rf "$STAGE"; mkdir -p "$STAGE/$SRC"
  if [ -n "$BASE" ]; then
    git archive "$BASE" 2>/dev/null | tar -x -C "$STAGE" || true
  fi
  mkdir -p "$STAGE/$SRC"
  cp -a "$MINE/." "$STAGE/$SRC/"

  # (3) data/us100 만 담은 부모 없는 커밋 — 별도 인덱스에 STAGE 를 담아 트리를 만든다
  IDX="$TMP/index"
  rm -f "$IDX"
  GIT_DIR="$GITDIR" GIT_INDEX_FILE="$IDX" GIT_WORK_TREE="$STAGE" git add -A -- "$SRC"
  TREE="$(GIT_DIR="$GITDIR" GIT_INDEX_FILE="$IDX" git write-tree)"
  MSG="미국 100대 기업 데이터 $LABEL $(TZ=Asia/Seoul date '+%Y-%m-%d %H:%M KST')

이 브랜치는 히스토리를 남기지 않는다 — 갱신할 때마다 커밋 하나로 갈아끼운다.
지금 조회되는 값만 의미가 있고 과거 조회값은 보관하지 않기 때문이다.
수집기: scripts/fetch_us100.py · scripts/fetch_us100_quotes.py"
  # 내용이 그대로면 올리지 않는다(커밋 메시지에 시각이 들어가 해시는 매번 달라지므로 트리로 견준다)
  if [ -n "$BASE" ] && [ "$(git rev-parse "$BASE^{tree}")" = "$TREE" ]; then
    echo "내용이 그대로다 — 올릴 것이 없다"
    exit 0
  fi
  NEW="$(git commit-tree "$TREE" -m "$MSG")"

  # (4) 그 사이 다른 판이 올렸으면 lease 가 막아 준다
  if [ -n "$BASE" ]; then
    if git push --quiet --force-with-lease="refs/heads/$BRANCH:$BASE" origin "+$NEW:refs/heads/$BRANCH"; then
      echo "데이터 브랜치 갱신: $BRANCH ($NEW) — 시도 $attempt"
      exit 0
    fi
  else
    if git push --quiet origin "$NEW:refs/heads/$BRANCH"; then
      echo "데이터 브랜치 생성: $BRANCH ($NEW)"
      exit 0
    fi
  fi
  echo "그 사이 다른 판이 올렸다 — 다시 합쳐 올린다 ($attempt/4)" >&2
  sleep $((attempt * 3))
done

echo "네 번 시도했지만 데이터 브랜치를 갱신하지 못했다" >&2
exit 1
