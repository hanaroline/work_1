#!/bin/bash
# 세션 시작 준비 — 웹 세션에서 시험과 검사가 바로 돌게 만든다.
#
# 이 저장소는 package.json 과 package-lock.json 을 .gitignore 로 뺀다.
# 그래서 새 세션이 받아 온 작업본에는 그 파일들이 **없고**, node_modules 도
# 없다. 브라우저 연기 시험(scripts/test_fund_page.mjs, scripts/test_etf_page.mjs)
# 과 사용법 PDF 빌드는 playwright 를 부르므로, 그것이 없으면 세션이 시작하자마자
# "모듈을 찾을 수 없다" 로 막힌다. 여기서 미리 깔아 둔다.
#
# 파이썬 쪽(scripts/*.py)은 표준 라이브러리만 쓴다 — 깔 것이 없다.
set -euo pipefail

# 웹 세션에서만 돈다. 사람의 기계에는 이미 갖춰져 있고, 거기서 마음대로
# package.json 을 건드리면 안 된다.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

# 워크플로(.github/workflows/fund-daily.yml 등)가 박아 쓰는 판과 같게 맞춘다.
# 러너와 세션이 다른 판을 쓰면 여기서 통과한 시험이 거기서 깨진다.
PW_VERSION=1.56.1

# 이미 같은 판이 깔려 있으면 건드리지 않는다 — 컨테이너가 갈무리된 뒤 다시
# 불릴 때 몇십 초를 그냥 버리지 않으려는 것이다.
if node -e "process.exit(require('playwright/package.json').version === '${PW_VERSION}' ? 0 : 1)" 2>/dev/null; then
  echo "playwright ${PW_VERSION} 이미 있음 — 건너뛴다"
else
  echo "playwright ${PW_VERSION} 설치"
  npm i -D "playwright@${PW_VERSION}" --no-audit --no-fund
fi

# 브라우저는 **내려받지 않는다.** 이 실행 환경에는 크로미움이 미리 깔려 있고
# (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers), 그 위에 `playwright install` 을
# 다시 부르면 수백 MB 를 세션 몫 디스크에 또 쌓는다.
# 없는 환경에서만 받는다.
if [ -n "${PLAYWRIGHT_BROWSERS_PATH:-}" ] && compgen -G "${PLAYWRIGHT_BROWSERS_PATH}/chromium-*" >/dev/null; then
  echo "크로미움 이미 있음 (${PLAYWRIGHT_BROWSERS_PATH}) — 내려받지 않는다"
else
  echo "크로미움 내려받기"
  npx --yes playwright install chromium
fi

echo "준비 끝"
