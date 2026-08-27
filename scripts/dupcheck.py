# -*- coding: utf-8 -*-
"""판 안 중복과 지난 판 반복을 잰다.

  python3 dupcheck.py <오늘.html> [어제.html]

「너무 반복된다」는 말을 세는 수로 바꾼다. 문장 단위로 잘라
① 오늘 판 안에서 그대로 겹치는 문장,
② 어제 판과 글자까지 같은 문장,
③ 절을 넘나들며 되풀이되는 사실(수치·고유명사)
을 각각 센다.
"""
import io, re, sys, html
from collections import Counter, defaultdict

SEC = re.compile(r'<section[^>]*\bid="([a-z0-9_-]+)"', re.I)


def sections(path):
    raw = io.open(path, encoding="utf-8").read()
    raw = re.sub(r"(?is)<(script|style|nav)\b.*?</\1>", " ", raw)
    out, cur, buf = [], "머리", []
    for part in re.split(r"(<section[^>]*>)", raw):
        m = SEC.match(part or "")
        if m:
            out.append((cur, "".join(buf)))
            cur, buf = m.group(1), []
        else:
            buf.append(part)
    out.append((cur, "".join(buf)))
    return [(k, text(v)) for k, v in out]


def text(frag):
    t = re.sub(r"(?s)<[^>]+>", " ", frag)
    t = html.unescape(t)
    return re.sub(r"[ \t ]+", " ", t)


def sents(t):
    out = []
    for s in re.split(r"(?<=[다요])\.\s+|\n+", t):
        s = s.strip(" ·—–-")
        if len(s) >= 25:
            out.append(re.sub(r"\s+", " ", s))
    return out


ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
STRICT = "--strict" in sys.argv
REPEAT_PCT = None                      # 어제와 같은 **글월**의 비율

# 표 머리행은 겹치는 것이 **정상이다.** 절마다 같은 표를 세우므로
# 「종목 Name 종가 Close 등락률 Change % 1주 1W …」 가 여섯 번 나온다. 이것을
# 중복으로 세면 모든 판이 막힌다 — 또 하나의 헛경보였다. 그래서 막을 때는
# **글월만** 센다. 글월은 종결어미로 끝난다.
PROSE_RE = re.compile(r"(습니다|입니다|했다|이다|된다|있다|없다)[.\s]*$")

today = ARGS[0]
secs = sections(today)
all_s = [(k, s) for k, t in secs for s in sents(t)]
c = Counter(s for _, s in all_s)
dups = [(s, n) for s, n in c.items() if n > 1]

print("== 판 안 중복 — 그대로 겹치는 문장")
print("   문장 %d개 · 중복 %d종 (겹친 자리 %d)"
      % (len(all_s), len(dups), sum(n for _, n in dups)))
where = defaultdict(list)
for k, s in all_s:
    where[s].append(k)
for s, n in sorted(dups, key=lambda x: -x[1])[:12]:
    print("   %dx [%s] %s" % (n, "·".join(dict.fromkeys(where[s]))[:40], s[:88]))

if len(ARGS) > 1:
    y = set(s for _, t in sections(ARGS[1]) for s in sents(t))
    mine = set(s for _, s in all_s)
    same = mine & y
    print()
    print("== 지난 판 반복 — 글자까지 같은 문장")
    print("   오늘 %d종 중 %d종 (%.0f%%) 이 어제와 같습니다"
          % (len(mine), len(same), 100.0 * len(same) / max(1, len(mine))))

    # **막을 때 쓰는 수는 글월만으로 다시 잰다.** 표 머리행·열 이름·절 제목은
    # 매 판 같은 것이 정상이고(「종목 Name 종가 Close 등락률 …」), 그것까지
    # 세면 잘 쓴 판도 걸린다. 판 안 중복에서 이미 같은 이유로 갈라 두었으므로
    # 여기서도 같은 잣대를 쓴다.
    mine_p = {s for s in mine if PROSE_RE.search(s)}
    same_p = mine_p & y
    REPEAT_PCT = 100.0 * len(same_p) / max(1, len(mine_p))
    print("   글월만: %d종 중 %d종 (%.0f%%)  ← 한도는 이 수로 잰다"
          % (len(mine_p), len(same_p), REPEAT_PCT))
    bysec = defaultdict(int)
    tot = defaultdict(int)
    for k, s in all_s:
        tot[k] += 1
        if s in same:
            bysec[k] += 1
    for k in sorted(tot, key=lambda k: -bysec[k])[:14]:
        print("   %-14s %3d/%-3d  %3.0f%%" % (k, bysec[k], tot[k],
                                              100.0 * bysec[k] / max(1, tot[k])))

print()
print("== 절을 넘나드는 사실 되풀이")
FACT = [("엔비디아", r"엔비디아"), ("금통위", r"금통위"), ("워시", r"워시"),
        ("잭슨홀", r"잭슨홀"), ("PCE", r"PCE"), ("상승 647", r"상승\s*647"),
        ("회전율 0.56", r"0\.56%"), ("7000선", r"7000선|7,000선")]
for nm, pat in FACT:
    hit = sorted({k for k, t in secs if re.search(pat, t)})
    if len(hit) > 1:
        print("   %-10s %2d개 절 — %s" % (nm, len(hit), " ".join(hit)))

# ── 끝 상태 ──────────────────────────────────────────────────────────
# 오래도록 이 스크립트는 세어서 **찍기만** 했다. 끝 상태가 언제나 0 이라
# 「중복 12종」을 찍어 놓고도 그 뒤 단계가 그대로 진행됐다. 세어 놓고 아무도
# 막지 않으면 검사가 아니라 소감이다. `--strict` 는 이것을 막는 잣대다.
#
# 기본 동작은 그대로 둔다 — 지침과 루틴이 이미 이 스크립트를 눈으로 읽는
# 용도로 쓰고 있다. 게이트(scripts/gate.sh)만 `--strict` 로 부른다.
# 한도 25% 는 지어낸 수가 아니라 **재어서 고른 수**다. 8월 판 23 쌍의 글월
# 반복률을 이어서 재면 두 무리로 갈린다.
#
#   정상   1 2 2 3 3 3 4 5 5 5 8 8 9 9 14 16 %   (17 쌍)
#   굳음   27 39 44 57 58 92 %                    ( 6 쌍)
#          └ 08-19 · 08-27m · 08-26m · 08-23g · 08-25m · 08-17g
#
# 9~16% 와 27% 사이가 비어 있다. 25% 는 그 빈 구간에, 정상 쪽 끝(16%)보다
# 넉넉히 위에 둔 선이다 — 잘 쓴 판을 막지 않으려는 쪽으로 치우쳐 잡았다.
#
# 8월 17일 해외 판은 글월의 **92%** 가 앞 판과 글자까지 같았다. 지침 7-2-1 이
# 「판을 물려 지으면 글이 먼저 굳는다」고 경고한 그 일이 **경고만 남긴 채
# 그대로 일어났다** — 세는 것은 있었는데 막는 것이 없었기 때문이다.
REPEAT_LIMIT = 25

prose_dups = [(s, n) for s, n in dups if PROSE_RE.search(s)]

if STRICT:
    fail = []
    if prose_dups:
        fail.append("판 안에 그대로 겹치는 **글월** %d종" % len(prose_dups))
        for s, n in sorted(prose_dups, key=lambda x: -x[1])[:5]:
            print("   %dx %s" % (n, s[:96]))
    elif dups:
        print()
        print("== 겹치는 %d종은 모두 표 머리행입니다 — 정상이므로 막지 않습니다"
              % len(dups))
    if REPEAT_PCT is not None and REPEAT_PCT >= REPEAT_LIMIT:
        fail.append("어제와 글자까지 같은 문장이 %.0f%% (한도 %d%%)"
                    % (REPEAT_PCT, REPEAT_LIMIT))
    print()
    if fail:
        print("!! 막습니다 — %s" % " · ".join(fail))
        sys.exit(1)
    print("== 통과 (--strict)")
    sys.exit(0)
