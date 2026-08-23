#!/usr/bin/env bash
# PDF·PPT 생성용 한글 폰트 설치
#
# 이 컨테이너에는 한글 폰트가 WenQuanYi(중국어) 와 Unifont(비트맵) 뿐이라,
# 그대로 뽑으면 한글 자모 모양이 어긋나거나 계단처럼 깨진다.
# 구글 폰트에서 Noto Sans KR / Inter 를 TTF 로 받아 사용자 폰트 경로에 넣는다.
# (구형 User-Agent 로 요청하면 unicode-range 로 쪼갠 woff2 대신 통짜 TTF 를 준다)
set -euo pipefail

DEST="${HOME}/.local/share/fonts"
CACHE="${FONT_CACHE:-${TMPDIR:-/tmp}/els-fonts}"
CSS="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Inter:wght@400;500;600;700"

mkdir -p "$DEST" "$CACHE"

if fc-list :lang=ko family 2>/dev/null | grep -q 'Noto Sans KR'; then
  echo "Noto Sans KR 이미 설치됨 — 건너뜀"
  exit 0
fi

echo "구글 폰트 목록 조회..."
curl -sSf -m 30 "$CSS" -H 'User-Agent: Mozilla/4.0' -o "$CACHE/fonts.css"

grep -o 'https://[^)]*\.ttf' "$CACHE/fonts.css" | sort -u | while read -r url; do
  name="$(printf '%s' "$url" | sed 's#.*/s/##; s#/#_#g')"
  if [ ! -f "$CACHE/$name" ]; then
    echo "  받는 중 $name"
    curl -sSf -m 180 "$url" -o "$CACHE/$name"
  fi
done

cp "$CACHE"/*.ttf "$DEST"/
fc-cache -f >/dev/null
echo "설치 완료:"
fc-list :lang=ko family | sort -u | grep -E 'Noto Sans KR' || { echo "설치 실패"; exit 1; }
