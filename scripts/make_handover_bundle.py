#!/usr/bin/env python3
"""인수인계 문서를 텍스트 한 장으로 모은다.

계정을 옮길 때 저장소 밖에도 한 벌 두고 싶다는 요청에서 나왔다. 그런데
**손으로 베낀 사본은 반드시 낡는다** — 이 저장소가 같은 이유로 지키는 규칙이
.github/workflows/README.md 머리말에도, docs/HANDOVER.md 0절에도 적혀 있다.
그래서 사본을 저장소에 두지 않고, 필요할 때 원문에서 다시 모은다.

    python3 scripts/make_handover_bundle.py            # out/인수인계-보관본.txt
    python3 scripts/make_handover_bundle.py --slim     # 지침(2,024줄)을 뺀다
    python3 scripts/make_handover_bundle.py -o 어디에.txt

머리에 **만든 시각과 그때 main 의 커밋**을 박는다. 몇 달 뒤 이 파일을 열었을
때 「언제 것인가」를 알 수 있어야 하기 때문이다.

없는 파일은 **조용히 건너뛰지 않는다.** 그 자리에 「없음」을 적어 둔다 —
빠진 것을 모르는 채 보관하는 쪽이 더 나쁘다. 몇몇 문서는 main 이 아니라
작업 가지에 있어서, 그 가지를 받아 두지 않으면 여기서 「없음」으로 나온다.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

KST = timezone(timedelta(hours=9))

# (경로, 제목, 지침인가) — 차례가 곧 보관본의 차례다.
# 지침은 2,024줄이라 --slim 에서 빠진다. 나머지는 늘 들어간다.
PARTS: list[tuple[str, str, bool]] = [
    ("docs/HANDOVER.md", "인수인계 — 새 계정에서 이어 가기", False),
    ("docs/handover/예약-전체백업.md", "예약(Routine) 전체 백업", False),
    ("docs/routine-prompts.md", "예약 프롬프트 — 모닝 · 시스템 설정", False),
    ("docs/routine-prompt-close.md", "예약 프롬프트 — 장마감 (원문)", False),
    ("docs/handover/자주쓰는-프롬프트.md", "자주 쓰는 말 · 리포트 예약 원문", False),
    ("docs/handover/시스템설정-백업.md", "시스템 설정 백업 — 리포트", False),
    ("docs/handover/증권사리포트-운영인계.md", "증권사 리포트 — 운영 인계", False),
    (".github/workflows/README.md", "워크플로 규약", False),
    (".claude/settings.json", "세션 설정 (.claude/settings.json)", False),
    (".claude/hooks/session-start.sh", "세션 시작 훅", False),
    (".gitignore", ".gitignore", False),
    ("docs/briefing-playbook.md", "브리핑 지침 — 사실상 모든 규칙", True),
]

RULE = "=" * 78


def repo_root() -> Path:
    out = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True, text=True, check=True,
    )
    return Path(out.stdout.strip())


def git(*args: str, default: str = "(알 수 없음)") -> str:
    try:
        out = subprocess.run(
            ["git", *args], capture_output=True, text=True, check=True,
        )
        return out.stdout.strip() or default
    except Exception:
        return default


def main() -> int:
    ap = argparse.ArgumentParser(description="인수인계 문서를 한 장으로 모은다")
    ap.add_argument("-o", "--out", default="out/인수인계-보관본.txt")
    ap.add_argument("--slim", action="store_true",
                    help="브리핑 지침(2,024줄)을 빼고 가볍게 만든다")
    args = ap.parse_args()

    root = repo_root()
    parts = [p for p in PARTS if not (args.slim and p[2])]

    stamp = datetime.now(KST).strftime("%Y-%m-%d %H:%M KST")
    head = git("rev-parse", "--short", "HEAD")
    branch = git("rev-parse", "--abbrev-ref", "HEAD")
    subject = git("log", "-1", "--format=%s")

    chunks: list[str] = []
    missing: list[str] = []
    toc: list[str] = []

    for i, (rel, title, _) in enumerate(parts, 1):
        path = root / rel
        if path.is_file():
            body = path.read_text(encoding="utf-8")
            lines = body.count("\n") + 1
            toc.append(f"  {i:2d}. {title}  ({rel} · {lines}줄)")
        else:
            body = (
                f"!! 이 파일이 지금 작업본에 없습니다 — {rel}\n"
                "   main 이 아니라 작업 가지에 있는 문서일 수 있습니다.\n"
                "   docs/HANDOVER.md 0절의 지도를 보고 그 가지를 받아 다시 모으십시오.\n"
            )
            missing.append(rel)
            toc.append(f"  {i:2d}. {title}  ({rel} · **없음**)")

        chunks.append(
            f"{RULE}\n{i:2d}. {title}\n    원문: {rel}\n{RULE}\n\n{body.rstrip()}\n"
        )

    header = [
        RULE,
        "미래에셋증권 마포WM — 인수인계 보관본",
        RULE,
        "",
        f"만든 때   : {stamp}",
        f"저장소     : hanaroline/work_1",
        f"그때 커밋  : {head} ({branch}) — {subject}",
        f"담은 문서  : {len(parts)}개" + ("  · 지침 제외(--slim)" if args.slim else ""),
        "",
        "이 파일은 저장소의 문서를 그때그때 모아 만든 것입니다. **원본이 아닙니다.**",
        "고칠 일이 있으면 저장소의 원문을 고치고 이 파일을 다시 만드십시오:",
        "",
        "    python3 scripts/make_handover_bundle.py",
        "",
        "저장소가 살아 있는 한 이 파일은 언제든 다시 만들 수 있습니다. 이것은",
        "저장소에 못 들어가는 자리 — 노트북, 사내 드라이브, 종이 — 에 두는 몫입니다.",
        "",
        "차례",
        *toc,
        "",
    ]
    if missing:
        header += [
            "!! 빠진 문서 %d개 — %s" % (len(missing), ", ".join(missing)),
            "   그 가지를 받아(git fetch) 다시 모으면 채워집니다.",
            "",
        ]

    out_path = root / args.out
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(header) + "\n" + "\n".join(chunks), encoding="utf-8")

    size = out_path.stat().st_size
    print(f"만들었다: {out_path}  ({size:,}바이트 · 문서 {len(parts)}개)")
    if missing:
        print(f"빠진 것 {len(missing)}개: {', '.join(missing)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
