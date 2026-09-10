# -*- coding: utf-8 -*-
"""판이 **어제 것을 오늘 것처럼** 말하고 있는지 훑는다.

  python3 stale.py <판.html> <오늘 YYYY-MM-DD> <직전 거래일 MM-DD>

세 가지를 본다.
① 지난 날짜를 앞일처럼 쓴 곳 (「25일 …이 붙습니다」 같은 것)
② 지난 판에서 물려받은 상대 시간말 (「지난주」·「내일」·「이번 주」)
③ 방향을 말하는 문장이 그 문장 안의 숫자 부호와 어긋나는 곳
"""
import io, re, sys, html, datetime

path, today, lastd = sys.argv[1], sys.argv[2], sys.argv[3]
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
UP = ("올랐", "상승", "뛰었", "급등", "반등", "높아졌", "오름")
DN = ("내렸", "하락", "빠졌", "급락", "무너졌", "낮아졌", "내림", "밀렸")
bad = 0
for s in sents:
    nums = [float(x) for x in re.findall(r"[+−\-]\s?(\d+\.\d\d)\s?%", s)]
    signs = re.findall(r"([+−\-])\s?\d+\.\d\d\s?%", s)
    if len(signs) < 1:
        continue
    up_w = any(w in s for w in UP)
    dn_w = any(w in s for w in DN)
    if up_w and dn_w:
        continue                                  # 둘 다 나오면 갈라 말한 문장이다
    allp = all(x == "+" for x in signs)
    alln = all(x in "−-" for x in signs)
    if (up_w and alln) or (dn_w and allp):
        bad += 1
        print("   %s" % s[:130])
print("   %s" % ("없음" if not bad else "합계 %d" % bad))
