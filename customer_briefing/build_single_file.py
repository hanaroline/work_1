#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
briefing.html + server.ps1 -> 단일 실행 파일(.bat) 빌더

산출물은 파일 하나로, 안에 다음 3개가 모두 들어갑니다.
  1) cmd 배치 런처       (파일 앞부분, ASCII/CRLF)
  2) PowerShell 로컬 서버 (server.ps1 내용)
  3) 대시보드 HTML       (briefing.html 내용, PowerShell here-string)

동작 방식
  더블클릭 -> cmd가 앞부분만 실행하고 `exit /b`로 멈춤
  -> PowerShell이 자기 자신(.bat)을 읽어 마커 뒤쪽을 %TEMP%에 .ps1로 풀고 실행
  -> 서버가 메모리에 있는 HTML을 http://localhost:8899/ 로 서비스

`exit /b` 뒤의 내용은 cmd가 아예 읽지 않으므로 PowerShell/HTML이 배치로
해석되는 일은 없습니다.

사용법:  python3 build_single_file.py
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
HTML_SRC = os.path.join(HERE, "briefing.html")
PS_SRC = os.path.join(HERE, "server.ps1")
OUT = os.path.join(HERE, "보유자산_통합브리핑.bat")

MARKER = "#@@PS_BEGIN@@"

# ---------------------------------------------------------------- 배치 런처
# 주의: 이 부분은 반드시 ASCII + CRLF 여야 합니다. (한국어 Windows cmd 안전)
# -Command 인수는 큰따옴표로 감싸므로 안쪽에서는 큰따옴표를 쓰지 않습니다.
PS_ONELINER = (
    "$t=[IO.File]::ReadAllText($env:MAB_SELF,[Text.Encoding]::UTF8); "
    # 마커를 런타임에 이어붙인다. 헤더 안에 마커 리터럴이 그대로 있으면
    # IndexOf가 페이로드 경계가 아니라 이 줄을 먼저 찾아버린다.
    "$m='#@@' + 'PS_BEGIN' + '@@'; "
    "$i=$t.IndexOf($m); "
    "if($i -lt 0){ Write-Host 'ERROR: embedded server payload not found.'; exit 1 }; "
    "$d=Join-Path $env:TEMP 'mab_briefing'; "
    "if(-not (Test-Path $d)){ [void](New-Item -ItemType Directory -Path $d) }; "
    # 하루 이상 지난 잔여 파일만 청소 (동시 실행 중인 인스턴스는 건드리지 않음)
    "Get-ChildItem $d -Filter 'server_*.ps1' -EA SilentlyContinue | "
    "Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-1) } | "
    "Remove-Item -Force -EA SilentlyContinue; "
    "$f=Join-Path $d ('server_' + $PID + '.ps1'); "
    # PS 5.1은 BOM 없는 UTF-8을 ANSI(949)로 읽어 한글이 깨지므로 BOM 필수
    "[IO.File]::WriteAllText($f, $t.Substring($i+$m.Length), "
    "(New-Object System.Text.UTF8Encoding $true)); "
    "try { & $f } finally { Remove-Item $f -Force -EA SilentlyContinue }"
)

BATCH_LINES = [
    "@echo off",
    "rem ==========================================================",
    "rem  Holdings briefing - single file edition",
    "rem  This one file contains the launcher, the local server and",
    "rem  the dashboard itself. Nothing else to copy.",
    "rem",
    "rem  How to use: just double-click this file.",
    "rem  How to stop: close the black console window.",
    "rem ==========================================================",
    "setlocal",
    'set "MAB_SELF=%~f0"',
    'set "MAB_ROOT=%~dp0"',
    "powershell -NoProfile -ExecutionPolicy Bypass -Command \"" + PS_ONELINER + "\"",
    "echo.",
    "pause",
    "exit /b",
    MARKER,
]


def patch_server(ps: str) -> str:
    """server.ps1을 단일 파일 구동에 맞게 최소 수정."""
    edits = 0

    # 1) $ROOT: %TEMP%의 임시 .ps1이 아니라 .bat이 놓인 폴더를 가리키게
    old_root = (
        "$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition\n"
        "Set-Location $ROOT"
    )
    new_root = (
        "# 단일 파일 실행 시에는 배치가 알려준 원본 폴더를 쓴다\n"
        "# (스크립트 자신은 %TEMP%에 풀려 있으므로 그 경로를 쓰면 안 됨)\n"
        "if ($env:MAB_ROOT) { $ROOT = $env:MAB_ROOT.TrimEnd('\\') }\n"
        "else { $ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition }\n"
        "Set-Location $ROOT"
    )
    if old_root not in ps:
        sys.exit("[FAIL] $ROOT 블록을 찾지 못했습니다. server.ps1이 바뀐 것 같습니다.")
    ps = ps.replace(old_root, new_root, 1)
    edits += 1

    # 2) '/' 와 '/briefing.html' 요청은 디스크가 아니라 내장 HTML로 응답
    old_idx = "  if ($path -eq '/' -or $path -eq '') { $path = '/briefing.html' }"
    new_idx = (
        "  # 내장된 대시보드 HTML을 메모리에서 바로 서비스 (별도 파일 불필요)\n"
        "  if ($path -eq '/' -or $path -eq '' -or $path -eq '/briefing.html') {\n"
        "    Send-Response -Stream $Stream -Status 200 "
        "-ContentType 'text/html; charset=utf-8' "
        "-Body ([System.Text.Encoding]::UTF8.GetBytes($global:HTML_DOC))\n"
        "    return\n"
        "  }"
    )
    if old_idx not in ps:
        sys.exit("[FAIL] 인덱스 라우팅 라인을 찾지 못했습니다.")
    ps = ps.replace(old_idx, new_idx, 1)
    edits += 1

    # 3) 배너 문구
    old_banner = '"  Holdings briefing server is running (PowerShell edition)."'
    new_banner = '"  Holdings briefing server is running (single-file edition)."'
    if old_banner in ps:
        ps = ps.replace(old_banner, new_banner, 1)
        edits += 1

    print("[ok] server.ps1 패치 %d곳" % edits)
    return ps


def build() -> None:
    with open(HTML_SRC, encoding="utf-8") as f:
        html = f.read()
    with open(PS_SRC, encoding="utf-8") as f:
        ps = f.read()

    # --- 임베드 안전성 검사 -------------------------------------------------
    # PowerShell 리터럴 here-string(@'...'@)은 줄 맨 앞의 '@ 로만 끝난다.
    for i, line in enumerate(html.split("\n"), 1):
        if line.startswith("'@"):
            sys.exit(
                "[FAIL] briefing.html %d번째 줄이 \"'@\"로 시작합니다. "
                "here-string이 여기서 끊깁니다." % i
            )
    if MARKER in html or MARKER in ps:
        sys.exit("[FAIL] 마커 문자열이 원본에 이미 존재합니다.")
    if not html.endswith("\n"):
        html += "\n"

    ps = patch_server(ps)

    # HTML은 $ROOT 설정 직후에 전역 변수로 심는다.
    anchor = "Set-Location $ROOT\n"
    if anchor not in ps:
        sys.exit("[FAIL] HTML 삽입 위치를 찾지 못했습니다.")
    # PowerShell here-string은 종료자 '@ 바로 앞의 개행을 값에 포함하지 않는다.
    # 그래서 개행을 하나 더 넣어 원본과 바이트 단위로 정확히 일치시킨다.
    html_block = (
        "\n# ==== 내장 대시보드 (briefing.html 원본 그대로) ====\n"
        "# 리터럴 here-string이므로 $ 나 ` 가 해석되지 않는다. 종료 표시는\n"
        "# 반드시 줄 맨 앞의 '@ 이어야 한다.\n"
        "$global:HTML_DOC = @'\n" + html + "\n'@\n"
    )
    ps = ps.replace(anchor, anchor + html_block, 1)

    # --- 조립 --------------------------------------------------------------
    # 배치 부분만 CRLF, 나머지는 원본 LF 유지. 파일 전체 UTF-8 (BOM 없음:
    # BOM이 있으면 cmd가 첫 줄에서 오류를 낼 수 있다).
    head = "\r\n".join(BATCH_LINES) + "\r\n"
    blob = head + ps
    with open(OUT, "w", encoding="utf-8", newline="") as f:
        f.write(blob)

    size = os.path.getsize(OUT)
    print("[ok] 생성: %s (%.1f KB)" % (os.path.basename(OUT), size / 1024.0))


if __name__ == "__main__":
    build()
