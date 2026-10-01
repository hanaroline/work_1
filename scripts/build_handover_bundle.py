#!/usr/bin/env python3
"""인계 문서들을 한 파일로 묶는다 — 계정 밖에 텍스트로 보관하기 위한 것.

Claude 계정을 옮기면 대화·아티팩트·예약은 따라오지 않는다. 저장소에 든 것만
남는다. 그런데 저장소를 열어 볼 수 없는 자리(새 계정을 아직 안 만든 때, 다른
기계, 종이)에서도 읽을 것이 있어야 해서 한 파일로 묶어 둔다.

**원본은 각 파일이고 이 묶음은 사본이다.** 고칠 일이 있으면 원본을 고치고
이것을 다시 만든다. 묶음을 직접 고치면 다음 실행에서 지워진다.

    python3 scripts/build_handover_bundle.py

기본 출력은 docs/handover/전체-인수인계-통합본.md 이다. 다른 자리에 내려면
첫 인자로 경로를 준다.
"""

import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

KST = timezone(timedelta(hours=9))
ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "docs/handover/전체-인수인계-통합본.md"

# 싣는 차례 = 읽는 차례다. 맨 앞이 가장 먼저 읽을 것.
SOURCES = [
    ("docs/HANDOVER.md", "계정을 옮길 때 먼저 읽는 문서. 무엇이 넘어가고 무엇이 안 넘어가는가"),
    ("docs/handover/자주쓰는-프롬프트.md", "날마다 쓰는 말, 예약 지시문, 일하는 결"),
    ("docs/handover/시스템설정-백업.md", "설정이 어디에 왜 있는지. 예약만 새로 만들면 된다"),
    ("docs/handover/사용자PC환경.md", "받는 PC 의 제약 — 오피스 인증·OneDrive"),
    ("docs/handover/증권사리포트-운영인계.md", "증권사 리포트 다이제스트 운영"),
    ("docs/routine-prompts.md", "모닝·ELS 예약 프롬프트 원문"),
    ("docs/routine-prompt-close.md", "장마감 예약 프롬프트 원문"),
    ("docs/briefing-playbook.md", "시황 브리핑 작업 지침 전문 — 이 저장소에서 가장 값진 문서"),
]

BANNER = "=" * 78


def head_sha() -> str:
    """지금 작업본의 커밋. 묶음이 어느 시점의 것인지 밝히기 위한 것."""
    try:
        out = subprocess.run(
            ["git", "-C", str(ROOT), "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True, timeout=10,
        )
        return out.stdout.strip() if out.returncode == 0 else "(알 수 없음)"
    except (OSError, subprocess.SubprocessError):
        return "(알 수 없음)"


def main() -> int:
    out_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_OUT

    missing = [rel for rel, _ in SOURCES if not (ROOT / rel).is_file()]
    if missing:
        for rel in missing:
            print(f"없는 파일: {rel}", file=sys.stderr)
        print("묶음을 만들지 않았습니다 — 빠진 채로 내면 없는 줄 모릅니다.", file=sys.stderr)
        return 1

    now = datetime.now(KST)
    parts: list[str] = []

    parts.append("# 인수인계 통합본 — 미래에셋증권 마포WM 파이프라인")
    parts.append("")
    parts.append(f"만든 때 **{now:%Y-%m-%d %H:%M} KST** · 저장소 `hanaroline/work_1` · 커밋 `{head_sha()}`")
    parts.append("")
    parts.append(
        "이 파일은 **사본**입니다. 아래 원본들을 차례로 이어 붙인 것이고, "
        "`python3 scripts/build_handover_bundle.py` 로 다시 만듭니다.\n"
        "**고칠 일이 있으면 원본을 고치십시오.** 이 파일을 직접 고치면 다음 "
        "실행에서 지워집니다."
    )
    parts.append("")
    parts.append("## 무엇이 들어 있나")
    parts.append("")
    parts.append("| # | 원본 | 줄 | 무엇 |")
    parts.append("|---|---|---|---|")

    bodies: list[str] = []
    for i, (rel, what) in enumerate(SOURCES, 1):
        text = (ROOT / rel).read_text(encoding="utf-8").rstrip("\n")
        parts.append(f"| {i} | `{rel}` | {len(text.splitlines()):,} | {what} |")
        bodies.append(
            f"\n\n{BANNER}\n"
            f"문서 {i}/{len(SOURCES)} — {rel}\n"
            f"{BANNER}\n\n"
            f"{text}\n"
        )

    parts.append("")
    parts.append(
        "> 여기 없는 것 — **발행한 아티팩트, 대화 기록, 예약(Routine) 자체**는 "
        "Claude 계정에 묶여 있어 저장소에도 이 묶음에도 담기지 않습니다. "
        "예약은 위 6·7번의 원문을 보고 **새 계정에서 다시 만드십시오.**"
    )
    parts.extend(bodies)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(parts).rstrip("\n") + "\n", encoding="utf-8")

    total = sum(len((ROOT / rel).read_text(encoding="utf-8").splitlines()) for rel, _ in SOURCES)
    print(f"{out_path.relative_to(ROOT) if out_path.is_relative_to(ROOT) else out_path}")
    print(f"문서 {len(SOURCES)}개 · 원본 합계 {total:,}줄 · 묶음 {out_path.stat().st_size:,}바이트")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
