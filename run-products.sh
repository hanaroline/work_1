#!/usr/bin/env bash
# 금융상품 통합조회 — 로컬 실행 (macOS / Linux)
cd "$(dirname "$0")" || exit 1
for py in python3 python; do
  if command -v "$py" >/dev/null 2>&1; then exec "$py" serve-products.py "$@"; fi
done
echo "[오류] Python 3 이 필요합니다. 설치 없이 보려면 products-standalone.html 을 열어 주세요."
exit 1
