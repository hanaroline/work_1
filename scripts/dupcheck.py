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


today = sys.argv[1]
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

if len(sys.argv) > 2:
    y = set(s for _, t in sections(sys.argv[2]) for s in sents(t))
    mine = set(s for _, s in all_s)
    same = mine & y
    print()
    print("== 지난 판 반복 — 글자까지 같은 문장")
    print("   오늘 %d종 중 %d종 (%.0f%%) 이 어제와 같습니다"
          % (len(mine), len(same), 100.0 * len(same) / max(1, len(mine))))
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
