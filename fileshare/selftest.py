#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""서버 기능 점검 스크립트 (표준 라이브러리 전용).

임시 폴더에 서버를 띄우고 로그인 · 업로드 · 목록 · 다운로드 · ZIP · 수정 ·
삭제 · 비밀번호 변경 · 권한 검사를 순서대로 확인한다.

    python3 selftest.py
"""

from __future__ import annotations

import io
import json
import shutil
import socket
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

import server as app

PASSED = []
FAILED = []


def check(label: str, condition: bool, detail: str = "") -> None:
    (PASSED if condition else FAILED).append(label)
    mark = "PASS" if condition else "FAIL"
    print(f"  [{mark}] {label}" + (f"  — {detail}" if detail and not condition else ""))


class Client:
    def __init__(self, base: str):
        self.base = base
        self.cookie = ""

    def request(self, path, data=None, method=None, headers=None, raw=False):
        url = self.base + path
        body = None
        head = {"X-Fileshare": "1"}
        if data is not None and not raw:
            body = json.dumps(data).encode("utf-8")
            head["Content-Type"] = "application/json"
        elif raw:
            body = data
            head["Content-Type"] = "application/octet-stream"
        head.update(headers or {})
        if self.cookie:
            head["Cookie"] = self.cookie
        req = urllib.request.Request(url, data=body, headers=head,
                                     method=method or ("POST" if body is not None else "GET"))
        try:
            with urllib.request.urlopen(req) as res:
                set_cookie = res.headers.get("Set-Cookie")
                if set_cookie:
                    self.cookie = set_cookie.split(";")[0]
                return res.status, res.read(), dict(res.headers)
        except urllib.error.HTTPError as err:
            return err.code, err.read(), dict(err.headers)

    def json_request(self, path, data=None, method=None, headers=None):
        status, body, head = self.request(path, data, method, headers)
        try:
            return status, json.loads(body.decode("utf-8")), head
        except ValueError:
            return status, {}, head


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def main() -> int:
    work = Path(tempfile.mkdtemp(prefix="fileshare-test-"))
    data_dir = work / "data"
    store = app.Store(data_dir)
    admin_pw = store.initial_passwords["admin"]
    viewer_pw = store.initial_passwords["viewer"]

    app.Handler.store = store
    app.Handler.sessions = app.Sessions(lambda: store.config.get("session_hours", 12))
    app.Handler.guard = app.LoginGuard()

    port = free_port()
    httpd = app.ThreadingHTTPServer(("127.0.0.1", port), app.Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.2)
    base = f"http://127.0.0.1:{port}"

    try:
        print("\n1. 인증")
        anon = Client(base)
        status, _, _ = anon.request("/api/files")
        check("비로그인 목록 조회 차단", status == 401)
        status, _, head = anon.request("/", method="GET")
        check("루트 접속 시 로그인으로 이동", status == 200 and "login" in head.get("Location", "/login"))

        status, payload, _ = anon.json_request("/api/login", {"password": "wrong-password"})
        check("잘못된 비밀번호 거부", status == 401 and payload.get("error") == "invalid_password")

        admin = Client(base)
        status, payload, _ = admin.json_request("/api/login", {"password": admin_pw, "name": "관리자"})
        check("관리자 로그인", status == 200 and payload.get("role") == "admin")

        viewer = Client(base)
        status, payload, _ = viewer.json_request("/api/login", {"password": viewer_pw, "name": "팀원A"})
        check("조회용 로그인", status == 200 and payload.get("role") == "viewer")

        status, payload, _ = admin.json_request("/api/session")
        check("세션 정보 확인", payload.get("authenticated") and payload.get("role") == "admin")

        print("\n2. 업로드")
        content = ("사내 자료 테스트 " * 500).encode("utf-8")
        status, body, _ = admin.request(
            "/api/upload", content, "POST",
            {"X-File-Name": urllib.parse.quote("2026년_8월_시황.txt"),
             "X-Folder": urllib.parse.quote("리서치"),
             "X-Note": urllib.parse.quote("월간 시황 최종본")},
            raw=True,
        )
        uploaded = json.loads(body.decode("utf-8"))
        file_id = uploaded.get("file", {}).get("id", "")
        check("관리자 업로드", status == 200 and len(file_id) == 32)
        check("한글 파일명 보존", uploaded.get("file", {}).get("name") == "2026년_8월_시황.txt")
        check("업로드 크기 일치", uploaded.get("file", {}).get("size") == len(content))

        status, body, _ = viewer.request(
            "/api/upload", b"blocked", "POST",
            {"X-File-Name": "viewer.txt"}, raw=True,
        )
        check("조회용 사용자 업로드 차단", status == 403)

        second = b"two"
        status, body, _ = admin.request(
            "/api/upload", second, "POST",
            {"X-File-Name": urllib.parse.quote("메모.txt"), "X-Folder": urllib.parse.quote("리서치")},
            raw=True,
        )
        second_id = json.loads(body.decode("utf-8"))["file"]["id"]
        check("두 번째 업로드", status == 200)

        print("\n3. 조회 / 다운로드")
        status, payload, _ = viewer.json_request("/api/files")
        check("조회용 사용자 목록 조회", status == 200 and payload["stats"]["count"] == 2)
        check("폴더 목록 수집", payload["folders"] == ["리서치"])

        status, body, head = viewer.request(f"/api/download/{file_id}", method="GET")
        check("다운로드 내용 일치", status == 200 and body == content)
        check("첨부파일 헤더", "attachment" in head.get("Content-Disposition", ""))
        check("한글 파일명 인코딩", "filename*=UTF-8''" in head.get("Content-Disposition", ""))

        status, body, head = viewer.request(
            f"/api/download/{file_id}", method="GET", headers={"Range": "bytes=0-9"})
        check("Range 부분 다운로드", status == 206 and body == content[:10])

        status, _, _ = viewer.request("/api/download/" + "z" * 32, method="GET")
        check("잘못된 ID 차단", status == 404)

        status, payload, _ = viewer.json_request("/api/zip", {"ids": [file_id, second_id]})
        token = payload.get("token", "")
        check("ZIP 묶기", status == 200 and payload.get("count") == 2)
        status, body, head = viewer.request(f"/api/zip/{token}", method="GET")
        archive = zipfile.ZipFile(io.BytesIO(body))
        check("ZIP 내용 확인", status == 200 and set(archive.namelist()) ==
              {"리서치/2026년_8월_시황.txt", "리서치/메모.txt"})
        status, _, _ = viewer.request(f"/api/zip/{token}", method="GET")
        check("ZIP 토큰 1회용", status == 404)

        print("\n4. 관리")
        status, _, _ = viewer.json_request("/api/file/update", {"id": file_id, "name": "hack.txt"})
        check("조회용 사용자 수정 차단", status == 403)
        status, payload, _ = admin.json_request(
            "/api/file/update", {"id": file_id, "name": "시황_v2.txt", "note": "수정본"})
        check("파일 정보 수정", status == 200 and payload["file"]["name"] == "시황_v2.txt")

        status, payload, _ = admin.json_request("/api/settings", {"site_title": "리서치 자료실",
                                                                 "viewer_can_upload": True})
        check("설정 저장", status == 200 and payload["site_title"] == "리서치 자료실")
        status, body, _ = viewer.request(
            "/api/upload", b"now allowed", "POST", {"X-File-Name": "ok.txt"}, raw=True)
        check("허용 후 조회용 업로드 가능", status == 200)
        third_id = json.loads(body.decode("utf-8"))["file"]["id"]

        status, payload, _ = admin.json_request("/api/audit?limit=50", method="GET")
        actions = [e["action"] for e in payload.get("entries", [])]
        check("감사 로그 기록", "upload" in actions and "login" in actions and "download" in actions)

        print("\n5. 비밀번호")
        status, payload, _ = admin.json_request(
            "/api/password", {"target": "viewer", "current": "틀린비밀번호", "new": "newpass123"})
        check("현재 비밀번호 검증", status == 403)
        status, payload, _ = admin.json_request(
            "/api/password", {"target": "viewer", "current": admin_pw, "new": "12345"})
        check("짧은 비밀번호 거부", status == 400)
        status, payload, _ = admin.json_request(
            "/api/password", {"target": "viewer", "current": admin_pw, "new": "team-2026-pass"})
        check("조회용 비밀번호 변경", status == 200)
        status, _, _ = viewer.request("/api/files")
        check("변경 후 기존 조회 세션 만료", status == 401)
        again = Client(base)
        status, payload, _ = again.json_request("/api/login", {"password": "team-2026-pass"})
        check("새 비밀번호로 로그인", status == 200 and payload.get("role") == "viewer")
        status, payload, _ = again.json_request("/api/login", {"password": viewer_pw})
        check("이전 비밀번호 무효화", status == 401)

        status, payload, _ = admin.json_request(
            "/api/password", {"target": "admin", "current": admin_pw, "new": "admin-2026-pass"})
        check("관리자 비밀번호 변경", status == 200)
        status, payload, _ = admin.json_request("/api/session")
        check("변경 후 관리자 세션 유지", payload.get("role") == "admin")

        print("\n6. 삭제 · 보안")
        status, payload, _ = admin.json_request("/api/file/delete", {"ids": [file_id, second_id, third_id]})
        check("파일 삭제", status == 200 and payload["deleted"] == 3)
        status, payload, _ = admin.json_request("/api/files")
        check("삭제 후 목록 비움", payload["stats"]["count"] == 0)
        check("실제 파일도 삭제", not any((data_dir / "blobs").iterdir()))

        no_csrf = Client(base)
        no_csrf.cookie = admin.cookie
        req = urllib.request.Request(base + "/api/file/delete", data=b"{}",
                                     headers={"Cookie": admin.cookie, "Content-Type": "application/json"},
                                     method="POST")
        try:
            with urllib.request.urlopen(req) as res:
                csrf_status = res.status
        except urllib.error.HTTPError as err:
            csrf_status = err.code
        check("CSRF 헤더 없는 요청 거부", csrf_status == 400)

        status, body, head = admin.request("/app", method="GET")
        check("앱 페이지 렌더", status == 200 and b"listArea" in body)
        check("보안 헤더 적용", "nosniff" in head.get("X-Content-Type-Options", "") and
              "frame-ancestors" in head.get("Content-Security-Policy", ""))
        status, body, _ = admin.request("/static/app.js", method="GET")
        check("정적 파일 제공", status == 200 and len(body) > 1000)
        status, _, _ = admin.request("/static/../server.py", method="GET")
        check("정적 경로 탈출 차단", status == 404)

        guard = app.LoginGuard()
        for _ in range(8):
            guard.record_failure("10.0.0.9")
        check("로그인 시도 제한 동작", guard.locked_for("10.0.0.9") > 0)

        # 서버 재시작 후에도 데이터가 유지되는지 확인
        reopened = app.Store(data_dir)
        check("설정 영구 저장", reopened.config["site_title"] == "리서치 자료실")
        check("변경된 비밀번호 영구 저장",
              app.verify_password("admin-2026-pass", reopened.config["admin_password"]))
    finally:
        httpd.shutdown()
        httpd.server_close()
        shutil.rmtree(work, ignore_errors=True)

    print("\n" + "-" * 50)
    print(f"통과 {len(PASSED)} / 실패 {len(FAILED)}")
    if FAILED:
        for name in FAILED:
            print("  실패:", name)
        return 1
    print("모든 점검을 통과했습니다.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
