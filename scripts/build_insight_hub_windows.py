#!/usr/bin/env python3
"""센터 인사이트(tools/insight-hub)를 윈도우 PC에서 더블클릭으로 쓰는 꾸러미(zip)로 묶는다.

파이썬 설치 없이 돌게, python.org 가 NuGet 에 올리는 윈도우용 파이썬(`python` 패키지,
x64)의 tools/ 폴더를 통째로 함께 넣는다. 표준 라이브러리만 쓴다.

  python3 scripts/build_insight_hub_windows.py --nupkg python.3.13.17.nupkg --out dist/
  python3 scripts/build_insight_hub_windows.py --out dist/     # NuGet·GitHub 에서 받아 옴
  --cloudflared cloudflared-windows-amd64.exe  미리 받아 둔 터널 프로그램 (--no-tunnel 이면 넣지 않음)

결과: <out>/CenterInsight-windows.zip  (API 키는 넣지 않는다 — 처음 실행 때 PC에서 묻는다)
"""
from __future__ import annotations

import argparse
import hashlib
import io
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "tools" / "insight-hub"
PY_VERSION = "3.13.17"
NUGET = "https://api.nuget.org/v3-flatcontainer/python/{v}/python.{v}.nupkg"
# 휴대폰이 어디서든 HTTPS 로 들어오게 하는 Cloudflare 터널 프로그램(공식 배포본). 꾸러미에 함께 넣는다.
CLOUDFLARED = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
TOP = "CenterInsight"

# 배치 파일은 ASCII 만 쓴다(cmd 가 UTF-8 한글 줄을 잘못 읽는 일이 있어서). 안내 문구는 파이썬이 찍는다.
START_BAT = r"""@echo off
title Center Insight
cd /d "%~dp0"
python\python.exe -E -s app\launcher.py serve
echo.
pause
"""
INVITE_BAT = r"""@echo off
title Center Insight - invite
cd /d "%~dp0"
python\python.exe -E -s app\launcher.py invite
echo.
pause
"""

README = """센터 인사이트 — 윈도우용 실행 꾸러미
=====================================

링크·PDF·캡처를 올리면 AI가 3단락으로 정리해 센터 직원이 함께 보는 앱입니다.
이 폴더 하나에 파이썬까지 들어 있어 따로 설치할 것이 없습니다.

1. 시작
   - zip 을 풀고(예: C:\\CenterInsight) Start.bat 을 더블클릭합니다.
   - "Windows의 PC 보호" 파란 창이 뜨면 [추가 정보] → [실행].
   - 처음 한 번 묻는 것
       · Claude API 키 (기사·PDF·캡처 정리) — console.anthropic.com 에서 발급
       · Gemini API 키 (유튜브 정리, 없으면 Enter 로 건너뜀)
       · 관리자 이름 → 화면에 8자리 초대 코드가 나옵니다
   - 브라우저가 열리면 이름 + 초대 코드 + 새 비밀번호로 가입합니다.
   - 키는 이 PC 사용자 환경변수(setx)에 저장되어 다음부터 묻지 않습니다.
     이 폴더나 zip 에는 키가 들어가지 않습니다.

2. 직원 초대 — 휴대폰 앱으로 (Claude 계정 필요 없음)
   - Invite.bat → 직원 이름 → 초대 코드가 나옵니다.
     (또는 앱 화면 오른쪽 위 [관리] → [직원 초대])
   - Start.bat 창에 "휴대폰 접속 주소 https://….trycloudflare.com/" 이 찍힙니다.
     직원에게 메신저로 [가입 주소(끝에 #join) + 이름 + 초대 코드] 를 보냅니다.
   - 직원은 휴대폰에서 그 주소를 열어 이름·코드·새 비밀번호로 가입한 뒤
       · 안드로이드(크롬): 메뉴 ⋮ → [앱 설치] 또는 [홈 화면에 추가]
       · 아이폰(사파리): 공유 버튼 → [홈 화면에 추가]
     → 홈 화면에 "센터 인사이트" 아이콘이 생기고 앱처럼 전체 화면으로 열립니다.
   - 회사 망 밖(LTE·집)에서도 들어옵니다. HTTPS 라 주소창 경고도 없습니다.
   ⚠ 이 임시 주소는 Start.bat 을 다시 켤 때마다 바뀝니다. 바뀌면 새 주소를 다시
     보내고, 직원은 새 주소로 한 번 더 [홈 화면에 추가] 합니다(가입·자료는 그대로).
     주소를 고정하려면 Cloudflare 계정 + 도메인으로 '이름 있는 터널'을 만들어야 합니다.
   - 같은 사무실 PC 는 "같은 망 직원" 주소(http://10.x.x.x:8080)로도 들어옵니다.
     윈도우 방화벽 창이 뜨면 [허용].

3. 쓰는 동안
   - Start.bat 검은 창을 닫으면 앱이 멈춥니다. 쓰는 동안 켜 두세요.
   - 자료는 이 폴더가 아니라 %USERPROFILE%\\.insight-hub 에 저장됩니다
     (insight.db + uploads). 새 판으로 바꿀 때는 이 폴더만 지우고 새 zip 을 풀면
     자료는 그대로 이어집니다. 백업은 .insight-hub 폴더 통째로.

4. 키 바꾸기 / 지우기
   - 시작 메뉴 → "계정의 환경 변수 편집" → ANTHROPIC_API_KEY · GEMINI_API_KEY 수정·삭제.

⚠ 올리면 안 되는 것
   올린 자료는 Anthropic(Claude)·Google(Gemini) 서버로 보내져 정리됩니다.
   고객 이름·계좌·연락처·상담 내용이 담긴 자료는 절대 올리지 마십시오.
   AI 정리는 참고용입니다. 고객에게 전하기 전에 원문과 숫자를 직접 확인하십시오.

포함된 파이썬: {pyver} (python.org 의 NuGet 'python' 패키지, x64)
  원본 sha256: {pysha}
포함된 cloudflared.exe (Cloudflare 공식 배포본, 휴대폰용 HTTPS 주소)
  sha256: {cfsha}
"""


def crlf(s: str) -> bytes:
    return s.replace("\r\n", "\n").replace("\n", "\r\n").encode("utf-8")


def build(nupkg: bytes, out: Path, cloudflared: bytes | None = None) -> Path:
    out.mkdir(parents=True, exist_ok=True)
    dest = out / f"{TOP}-windows.zip"
    pysha = hashlib.sha256(nupkg).hexdigest()
    src = zipfile.ZipFile(io.BytesIO(nupkg))
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        n_py = 0
        for info in src.infolist():
            name = info.filename
            if not name.startswith("tools/") or name.endswith("/"):
                continue
            rel = name[len("tools/"):]
            # 꾸러미 크기를 줄인다: 이 앱이 쓰지 않는 개발 도구·GUI·시험 묶음
            if rel.startswith(("Lib/test/", "Lib/idlelib/", "Lib/tkinter/", "Lib/turtledemo/",
                               "Lib/ensurepip/", "Lib/lib2to3/", "include/", "libs/", "Scripts/")):
                continue
            z.writestr(f"{TOP}/python/{rel}", src.read(info))
            n_py += 1
        if not n_py or f"{TOP}/python/python.exe" not in z.namelist():
            raise SystemExit("NuGet 패키지에서 python.exe 를 찾지 못했다")
        z.write(APP / "server.py", f"{TOP}/app/server.py")
        z.write(APP / "launcher.py", f"{TOP}/app/launcher.py")
        for f in sorted((APP / "static").iterdir()):
            if f.is_file():
                z.write(f, f"{TOP}/app/static/{f.name}")
        if cloudflared:
            z.writestr(f"{TOP}/cloudflared.exe", cloudflared)
        z.writestr(f"{TOP}/Start.bat", crlf(START_BAT))
        z.writestr(f"{TOP}/Invite.bat", crlf(INVITE_BAT))
        z.writestr(f"{TOP}/README.txt", b"\xef\xbb\xbf" + crlf(README.format(
            pyver=PY_VERSION, pysha=pysha,
            cfsha=hashlib.sha256(cloudflared).hexdigest() if cloudflared else "(넣지 않음)")))
    return dest


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--nupkg", help=f"미리 받아 둔 python.{PY_VERSION}.nupkg (없으면 NuGet 에서 받음)")
    ap.add_argument("--out", default="dist", help="결과 폴더 (기본 dist/)")
    ap.add_argument("--cloudflared", help="미리 받아 둔 cloudflared-windows-amd64.exe (없으면 GitHub 에서 받음)")
    ap.add_argument("--no-tunnel", action="store_true", help="cloudflared 를 넣지 않음(같은 망에서만 사용)")
    a = ap.parse_args()
    if a.nupkg:
        data = Path(a.nupkg).read_bytes()
    else:
        with urllib.request.urlopen(NUGET.format(v=PY_VERSION), timeout=120) as r:
            data = r.read()
    cf = None
    if not a.no_tunnel:
        if a.cloudflared:
            cf = Path(a.cloudflared).read_bytes()
        else:
            with urllib.request.urlopen(CLOUDFLARED, timeout=300) as r:
                cf = r.read()
        if cf[:2] != b"MZ":
            raise SystemExit("cloudflared 가 윈도우 실행 파일이 아니다")
    dest = build(data, Path(a.out), cf)
    print(f"{dest}  {dest.stat().st_size / 1e6:.1f}MB")


if __name__ == "__main__":
    main()
