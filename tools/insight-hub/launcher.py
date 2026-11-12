#!/usr/bin/env python3
"""센터 인사이트 — 센터 PC에서 더블클릭으로 띄우는 실행기.

윈도우 꾸러미(`scripts/build_insight_hub_windows.py` 가 만듦)의 Start.bat · Invite.bat 이
이 파일을 부릅니다. 하는 일:

  serve   API 키 확인(없으면 한 번 물어 이 PC 사용자 환경변수에 저장) → 첫 관리자가 없으면
          초대 코드 발급 → 비어 있는 포트로 서버 시작 → 브라우저 열기 → 같은 망 접속 주소 안내
  invite  직원 초대 코드(또는 비밀번호 재설정 코드) 발급

키는 저장소 파일이나 이 폴더에 쓰지 않습니다. 윈도우에서는 `setx`(사용자 환경변수)에,
그 밖의 운영체제에서는 저장하지 않고 이번 실행에만 씁니다.
"""
from __future__ import annotations

import getpass
import os
import socket
import subprocess
import sys
import threading
import time
import webbrowser

KEYS = [
    ("ANTHROPIC_API_KEY", "Claude API 키 (기사·PDF·캡처 정리용, sk-ant- 로 시작)", "sk-ant-"),
    ("GEMINI_API_KEY", "Gemini API 키 (유튜브 정리용, 없으면 그냥 Enter)", ""),
]


def ask(prompt: str) -> str:
    try:
        return input(prompt).strip()
    except EOFError:
        return ""


def save_user_env(name: str, value: str) -> bool:
    """윈도우 사용자 환경변수로 저장. 다음 실행부터 묻지 않게 한다."""
    if os.name != "nt":
        return False
    try:
        r = subprocess.run(["setx", name, value], capture_output=True, text=True)
        return r.returncode == 0
    except OSError:
        return False


def ensure_keys() -> None:
    for name, label, prefix in KEYS:
        if os.environ.get(name):
            continue
        print(f"\n▶ {label}")
        try:
            v = getpass.getpass("  붙여넣고 Enter (화면에 보이지 않음, 건너뛰려면 그냥 Enter): ").strip()
        except (EOFError, KeyboardInterrupt):
            v = ""
        if not v:
            print("  건너뜀 — 이 키가 필요한 정리는 '키 없음'으로 멈춥니다. 다음 실행 때 다시 묻습니다.")
            continue
        if prefix and not v.startswith(prefix):
            print(f"  ⚠ 보통 '{prefix}' 로 시작합니다. 그대로 쓰되, 정리가 실패하면 키를 다시 확인하세요.")
        os.environ[name] = v
        if save_user_env(name, v):
            print("  이 PC 사용자 환경변수에 저장했습니다(다음부터 묻지 않음).")


def free_port(start: int) -> int:
    for p in range(start, start + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("0.0.0.0", p))
                return p
            except OSError:
                continue
    raise SystemExit(f"{start}~{start + 19} 포트가 모두 쓰이고 있습니다. 다른 프로그램을 닫고 다시 실행하세요.")


def lan_ips() -> list[str]:
    ips: set[str] = set()
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))  # 실제로 보내지 않음 — 나가는 인터페이스 주소만 얻는다
            ips.add(s.getsockname()[0])
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ips.add(info[4][0])
    except OSError:
        pass
    return sorted(i for i in ips if not i.startswith("127."))


def first_admin(server) -> bool:
    """사용자도, 살아 있는 초대 코드도 없으면 첫 관리자 코드를 만든다. 만들었으면 True."""
    server.db()
    users = server.q("SELECT COUNT(*) AS n FROM users", one=True)["n"]
    if users:
        return False
    live = server.q("SELECT name FROM invites WHERE used_at IS NULL AND expires_at>?", (server.now(),), one=True)
    if live:
        print(f"\n아직 가입 전입니다. 앞서 만든 초대 코드({live['name']})로 가입하세요."
              " 코드를 잃었으면 Invite.bat 으로 같은 이름을 다시 넣으면 새 코드가 나옵니다.")
        return True
    print("\n처음 실행입니다. 관리자(이 앱을 관리할 사람)의 이름을 넣으세요.")
    name = ""
    while not name:
        name = ask("  관리자 이름: ")
    code = server.new_invite(name, "admin")
    print("\n" + "=" * 52)
    print(f"  이름: {server.norm_name(name)}    초대 코드: {code}")
    print(f"  ({server.invite_label()} 안에 한 번만 쓸 수 있습니다)")
    print("=" * 52)
    print("  곧 열리는 브라우저에서 이름 + 이 코드 + 새 비밀번호로 가입하세요.")
    return True


def cmd_serve(port: int) -> None:
    import server  # 같은 폴더의 server.py

    print(f"[{server.CENTER_NAME}] 시작 준비 — 데이터 폴더: {server.DATA_DIR}")
    ensure_keys()
    joining = first_admin(server)
    port = free_port(port)
    local = f"http://localhost:{port}/" + ("#join" if joining else "")

    print("\n접속 주소")
    print(f"  이 PC        : {local}")
    for ip in lan_ips():
        print(f"  같은 망 직원 : http://{ip}:{port}/")
    print("  (윈도우 방화벽 창이 뜨면 '허용'을 눌러야 다른 직원 PC·휴대폰에서 들어옵니다)")
    print("\n이 창을 닫으면 앱이 멈춥니다. 쓰는 동안 켜 두세요.\n")

    def open_browser():
        time.sleep(1.2)
        try:
            webbrowser.open(local)
        except Exception:
            pass

    if os.environ.get("INSIGHT_NO_BROWSER") != "1":
        threading.Thread(target=open_browser, daemon=True).start()
    server.main(["serve", "--host", "0.0.0.0", "--port", str(port)])


def cmd_invite() -> None:
    import server

    server.db()
    print("직원 초대 코드를 만듭니다. 이미 가입한 이름을 넣으면 비밀번호 재설정 코드가 나옵니다.")
    name = ""
    while not name:
        name = ask("  직원 이름: ")
    admin = ask("  관리자로 초대할까요? (y/N): ").lower() in ("y", "yes", "ㅛ")
    code = server.new_invite(name, "admin" if admin else "member")
    print(f"\n  이름: {server.norm_name(name)}    코드: {code}"
          f"    ({server.invite_label()} 안에 한 번만{', 관리자' if admin else ''})")
    print("  메신저로 이름과 코드를 전달하세요. 직원은 접속 주소 뒤에 #join 을 붙여 가입합니다.")


def main(argv: list[str]) -> None:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    try:  # 창에 바로바로 보이게(파이프로 돌 때도)
        sys.stdout.reconfigure(line_buffering=True)
    except (AttributeError, ValueError):
        pass
    cmd = argv[0] if argv else "serve"
    try:
        if cmd == "invite":
            cmd_invite()
        else:
            cmd_serve(int(os.environ.get("INSIGHT_PORT", "8080")))
    except KeyboardInterrupt:
        print("\n멈췄습니다.")


if __name__ == "__main__":
    main(sys.argv[1:])
