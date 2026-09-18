#!/usr/bin/env bash
# 판을 만드는 도중에 **중간 저장**한다 — 커밋하고 main 에 밀어 넣는다.
#
# 왜 있는가. 2026-09-16 장마감 판이 빌드·검증·PDF 까지 끝난 상태에서
# 아티팩트 발행 직전에 실행이 끊겼다. 만든 것은 전부 작업트리에만 있었고,
# 컨테이너가 회수됐다면 손으로 쓴 서술 파일까지 통째로 사라질 자리였다.
# 그날은 컨테이너가 살아남아 다음 날 이어 마쳤지만, 그것은 운이었다.
#
# 그래서 커밋을 **맨 끝에서 중간으로** 옮겼다(지침 6-1절). 이 스크립트는
# 그 중간 저장을 한 줄로 만든다 — 되받아 다시 미는 고리를 세 번 베껴
# 쓰지 않으려는 것이다.
#
#   bash scripts/save_progress.sh "메시지" 파일...
#
# 밀지 못해도 **죽지 않는다.** 커밋은 이미 로컬에 남았고, 다음 저장이나
# 마지막 커밋이 함께 밀어 준다. 대신 밀렸다는 사실을 소리 내어 알린다.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1

msg="${1:?메시지가 필요하다}"; shift
[ "$#" -gt 0 ] || { echo "  !! 저장할 파일을 적어라"; exit 1; }

# 수집기가 건드린 시세 파일은 이 커밋에 끼워 넣지 않는다(지침 8절).
git checkout -- data/market/latest.json 2>/dev/null || true

git add -- "$@" || exit 1
if git diff --cached --quiet; then
  echo "  중간 저장: 바뀐 것이 없다 — 건너뛴다"
  exit 0
fi

git commit -q -m "$msg

이것은 **중간 저장**입니다(scripts/save_progress.sh). 판이 아직 다 나가지
않았을 수 있습니다 — 발행·전달까지 끝났는지는 뒤따르는 커밋으로 봅니다.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" || exit 1

for i in 1 2 3 4; do
  if git push -q origin HEAD:main 2>/dev/null; then
    echo "  중간 저장: $(git log --oneline -1)"
    exit 0
  fi
  sleep $((2 ** i))
  git pull --rebase -q origin main || break
done

# 여기까지 왔으면 못 민 것이다. **그래도 커밋은 남아 있다.**
echo "  !! 중간 저장을 밀지 못했다 — 커밋은 로컬에 남아 있다($(git log --oneline -1))"
echo "     다음 저장이나 마지막 커밋에서 함께 밀린다. 계속 진행해도 된다."
exit 0
