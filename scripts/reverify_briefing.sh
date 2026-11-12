#!/usr/bin/env bash
# 완성본 재검증 — 발행까지 끝난 판을 처음부터 다시 잰다.
#
#   bash scripts/reverify_briefing.sh [--pre] <morning|close> [YYYY-MM-DD]
#
# --pre 는 **발행 전**(파일 보내기·아티팩트 발행 직전)에 돌릴 때 붙입니다.
#   아직 주소가 없으니 「발행 주소가 비었다」를 오류로 세지 않습니다.
#
# 날짜를 빼면 오늘(KST)입니다. morning 은 그날 판이 해외판(-global)이어도 찾습니다.
# 전체 판과 핵심본 모두에 대해 아래를 차례로 돌리고 한 줄 요약을 냅니다.
#   ① 폭 훑기 340~1920px (scripts/sweep.mjs) — 넘침·열 불일치·JS 오류
#   ② recheck.py (둘 다)  ③ audit_numbers.py  ④ dupcheck.py (직전 같은 종류 판과)
#   ⑤ stale.py (직전 같은 종류 판의 날짜)  ⑥ out/ 에 PDF 가 있으면 빈 띠
#   ⑦ 매번 지킬 것(2026-11-12) — 특별판(deep) 절, 고객 응대 문항 수(전체 8+·핵심 5+),
#      첫 줄 <meta charset="utf-8">, <style id="readability">, out/ 단독 HTML 의 BOM
# 끝 상태: 0 = 오류 없음(경고는 있을 수 있음) · 1 = 오류 있음 · 2 = 판이 없음.
# 이 스크립트는 **재기만 합니다.** 고치는 것은 사람이(예약이) 판단해서 합니다.
set -u
cd "$(git rev-parse --show-toplevel)"

PRE=0; [ "${1:-}" = "--pre" ] && { PRE=1; shift; }

KIND="${1:-}"
DAY="${2:-$(TZ=Asia/Seoul date +%F)}"
case "$KIND" in
  morning) CANDS="morning global" ;;
  close)   CANDS="close" ;;
  *) echo "쓰는 법: bash scripts/reverify_briefing.sh <morning|close> [YYYY-MM-DD]"; exit 2 ;;
esac

F=""; SESS=""
for s in $CANDS; do
  if [ -f "docs/briefings/$DAY-$s.html" ]; then F="docs/briefings/$DAY-$s.html"; SESS="$s"; break; fi
done
if [ -z "$F" ]; then
  echo "판 없음: docs/briefings/$DAY-{$(echo $CANDS | tr ' ' ',')}.html — 재검증할 것이 없습니다."
  exit 2
fi
C="${F%.html}-core.html"; [ -f "$C" ] || C=""

# 직전 같은 종류 판(모닝은 모닝·해외를 같은 종류로 본다)
PREV=$(python3 - "$DAY" "$KIND" <<'PY'
import json, sys
day, kind = sys.argv[1], sys.argv[2]
same = {'morning': ('morning', 'global'), 'close': ('close',)}[kind]
rows = json.load(open('docs/briefings/index.json'))['briefings']
c = sorted((r['date'], r['file']) for r in rows
           if r.get('session') in same and r['date'] < day and r.get('file'))
print(c[-1][1] if c else '')
PY
)
PREVD=""; [ -n "$PREV" ] && PREVD=$(echo "$PREV" | cut -c6-10)

# 오늘 항목이 index.json 에 있고 주소가 적혔는지
URL=$(python3 - "$(basename "$F")" <<'PY'
import json, sys
rows = json.load(open('docs/briefings/index.json'))['briefings']
r = [x for x in rows if x.get('file') == sys.argv[1]]
print('없음' if not r else (r[0].get('url') or 'null'))
PY
)

ERR=0; WARNS=0
echo "######## 완성본 재검증 · $F (${C:-핵심본 없음}) · 직전 ${PREV:-없음}"
echo "index.json 주소: $URL"
if [ $PRE -eq 1 ]; then
  echo "  (--pre: 발행 전 재검증이라 주소는 보지 않습니다)"
elif [ "$URL" = "없음" ] || [ "$URL" = "null" ]; then
  echo "  !! 발행 주소가 비었습니다"; ERR=$((ERR+1))
fi

echo; echo "== ① 폭 훑기 340~1920px"
SW=$(node scripts/sweep.mjs "$F" $C 2>&1); echo "$SW"
if echo "$SW" | grep -qE '넘침 최대 [1-9][0-9]*px|열 수 불일치 [1-9]|JS 오류 [1-9]|Error'; then
  ERR=$((ERR+1)); echo "  !! 폭 훑기에서 오류"
fi

echo; echo "== ② recheck"
for X in "$F" $C; do
  OUT=$(python3 scripts/recheck.py "$X"); RC=$?; echo "$OUT" | tail -25
  W=$(echo "$OUT" | grep -c '^  WARN'); WARNS=$((WARNS+W))
  [ $RC -ne 0 ] && ERR=$((ERR+1))
done

echo; echo "== ③ audit_numbers (전체 판)"
python3 scripts/audit_numbers.py "$F" | tail -30

if [ -n "$PREV" ]; then
  echo; echo "== ④ dupcheck (직전 $PREV 과)"
  python3 scripts/dupcheck.py "$F" "docs/briefings/$PREV" | head -40
  echo; echo "== ⑤ stale ($DAY · 직전 $PREVD)"
  python3 scripts/stale.py "$F" "$DAY" "$PREVD"
else
  echo; echo "== ④⑤ 직전 같은 종류 판이 index.json 에 없어 dupcheck·stale 을 건너뜁니다"
fi

YMD=$(echo "$DAY" | tr -d -)
PDFS=$(ls out/*"$YMD"*.pdf 2>/dev/null)
echo; echo "== ⑥ PDF 빈 띠"
if [ -n "$PDFS" ]; then
  python3 scripts/pdf_bands.py $PDFS || WARNS=$((WARNS+1))
else
  echo "   out/ 에 $YMD PDF 가 없습니다 — make_outputs.sh 뒤에 다시 재십시오"
fi

echo; echo "== ⑦ 매번 지킬 것 — 특별판 · 고객 응대 깊이 · 인코딩 · 가독성"
MUST=$(python3 - "$F" "$C" "$YMD" <<'PY'
import glob, re, sys
f, c, ymd = sys.argv[1], sys.argv[2], sys.argv[3]
bad = 0
def say(ok, msg):
    global bad
    print(("   ok  " if ok else "   !!  ") + msg)
    bad += 0 if ok else 1
for path, need in ((f, 8), (c, 5)):
    if not path:
        continue
    h = open(path, encoding="utf-8").read()
    name = path.split("/")[-1]
    say(h.lstrip().startswith('<meta charset="utf-8">'), f"{name}: 첫 줄 utf-8 선언")
    say('<style id="readability">' in h, f"{name}: 가독성 층(readability)")
    say('<section class="section" id="deep">' in h, f"{name}: 특별판(deep) 절")
    m = re.search(r'<section class="section" id="talking">(.*?)</section>', h, re.S)
    n = m.group(1).count('<p class="q">') if m else 0
    say(n >= need, f"{name}: 고객 응대 {n}문항 (기준 {need}+)")
for o in sorted(glob.glob(f"out/*{ymd}*.html")):
    say(open(o, "rb").read(3) == b"\xef\xbb\xbf", f"{o}: UTF-8 BOM")
print(f"MUSTBAD={bad}")
PY
)
echo "$MUST" | grep -v '^MUSTBAD='
MB=$(echo "$MUST" | sed -n 's/^MUSTBAD=//p'); ERR=$((ERR+${MB:-1}))

echo
echo "######## 요약: 오류 $ERR · recheck 경고 $WARNS — audit·dupcheck·stale 은 위 목록을 하나씩 판단하십시오"
[ $ERR -eq 0 ]
