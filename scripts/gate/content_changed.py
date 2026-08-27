# -*- coding: utf-8 -*-
"""판의 **글이** 바뀌었는지, 생성 블록만 바뀌었는지 가른다.

`build_archive_nav.py` 를 돌리면 판 스물다섯 개가 한꺼번에 바뀐다. 사이드바
목록은 **생성물**이므로 그것만 바뀐 판을 두고 글 검사를 다시 돌리는 것은 뜻이
없다. 이미 발행된 글을 지금 기준으로 다시 재는 셈이 되고, 관문은 첫날부터
빨간불이 된다 — 사람이 관문을 안 보게 되는 바로 그 경로다.

그래서 생성 블록을 걷어낸 뒤 origin/main 과 견준다.

    python3 scripts/gate/content_changed.py docs/briefings/<파일>.html

끝 상태
    0  글이 바뀌었다 (또는 새 판이다) — 관문을 온전히 돌릴 것
    1  생성 블록만 바뀌었다 (또는 바뀐 것이 없다) — 글 검사는 건너뛸 것
    2  견줄 수 없다 (origin/main 이 없다) — 0 처럼 다루는 편이 안전하다
"""
import io
import os
import re
import subprocess
import sys

# 생성물 — 손으로 쓰지 않는 자리. build_archive_nav.py 가 만든다.
GENERATED = [
    re.compile(r'<ul class="sidenav-dates">.*?</ul>', re.S),
    re.compile(r'<nav[^>]*class="[^"]*print-dates[^"]*".*?</nav>', re.S),
    re.compile(r'<div[^>]*class="[^"]*print-dates[^"]*".*?</div>', re.S),
    re.compile(r'<meta name="gate:snapshots" content="[^"]*">'),
    # 목록 옆의 「n판」 같은 이름표도 빌더가 갈아 끼운다.
    re.compile(r'<span class="sidenav-label">[^<]*</span>'),
]


def strip_generated(s):
    for pat in GENERATED:
        s = pat.sub("", s)
    return re.sub(r"\s+", " ", s).strip()


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    path = argv[0]
    if not os.path.exists(path):
        print("  없는 파일 — 새 판으로 봅니다: %s" % path)
        return 0

    try:
        old = subprocess.run(
            ["git", "show", "origin/main:%s" % path],
            capture_output=True, check=True).stdout.decode("utf-8")
    except subprocess.CalledProcessError:
        print("  origin/main 에 없는 판입니다 — 새 판으로 봅니다")
        return 0
    except Exception as e:                                     # noqa: BLE001
        print("  견줄 수 없습니다(%s) — 온전히 돌리는 쪽으로 둡니다" % e)
        return 2

    new = io.open(path, encoding="utf-8").read()
    if strip_generated(old) == strip_generated(new):
        print("  생성 블록(사이드바 목록·못)만 다릅니다 — 글은 그대로입니다")
        return 1
    print("  글이 바뀌었습니다 — 관문을 온전히 돌립니다")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
