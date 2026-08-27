# -*- coding: utf-8 -*-
"""칩과 자료가 맞는지 본다 — 기준·수집본을 가려서.

판에는 이미 출처 칩이 붙어 있다(`MARKET DATA` 190 · `1 SOURCE` 111 ·
`2 SOURCES` 74 · `CALCULATED` 46 · `NOT FOUND` 18 — 8월 27일 모닝 판).
표시는 훌륭한데 **아무도 그 표시가 참인지 확인하지 않았다.** 「MARKET DATA」라고
붙은 숫자가 정말 시세 파일에 있는지 검사하는 것이 없었다.

여기서 보는 것은 그것이다.

    MARKET DATA · CALCULATED  → 못박은 수집본에서 그 기준으로 찾아야 한다.
                                 못 찾으면 **오류**다. 칩이 거짓이기 때문이다.
    1 SOURCE · NOT FOUND      → 시세 파일에 없는 것이 정상이다. 대신 **단정문으로
                                 쓰였는지**를 본다(미확인이 단정문으로 새는 것).

`scripts/audit_numbers.py` 와 다른 점은 셋이다 — 기준(주간·연초 이후…)을 글에서
읽고, 못박은 수집본 여럿을 함께 보고, 칩별로 잣대를 가른다. 그래서 종전 60~90 건
이던 헛경보가 사라진다. 자세한 사정은 `ledger.py` 머리글에 있다.

    python3 scripts/gate/audit2.py docs/briefings/<파일>.html
    python3 scripts/gate/audit2.py <파일>.html --snapshot data/market/2026-08-27.json

끝 상태
    0  칩과 자료가 맞다
    1  거짓 칩이 있거나(오류), 못이 박혀 있지 않다
    2  파일을 읽을 수 없다
"""
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ledger  # noqa: E402
import pin  # noqa: E402

# 칩을 글 속에 남기면서 태그를 걷는다.
CHIP = re.compile(r'<span class="vf (ok|solo|none|bad|new)">([^<]*)</span>')
CHIP_MARK = re.compile(r"⟦(ok|solo|none|bad|new)\|([^⟧]*)⟧")

# 「자료에서 나와야 하는」 칩
HARD = ("MARKET DATA", "CALCULATED")
# 단정문 어미 — 미확인 칩이 이렇게 끝나면 안 된다.
ASSERT_END = ("입니다", "습니다", "했다", "이다", "된다", "올랐", "내렸")

# **밝히는 문장은 새는 문장이 아니다.** 「수집기가 받지 못해 비워 두었습니다」는
# NOT FOUND 칩과 짝이 맞는 옳은 글이다. 이 말이 들어 있으면 세지 않는다.
DISCLOSE = ("비워", "받지 못", "확인하지 못", "확인되지", "없습니다", "않습니다",
            "아닙니다", "못했습니다", "빠졌", "제외", "추정", "근사")

# 판이 **스스로 자를 밝힌** 자리. 「주간」이 두 가지로 쓰이는 판이 있다 —
# 직전 금요일 종가 대비와 수집기의 달력 되짚기. 판이 그 차이를 본문에서
# 밝혀 두었으면 어긋난 것이 아니라 **다른 자**다. 그때는 막지 않고 알린다.
RULER = ("자가 다른", "자가 다릅니다", "기준이 다른", "기준이 다릅니다",
         "두 가지", "different ruler")


def prepare(raw):
    """태그를 걷되 칩은 ⟦종류|글⟧ 표시로 남긴다."""
    raw = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", raw)
    raw = CHIP.sub(lambda m: "⟦%s|%s⟧" % (m.group(1), m.group(2).strip()), raw)
    import html as H
    t = H.unescape(re.sub(r"(?s)<[^>]+>", " ", raw))
    return re.sub(r"[ \t ]+", " ", t.replace("−", "-").replace("–", "-"))


def chip_after(text, end, span=160):
    """숫자 뒤 가장 가까운 칩. 칩은 주장 **뒤에** 붙는다."""
    m = CHIP_MARK.search(text, end, end + span)
    return (m.group(1), m.group(2)) if m else (None, None)


def clean(s):
    return CHIP_MARK.sub(lambda m: "[%s]" % m.group(2), s)


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    path = argv[0]
    if not os.path.exists(path):
        print("  !! 없는 파일: %s" % path)
        return 2

    # ── 못 ──────────────────────────────────────────────────────────
    if "--snapshot" in argv:
        paths = [argv[argv.index("--snapshot") + 1]]
        print("  못을 건너뛰고 지정한 수집본으로 봅니다: %s" % paths[0])
    else:
        pins = pin.read(path)
        if not pins:
            print("  !! 못이 없습니다 — `python3 scripts/gate/pin.py --auto %s`" % path)
            print("     어느 수집본으로 쓴 판인지 모르면 검산 결과가 매번 달라집니다.")
            return 1
        paths = [f for f, _ in pins]
        missing = [f for f in paths if not os.path.exists(f)]
        if missing:
            print("  !! 못이 가리키는 수집본이 없습니다: %s" % ", ".join(missing))
            return 1

    snapshots = ledger.load(paths)
    print("  수집본 %d 개: %s" % (len(snapshots), ", ".join(n for n, _ in snapshots)))

    text = prepare(io.open(path, encoding="utf-8").read())
    names = ledger.known_names(snapshots)

    hard_bad, soft, unknown_hard, ok = [], [], [], 0
    seen = set()
    for name in sorted(names, key=len, reverse=True):
        pat = ledger.name_pattern(name) + r"[^0-9%+\-⟦]{0,14}([+-]?\d+\.\d\d)\s?%"
        for m in re.finditer(pat, text):
            printed = float(m.group(1))
            gap = text[m.end(0) - len(m.group(0)) + len(name):m.start(1)]
            if any(w in gap for w in ledger.OTHER_SUBJECT):
                continue            # 사이에 다른 주어가 끼었다 — 이 이름의 값이 아니다
            basis = ledger.basis_of(text[max(0, m.start() - 60):m.start()])
            cls, label = chip_after(text, m.end())
            key = (name, printed, basis, m.start() // 400)
            if key in seen:
                continue
            seen.add(key)

            verdict, why = ledger.resolve(name, printed, basis, snapshots)
            ctx = clean(text[max(0, m.start() - 70):m.end() + 60]).strip()

            if verdict == "OK":
                ok += 1
            elif verdict == "NEAR":
                soft.append((name, printed, basis, (label or "칩 없음") + "·근사",
                             why, ctx))
            elif label in HARD and not any(r in ctx for r in RULER):
                (hard_bad if verdict == "MISMATCH" else unknown_hard).append(
                    (name, printed, basis, label, why, ctx))
            else:
                soft.append((name, printed, basis, label or "칩 없음", why, ctx))

    # ── 미확인 칩이 단정문으로 쓰였는지 ────────────────────────────
    leak = []
    for m in CHIP_MARK.finditer(text):
        if m.group(2) not in ("NOT FOUND",):
            continue
        before = text[max(0, m.start() - 220):m.start()]
        sent = re.split(r"(?<=[다요])\.\s|⟧", before)[-1].strip()
        if any(d in sent for d in DISCLOSE):
            continue                       # 결측을 밝힌 문장 — 옳은 글이다
        if any(sent.rstrip(" .").endswith(e) for e in ASSERT_END):
            leak.append(clean(sent)[-140:])

    # ── 보고 ────────────────────────────────────────────────────────
    print("  맞은 주장 %d" % ok)
    print("  거짓 칩 %d · 자료에 없는 자료칩 %d · 참고 %d · 미확인 단정문 %d"
          % (len(hard_bad), len(unknown_hard), len(soft), len(leak)))

    for tag, rows in (("거짓 칩 — 자료칩인데 값이 자료와 다릅니다", hard_bad),
                      ("자료칩인데 계열이 시세 파일에 없습니다", unknown_hard)):
        if not rows:
            continue
        print("\n== %s" % tag)
        for name, printed, basis, label, why, ctx in rows[:20]:
            print("  ! %s [%s] 판=%+.2f%%  칩=%s" % (name, ledger.BASIS_LABEL[basis], printed, label))
            print("    자료: %s" % why)
            print("    …%s…" % ctx[:150])

    if leak:
        print("\n== 미확인(NOT FOUND)인데 단정문으로 쓰였습니다")
        for s in leak[:10]:
            print("  ! …%s" % s)

    if soft:
        print("\n== 참고 — 자료칩이 아니므로 막지 않습니다 (%d)" % len(soft))
        for name, printed, basis, label, why, ctx in soft[:8]:
            print("  · %s [%s] %+.2f%% 칩=%s" % (name, ledger.BASIS_LABEL[basis], printed, label))

    return 1 if (hard_bad or unknown_hard or leak) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
