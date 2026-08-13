#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""사내 업무망 반입용 배포 패키지를 만든다.

인터넷망에서 이 스크립트를 돌리면 `dist/` 에 아래 세 가지가 생성된다.

  team-fileshare-<날짜>.zip        전체 폴더 압축본 (권장)
  team-fileshare-standalone.py     web/ 자산까지 한 파일에 담은 단일 파일 서버
  team-fileshare-standalone.py.txt 위 파일의 .txt 사본 (.py 반입이 막힐 때)

사내 파일전송 시스템으로 옮긴 뒤, 압축을 풀거나(.zip) 파일 하나만 두고
`python team-fileshare-standalone.py` 로 실행하면 된다.

    python3 make_package.py
"""

from __future__ import annotations

import base64
import hashlib
import shutil
import sys
import time
import zipfile
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
WEB_DIR = APP_DIR / "web"
DIST_DIR = APP_DIR / "dist"

PLACEHOLDER = "EMBEDDED_WEB: dict = {}"
ZIP_MEMBERS = [
    "server.py",
    "selftest.py",
    "make_package.py",
    "README.md",
    "START-HERE.txt",
    "run.bat",
    "run.cmd",
    "run.sh",
    "web/index.html",
    "web/login.html",
    "web/app.css",
    "web/app.js",
    "web/login.js",
    "web/i18n.js",
    "web/favicon.svg",
]


def build_standalone() -> str:
    """server.py 에 web/ 자산을 base64 로 심어 단일 파일 소스를 만든다."""
    source = (APP_DIR / "server.py").read_text(encoding="utf-8")
    if source.count(PLACEHOLDER) != 1:
        raise SystemExit("server.py 에서 EMBEDDED_WEB 자리표시자를 찾지 못했습니다.")

    lines = ["EMBEDDED_WEB: dict = {"]
    for asset in sorted(WEB_DIR.iterdir()):
        if not asset.is_file():
            continue
        encoded = base64.b64encode(asset.read_bytes()).decode("ascii")
        lines.append(f'    "{asset.name}":')
        for start in range(0, len(encoded), 96):
            lines.append(f'        "{encoded[start:start + 96]}"')
        lines[-1] += ","
    lines.append("}")

    header = (
        "# 단일 파일 배포본 — web/ 폴더 없이 이 파일 하나로 동작합니다.\n"
        f"# 생성: {time.strftime('%Y-%m-%d %H:%M')}\n"
    )
    return header + source.replace(PLACEHOLDER, "\n".join(lines))


def build_zip(path: Path) -> None:
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
        for member in ZIP_MEMBERS:
            source = APP_DIR / member
            if not source.exists():
                raise SystemExit(f"파일이 없습니다: {member}")
            zf.write(source, f"team-fileshare/{member}")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def human(size: int) -> str:
    return f"{size / 1024:.0f} KB" if size < 1024 * 1024 else f"{size / 1024 / 1024:.1f} MB"


def main() -> int:
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True)

    stamp = time.strftime("%Y%m%d")
    zip_path = DIST_DIR / f"team-fileshare-{stamp}.zip"
    standalone_path = DIST_DIR / "team-fileshare-standalone.py"
    txt_path = DIST_DIR / "team-fileshare-standalone.py.txt"

    build_zip(zip_path)
    standalone = build_standalone()
    standalone_path.write_text(standalone, encoding="utf-8")
    txt_path.write_text(standalone, encoding="utf-8")

    checksums = DIST_DIR / "CHECKSUMS.txt"
    rows = [(p.name, digest(p), p.stat().st_size) for p in (zip_path, standalone_path, txt_path)]
    checksums.write_text(
        "# 사내망으로 옮긴 뒤 파일이 온전한지 확인하는 SHA-256 값입니다.\n"
        "# 확인: certutil -hashfile <파일> SHA256   (Windows)\n"
        "#       shasum -a 256 <파일>              (Mac/Linux)\n\n"
        + "".join(f"{h}  {n}\n" for n, h, _ in rows),
        encoding="utf-8",
    )

    print("배포 패키지를 만들었습니다:", DIST_DIR)
    for name, hashed, size in rows:
        print(f"  {name:34s} {human(size):>8s}  {hashed[:16]}...")
    print(f"  {checksums.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
