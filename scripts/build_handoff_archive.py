#!/usr/bin/env python3
"""인계-보관본.txt + 예약 지시문 원문을 한 파일로 묶는다.

저장소 밖으로 한 파일만 들고 나갈 때 쓴다. 표준 라이브러리만 쓴다.

    python3 scripts/build_handoff_archive.py

낸 것 : 인계-보관본_전체.txt  (저장소 뿌리)
"""

import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "인계-보관본.txt"
ROUTINES = ROOT / "docs" / "claude-handoff" / "ROUTINES.md"
OUT = ROOT / "인계-보관본_전체.txt"

RULE = "=" * 80


def head() -> str:
    kst = datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=9)))
    try:
        rev = subprocess.run(
            ["git", "-C", str(ROOT), "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        rev = "(알 수 없음)"
    return "\n".join([
        RULE,
        " 미래에셋증권 마포WM — Claude 작업 보관본 · 전체본",
        RULE,
        f" 묶은 때   {kst:%Y-%m-%d %H:%M} KST   (main {rev})",
        " 묶은 것   인계-보관본.txt  +  docs/claude-handoff/ROUTINES.md",
        " 만드는 법 python3 scripts/build_handoff_archive.py",
        "",
        " 이 파일은 손으로 고치지 마십시오. 원본 둘을 고친 뒤 다시 만드십시오.",
        RULE,
        "", "",
    ])


def part(title: str, src: Path) -> str:
    if not src.exists():
        sys.exit(f"없는 파일: {src}")
    return "\n".join([
        "", "", "#" * 80,
        f"# {title}",
        f"# (원본: {src.relative_to(ROOT)})",
        "#" * 80, "", "",
        src.read_text(encoding="utf-8").rstrip(), "",
    ])


def main() -> int:
    text = (
        head()
        + part("제1부. 보관본 — 맥락 · 지침 · 설정 · 함정", MASTER)
        + part("제2부. 예약(Routine) 지시문 원문 19건", ROUTINES)
    )
    OUT.write_text(text, encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} — {len(text.splitlines()):,}줄 · "
          f"{OUT.stat().st_size / 1024:.0f}KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
