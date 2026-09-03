# -*- coding: utf-8 -*-
"""판이 **어제 것을 오늘 것처럼** 말하고 있는지 훑는다.

  python3 stale.py <판.html> <오늘 YYYY-MM-DD> <직전 거래일 MM-DD>

세 가지를 본다.
① 지난 날짜를 앞일처럼 쓴 곳 (「25일 …이 붙습니다」 같은 것)
② 지난 판에서 물려받은 상대 시간말 (「지난주」·「내일」·「이번 주」)
③ 방향을 말하는 문장이 그 문장 안의 숫자 부호와 어긋나는 곳
"""
import io, re, sys, html, datetime

ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
STRICT = "--strict" in sys.argv

path, today, lastd = ARGS[0], ARGS[1], ARGS[2]
Y = int(today[:4])
T = datetime.date(Y, int(today[5:7]), int(today[8:10]))
raw = io.open(path, encoding="utf-8").read()
raw = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", raw)
txt = html.unescape(re.sub(r"(?s)<[^>]+>", " ", raw))
txt = re.sub(r"[ \t ]+", " ", txt)
sents = [s.strip() for s in re.split(r"(?<=[다요])\.\s|\n+", txt) if len(s.strip()) > 18]

FUT = ("입니다", "예정", "앞두", "남았", "붙습니다", "옵니다", "나옵니다", "받습니다",
       "될 것", "합니다", "겠", "예상")
print("== ① 지난 날짜를 앞일처럼")
hit = 0
for s in sents:
    for m in re.finditer(r"(?<![0-9])([01]?\d)월\s?([0-3]?\d)일|(?<![0-9./])([0-3]?\d)일(?![0-9])", s):
        mm = int(m.group(1)) if m.group(1) else T.month
        dd = int(m.group(2) or m.group(3))
        try:
            d = datetime.date(Y, mm, dd)
        except ValueError:
            continue
        if d >= T or (T - d).days > 20:
            continue
        w = s[max(0, m.end() - 4):m.end() + 60]
        if any(f in w for f in ("오늘", "어제", "지났", "끝났", "이미", "였", "했")):
            continue
        if any(f in w for f in FUT):
            hit += 1
            print("   [%02d-%02d, %d일 전] %s" % (mm, dd, (T - d).days, s[:120]))
            break
if not hit:
    print("   없음")

print()
print("== ② 물려받은 상대 시간말")
REL = ("지난주", "이번 주", "다음 주", "내일", "모레", "어제", "그제", "지난달", "다음 달",
       "오늘부터", "월요일", "화요일", "수요일", "목요일", "금요일", "주말")
seen = 0
for s in sents:
    ws = [w for w in REL if w in s]
    if ws:
        seen += 1
        print("   [%s] %s" % ("·".join(ws), s[:118]))
print("   합계 %d 문장 — 하나씩 오늘 기준으로 맞는지 보십시오" % seen)

print()
print("== ③ 방향과 부호가 어긋난 문장")
UP = ("올랐", "상승", "뛰었", "급등", "반등", "높아졌", "오름", "웃돌")
DN = ("내렸", "하락", "빠졌", "급락", "무너졌", "낮아졌", "내림", "밀렸", "밑돌")
# 방향이 아니라 「움직이지 않았다」는 말. 옆의 부호와 다투지 않는다.
FLAT = ("제자리", "보합", "횡보", "제한적", "사실상 변화")
# 문장을 **절로 가르는** 말. 한 문장 안에서 방향이 갈리는 자리다.
#   「코스닥은 −0.03% 로 제자리인데 907 대 708 로 넓게 올랐습니다」
# 여기서 「올랐」은 뒤 절의 것이고 −0.03% 는 앞 절의 것이다. 문장을 통째로
# 보면 어긋난 것처럼 보이지만 옳은 문장이다. 절로 갈라야 한다.
SPLIT = re.compile(r"인데|지만|반면|그런데|하지만|다만|이고|이며|,\s|—|·|뒤 ")


def clause_bad(cl):
    """절 하나를 본다. 방향 한 쪽만 있고 부호가 전부 반대면 오류."""
    signs = re.findall(r"([+−\-])\s?\d+\.\d\d\s?%", cl)
    if not signs:
        return False
    if any(w in cl for w in FLAT):
        return False
    up_w = any(w in cl for w in UP)
    dn_w = any(w in cl for w in DN)
    if up_w == dn_w:                    # 둘 다거나 둘 다 아니면 판단하지 않는다
        return False
    allp = all(x == "+" for x in signs)
    alln = all(x in "−-" for x in signs)
    return (up_w and alln) or (dn_w and allp)


bad = 0
for s in sents:
    # 표에서 걷어낸 조각은 글이 아니다 — 숫자만 늘어선 줄은 보지 않는다.
    if len(re.findall(r"\d", s)) > len(s) * 0.25:
        continue
    hits = [cl for cl in SPLIT.split(s) if clause_bad(cl)]
    if hits:
        bad += 1
        print("   %s" % s[:130])
        print("      └ 어긋난 절: %s" % hits[0].strip()[:90])
print("   %s" % ("없음" if not bad else "합계 %d" % bad))

# ── 끝 상태 — **막지 않는다** ────────────────────────────────────────
# 한때 ③ 으로 발행을 막으려 했다. 그런데 27 개 판에 돌려 보니 67 건이 잡히고
# 표본 9 건 가운데 8 건이 헛경보였다. 방향어가 문장 경계를 넘어 새어 들어온다.
#
#   「아시아는 5 대 1 로 항셍만 내렸습니다. … 가권 +0.91% 입니다」
#     → 「내렸」은 항셍의 것이고 +0.91% 는 가권의 것이다. 옳은 글이다.
#   「SOX −3.37% . 하루치 반등이 한 주치 조정을 되돌리지 못했습니다」
#     → 「반등」은 하루치, −3.37% 는 주간치다. 옳은 글이다.
#
# **정밀하지 않은 검사를 관문으로 쓰면 안 된다.** 헛경보가 섞인 빨간불은
# 사람을 「어차피 오탐」으로 길들이고, 그게 audit_numbers 가 60~90 건을 찍어도
# 아무 일도 일어나지 않았던 이유다. 그래서 이 스크립트는 **읽는 것**으로 둔다.
# 관문은 판단이 필요 없는 것만 막는다(scripts/gate.sh 의 [차단]).
#
# `--strict` 는 호출 쪽 호환을 위해 받기만 하고 끝 상태를 바꾸지 않는다.
if STRICT:
    print()
    print("== 이 검사는 막지 않습니다 — ① %d · ② %d · ③ %d 건을 눈으로 보고"
          % (hit, seen, bad))
    print("   판단한 결과를 판의 「검증 노트」에 적으십시오.")
