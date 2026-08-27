#!/usr/bin/env bash
# 판 하나를 발행해도 되는지 **한 번에** 판정한다. 끝 상태 하나로 답한다.
#
#   bash scripts/gate.sh docs/briefings/2026-08-27-morning.html
#   bash scripts/gate.sh --changed          # origin/main 과 다른 판을 모두
#
# 끝 상태 0 이면 발행해도 된다. 1 이면 남은 것이 있다.
#
# ── 왜 만들었나 ──────────────────────────────────────────────────────
# 검사 스크립트는 이미 여덟 개가 있었다. 그런데 세 개는 **끝 상태가 언제나
# 0** 이었다. 재어 보면 이랬다.
#
#   audit_numbers.py    「어긋난 짝 63개」를 찍고  → 끝 상태 0
#   dupcheck.py         「중복 3종」을 찍고        → 끝 상태 0
#   stale.py            「합계 5」를 찍고          → 끝 상태 0
#   build_archive_nav.py --check  「고칠 곳 25개」 → 끝 상태 0
#
# 세어 놓고 아무도 막지 않으면 그것은 검사가 아니라 소감이다. 「검증했습니다」가
# 사실은 「돌려 보고 제가 읽었습니다」였고, 그래서 믿을 수도 없고 남이 다시
# 확인할 수도 없었다. 이 파일은 그 판단을 사람의 성실성에서 **끝 상태**로
# 옮긴다.
#
# ── 무엇을 막고 무엇을 막지 않는가 ──────────────────────────────────
# [차단] 판단할 것이 없는 것만 막는다. 못(수집본 지문)·신선도·거짓 칩·구조
#        검사·판 안 완전중복·목록 정합성.
# [확인] 정밀하지 않은 검사는 **막지 않고 보여준다.** stale ①②③ 같은 것은
#        27 개 판에서 67 건이 잡히고 표본 9 건 중 8 건이 헛경보였다. 헛경보가
#        섞인 빨간불은 사람을 「어차피 오탐」으로 길들인다 — 그것이 애초에
#        검사가 무력해진 경로다.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

REPORT_DIR="out/gate"
mkdir -p "$REPORT_DIR"

FAIL=0
declare -a BLOCKED=()

step() {   # step <이름> <막는가:yes|no> <명령...>
  local name="$1" blocking="$2"; shift 2
  local log="$REPORT_DIR/$(echo "$name" | tr ' /' '__').log"
  printf '\n── %s\n' "$name"
  if "$@" >"$log" 2>&1; then
    echo "   통과"
  else
    local code=$?
    if [ "$blocking" = "yes" ]; then
      echo "   !! 막힘 (끝 상태 $code)"
      BLOCKED+=("$name")
      FAIL=1
    else
      echo "   확인 필요 (끝 상태 $code) — 막지 않습니다"
    fi
  fi
  sed -n '1,12p' "$log" | sed 's/^/     /'
  echo "     … 전문: $log"
}

# 목록 검사를 판 하나로 좁힌다. build_archive_nav.py --check 는 고칠 판을
# 「  <파일>  고칠 것 → N 항목」 꼴로 찍으므로, 그 줄에 이 판이 있는지만 본다.
nav_check_one() {
  local base="$1" out
  out="$(python3 scripts/build_archive_nav.py --check 2>&1)"
  printf '%s\n' "$out"
  if printf '%s\n' "$out" | grep -q "^  $base  고칠 것"; then
    echo "!! 이 판의 목록이 어긋났습니다 — python3 scripts/build_archive_nav.py"
    return 1
  fi
  if printf '%s\n' "$out" | grep -q "!! $base"; then
    echo "!! 이 판의 목록 블록이 성하지 않습니다"
    return 1
  fi
  echo "== 이 판의 목록은 성합니다"
  return 0
}

gate_one() {
  local f="$1"
  local base date kind
  base="$(basename "$f")"
  date="${base:0:10}"
  case "$base" in
    *-close.html)  kind=close ;;
    *-global.html) kind=global ;;
    *)             kind=morning ;;
  esac

  echo "════════════════════════════════════════════════════════════"
  echo " $base   (갈래 $kind · 날짜 $date)"
  echo "════════════════════════════════════════════════════════════"

  # ── [차단] ────────────────────────────────────────────────────────
  # 못이 먼저다. 어느 수집본으로 쓴 판인지 모르면 그 뒤의 대조는 매번 다른
  # 답을 낸다 — 같은 판을 세 수집본으로 재면 어긋난 짝이 63 / 87 / 104 로
  # 갈렸다. 판이 변한 것이 아니라 기준이 흘러간 것이다.
  step "못 — 수집본이 판에 박혀 있나" yes \
    python3 scripts/gate/pin.py --check "$f"

  # 신선도는 **오늘 판을 쓰는 중일 때** 의미가 있다. 「지금 읽고 있는 시세가
  # 낡았나」를 보는 검사이기 때문이다. 지난 판에 걸면 언제나 빨간불이 된다 —
  # 그때의 시세는 이미 지나갔으므로 당연하다. 지난 판의 근거는 못이 지킨다.
  if [ "$date" = "$(TZ=Asia/Seoul date +%F)" ]; then
    step "신선도 — 시세 파일이 이 판의 것인가" yes \
      python3 scripts/check_market_fresh.py "$([ "$kind" = close ] && echo close || echo morning)"
  else
    printf '\n── 신선도\n   건너뜀 — 오늘(%s) 판이 아닙니다. 근거는 못이 지킵니다.\n' \
      "$(TZ=Asia/Seoul date +%F)"
  fi

  step "거짓 칩 — MARKET DATA 라 붙은 값이 자료에 있나" yes \
    python3 scripts/gate/audit2.py "$f"

  step "구조·파생계산 (recheck)" yes \
    python3 scripts/recheck.py "$f"

  step "판 안 완전중복" yes \
    python3 scripts/dupcheck.py "$f" --strict

  # 목록 정합성은 **이 판이 어긋났을 때만** 막는다. 저장소 전체로 재면 지금
  # 25 개 판이 걸리고, 그것을 고치려면 발행된 판 25 개를 다시 쓰게 된다. 관문이
  # 첫날부터 빨간불이면 사람은 관문을 안 보게 된다 — 그게 이 병의 시작이었다.
  # 남은 판은 아래 [확인] 칸에서 알린다.
  step "브리핑 목록 — 이 판이 어긋났나" yes \
    nav_check_one "$base"

  step "브리핑 목록 — 저장소 전체 (눈으로 볼 것)" no \
    python3 scripts/build_archive_nav.py --check --strict

  # 기간 수익률은 **수집기가 계산하지 않는 계열**이 남아 있어 늘 걸린다
  # (스크립트 머리글에 적힌 오래된 빈자리 — 미 실질금리·EFFR·국내 금리 등).
  # 판을 잘 만들어도 통과할 수 없는 것을 차단에 두면 관문이 무력해진다.
  step "기간 수익률 채움 (눈으로 볼 것)" no \
    python3 scripts/check_perf_coverage.py --strict

  # ── [확인] 막지 않는다 ────────────────────────────────────────────
  step "물려 짓기·시간말·방향 (stale — 눈으로 볼 것)" no \
    python3 scripts/stale.py "$f" "$date" "${date:5}" --strict

  local prev
  prev="$(ls docs/briefings/2026-*-"$kind".html 2>/dev/null | sort | grep -B1 -F "$base" | head -1)"
  if [ -n "$prev" ] && [ "$prev" != "docs/briefings/$base" ]; then
    step "지난 판 반복률 (한도 25%)" yes \
      python3 scripts/dupcheck.py "$f" "$prev" --strict
  fi

  # 검증 노트 — 지침 9절이 요구하는 자리. 있는지만 본다.
  step "검증 노트가 있나" yes \
    grep -q "검증 노트\|검증노트" "$f"
}

TARGETS=()
if [ "${1:-}" = "--changed" ]; then
  git fetch -q origin main 2>/dev/null || true
  while IFS= read -r p; do
    [ -n "$p" ] && [ -f "$p" ] && TARGETS+=("$p")
  done < <(git diff --name-only origin/main...HEAD -- 'docs/briefings/*.html' 2>/dev/null
           git diff --name-only -- 'docs/briefings/*.html' 2>/dev/null)
  # 같은 파일이 두 목록에 다 있을 수 있다
  if [ ${#TARGETS[@]} -gt 0 ]; then
    mapfile -t TARGETS < <(printf '%s\n' "${TARGETS[@]}" | sort -u)
  fi
  if [ ${#TARGETS[@]} -eq 0 ]; then
    echo "고쳐진 판이 없습니다 — 볼 것이 없습니다."
    exit 0
  fi
elif [ $# -ge 1 ]; then
  TARGETS=("$@")
else
  sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
fi

for f in "${TARGETS[@]}"; do
  case "$f" in
    docs/briefings/archive.html|*/index.json) continue ;;
  esac
  gate_one "$f"
done

echo
echo "════════════════════════════════════════════════════════════"
if [ "$FAIL" -eq 0 ]; then
  echo " 관문 통과 — 발행해도 됩니다."
  echo " [확인] 칸의 내용은 판의 「검증 노트」에 적으십시오."
else
  echo " 관문에 막혔습니다. 남은 것:"
  for b in "${BLOCKED[@]}"; do echo "   · $b"; done
  echo " 고친 뒤 다시 돌리십시오. 이 상태로 「다 됐습니다」라고 하지 마십시오."
fi
echo " 기록: $REPORT_DIR/"
echo "════════════════════════════════════════════════════════════"
exit "$FAIL"
