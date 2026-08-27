# -*- coding: utf-8 -*-
"""판이 **어느 수집본으로 쓰였는지**를 판 안에 못박는다.

이것이 없으면 나중에 아무도 판을 다시 검산할 수 없다. `data/market/latest.json`
은 수집마다 덮어써지므로, 같은 검사를 이틀 뒤에 돌리면 다른 답이 나온다.
실제로 8월 27일 모닝 판을 세 수집본으로 대조하면 어긋난 짝이 63 / 87 / 104 로
갈렸다 — 판이 변한 것이 아니라 기준이 흘러간 것이다.

그래서 발행 시점에 쓴 수집본의 **이름과 지문**을 판의 <head> 에 적어 둔다.
그 뒤로는 누가·언제 돌려도 같은 답이 나온다. 검증을 매 판 되풀이하지 않아도
되는 것은 이 못 때문이다.

    python3 scripts/gate/pin.py --auto  docs/briefings/<파일>.html   # 날짜로 골라 박는다
    python3 scripts/gate/pin.py --set   <파일>.html a.json b.json    # 손으로 지정
    python3 scripts/gate/pin.py --read  <파일>.html                  # 박힌 것을 보여준다
    python3 scripts/gate/pin.py --check <파일>.html                  # 박혔나·지문이 맞나

끝 상태
    0  못이 박혀 있고 지문도 맞다
    1  못이 없거나, 가리키는 파일이 없거나, 지문이 달라졌다
"""
import glob
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ledger  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MARKET = os.path.join(ROOT, "data", "market")
TAG = re.compile(r'<meta\s+name="gate:snapshots"\s+content="([^"]*)"\s*/?>')


def read(path):
    """[(경로, 박아둔 지문)] — 못이 없으면 빈 목록."""
    m = TAG.search(io.open(path, encoding="utf-8").read())
    if not m:
        return []
    out = []
    for part in m.group(1).split(","):
        part = part.strip()
        if not part:
            continue
        name, _, want = part.partition("@")
        out.append((os.path.join(MARKET, name), want))
    return out


def write(path, files):
    raw = io.open(path, encoding="utf-8").read()
    content = ",".join("%s@%s" % (os.path.basename(f), ledger.sha12(f))
                       for f in files)
    tag = '<meta name="gate:snapshots" content="%s">' % content
    if TAG.search(raw):
        raw = TAG.sub(lambda _: tag, raw, count=1)
    elif "</head>" in raw:
        raw = raw.replace("</head>", "  " + tag + "\n</head>", 1)
    elif "</title>" in raw:
        # 보관본은 Artifact 조각이라 <head> 가 없다 — <title> 바로 뒤에 붙인다.
        raw = raw.replace("</title>", "</title>\n" + tag, 1)
    else:
        raw = tag + "\n" + raw
    io.open(path, "w", encoding="utf-8").write(raw)
    print("  못 박음: %s" % content)
    return 0


# 판의 갈래마다 「이 시각까지 들어온 수집본」을 쓴다.
CUTOFF = {"morning": "T0900", "global": "T1000", "close": "T1800"}


def auto(path):
    """판 이름의 날짜·갈래로 수집본을 고른다.

    **수집본 이름은 「수집한 때」이고 계열의 `date` 는 「그 값이 속한 세션」이다.**
    `2026-08-27.json` 의 SOX 는 `date=2026-08-26` 이다. 이 둘을 섞는 것이
    「금요일 숫자를 월요일 것이라 말하는」 사고의 통로다.

    한 판에는 밤사이 해외 마감과 국내 마감이 함께 들어가고 그 둘은 **서로 다른
    수집본**에 있으므로, 갈래에 맞는 시각까지의 수집본 **둘**을 박는다.

    `data/market/runs/` 를 먼저 본다. 날짜별 파일은 하루 네 번 도는 수집이
    서로 덮어써 오후 것만 남으므로, 모닝 판의 근거가 되지 못한다.
    """
    m = re.search(r"(\d{4}-\d{2}-\d{2})", os.path.basename(path))
    if not m:
        print("  !! 판 이름에서 날짜를 못 찾았습니다: %s" % path)
        return 1
    day = m.group(1)
    kind = next((k for k in CUTOFF if k in os.path.basename(path)), "morning")
    limit = day + CUTOFF[kind]

    runs = sorted(f for f in glob.glob(os.path.join(MARKET, "runs", "20*.json"))
                  if os.path.basename(f)[:15] <= limit)
    if runs:
        return write(path, runs[-2:] if len(runs) >= 2 else runs[-1:])

    dated = sorted(f for f in glob.glob(os.path.join(MARKET, "20*.json"))
                   if os.path.basename(f)[:10] <= day)
    if not dated:
        print("  !! %s 이전의 수집본이 없습니다" % day)
        return 1
    print("  ** runs/ 에 수집본이 없어 날짜별 파일로 박습니다.")
    print("     날짜별 파일은 그날 **마지막** 수집만 남긴 것입니다. 모닝 판의")
    print("     근거(새벽 수집본)가 이미 덮어써진 판이면 검산이 어긋납니다.")
    return write(path, dated[-2:] if len(dated) >= 2 else dated[-1:])


def check(path):
    pins = read(path)
    if not pins:
        print("  !! 못이 없습니다 — `pin.py --auto %s` 를 돌리십시오" % path)
        print("     못이 없는 판은 나중에 다시 검산할 수 없습니다.")
        return 1
    bad = 0
    for f, want in pins:
        if not os.path.exists(f):
            print("  !! 못이 가리키는 수집본이 없습니다: %s" % f)
            bad += 1
            continue
        got = ledger.sha12(f)
        if want and got != want:
            print("  !! 수집본이 발행 뒤에 바뀌었습니다: %s (박은 것 %s / 지금 %s)"
                  % (os.path.basename(f), want, got))
            bad += 1
        else:
            print("  못 확인: %s@%s" % (os.path.basename(f), got))
    return 1 if bad else 0


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    mode, path = argv[0], argv[1]
    if mode == "--auto":
        return auto(path)
    if mode == "--set":
        return write(path, argv[2:])
    if mode == "--read":
        for f, want in read(path):
            print("%s\t%s" % (f, want))
        return 0
    if mode == "--check":
        return check(path)
    print("  !! 모르는 갈래: %s" % mode)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
