#!/usr/bin/env bash
# 양도소득세 브리프 두 판을 짓고, 세 관문을 모두 통과시킨 뒤 docs/tax/ 에 둔다.
#
#   bash tools/tax-brief/build.sh
#
# 관문은 셋이고 순서가 뜻이다.
#   1) check_claims.py  — 대장 안의 셈 (대장 → 산출물)
#   2) 빌드
#   3) validate.py      — 슬라이드의 숫자가 대장에 있는가 (산출물 → 대장)
#   4) geomqa.py        — 상자가 겹치거나 넘치지 않는가
#
# 이 환경의 LibreOffice 는 고장나 있어 슬라이드를 그려 볼 수 없다. 4) 가 그
# 자리를 대신하지만 완전하지는 않다 — 받는 쪽에서 한 번은 열어 보아야 한다.
set -euo pipefail

cd "$(dirname "$0")/../.."
HERE=tools/tax-brief
LEDGER=data/law/양도소득세_주장대장.json
OUT=docs/tax
WORK="${TMPDIR:-/tmp}/tax-brief-build"

A="국내상장주식_양도소득세_2020-2026_최종.pptx"
B="국내상장주식_양도소득세_2021-2022_최종.pptx"

echo "── 1) 주장 대장 검산"
python3 "$HERE/check_claims.py" "$LEDGER"

echo
echo "── 2) 빌드"
mkdir -p "$WORK" "$OUT"
cp "$HERE"/lib.js "$HERE"/deckA.js "$HERE"/deckB.js "$WORK/"
# pptxgenjs 는 .gitignore 에 있는 node_modules 로 깔린다. 없으면 받는다.
if [ ! -d "$WORK/node_modules/pptxgenjs" ]; then
  ( cd "$WORK" && npm init -y >/dev/null 2>&1 && npm install pptxgenjs >/dev/null 2>&1 )
fi
( cd "$WORK" && node deckA.js "$A" && node deckB.js "$B" )

echo
echo "── 3) 역방향 검증 — 슬라이드의 숫자가 대장에 있는가"
python3 "$HERE/validate.py" "$LEDGER" "$WORK/$A" "$WORK/$B"

echo
echo "── 4) 기하 검사 — 겹침 · 넘침 · 여백"
python3 "$HERE/geomqa.py" "$WORK/$A" "$WORK/$B"

cp "$WORK/$A" "$WORK/$B" "$OUT/"
echo
echo "완료 — $OUT/$A"
echo "       $OUT/$B"
