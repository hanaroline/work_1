#!/usr/bin/env bash
# Stop 훅 — 관문을 통과하지 않은 채로 턴을 끝내지 못하게 막는다.
#
# CLAUDE.md 에 「관문을 통과하지 않은 것은 완성이 아니다」라고 적어 두어도,
# 규칙은 읽고 잊힙니다. 이 훅은 잊히지 않습니다. 고쳐진 판이 있고 관문이
# 빨간불이면 턴이 끝나지 않고, 막은 사유가 모델에게 되돌아갑니다.
#
# 사람의 성실성에 기대지 않는 층이 하나 필요해서 둡니다.
set -uo pipefail

IN="$(cat)"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 0

# 이미 이 훅 때문에 이어서 도는 중이면 다시 막지 않는다. 고치지 못하는 사정
# (예: 저장소 전체의 목록 정합성)이 있을 때 턴이 갇히면 안 된다. 한 번은
# 반드시 알리고, 두 번째부터는 모델과 사용자의 판단에 맡긴다.
if [ "$(printf '%s' "$IN" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

OUT="$(bash scripts/gate.sh --changed 2>&1)"
CODE=$?

if [ "$CODE" -eq 0 ]; then
  # 볼 것이 없거나 통과했다 — 조용히 지나간다.
  printf '{"suppressOutput":true}\n'
  exit 0
fi

# 막은 사유를 모델에게 되돌린다. **맨 끝 요약 칸만** 보낸다 — 그냥 tail 을 하면
# 마지막 검사의 로그가 자리를 다 차지해서 「무엇이 막았는지」가 안 보인다.
# 검사별 전문은 out/gate/ 에 있다.
REASON="$(printf '%s' "$OUT" | awk '/^ 관문에 막혔습니다/,0' | head -20)"
[ -n "$REASON" ] || REASON="$(printf '%s' "$OUT" | grep -E '^ *(!! 막힘|── )' | head -20)"
jq -n --arg r "관문에 막혀 있습니다. 이 상태로 「완료」라고 말하지 마십시오.
고치고 \`bash scripts/gate.sh --changed\` 을 다시 돌리십시오.
검사를 끄거나 한도를 늘려 통과시키지 마십시오.

$REASON" '{decision:"block", reason:$r}'
exit 0
