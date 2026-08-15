#!/usr/bin/env bash
# 리포트 다이제스트로 건넬 파일 셋을 만든다 — 한 파일 HTML + 요약/전체 PDF.
#
#   bash scripts/make_reports_outputs.sh              # 최신 판
#   bash scripts/make_reports_outputs.sh 2026-08-15   # 그날 판
#   bash scripts/make_reports_outputs.sh 최신 out2    # 낼 곳 지정
#
# 기본 출력은 out/ 이고 .gitignore 에 들어 있다. 컨테이너는 회수되므로
# 만든 파일은 같은 세션에서 사용자에게 보내야 한다.
#
# 브리핑 쪽 scripts/make_outputs.sh 와 짝이다. 새 컨테이너에는 한글 글꼴도
# playwright 도 없으므로 둘 다 여기서 갖춘다.
set -euo pipefail

DAY="${1:-최신}"
OUT="${2:-out}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p "$OUT"

# ── 1. 한글 글꼴 ────────────────────────────────────────────────
# 없으면 PDF 의 한글이 중국어 글꼴(WenQuanYi)로 나온다.
if ! fc-list 2>/dev/null | grep -qi 'Noto Sans CJK'; then
  echo "== 한글 글꼴 설치"
  (apt-get update -qq && apt-get install -y -qq fonts-noto-cjk) >/dev/null 2>&1 \
    || echo "!! fonts-noto-cjk 설치 실패 — PDF 한글이 깨질 수 있습니다" >&2
  fc-cache -f >/dev/null 2>&1 || true
fi

# ── 2. playwright ──────────────────────────────────────────────
# 브라우저는 /opt/pw-browsers 에 이미 있다. 내려받지 않는다.
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
if ! node -e "require.resolve('playwright')" >/dev/null 2>&1; then
  echo "== playwright 설치"
  npm install --no-save --no-audit --no-fund --loglevel=error playwright >/dev/null
fi

# ── 3. 한 파일 HTML ────────────────────────────────────────────
echo "== 한 파일 HTML"
python3 scripts/make_reports_standalone.py "$DAY" "$OUT"

HTML="$(ls -t "$OUT"/미래에셋_증권사리포트_*.html | head -1)"
[ -f "$HTML" ] || { echo "!! 한 파일 HTML 을 만들지 못했습니다" >&2; exit 1; }

# ── 4. PDF 두 개 ───────────────────────────────────────────────
# 꼬리말에 쓸 날짜는 만들어진 파일 이름에서 뽑는다 (…_20260814.html).
STAMP="$(basename "$HTML" .html)"; STAMP="${STAMP##*_}"
PRETTY="${STAMP:0:4}-${STAMP:4:2}-${STAMP:6:2}"
echo "== PDF"
node scripts/reports_to_pdf.mjs "$HTML" "$OUT" \
     "미래에셋증권 마포WM · 증권사 리포트 다이제스트 · ${PRETTY}"

echo
echo "== 결과"
ls -la "$OUT"/미래에셋_증권사리포트_* | sed 's/^/   /'
