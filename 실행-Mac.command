#!/bin/bash
# 미래에셋 세일즈 툴킷 - macOS 실행기
# 이 폴더를 로컬 웹서버(http://localhost)로 띄워 대시보드 실시간 데이터가 동작하게 합니다.
cd "$(dirname "$0")" || exit 1
PORT=8080
URL="http://localhost:${PORT}/tools.html"

echo ""
echo "  미래에셋 세일즈 툴킷을 시작합니다..."
echo ""

open "$URL" 2>/dev/null &

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server "$PORT"
elif command -v node >/dev/null 2>&1; then
  exec node serve.mjs "$PORT"
else
  echo "  [안내] Python 또는 Node.js가 필요합니다."
  echo "  - Python:  https://www.python.org/downloads/"
  echo "  - Node.js: https://nodejs.org/"
  echo ""
  read -r -p "  엔터를 누르면 종료합니다..."
fi
