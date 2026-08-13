#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""사내망 팀 자료실 (파일 공유) 서버.

파이썬 표준 라이브러리만 사용합니다. pip 설치도, 인터넷 연결도 필요 없습니다.

  python3 server.py                 # 0.0.0.0:8080 으로 실행
  python3 server.py --port 9000     # 포트 변경
  python3 server.py --set-password admin    # 관리자 비밀번호 재설정(콘솔)
  python3 server.py --set-password viewer   # 조회용 비밀번호 재설정(콘솔)

데이터는 기본적으로 이 파일과 같은 위치의 data/ 폴더에 저장됩니다.
"""

from __future__ import annotations

import argparse
import base64
import getpass
import hashlib
import hmac
import http.server
import json
import os
import re
import secrets
import shutil
import socket
import socketserver
import stat
import sys
import threading
import time
import urllib.parse
import zipfile
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
WEB_DIR = APP_DIR / "web"

PBKDF2_ITERATIONS = 240_000
ID_RE = re.compile(r"^[0-9a-f]{32}$")
SESSION_COOKIE = "fs_sid"
CSRF_HEADER = "X-Fileshare"
MAX_JSON_BODY = 256 * 1024
AUDIT_MAX_BYTES = 5 * 1024 * 1024

DEFAULT_CONFIG = {
    "version": 1,
    "site_title": "팀 자료실",
    "viewer_password": "",
    "admin_password": "",
    "session_hours": 12,
    "max_upload_mb": 1024,
    "viewer_can_upload": False,
    "require_name": False,
}

STATIC_FILES = {
    "app.css": "text/css; charset=utf-8",
    "app.js": "application/javascript; charset=utf-8",
    "login.js": "application/javascript; charset=utf-8",
    "i18n.js": "application/javascript; charset=utf-8",
    "favicon.svg": "image/svg+xml",
}


# --------------------------------------------------------------------------
# 비밀번호 해시
# --------------------------------------------------------------------------

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ITERATIONS,
        base64.b64encode(salt).decode(),
        base64.b64encode(dk).decode(),
    )


def verify_password(password: str, stored: str) -> bool:
    if not stored:
        return False
    try:
        algo, iterations, salt_b64, hash_b64 = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
    except Exception:
        return False
    return hmac.compare_digest(dk, expected)


def generate_password(words: int = 3) -> str:
    """콘솔에 출력해도 옮겨 적기 쉬운 초기 비밀번호."""
    alphabet = "abcdefghjkmnpqrstuvwxyz23456789"
    parts = ["".join(secrets.choice(alphabet) for _ in range(4)) for _ in range(words)]
    return "-".join(parts)


# --------------------------------------------------------------------------
# 저장소
# --------------------------------------------------------------------------

class Store:
    """설정 · 파일 메타데이터 · 실제 파일 바이트를 관리한다."""

    def __init__(self, data_dir: Path):
        self.dir = Path(data_dir).resolve()
        self.blobs = self.dir / "blobs"
        self.tmp = self.dir / "tmp"
        self.config_path = self.dir / "config.json"
        self.index_path = self.dir / "index.json"
        self.audit_path = self.dir / "audit.log"
        self.lock = threading.RLock()
        self.config: dict = {}
        self.files: list = []
        self._bootstrap()

    # -- 초기화 -------------------------------------------------------------
    def _bootstrap(self) -> None:
        for path in (self.dir, self.blobs, self.tmp):
            path.mkdir(parents=True, exist_ok=True)
        try:
            os.chmod(self.dir, stat.S_IRWXU)
        except OSError:
            pass

        for leftover in self.tmp.glob("*"):  # 이전 실행에서 남은 임시 파일 정리
            try:
                leftover.unlink()
            except OSError:
                pass

        if self.config_path.exists():
            self.config = {**DEFAULT_CONFIG, **self._read_json(self.config_path, {})}
        else:
            self.config = dict(DEFAULT_CONFIG)
            self.initial_passwords = {
                "admin": generate_password(),
                "viewer": generate_password(),
            }
            self.config["admin_password"] = hash_password(self.initial_passwords["admin"])
            self.config["viewer_password"] = hash_password(self.initial_passwords["viewer"])
            self._write_json(self.config_path, self.config)

        data = self._read_json(self.index_path, {"files": []})
        self.files = data.get("files", [])
        self._reconcile()

    def _reconcile(self) -> None:
        """인덱스에는 있으나 실제 파일이 없는 항목을 정리한다."""
        alive = [f for f in self.files if (self.blobs / f["id"]).exists()]
        if len(alive) != len(self.files):
            self.files = alive
            self._write_json(self.index_path, {"files": self.files})

    # -- JSON 입출력 --------------------------------------------------------
    @staticmethod
    def _read_json(path: Path, fallback):
        try:
            with path.open("r", encoding="utf-8") as fh:
                return json.load(fh)
        except (OSError, ValueError):
            return fallback

    @staticmethod
    def _write_json(path: Path, payload) -> None:
        tmp_path = path.with_suffix(path.suffix + ".tmp")
        with tmp_path.open("w", encoding="utf-8") as fh:
            json.dump(payload, fh, ensure_ascii=False, indent=2)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmp_path, path)

    # -- 설정 ---------------------------------------------------------------
    def save_config(self) -> None:
        with self.lock:
            self._write_json(self.config_path, self.config)

    def set_password(self, role: str, password: str) -> None:
        with self.lock:
            self.config[f"{role}_password"] = hash_password(password)
            self.save_config()

    # -- 파일 ---------------------------------------------------------------
    def save_index(self) -> None:
        with self.lock:
            self._write_json(self.index_path, {"files": self.files})

    def new_blob(self):
        file_id = secrets.token_hex(16)
        return file_id, self.blobs / file_id

    def add_file(self, meta: dict) -> dict:
        with self.lock:
            self.files.append(meta)
            self.save_index()
        return meta

    def get_file(self, file_id: str):
        with self.lock:
            for meta in self.files:
                if meta["id"] == file_id:
                    return meta
        return None

    def update_file(self, file_id: str, **changes):
        with self.lock:
            meta = self.get_file(file_id)
            if not meta:
                return None
            meta.update(changes)
            self.save_index()
            return meta

    def delete_file(self, file_id: str):
        with self.lock:
            meta = self.get_file(file_id)
            if not meta:
                return None
            self.files = [f for f in self.files if f["id"] != file_id]
            self.save_index()
        try:
            (self.blobs / file_id).unlink()
        except OSError:
            pass
        return meta

    def bump_downloads(self, file_id: str) -> None:
        with self.lock:
            meta = self.get_file(file_id)
            if meta:
                meta["downloads"] = int(meta.get("downloads", 0)) + 1
                self.save_index()

    def folders(self) -> list:
        with self.lock:
            names = {(f.get("folder") or "").strip() for f in self.files}
        return sorted(n for n in names if n)

    # -- 감사 로그 ----------------------------------------------------------
    def audit(self, action: str, actor: str = "", ip: str = "", detail: str = "") -> None:
        entry = {
            "ts": time.strftime("%Y-%m-%d %H:%M:%S"),
            "action": action,
            "actor": actor,
            "ip": ip,
            "detail": detail,
        }
        with self.lock:
            try:
                if self.audit_path.exists() and self.audit_path.stat().st_size > AUDIT_MAX_BYTES:
                    shutil.move(str(self.audit_path), str(self.audit_path) + ".1")
                with self.audit_path.open("a", encoding="utf-8") as fh:
                    fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
            except OSError:
                pass

    def read_audit(self, limit: int = 300) -> list:
        with self.lock:
            try:
                with self.audit_path.open("r", encoding="utf-8") as fh:
                    lines = fh.readlines()[-limit:]
            except OSError:
                return []
        entries = []
        for line in lines:
            try:
                entries.append(json.loads(line))
            except ValueError:
                continue
        entries.reverse()
        return entries


# --------------------------------------------------------------------------
# 세션 / 로그인 시도 제한
# --------------------------------------------------------------------------

class Sessions:
    def __init__(self, ttl_hours_getter):
        self._sessions: dict = {}
        self._lock = threading.RLock()
        self._ttl_hours = ttl_hours_getter

    def create(self, role: str, name: str, ip: str) -> str:
        sid = secrets.token_urlsafe(32)
        with self._lock:
            self._sessions[sid] = {
                "role": role,
                "name": name,
                "ip": ip,
                "expires": time.time() + max(1, int(self._ttl_hours())) * 3600,
            }
            self._prune()
        return sid

    def get(self, sid: str):
        if not sid:
            return None
        with self._lock:
            data = self._sessions.get(sid)
            if not data:
                return None
            if data["expires"] < time.time():
                self._sessions.pop(sid, None)
                return None
            return dict(data)

    def drop(self, sid: str) -> None:
        with self._lock:
            self._sessions.pop(sid, None)

    def drop_role(self, role: str) -> None:
        """비밀번호가 바뀌면 해당 역할의 기존 세션을 모두 만료시킨다."""
        with self._lock:
            for sid in [s for s, d in self._sessions.items() if d["role"] == role]:
                self._sessions.pop(sid, None)

    def _prune(self) -> None:
        now = time.time()
        for sid in [s for s, d in self._sessions.items() if d["expires"] < now]:
            self._sessions.pop(sid, None)


class LoginGuard:
    """같은 IP 에서 비밀번호를 반복해서 틀리면 잠시 잠근다."""

    MAX_FAILS = 8
    LOCK_SECONDS = 300
    WINDOW_SECONDS = 900  # 이 시간 안에 누적된 실패만 센다

    def __init__(self):
        self._state: dict = {}
        self._lock = threading.RLock()

    def locked_for(self, ip: str) -> int:
        with self._lock:
            entry = self._state.get(ip)
            if not entry:
                return 0
            remain = int(entry["until"] - time.time())
            return remain if remain > 0 else 0

    def record_failure(self, ip: str) -> None:
        now = time.time()
        with self._lock:
            self._sweep(now)
            entry = self._state.setdefault(ip, {"fails": 0, "until": 0.0, "reset_at": 0.0})
            if entry["reset_at"] <= now:
                entry["fails"] = 0
            entry["reset_at"] = now + self.WINDOW_SECONDS
            entry["fails"] += 1
            if entry["fails"] >= self.MAX_FAILS:
                entry["until"] = now + self.LOCK_SECONDS
                entry["fails"] = 0

    def _sweep(self, now: float) -> None:
        stale = [ip for ip, e in self._state.items()
                 if e["until"] <= now and e["reset_at"] <= now]
        for ip in stale:
            self._state.pop(ip, None)

    def record_success(self, ip: str) -> None:
        with self._lock:
            self._state.pop(ip, None)


class ZipTokens:
    """ZIP 묶음 다운로드용 1회성 토큰 (기본 5분 유효)."""

    def __init__(self):
        self._items: dict = {}
        self._lock = threading.RLock()

    def put(self, token: str, entry: dict) -> None:
        with self._lock:
            self._sweep()
            self._items[token] = entry

    def take(self, token: str):
        if not re.match(r"^[0-9a-f]{32}$", token or ""):
            return None
        with self._lock:
            entry = self._items.pop(token, None)
            self._sweep()
        if not entry or entry["expires"] < time.time():
            if entry:
                try:
                    entry["path"].unlink()
                except OSError:
                    pass
            return None
        return entry

    def _sweep(self) -> None:
        now = time.time()
        for token in [t for t, e in self._items.items() if e["expires"] < now]:
            entry = self._items.pop(token)
            try:
                entry["path"].unlink()
            except OSError:
                pass


ZIP_TOKENS = ZipTokens()


# --------------------------------------------------------------------------
# HTTP 핸들러
# --------------------------------------------------------------------------

class Handler(http.server.BaseHTTPRequestHandler):
    server_version = "TeamFileShare"
    sys_version = ""
    protocol_version = "HTTP/1.1"

    store: Store
    sessions: Sessions
    guard: LoginGuard

    # -- 공통 응답 ----------------------------------------------------------
    def _security_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
            "connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
        )

    def _send_bytes(self, status: int, body: bytes, content_type: str, headers=None) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self._security_headers()
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _send_json(self, status: int, payload, headers=None) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self._send_bytes(status, body, "application/json; charset=utf-8", headers)

    def _error(self, status: int, code: str, message: str = "") -> None:
        self._send_json(status, {"error": code, "message": message})

    def _redirect(self, location: str) -> None:
        self.send_response(303)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.send_header("Cache-Control", "no-store")
        self._security_headers()
        self.end_headers()

    def log_message(self, fmt: str, *args) -> None:  # 콘솔 로그 간소화
        sys.stderr.write("[%s] %s %s\n" % (time.strftime("%H:%M:%S"), self.client_ip(), fmt % args))

    # -- 요청 유틸 ----------------------------------------------------------
    def client_ip(self) -> str:
        return self.client_address[0] if self.client_address else "-"

    def cookies(self) -> dict:
        raw = self.headers.get("Cookie", "")
        jar = {}
        for chunk in raw.split(";"):
            if "=" in chunk:
                key, _, value = chunk.partition("=")
                jar[key.strip()] = value.strip()
        return jar

    def session(self):
        return self.sessions.get(self.cookies().get(SESSION_COOKIE, ""))

    def header_text(self, name: str, limit: int = 400) -> str:
        raw = self.headers.get(name, "")
        try:
            value = urllib.parse.unquote(raw, errors="replace")
        except Exception:
            value = ""
        return value.replace("\r", " ").replace("\n", " ").strip()[:limit]

    def read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return None
        if length <= 0 or length > MAX_JSON_BODY:
            return None
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return None

    def require_session(self, admin: bool = False):
        sess = self.session()
        if not sess:
            self._error(401, "unauthorized", "로그인이 필요합니다.")
            return None
        if admin and sess["role"] != "admin":
            self._error(403, "forbidden", "관리자 권한이 필요합니다.")
            return None
        return sess

    def check_csrf(self) -> bool:
        if self.headers.get(CSRF_HEADER, "") != "1":
            self._error(400, "bad_request", "잘못된 요청입니다.")
            return False
        return True

    def actor(self, sess) -> str:
        name = (sess.get("name") or "").strip()
        return f"{sess['role']}:{name}" if name else sess["role"]

    # -- 라우팅 -------------------------------------------------------------
    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)

        if path == "/":
            return self._redirect("/app" if self.session() else "/login")
        if path == "/login":
            if self.session():
                return self._redirect("/app")
            return self.serve_page("login.html")
        if path == "/app":
            if not self.session():
                return self._redirect("/login")
            return self.serve_page("index.html")
        if path.startswith("/static/"):
            return self.serve_static(path[len("/static/"):])
        if path == "/favicon.ico":
            return self.serve_static("favicon.svg")

        if path == "/api/session":
            return self.api_session()
        if path == "/api/files":
            return self.api_files()
        if path.startswith("/api/download/"):
            return self.api_download(path[len("/api/download/"):])
        if path.startswith("/api/zip/"):
            return self.api_zip_fetch(path[len("/api/zip/"):])
        if path == "/api/audit":
            return self.api_audit(query)
        if path == "/api/settings":
            return self.api_settings_get()

        return self._error(404, "not_found", "페이지를 찾을 수 없습니다.")

    def do_HEAD(self):
        self.do_GET()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path

        if path == "/api/login":
            return self.api_login()
        if not self.check_csrf():
            return None
        if path == "/api/logout":
            return self.api_logout()
        if path == "/api/upload":
            return self.api_upload()
        if path == "/api/zip":
            return self.api_zip()
        if path == "/api/file/update":
            return self.api_file_update()
        if path == "/api/file/delete":
            return self.api_file_delete()
        if path == "/api/password":
            return self.api_password()
        if path == "/api/settings":
            return self.api_settings_post()

        return self._error(404, "not_found", "잘못된 경로입니다.")

    # -- 정적 파일 ----------------------------------------------------------
    def serve_page(self, name: str) -> None:
        path = WEB_DIR / name
        try:
            body = path.read_bytes()
        except OSError:
            return self._error(500, "missing_asset", f"{name} 파일을 찾을 수 없습니다.")
        title = str(self.store.config.get("site_title") or DEFAULT_CONFIG["site_title"])
        safe_title = (
            title.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        )
        body = body.replace(b"{{SITE_TITLE}}", safe_title.encode("utf-8"))
        self._send_bytes(200, body, "text/html; charset=utf-8")

    def serve_static(self, name: str) -> None:
        content_type = STATIC_FILES.get(name)
        if not content_type:
            return self._error(404, "not_found")
        try:
            body = (WEB_DIR / name).read_bytes()
        except OSError:
            return self._error(404, "not_found")
        self._send_bytes(200, body, content_type)

    # -- 인증 API -----------------------------------------------------------
    def api_login(self) -> None:
        ip = self.client_ip()
        locked = self.guard.locked_for(ip)
        if locked:
            return self._error(429, "locked", f"로그인 시도가 많습니다. {locked}초 후 다시 시도하세요.")

        payload = self.read_json_body() or {}
        password = str(payload.get("password", ""))
        name = str(payload.get("name", "")).strip()[:40]
        config = self.store.config

        if config.get("require_name") and not name:
            return self._error(400, "name_required", "이름을 입력해 주세요.")

        role = ""
        if password and verify_password(password, config.get("admin_password", "")):
            role = "admin"
        elif password and verify_password(password, config.get("viewer_password", "")):
            role = "viewer"

        if not role:
            self.guard.record_failure(ip)
            self.store.audit("login_failed", name or "-", ip)
            return self._error(401, "invalid_password", "비밀번호가 올바르지 않습니다.")

        self.guard.record_success(ip)
        sid = self.sessions.create(role, name, ip)
        self.store.audit("login", f"{role}:{name}" if name else role, ip)
        max_age = max(1, int(config.get("session_hours", 12))) * 3600
        cookie = (
            f"{SESSION_COOKIE}={sid}; Path=/; HttpOnly; SameSite=Strict; Max-Age={max_age}"
        )
        self._send_json(200, {"ok": True, "role": role}, {"Set-Cookie": cookie})

    def api_logout(self) -> None:
        sid = self.cookies().get(SESSION_COOKIE, "")
        sess = self.sessions.get(sid)
        if sess:
            self.store.audit("logout", self.actor(sess), self.client_ip())
        self.sessions.drop(sid)
        expired = f"{SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
        self._send_json(200, {"ok": True}, {"Set-Cookie": expired})

    def api_session(self) -> None:
        sess = self.session()
        config = self.store.config
        if not sess:
            return self._send_json(200, {
                "authenticated": False,
                "site_title": config.get("site_title"),
                "require_name": bool(config.get("require_name")),
            })
        self._send_json(200, {
            "authenticated": True,
            "role": sess["role"],
            "name": sess.get("name", ""),
            "site_title": config.get("site_title"),
            "can_upload": sess["role"] == "admin" or bool(config.get("viewer_can_upload")),
            "max_upload_mb": int(config.get("max_upload_mb", 1024)),
        })

    # -- 파일 API -----------------------------------------------------------
    def api_files(self) -> None:
        sess = self.require_session()
        if not sess:
            return None
        with self.store.lock:
            files = [dict(f) for f in self.store.files]
        files.sort(key=lambda f: f.get("uploaded_at", 0), reverse=True)
        total_bytes = sum(int(f.get("size", 0)) for f in files)
        self._send_json(200, {
            "files": files,
            "folders": self.store.folders(),
            "stats": {
                "count": len(files),
                "bytes": total_bytes,
                "downloads": sum(int(f.get("downloads", 0)) for f in files),
            },
        })

    def api_upload(self) -> None:
        sess = self.require_session()
        if not sess:
            return None
        config = self.store.config
        if sess["role"] != "admin" and not config.get("viewer_can_upload"):
            return self._error(403, "forbidden", "업로드 권한이 없습니다.")

        name = os.path.basename(self.header_text("X-File-Name", 255)) or "unnamed"
        folder = self.header_text("X-Folder", 60)
        note = self.header_text("X-Note", 300)

        try:
            length = int(self.headers.get("Content-Length", "-1"))
        except ValueError:
            length = -1
        if length < 0:
            return self._error(411, "length_required", "파일 크기를 확인할 수 없습니다.")

        limit = max(1, int(config.get("max_upload_mb", 1024))) * 1024 * 1024
        if length > limit:
            return self._error(413, "too_large", f"최대 {config.get('max_upload_mb')}MB 까지 업로드할 수 있습니다.")

        file_id, blob_path = self.store.new_blob()
        tmp_path = self.store.tmp / (file_id + ".part")
        digest = hashlib.sha256()
        written = 0
        try:
            with tmp_path.open("wb") as out:
                remaining = length
                while remaining > 0:
                    chunk = self.rfile.read(min(1024 * 1024, remaining))
                    if not chunk:
                        break
                    out.write(chunk)
                    digest.update(chunk)
                    written += len(chunk)
                    remaining -= len(chunk)
            if written != length:
                raise IOError("업로드가 중단되었습니다.")
            os.replace(tmp_path, blob_path)
        except Exception as exc:
            for path in (tmp_path, blob_path):
                try:
                    path.unlink()
                except OSError:
                    pass
            return self._error(400, "upload_failed", str(exc) or "업로드에 실패했습니다.")

        meta = {
            "id": file_id,
            "name": name,
            "size": written,
            "folder": folder,
            "note": note,
            "uploaded_at": time.time(),
            "uploaded_by": (sess.get("name") or "").strip() or sess["role"],
            "downloads": 0,
            "sha256": digest.hexdigest(),
        }
        self.store.add_file(meta)
        self.store.audit("upload", self.actor(sess), self.client_ip(), f"{name} ({written} bytes)")
        self._send_json(200, {"ok": True, "file": meta})

    def api_download(self, file_id: str) -> None:
        sess = self.require_session()
        if not sess:
            return None
        if not ID_RE.match(file_id or ""):
            return self._error(404, "not_found", "파일을 찾을 수 없습니다.")
        meta = self.store.get_file(file_id)
        if not meta:
            return self._error(404, "not_found", "파일을 찾을 수 없습니다.")
        blob = self.store.blobs / file_id
        if not blob.exists():
            return self._error(404, "not_found", "파일 실체가 없습니다.")

        size = blob.stat().st_size
        start, end = 0, size - 1
        status = 200
        range_header = self.headers.get("Range", "")
        match = re.match(r"bytes=(\d*)-(\d*)$", range_header.strip()) if range_header else None
        if match and size > 0:
            raw_start, raw_end = match.group(1), match.group(2)
            if raw_start:
                start = int(raw_start)
                if raw_end:
                    end = min(int(raw_end), size - 1)
            elif raw_end:  # 마지막 N 바이트
                start = max(0, size - int(raw_end))
            if start > end or start >= size:
                return self._send_bytes(416, b"", "text/plain; charset=utf-8",
                                        {"Content-Range": f"bytes */{size}"})
            status = 206

        headers = {
            "Content-Disposition": content_disposition(meta.get("name", "file")),
            "Accept-Ranges": "bytes",
        }
        if status == 206:
            headers["Content-Range"] = f"bytes {start}-{end}/{size}"

        length = end - start + 1
        self.send_response(status)
        self.send_header("Content-Type", "application/octet-stream")
        self.send_header("Content-Length", str(length))
        self.send_header("Cache-Control", "no-store")
        self._security_headers()
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()

        if self.command == "HEAD":
            return None
        try:
            with blob.open("rb") as fh:
                fh.seek(start)
                remaining = length
                while remaining > 0:
                    chunk = fh.read(min(1024 * 256, remaining))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            return None
        if status == 200:
            self.store.bump_downloads(file_id)
            self.store.audit("download", self.actor(sess), self.client_ip(), meta.get("name", ""))

    def api_zip(self) -> None:
        """선택한 파일을 ZIP 으로 묶고, 내려받기용 1회성 토큰을 돌려준다."""
        sess = self.require_session()
        if not sess:
            return None
        payload = self.read_json_body() or {}
        ids = [i for i in payload.get("ids", []) if isinstance(i, str) and ID_RE.match(i)][:200]
        if not ids:
            return self._error(400, "bad_request", "선택된 파일이 없습니다.")

        token = secrets.token_hex(16)
        tmp_path = self.store.tmp / (token + ".zip")
        used_names: dict = {}
        packed = 0
        try:
            with zipfile.ZipFile(tmp_path, "w", zipfile.ZIP_DEFLATED, compresslevel=1) as zf:
                for file_id in ids:
                    meta = self.store.get_file(file_id)
                    blob = self.store.blobs / file_id
                    if not meta or not blob.exists():
                        continue
                    arcname = safe_zip_name(meta.get("folder", ""), meta.get("name", file_id))
                    count = used_names.get(arcname, 0)
                    used_names[arcname] = count + 1
                    if count:
                        stem, dot, ext = arcname.rpartition(".")
                        arcname = f"{stem} ({count}){dot}{ext}" if dot else f"{arcname} ({count})"
                    zf.write(blob, arcname)
                    self.store.bump_downloads(file_id)
                    packed += 1
        except Exception as exc:
            try:
                tmp_path.unlink()
            except OSError:
                pass
            return self._error(500, "zip_failed", str(exc))

        if not packed:
            try:
                tmp_path.unlink()
            except OSError:
                pass
            return self._error(404, "not_found", "내려받을 파일이 없습니다.")

        name = f"files-{time.strftime('%Y%m%d-%H%M')}.zip"
        ZIP_TOKENS.put(token, {"path": tmp_path, "name": name, "expires": time.time() + 300})
        self.store.audit("download_zip", self.actor(sess), self.client_ip(), f"{packed}개 파일")
        self._send_json(200, {"ok": True, "token": token, "name": name,
                              "size": tmp_path.stat().st_size, "count": packed})

    def api_zip_fetch(self, token: str) -> None:
        sess = self.require_session()
        if not sess:
            return None
        entry = ZIP_TOKENS.take(token)
        if not entry or not entry["path"].exists():
            return self._error(404, "not_found", "다운로드 링크가 만료되었습니다.")
        path = entry["path"]
        try:
            size = path.stat().st_size
            self.send_response(200)
            self.send_header("Content-Type", "application/zip")
            self.send_header("Content-Length", str(size))
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Disposition", content_disposition(entry["name"]))
            self._security_headers()
            self.end_headers()
            if self.command != "HEAD":
                with path.open("rb") as fh:
                    shutil.copyfileobj(fh, self.wfile, 1024 * 256)
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            try:
                path.unlink()
            except OSError:
                pass

    def api_file_update(self) -> None:
        sess = self.require_session(admin=True)
        if not sess:
            return None
        payload = self.read_json_body() or {}
        file_id = str(payload.get("id", ""))
        if not ID_RE.match(file_id):
            return self._error(400, "bad_request", "잘못된 파일입니다.")
        changes = {}
        if "name" in payload:
            new_name = os.path.basename(str(payload["name"])).strip()[:255]
            if not new_name:
                return self._error(400, "bad_request", "파일 이름이 비어 있습니다.")
            changes["name"] = new_name
        if "folder" in payload:
            changes["folder"] = str(payload["folder"]).strip()[:60]
        if "note" in payload:
            changes["note"] = str(payload["note"]).strip()[:300]
        meta = self.store.update_file(file_id, **changes)
        if not meta:
            return self._error(404, "not_found", "파일을 찾을 수 없습니다.")
        self.store.audit("update", self.actor(sess), self.client_ip(), meta.get("name", ""))
        self._send_json(200, {"ok": True, "file": meta})

    def api_file_delete(self) -> None:
        sess = self.require_session(admin=True)
        if not sess:
            return None
        payload = self.read_json_body() or {}
        ids = [i for i in payload.get("ids", []) if isinstance(i, str) and ID_RE.match(i)]
        removed = []
        for file_id in ids:
            meta = self.store.delete_file(file_id)
            if meta:
                removed.append(meta.get("name", ""))
        if removed:
            self.store.audit("delete", self.actor(sess), self.client_ip(), ", ".join(removed)[:300])
        self._send_json(200, {"ok": True, "deleted": len(removed)})

    # -- 관리 API -----------------------------------------------------------
    def api_password(self) -> None:
        sess = self.require_session(admin=True)
        if not sess:
            return None
        payload = self.read_json_body() or {}
        target = str(payload.get("target", ""))
        current = str(payload.get("current", ""))
        new_password = str(payload.get("new", ""))

        if target not in ("viewer", "admin"):
            return self._error(400, "bad_request", "대상을 확인해 주세요.")
        if not verify_password(current, self.store.config.get("admin_password", "")):
            return self._error(403, "wrong_current", "현재 관리자 비밀번호가 올바르지 않습니다.")
        if len(new_password) < 6:
            return self._error(400, "too_short", "새 비밀번호는 6자 이상이어야 합니다.")

        self.store.set_password(target, new_password)
        self.sessions.drop_role(target)
        self.store.audit("password_change", self.actor(sess), self.client_ip(), f"{target} 비밀번호 변경")

        headers = None
        if target == "admin":
            sid = self.sessions.create("admin", sess.get("name", ""), self.client_ip())
            max_age = max(1, int(self.store.config.get("session_hours", 12))) * 3600
            headers = {"Set-Cookie": f"{SESSION_COOKIE}={sid}; Path=/; HttpOnly; SameSite=Strict; Max-Age={max_age}"}
        self._send_json(200, {"ok": True}, headers)

    def api_settings_get(self) -> None:
        sess = self.require_session(admin=True)
        if not sess:
            return None
        config = self.store.config
        with self.store.lock:
            total_bytes = sum(int(f.get("size", 0)) for f in self.store.files)
        self._send_json(200, {
            "site_title": config.get("site_title"),
            "session_hours": int(config.get("session_hours", 12)),
            "max_upload_mb": int(config.get("max_upload_mb", 1024)),
            "viewer_can_upload": bool(config.get("viewer_can_upload")),
            "require_name": bool(config.get("require_name")),
            "data_dir": str(self.store.dir),
            "total_bytes": total_bytes,
            "file_count": len(self.store.files),
        })

    def api_settings_post(self) -> None:
        sess = self.require_session(admin=True)
        if not sess:
            return None
        payload = self.read_json_body() or {}
        config = self.store.config
        if "site_title" in payload:
            title = str(payload["site_title"]).strip()[:60]
            config["site_title"] = title or DEFAULT_CONFIG["site_title"]
        if "session_hours" in payload:
            config["session_hours"] = clamp_int(payload["session_hours"], 1, 720, 12)
        if "max_upload_mb" in payload:
            config["max_upload_mb"] = clamp_int(payload["max_upload_mb"], 1, 20480, 1024)
        if "viewer_can_upload" in payload:
            config["viewer_can_upload"] = bool(payload["viewer_can_upload"])
        if "require_name" in payload:
            config["require_name"] = bool(payload["require_name"])
        self.store.save_config()
        self.store.audit("settings", self.actor(sess), self.client_ip(), "설정 변경")
        self.api_settings_get()

    def api_audit(self, query: dict) -> None:
        sess = self.require_session(admin=True)
        if not sess:
            return None
        limit = clamp_int((query.get("limit") or ["200"])[0], 1, 1000, 200)
        self._send_json(200, {"entries": self.store.read_audit(limit)})


# --------------------------------------------------------------------------
# 도우미
# --------------------------------------------------------------------------

def clamp_int(value, low: int, high: int, fallback: int) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError):
        return fallback
    return max(low, min(high, number))


def content_disposition(filename: str) -> str:
    """RFC 6266 헤더. 한글 파일명은 filename* 로, 구형 클라이언트용 ASCII 이름도 함께 보낸다."""
    stem, dot, ext = filename.rpartition(".")
    if not dot:
        stem, ext = filename, ""
    ascii_stem = re.sub(r"_{2,}", "_", re.sub(r"[^A-Za-z0-9._-]+", "_", stem)).strip("._-")
    ascii_ext = re.sub(r"[^A-Za-z0-9]+", "", ext)[:10]
    fallback = (ascii_stem or "file") + (("." + ascii_ext) if ascii_ext else "")
    quoted = urllib.parse.quote(filename, safe="")
    return f"attachment; filename=\"{fallback}\"; filename*=UTF-8''{quoted}"


def safe_zip_name(folder: str, name: str) -> str:
    clean = lambda s: re.sub(r'[\\/:*?"<>|]', "_", (s or "").strip()).strip(". ")
    base = clean(name) or "file"
    directory = clean(folder)
    return f"{directory}/{base}" if directory else base


def local_addresses() -> list:
    addresses = set()
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.connect(("8.8.8.8", 80))
        addresses.add(sock.getsockname()[0])
        sock.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            addresses.add(info[4][0])
    except socket.gaierror:
        pass
    return sorted(a for a in addresses if not a.startswith("127."))


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def print_banner(store: Store, host: str, port: int) -> None:
    initial = getattr(store, "initial_passwords", None)
    bar = "=" * 64
    print(bar)
    print(f"  {store.config.get('site_title')} — 사내망 파일 공유 서버")
    print(bar)
    print(f"  데이터 폴더 : {store.dir}")
    print(f"  접속 주소   : http://localhost:{port}")
    for address in local_addresses():
        print(f"                http://{address}:{port}   ← 팀원에게 이 주소를 알려주세요")
    if initial:
        print("-" * 64)
        print("  최초 실행입니다. 아래 비밀번호로 로그인한 뒤 바로 변경하세요.")
        print(f"    관리자 비밀번호 : {initial['admin']}   (업로드 · 삭제 · 설정)")
        print(f"    조회용 비밀번호 : {initial['viewer']}   (팀원 열람 · 다운로드)")
        print("  이 값은 지금 한 번만 표시됩니다.")
    print(bar)
    print("  종료하려면 Ctrl+C")
    print(bar, flush=True)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="사내망 팀 자료실 서버")
    parser.add_argument("--host", default="0.0.0.0", help="바인딩 주소 (기본 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8080, help="포트 (기본 8080)")
    parser.add_argument("--data", default=str(APP_DIR / "data"), help="데이터 저장 폴더")
    parser.add_argument("--set-password", choices=["admin", "viewer"],
                        help="비밀번호를 콘솔에서 재설정하고 종료")
    args = parser.parse_args(argv)

    store = Store(Path(args.data))

    if args.set_password:
        role = args.set_password
        label = "관리자" if role == "admin" else "조회용"
        first = getpass.getpass(f"새 {label} 비밀번호: ")
        second = getpass.getpass("한 번 더 입력: ")
        if first != second:
            print("두 값이 다릅니다. 변경하지 않았습니다.")
            return 1
        if len(first) < 6:
            print("비밀번호는 6자 이상이어야 합니다.")
            return 1
        store.set_password(role, first)
        store.audit("password_change", "cli", "-", f"{role} 비밀번호 변경(콘솔)")
        print(f"{label} 비밀번호를 변경했습니다.")
        return 0

    Handler.store = store
    Handler.sessions = Sessions(lambda: store.config.get("session_hours", 12))
    Handler.guard = LoginGuard()

    httpd = ThreadingHTTPServer((args.host, args.port), Handler)
    print_banner(store, args.host, args.port)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n서버를 종료합니다.")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
