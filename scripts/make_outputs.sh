#!/usr/bin/env bash
# 보관본 HTML 하나로 고객에게 건넬 파일 셋을 만든다 — 단독 HTML + 요약/전체 PDF.
#
#   bash scripts/make_outputs.sh docs/briefings/2026-08-12-morning.html [출력디렉터리]
#
# 기본 출력은 out/ 이고 .gitignore 에 들어 있다. 컨테이너는 회수되므로
# 만든 파일은 같은 세션에서 사용자에게 보내야 한다.
#
# 새 컨테이너에는 한글 글꼴도 playwright 도 없다. 둘 다 여기서 갖춘다.
set -euo pipefail

SRC="${1:?보관본 HTML 경로를 주십시오}"
OUT="${2:-out}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
[ -f "$SRC" ] || { echo "!! 없는 파일: $SRC" >&2; exit 1; }
mkdir -p "$OUT"

# ── 1. 한글 글꼴 ────────────────────────────────────────────────
# 없으면 PDF 의 한글이 중국어 글꼴(WenQuanYi)로 나온다.
# `fc-list | grep -q` 로 쓰면 안 된다. grep 이 첫 줄에서 끝나 fc-list 가
# SIGPIPE 로 죽고, `set -o pipefail` 이 그 실패를 물려받아 **글꼴이 있어도
# 없다고 나온다.** 판마다 apt-get 을 다시 돌리고 있었다.
FC_HAS_CJK="$(fc-list 2>/dev/null | grep -ci 'Noto Sans CJK' || true)"
if [ "${FC_HAS_CJK:-0}" -eq 0 ]; then
  echo "== 한글 글꼴 설치"
  (apt-get update -qq && apt-get install -y -qq fonts-noto-cjk) >/dev/null 2>&1 \
    || { echo "!! fonts-noto-cjk 설치 실패 — PDF 한글이 깨질 수 있습니다" >&2; }
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

# ── 3. 단독 HTML ───────────────────────────────────────────────
echo "== 단독 HTML"
python3 scripts/make_standalone.py "$SRC" "$OUT"

# 방금 만든 파일 이름을 되받는다 (미래에셋_마포WM_<구분>_<YYYYMMDD>.html)
HTML="$(ls -t "$OUT"/미래에셋_마포WM_*.html | head -1)"
[ -f "$HTML" ] || { echo "!! 단독 HTML 을 만들지 못했습니다" >&2; exit 1; }

# ── 4. PDF 두 개 ───────────────────────────────────────────────
# 꼬리말에 쓸 날짜·구분은 보관본 파일 이름에서 뽑는다.
BASE="$(basename "$SRC" .html)"                    # 2026-08-12-morning
# 베타 시안은 `<날짜>-<판>-beta`. 꼬리를 먼저 떼야 날짜와 판이 제대로 잡힌다
# — 안 떼면 DATE 가 「2026-08-22-global」이 되고 판은 「beta」가 된다.
SUFFIX=''
case "$BASE" in
  *-beta) BASE="${BASE%-beta}"; SUFFIX=' (베타 시안 — 고객 전달용 아님)' ;;
esac
# 핵심본도 같은 자리에서 꼬리를 뗀다 — 안 떼면 판이 「core」로 잡혀
# 꼬리말이 「시황 브리핑」으로 뭉개진다.
case "$BASE" in
  *-core) BASE="${BASE%-core}"; SUFFIX=" 핵심본${SUFFIX}" ;;
esac
DATE="${BASE:0:10}"                                # 2026-08-12
case "${BASE##*-}" in
  morning) LABEL='모닝 마켓 브리핑' ;;
  close)   LABEL='장마감 시황 브리핑' ;;
  global)  LABEL='해외 증시 브리핑' ;;
  *)       LABEL='시황 브리핑' ;;
esac
LABEL="${LABEL}${SUFFIX}"
echo "== PDF"
node scripts/to_pdf.mjs "$HTML" "$OUT" "미래에셋증권 마포WM · ${LABEL} · ${DATE}"

echo
echo "== 결과"
ls -la "$OUT"/미래에셋_마포WM_* | sed 's/^/   /'
