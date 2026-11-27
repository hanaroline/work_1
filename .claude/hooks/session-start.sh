#!/bin/bash
# 세션 시작 준비 — 웹 세션에서 시험과 검사가 바로 돌게 만든다.
#
# 이 저장소는 package.json 과 package-lock.json 을 .gitignore 로 뺀다.
# 그래서 새 세션이 받아 온 작업본에는 그 파일들이 **없고**, node_modules 도
# 없다. 브라우저를 몰아 쓰는 것들 — 화면 연기 시험, 수집기, PDF·덱 만들기 —
# 이 playwright 를 부르므로, 그것이 없으면 세션이 시작하자마자 "모듈을 찾을
# 수 없다" 로 막힌다. 여기서 미리 깔아 둔다.
#
# 가지마다 쓰는 대본은 다르지만 없는 것은 똑같다. 그래서 이 파일은 어느
# 가지에서도 같은 내용이다 — 갈라 두면 한쪽만 고쳐지고 다른 쪽은 낡는다.
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

# 퇴직급여 도구 빌드(scripts/build-retire-payout.js)가 읽는 것들. 없으면
# "폰트 파일이 없습니다" 로 멈추고 retire-payout.html 을 짓지 못한다 — 계정을
# 옮긴 첫 세션(2026-10-22)에서 실제로 그랬다.
# 판은 .github/workflows/pr-check.yml 의 `퇴직급여` 작업과 같게 맞춘다. 판이
# 다르면 여기서 지은 HTML 이 CI 가 지은 것과 바이트가 어긋나 CI 가 끊는다.
BUILD_DEPS=(
  react@18.3.1
  react-dom@18.3.1
  @babel/standalone@7.25.6
  tailwindcss@3.4.16
  spoqa-han-sans@3.3.0
  @fontsource/inter@5.3.0
)

# playwright 와 빌드 꾸러미를 **한 번의 npm 으로 함께** 깐다.
# npm 은 깔 때마다 package.json 에 없는 꾸러미를 지운다. package.json 이 없는
# 이 저장소에서는 이름을 대지 않은 것이 모두 지워진다 — 따로 두 번 부르면
# 뒤의 것이 앞의 것을 지운다. 실제로 세션을 다시 열 때마다 빌드 꾸러미를
# 깔면서 playwright 가 지워져, 10/23·10/26 리포트 PDF 가 "모듈을 찾을 수
# 없다" 로 멈췄다. 하나라도 빠졌으면 전부를 이름 대어 다시 깐다.
WANT=("playwright@${PW_VERSION}" "${BUILD_DEPS[@]}")

# 이미 같은 판이 다 있으면 건드리지 않는다 — 컨테이너가 갈무리된 뒤 다시
# 불릴 때 몇십 초를 그냥 버리지 않으려는 것이다.
# require('x/package.json') 은 exports 를 막아 둔 꾸러미에서 실패하므로
# 파일을 직접 읽는다.
missing=()
for dep in "${WANT[@]}"; do
  name="${dep%@*}" want="${dep##*@}"
  have=$(node -e "try{console.log(require('./node_modules/${name}/package.json').version)}catch(e){}" 2>/dev/null)
  [ "$have" = "$want" ] || missing+=("$dep")
done
if [ ${#missing[@]} -eq 0 ]; then
  echo "playwright ${PW_VERSION} · 퇴직급여 빌드 꾸러미 이미 있음 — 건너뛴다"
else
  echo "빠진 것: ${missing[*]} — 전부 함께 다시 깐다"
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-save "${WANT[@]}" --no-audit --no-fund
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
