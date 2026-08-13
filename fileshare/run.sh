#!/bin/sh
# 팀 자료실 서버 실행 (기본 포트 8080, 첫 번째 인자로 변경 가능)
cd "$(dirname "$0")" || exit 1

PORT="${1:-8080}"

if command -v python3 >/dev/null 2>&1; then
  exec python3 server.py --port "$PORT"
elif command -v python >/dev/null 2>&1; then
  exec python server.py --port "$PORT"
fi

echo "[안내] 파이썬 3 을 찾을 수 없습니다. python3 를 설치한 뒤 다시 실행해 주세요."
exit 1
