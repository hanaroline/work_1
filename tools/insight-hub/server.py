#!/usr/bin/env python3
"""인사이트룸 — 링크만 올리면 AI가 읽고 정리해 센터 전체가 함께 보는 공간.

표준 라이브러리만 씁니다(설치할 것 없음). 데이터는 저장소 밖
(`INSIGHT_DATA_DIR`, 기본 ~/.insight-hub)의 SQLite 한 파일과 첨부 폴더에 둡니다.

  글 기반(기사·PDF·스크린샷·보고서)  → Claude API   (ANTHROPIC_API_KEY)
  영상 기반(유튜브)                   → Gemini API   (GEMINI_API_KEY)

사용법
  python3 server.py invite 홍길동 --admin     # 첫 관리자 초대 코드 발급
  python3 server.py serve --port 8080         # 서버 시작
  python3 server.py serve --cert c.pem --key k.pem   # HTTPS (PWA 설치에 필요)
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import hmac
import html
import ipaddress
import json
import mimetypes
import os
import queue
import re
import secrets
import socket
import sqlite3
import ssl
import sys
import threading
import time
import traceback
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
STATIC = HERE / "static"


def _build_id() -> str:
    """화면 파일이 바뀌면 달라지는 판 번호 — 열려 있는 화면이 새 판을 알아채 스스로 새로고침하게 한다."""
    h = hashlib.sha256()
    for n in ("index.html", "v2.html", "sw.js"):
        try:
            h.update((STATIC / n).read_bytes())
        except OSError:
            pass
    return h.hexdigest()[:12]


BUILD_ID = _build_id()
DATA_DIR = Path(os.environ.get("INSIGHT_DATA_DIR", Path.home() / ".insight-hub")).expanduser()
# Vercel 등 클라우드에 올리면 데이터는 Postgres 에 둔다(주소가 환경 변수로 들어온다).
DATABASE_URL = (os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
                or os.environ.get("INSIGHT_DATABASE_URL") or "")
# 서버리스(Vercel): 요청이 끝나면 프로세스가 멈출 수 있어 뒤에서 도는 일꾼을 못 쓴다.
# 그래서 글을 올린 화면이 /api/posts/{id}/run 을 불러 그 요청 안에서 정리한다.
SERVERLESS = bool(os.environ.get("VERCEL")) or os.environ.get("INSIGHT_SERVERLESS") == "1"
# 처음 띄운 클라우드 서버에서 첫 관리자가 들어오는 길(사용자가 한 명도 없을 때만 통함).
# 값은 저장소가 아니라 Vercel 환경 변수에만 둔다.
BOOT_ADMIN = os.environ.get("INSIGHT_ADMIN_NAME", "")
BOOT_CODE = os.environ.get("INSIGHT_SETUP_CODE", "")
DB_PATH = DATA_DIR / "insight.db"
UPLOAD_DIR = DATA_DIR / "uploads"

CENTER_NAME = os.environ.get("INSIGHT_CENTER_NAME", "인사이트룸")
# 새 화면(v2)의 이름과 기본으로 보여 줄 화면. 이전 화면은 /classic 에서 언제든 열린다.
# INSIGHT_UI=classic 으로 두면 첫 화면이 예전 그대로 돌아간다.
V2_NAME = os.environ.get("INSIGHT_V2_NAME", "브리핑룸")
ASK_PER_HOUR = int(os.environ.get("INSIGHT_ASK_PER_HOUR", "20"))
UI_DEFAULT = "classic" if os.environ.get("INSIGHT_UI", "v2").strip().lower() == "classic" else "v2"
APP_NAME = V2_NAME if UI_DEFAULT == "v2" else CENTER_NAME
CLAUDE_MODEL = os.environ.get("INSIGHT_CLAUDE_MODEL", "claude-opus-5-5")
CLAUDE_EFFORT = os.environ.get("INSIGHT_CLAUDE_EFFORT", "medium")
GEMINI_MODEL = os.environ.get("INSIGHT_GEMINI_MODEL", "gemini-3.8-flash")
ANTHROPIC_VERSION = "2026-10-21"
# 회사 프록시·시험용 가짜 서버를 쓸 때만 바꾼다
ANTHROPIC_BASE = os.environ.get("ANTHROPIC_BASE_URL", "https://api.anthropic.com").rstrip("/")
GEMINI_BASE = os.environ.get("INSIGHT_GEMINI_BASE_URL", "https://generativelanguage.googleapis.com").rstrip("/")

# 한 번 들어온 기기는 쓰는 동안 계속 로그인 상태가 이어진다(쓸 때마다 기한이 다시 늘어남).
# 이 기간 동안 한 번도 열지 않은 기기만 다시 비밀번호를 묻는다.
SESSION_DAYS = max(1, int(os.environ.get("INSIGHT_SESSION_DAYS", "180")))
SESSION_RENEW_SEC = 86400            # 기한 연장은 하루에 한 번만 기록한다(매 요청마다 쓰지 않음)
# 첫 가입은 엄격하게: 초대 코드는 짧게 살고, 그 이름으로 5번 틀리면 코드가 무효가 된다.
INVITE_HOURS = max(1, int(os.environ.get("INSIGHT_INVITE_HOURS", "72")))
INVITE_MAX_FAIL = 5
# 첨부 한 건 상한. Vercel 은 요청·응답 한 번이 4.5MB 까지라, 파일은 조각(UPLOAD_CHUNK)으로 나눠
# 올리고(/api/uploads) 나눠 받는다(/api/files/<id>?part=N). base64 로 1.37배 불어나도 3.4MB 라 안에 든다.
MAX_UPLOAD = 20 * 1024 * 1024
UPLOAD_CHUNK = 2_560_000
MAX_PARTS = -(-MAX_UPLOAD // UPLOAD_CHUNK)
# Gemini 에 본문째(inline) 넣는 상한 — 요청 전체가 20MB 를 넘으면 안 되므로, 그보다 크면 Files API 로 먼저 올린다
GEMINI_INLINE_MAX = 12 * 1024 * 1024
AI_TIMEOUT_CAP = 240 if SERVERLESS else 600   # 서버리스 함수는 300초 안에 끝나야 한다
STALE_WORK_SEC = 330                          # 이보다 오래 '정리 중'이면 멈춘 것으로 보고 다시 시킨다
MAX_FETCH = 20 * 1024 * 1024         # 링크에서 받아 올 상한
MAX_TEXT_CHARS = 150_000             # AI에 넘길 본문 상한 — 넘으면 화면에 그 사실을 적는다
MIN_TEXT_CHARS = 300                 # 이보다 짧으면 "본문을 읽지 못함"으로 본다
LOGIN_MAX_FAIL = 5
LOGIN_LOCK_SEC = 15 * 60
# 계정 하나에 걸리는 전체 상한 — 여러 IP를 돌려 가며 비밀번호를 맞혀 보는 것을 막는다.
# 본인이 헷갈려 틀리는 정도(IP당 5번 차단)로는 닿지 않게 넉넉히 잡는다. 관리자가 풀 수 있다.
ACCT_MAX_FAIL = 20
ACCT_LOCK_SEC = 60 * 60
PBKDF2_ROUNDS = 310_000

CATEGORIES = ["국내주식", "해외주식", "채권·금리", "환율", "원자재", "매크로", "부동산", "상품·전략", "기타"]
SENTIMENTS = ["긍정", "중립", "부정", "혼재"]
ALLOWED_UPLOAD = {
    "application/pdf": ".pdf",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
USER_AGENT = "Mozilla/5.0 (compatible; CenterInsightBot/1.0)"


# ───────────────────────────── 저장소(SQLite) ─────────────────────────────

_db_lock = threading.RLock()
_db = None
USE_PG = bool(DATABASE_URL)

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  pw_hash TEXT,
  role TEXT NOT NULL DEFAULT 'member',          -- member | admin
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  last_login INTEGER
);
CREATE TABLE IF NOT EXISTS invites (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_by INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  fails INTEGER NOT NULL DEFAULT 0                -- 이 초대에 틀린 코드를 넣은 횟수
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS login_fail (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  first_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  url TEXT,
  kind TEXT NOT NULL,                 -- article | pdf | image | video | text
  engine TEXT NOT NULL,               -- claude | gemini
  note TEXT,
  pasted_text TEXT,
  file_name TEXT,
  file_path TEXT,
  file_type TEXT,
  source_title TEXT,
  title_edit TEXT,                    -- 관리자가 고친 제목(있으면 이것을 보인다, AI 가 다시 정리해도 남는다)
  source_site TEXT,
  source_published TEXT,
  status TEXT NOT NULL,               -- queued | working | done | failed | blocked
  status_msg TEXT,
  summary_json TEXT,
  category TEXT,
  sentiment TEXT,
  tags TEXT,                          -- ,태그,태그,
  model TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS posts_created ON posts(created_at DESC);
CREATE TABLE IF NOT EXISTS likes (
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (post_id, user_id)
);
CREATE TABLE IF NOT EXISTS post_views (    -- 누가 어느 글을 처음 열어 봤나(사람당 한 줄, 올린 본인은 넣지 않음)
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (post_id, user_id)
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS comments_post ON comments(post_id);
CREATE TABLE IF NOT EXISTS push_subs (     -- 새 글 알림을 받겠다고 한 기기(브라우저 푸시 구독 하나당 한 줄)
  endpoint TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  origin TEXT,
  created_at INTEGER NOT NULL,
  last_ok INTEGER
);
CREATE TABLE IF NOT EXISTS ai_cache (
  key TEXT PRIMARY KEY,
  sig TEXT,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
"""

# Postgres 에서는 첨부도 DB 에 둔다(서버리스엔 오래 남는 디스크가 없다)
PG_EXTRA = ["CREATE TABLE IF NOT EXISTS files (name TEXT PRIMARY KEY, data BYTEA NOT NULL)",
            "ALTER TABLE posts ADD COLUMN IF NOT EXISTS title_edit TEXT"]  # 이전 판 DB 이어 쓰기
_RETURNING_ID = re.compile(r"^\s*INSERT\s+INTO\s+(users|invites|posts|comments)\b", re.I)


def _pg_schema() -> list[str]:
    sql = re.sub(r"--[^\n]*", "", SCHEMA)
    sql = sql.replace("INTEGER PRIMARY KEY", "BIGSERIAL PRIMARY KEY").replace("INTEGER", "BIGINT")
    return [st.strip() for st in sql.split(";") if st.strip()] + PG_EXTRA


def _pg_sql(sql: str) -> str:
    # SQLite 문장을 Postgres 로: 자리표시자 ? → %s, LIKE → ILIKE(대소문자 무시는 SQLite 와 같게)
    return re.sub(r"\bLIKE\b", "ILIKE", sql).replace("?", "%s")


def _pg_connect():
    import psycopg  # 클라우드(Postgres)에서만 필요하다 — 로컬·Windows 판은 표준 라이브러리만 쓴다
    from psycopg.rows import dict_row
    # 연결 풀(pgbouncer, 거래 단위)을 거치므로 서버 쪽 준비문(prepared statement)을 쓰지 않는다
    conn = psycopg.connect(DATABASE_URL, autocommit=True, row_factory=dict_row, connect_timeout=15,
                           prepare_threshold=None)
    with conn.cursor() as cur:
        for st in _pg_schema():
            cur.execute(st)
    return conn


def db():
    global _db
    if _db is None:
        if USE_PG:
            _db = _pg_connect()
            return _db
        if SERVERLESS:  # 서버리스 디스크는 요청이 끝나면 사라진다 — 거기에 SQLite 를 두지 않는다
            raise HTTPError_(503, "데이터베이스가 아직 연결되지 않았습니다. Vercel 의 Storage 에서 Postgres(Neon)를 "
                                  "이 프로젝트에 연결한 뒤 다시 배포하세요.")
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        try:
            os.chmod(DATA_DIR, 0o700)
        except OSError:
            pass
        conn = sqlite3.connect(DB_PATH, check_same_thread=False, isolation_level=None)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        conn.executescript(SCHEMA)
        cols = {r[1] for r in conn.execute("PRAGMA table_info(invites)")}
        if "fails" not in cols:  # 이전 판 DB 이어 쓰기
            conn.execute("ALTER TABLE invites ADD COLUMN fails INTEGER NOT NULL DEFAULT 0")
        if "title_edit" not in {r[1] for r in conn.execute("PRAGMA table_info(posts)")}:
            conn.execute("ALTER TABLE posts ADD COLUMN title_edit TEXT")
        _db = conn
    return _db


def _run(sql: str, args, fetch: str):
    """한 문장을 실행한다. fetch: rows | id | count."""
    global _db
    with _db_lock:
        if not USE_PG:
            cur = db().execute(sql, args)
            return cur.fetchall() if fetch == "rows" else (cur.lastrowid if fetch == "id" else cur.rowcount)
        psql = _pg_sql(sql)
        if fetch == "id" and _RETURNING_ID.match(sql):
            psql += " RETURNING id"
        for attempt in (0, 1):
            try:
                with db().cursor() as cur:
                    cur.execute(psql, tuple(args))
                    if fetch == "rows":
                        return cur.fetchall() if cur.description else []
                    if fetch == "id":
                        r = cur.fetchone() if cur.description else None
                        return r["id"] if r else None
                    return cur.rowcount
            except Exception as e:
                # 서버리스가 쉬는 동안 DB 연결이 끊겼으면 한 번 다시 잇는다
                import psycopg
                if attempt or not isinstance(e, (psycopg.OperationalError, psycopg.InterfaceError)):
                    raise
                try:
                    _db.close()
                except Exception:
                    pass
                _db = None


def q(sql: str, args=(), one=False):
    rows = _run(sql, args, "rows")
    return (rows[0] if rows else None) if one else rows


def x(sql: str, args=()) -> int:
    return _run(sql, args, "id")


def xn(sql: str, args=()) -> int:
    """바뀐 줄 수를 돌려준다."""
    return _run(sql, args, "count")


# ── 첨부 보관: 로컬은 폴더, Postgres 는 files 표 ──
def blob_put(name: str, data: bytes) -> None:
    if USE_PG:
        x("INSERT INTO files(name, data) VALUES (?,?)", (name, data))
    else:
        (UPLOAD_DIR / name).write_bytes(data)


def blob_get(name: str) -> bytes:
    if USE_PG:
        r = q("SELECT data FROM files WHERE name=?", (name,), one=True)
        if not r:
            raise FileNotFoundError(name)
        return bytes(r["data"])
    return (UPLOAD_DIR / name).read_bytes()


def blob_slice(name: str, start: int, n: int) -> tuple[bytes, int]:
    """첨부의 start 부터 n 바이트와 전체 크기 — 큰 파일을 조각으로 내려보낼 때 쓴다."""
    if USE_PG:
        r = q("SELECT substring(data from ? for ?) AS d, octet_length(data) AS n FROM files WHERE name=?",
              (start + 1, n, name), one=True)
        if not r:
            raise FileNotFoundError(name)
        return bytes(r["d"]), int(r["n"])
    path = UPLOAD_DIR / name
    with open(path, "rb") as fh:
        fh.seek(start)
        return fh.read(n), path.stat().st_size


def blob_names(prefix: str) -> list[str]:
    if USE_PG:
        return [r["name"] for r in q("SELECT name FROM files WHERE name LIKE ?", (prefix + "%",))]
    return [f.name for f in UPLOAD_DIR.glob(prefix + "*")]


DB_LIMIT_MB = int(os.environ.get("INSIGHT_DB_LIMIT_MB", "1024"))  # 화면에 비교해 보일 한도(Neon 무료 요금제: 2026-10 부터 프로젝트당 1GB)


def storage_usage() -> dict:
    """관리 화면용 저장 공간 사용량. 첨부·글·전체를 바이트로 돌려준다."""
    posts = q("SELECT COUNT(*) AS n, COALESCE(SUM(LENGTH(COALESCE(pasted_text,''))+LENGTH(COALESCE(summary_json,''))),0) AS b FROM posts", one=True)
    if USE_PG:
        f = q("SELECT COUNT(*) AS n, COALESCE(SUM(octet_length(data)),0) AS b FROM files WHERE name NOT LIKE ?", ("up-%",), one=True)
        total = q("SELECT pg_database_size(current_database()) AS b", one=True)["b"]
        files_n, files_b = f["n"], f["b"]
    else:
        fs = [p for p in UPLOAD_DIR.iterdir() if p.is_file() and not p.name.startswith("up-")] if UPLOAD_DIR.exists() else []
        files_n, files_b = len(fs), sum(p.stat().st_size for p in fs)
        total = files_b + (DB_PATH.stat().st_size if DB_PATH.exists() else 0)
    return {"total": int(total), "files": int(files_b), "files_n": int(files_n), "posts": int(posts["b"]),
            "posts_n": int(posts["n"]), "limit": DB_LIMIT_MB * 1024 * 1024, "pg": USE_PG}


def upload_gc() -> None:
    """하루 넘게 묶이지 않은 올림 조각(up-<사용자>-<시각>-…)을 치운다."""
    cut = now() - 86400
    for nm in blob_names("up-"):
        m = re.match(r"up-\d+-(\d+)-", nm)
        if m and int(m.group(1)) < cut:
            blob_del(nm)


def blob_del(name: str) -> None:
    if USE_PG:
        x("DELETE FROM files WHERE name=?", (name,))
    else:
        try:
            (UPLOAD_DIR / name).unlink()
        except FileNotFoundError:
            pass


def now() -> int:
    return int(time.time())


# ───────────────────────────── 인증 ─────────────────────────────

def hash_pw(pw: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, PBKDF2_ROUNDS)
    return f"pbkdf2${PBKDF2_ROUNDS}${salt.hex()}${dk.hex()}"


def check_pw(pw: str, stored: str | None) -> bool:
    if not stored:
        return False
    try:
        _, rounds, salt, dk = stored.split("$")
        got = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), int(rounds))
        return hmac.compare_digest(got.hex(), dk)
    except ValueError:
        return False


def sha(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


def norm_name(name: str) -> str:
    return re.sub(r"\s+", "", (name or "")).strip()


def new_invite(name: str, role: str = "member", created_by: int | None = None) -> str:
    """초대 코드를 만들고 평문을 한 번만 돌려준다. DB엔 해시만 남는다."""
    name = norm_name(name)
    if not name:
        raise ValueError("이름이 비었습니다")
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # 헷갈리는 0/O/1/I 제외
    code = "".join(secrets.choice(alphabet) for _ in range(8))
    # 같은 이름의 쓰지 않은 옛 코드는 무효로 한다
    x("UPDATE invites SET used_at=? WHERE name=? AND used_at IS NULL", (now(), name))
    x(
        "INSERT INTO invites(name, code_hash, role, created_by, created_at, expires_at) VALUES (?,?,?,?,?,?)",
        (name, sha(code), role, created_by, now(), now() + INVITE_HOURS * 3600),
    )
    return code


def bootstrap_invite(name: str) -> None:
    """클라우드에 처음 올린 뒤 첫 관리자가 들어오는 길.

    INSIGHT_ADMIN_NAME·INSIGHT_SETUP_CODE 환경 변수가 있고 사용자가 아직 한 명도 없을 때만,
    그 이름으로 관리자 초대를 하나 만들어 둔다(코드는 환경 변수 값). 그 뒤 확인은 보통 초대와 같다 —
    틀린 횟수 제한·IP 잠금도 그대로 걸린다. 누군가 한 명이라도 가입하면 이 길은 닫힌다.
    """
    code = re.sub(r"[\s-]", "", BOOT_CODE).upper()
    if not BOOT_ADMIN or len(code) < 8 or norm_name(BOOT_ADMIN) != name:
        return
    if q("SELECT 1 FROM users LIMIT 1", one=True):
        return
    if q("SELECT 1 FROM invites WHERE name=? AND ((used_at IS NULL AND expires_at>?) OR fails>=?)",
         (name, now(), INVITE_MAX_FAIL), one=True):
        return  # 이미 만들어 둔 것이 있거나, 틀린 횟수로 막혔다(막힌 뒤엔 다시 만들지 않는다)
    t = now()
    x("INSERT INTO invites(name, code_hash, role, created_by, created_at, expires_at) VALUES (?,?,?,?,?,?)",
      (name, sha(code), "admin", None, t, t + INVITE_HOURS * 3600))


def invite_label() -> str:
    return f"{INVITE_HOURS // 24}일" if INVITE_HOURS % 24 == 0 else f"{INVITE_HOURS}시간"


WEAK_PASSWORDS = {"password", "password1", "qwer1234", "qwerty123", "abcd1234", "asdf1234", "1q2w3e4r",
                  "1q2w3e4r5t", "a1234567", "a12345678", "zxcv1234", "test1234", "admin123", "miraeasset1"}


def password_problem(pw: str, name: str) -> str | None:
    """비밀번호 규칙: 8자 이상, 영문과 숫자를 모두, 이름이 들어가지 않게, 흔한 것은 거절."""
    if len(pw) < 8:
        return "비밀번호는 8자 이상이어야 합니다"
    if len(pw) > 128:
        return "비밀번호가 너무 깁니다"
    if not re.search(r"[A-Za-z]", pw) or not re.search(r"[0-9]", pw):
        return "비밀번호에 영문과 숫자를 모두 넣어 주세요"
    if name and name.lower() in pw.lower():
        return "비밀번호에 이름을 넣을 수 없습니다"
    if pw.lower() in WEAK_PASSWORDS or len(set(pw)) < 4:
        return "너무 흔하거나 단순한 비밀번호입니다"
    return None


def login_blocked(key: str, limit: int = LOGIN_MAX_FAIL, window: int = LOGIN_LOCK_SEC) -> bool:
    row = q("SELECT count, first_at FROM login_fail WHERE key=?", (key,), one=True)
    if not row:
        return False
    if now() - row["first_at"] > window:
        x("DELETE FROM login_fail WHERE key=?", (key,))
        return False
    return row["count"] >= limit


def acct_key(name: str) -> str:
    return f"acct|{name}"


def acct_locked(name: str) -> bool:
    return login_blocked(acct_key(name), ACCT_MAX_FAIL, ACCT_LOCK_SEC)


def acct_unlock(name: str) -> None:
    """계정 잠금과, 그 이름에 걸린 IP별 차단을 모두 푼다."""
    x("DELETE FROM login_fail WHERE key=? OR substr(key, 1, ?)=?", (acct_key(name), len(name) + 1, name + "|"))


def login_failed(key: str, window: int = LOGIN_LOCK_SEC) -> None:
    row = q("SELECT count, first_at FROM login_fail WHERE key=?", (key,), one=True)
    if row and now() - row["first_at"] <= window:
        x("UPDATE login_fail SET count=count+1 WHERE key=?", (key,))
    else:
        x("INSERT INTO login_fail(key, count, first_at) VALUES (?,?,?) "
          "ON CONFLICT(key) DO UPDATE SET count=excluded.count, first_at=excluded.first_at", (key, 1, now()))


def new_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    x(
        "INSERT INTO sessions(token_hash, user_id, created_at, expires_at) VALUES (?,?,?,?)",
        (sha(token), user_id, now(), now() + SESSION_DAYS * 86400),
    )
    x("UPDATE users SET last_login=? WHERE id=?", (now(), user_id))
    return token


# ───────────────────────────── 링크 읽기 ─────────────────────────────

class BlockedURL(Exception):
    pass


def looks_like_url(s: str) -> bool:
    """링크 칸에 든 것이 주소인가. 띄어쓰기가 있거나 점 있는 호스트가 없으면 주소가 아니다."""
    if re.search(r"\s", s):
        return False
    t = s if re.match(r"^https?://", s, re.I) else "https://" + s
    try:
        host = urllib.parse.urlsplit(t).hostname or ""
    except ValueError:
        return False
    return "." in host and bool(re.fullmatch(r"[\w.-]+", host))


def check_public_url(url: str) -> urllib.parse.SplitResult:
    """내부망 주소를 읽어 오는 일(SSRF)을 막는다. 공인 주소만 허용."""
    parts = urllib.parse.urlsplit(url)
    if parts.scheme not in ("http", "https") or not parts.hostname:
        raise BlockedURL("http(s) 주소만 올릴 수 있습니다")
    host = parts.hostname
    if host.endswith(".translate.goog"):
        raise BlockedURL("번역 프록시 주소(translate.goog)는 회사 망에서 막혀 있습니다 — 원문 주소를 올려 주세요")
    try:
        infos = socket.getaddrinfo(host, parts.port or (443 if parts.scheme == "https" else 80))
    except (UnicodeError, ValueError):
        raise BlockedURL("주소 형식이 올바르지 않습니다 — 링크 칸에는 주소만 넣어 주세요")
    except socket.gaierror:
        # 프록시 뒤라 직접 이름풀이가 안 되는 환경: IP 문자열만 걸러 낸다
        try:
            ip = ipaddress.ip_address(host)
        except ValueError:
            if host in ("localhost",) or host.endswith((".local", ".internal", ".lan")):
                raise BlockedURL("내부망 주소는 읽지 않습니다")
            return parts
        if not ip.is_global:
            raise BlockedURL("내부망 주소는 읽지 않습니다")
        return parts
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if not ip.is_global:
            raise BlockedURL("내부망 주소는 읽지 않습니다")
    return parts


class _SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        check_public_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


_opener = urllib.request.build_opener(_SafeRedirect())


def fetch(url: str, timeout: int = 25) -> tuple[bytes, str, str]:
    """(본문, content-type, 최종 주소)."""
    check_public_url(url)
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.7",
    })
    with _opener.open(req, timeout=timeout) as resp:
        ctype = resp.headers.get("Content-Type", "")
        data = resp.read(MAX_FETCH + 1)
        if len(data) > MAX_FETCH:
            raise ValueError("파일이 20MB를 넘어 읽지 않았습니다")
        return data, ctype, resp.geturl()


def decode_html(data: bytes, ctype: str) -> str:
    m = re.search(r"charset=([\w-]+)", ctype, re.I)
    enc = m.group(1) if m else None
    if not enc:
        m = re.search(rb"<meta[^>]+charset=[\"']?([\w-]+)", data[:4000], re.I)
        enc = m.group(1).decode("ascii", "ignore") if m else "utf-8"
    enc = {"ks_c_5601-1987": "cp949", "euc-kr": "cp949", "x-windows-949": "cp949"}.get(enc.lower(), enc)
    try:
        return data.decode(enc, errors="replace")
    except LookupError:
        return data.decode("utf-8", errors="replace")


class _Extractor(HTMLParser):
    SKIP = {"script", "style", "noscript", "nav", "footer", "header", "aside", "form", "svg", "iframe", "button", "select"}
    BLOCK = {"p", "div", "br", "li", "h1", "h2", "h3", "h4", "h5", "tr", "section", "article", "table", "blockquote"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta: dict[str, str] = {}
        self.title = ""
        self._in_title = False
        self._skip = 0
        self._article = 0
        self.all: list[str] = []
        self.art: list[str] = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta":
            key = (a.get("property") or a.get("name") or "").lower()
            if key and a.get("content"):
                self.meta.setdefault(key, a["content"].strip())
        elif tag == "title":
            self._in_title = True
        if tag in self.SKIP:
            self._skip += 1
        if tag == "article":
            self._article += 1
        if tag in self.BLOCK:
            self._push("\n")

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag in self.SKIP and self._skip:
            self._skip -= 1
        if tag == "article" and self._article:
            self._article -= 1
        if tag in self.BLOCK:
            self._push("\n")

    def _push(self, s):
        self.all.append(s)
        if self._article:
            self.art.append(s)

    def handle_data(self, data):
        if self._in_title:
            self.title += data
            return
        if self._skip:
            return
        self._push(data)


def clean_text(chunks: list[str]) -> str:
    text = "".join(chunks)
    lines = [re.sub(r"[ \t ]+", " ", ln).strip() for ln in text.splitlines()]
    out, prev = [], None
    for ln in lines:
        if ln and ln != prev:
            out.append(ln)
        prev = ln
    return "\n".join(out)


def extract_article(html_text: str) -> dict:
    p = _Extractor()
    try:
        p.feed(html_text)
    except Exception:  # 깨진 HTML이어도 모은 데까지는 쓴다
        pass
    art = clean_text(p.art)
    body = art if len(art) >= MIN_TEXT_CHARS else clean_text(p.all)
    # 메뉴 조각처럼 짧은 줄만 잔뜩 있는 경우를 걸러, 문장다운 줄만 남긴다
    lines = [ln for ln in body.splitlines() if len(ln) >= 25 or re.search(r"[.。!?다요]$", ln)]
    body = "\n".join(lines)
    m = p.meta
    return {
        "title": html.unescape(m.get("og:title") or p.title or "").strip()[:300],
        "site": (m.get("og:site_name") or "").strip()[:100],
        "published": (m.get("article:published_time") or m.get("og:article:published_time")
                      or m.get("pubdate") or m.get("date") or "").strip()[:40],
        "description": (m.get("og:description") or m.get("description") or "").strip()[:1000],
        "text": body,
    }


YT_RE = re.compile(
    r"^(?:https?://)?(?:www\.|m\.|music\.)?(?:youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|live/|embed/)|youtu\.be/)([\w-]{11})"
)
VIDEO_HOSTS = ("youtube.com", "youtu.be")


def youtube_id(url: str) -> str | None:
    m = YT_RE.match(url.strip())
    return m.group(1) if m else None


def youtube_title(vid: str) -> tuple[str, str]:
    try:
        data, _, _ = fetch("https://www.youtube.com/oembed?format=json&url="
                           + urllib.parse.quote(f"https://www.youtube.com/watch?v={vid}", safe=""), timeout=10)
        j = json.loads(data)
        return j.get("title", ""), j.get("author_name", "")
    except Exception:
        return "", ""


# ───────────────────────────── AI 정리 ─────────────────────────────

SUMMARY_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["readable", "title", "one_line", "key_points", "implications", "related",
                 "figures", "risks", "category", "sentiment", "tags", "unverified",
                 "client_talk", "counterpoint"],
    "properties": {
        "readable": {"type": "boolean", "description": "자료 본문을 실제로 읽고 정리할 수 있었는가"},
        "title": {"type": "string"},
        "one_line": {"type": "string"},
        "key_points": {"type": "array", "items": {
            "type": "object", "additionalProperties": False, "required": ["point", "at"],
            "properties": {"point": {"type": "string"},
                           "at": {"type": "string", "description": "영상이면 mm:ss, 문서면 쪽 번호, 없으면 빈 문자열"}}}},
        "implications": {"type": "array", "items": {"type": "string"}},
        "related": {"type": "array", "items": {
            "type": "object", "additionalProperties": False, "required": ["name", "kind", "code"],
            "properties": {"name": {"type": "string"},
                           "kind": {"type": "string", "enum": ["종목", "산업", "ETF", "지표", "국가", "기타"]},
                           "code": {"type": "string", "description": "자료에 적힌 종목코드·티커. 없으면 빈 문자열"}}}},
        "figures": {"type": "array", "items": {
            "type": "object", "additionalProperties": False, "required": ["label", "value", "as_of"],
            "properties": {"label": {"type": "string"}, "value": {"type": "string"},
                           "as_of": {"type": "string", "description": "자료에 적힌 기준 시점. 없으면 빈 문자열"}}}},
        "risks": {"type": "array", "items": {"type": "string"}},
        "category": {"type": "string", "enum": CATEGORIES},
        "sentiment": {"type": "string", "enum": SENTIMENTS},
        "tags": {"type": "array", "items": {"type": "string"}},
        "unverified": {"type": "array", "items": {"type": "string"},
                       "description": "자료 안에서 근거가 약하거나 출처가 밝혀지지 않은 주장"},
        "client_talk": {"type": "string", "description": "고객에게 이 자료를 소개할 때 쓸 2~3문장. 자료의 주장으로서 전한다"},
        "counterpoint": {"type": "array", "items": {"type": "string"},
                         "description": "자료 안에서 찾은 반대 근거·전제 조건·논리의 빈틈"}},
}

SYSTEM_PROMPT = f"""당신은 증권사 WM 센터의 리서치 보조입니다. 직원이 올린 자료(기사·보고서·PDF·스크린샷·영상)를
센터 직원들이 고객 상담 전에 빠르게 훑어볼 수 있도록 정리합니다.

반드시 지킬 것:
- 자료에 실제로 있는 내용만 씁니다. 당신이 알고 있는 바깥 지식, 최신 시세, 추정치를 덧붙이지 않습니다.
- 숫자·날짜·종목명은 자료에 적힌 그대로 옮깁니다. 반올림하거나 환산하지 않습니다. 자료에 기준 시점이 없으면 as_of 는 빈 문자열입니다.
- 자료에 없는 항목은 빈 배열로 둡니다. 채우려고 지어내지 않습니다. 틀린 값보다 빈칸이 낫습니다.
- 본문을 읽을 수 없거나(로그인 벽, 빈 페이지, 오류 화면) 투자와 무관한 자료라면 readable 을 false 로 하고 one_line 에 그 이유를 적습니다.
- 매수·매도 권유 문장을 쓰지 않습니다. implications 에는 "자료가 말하는 시사점"을 자료의 주장으로서 적습니다(예: "필자는 ~로 본다").
- 의견과 사실을 구분합니다. 근거가 약한 주장, 출처 없는 루머는 unverified 에 적습니다.
- 한국어로, 짧고 단정한 문장으로 씁니다. 직원이 1분 안에 읽을 분량이 목표입니다.
- 자료가 영어·일본어·중국어 등 외국어여도 모든 항목(title 포함)을 한국어로 씁니다. 외국 회사·인물·기관 이름은 한글로 쓰되 처음 한 번은 원어를 괄호에 붙입니다(예: 엔비디아(NVIDIA)). 숫자와 통화 단위($, ¥, €)는 원문 그대로 두고 원화로 바꾸지 않습니다.
- 개수 상한: key_points 3~5개, implications 1~3개, figures 최대 5개, risks 최대 3개, unverified 최대 3개, related 최대 8개, tags 3~6개(종목명·테마·지표 위주, '#' 없이).
- figures 에는 자료의 핵심 주장을 뒷받침하는 숫자만 고릅니다. 곁가지 숫자, 같은 뜻을 되풀이하는 숫자는 넣지 않습니다. 기간·시점은 as_of 에만 쓰고 label 에 되풀이하지 않습니다.
- 상한을 채우려고 억지로 늘리지 않습니다. 중요한 것이 적으면 적게 씁니다.
- category 는 다음 중 하나: {", ".join(CATEGORIES)}.
- client_talk: 직원이 고객에게 이 자료를 소개할 때 그대로 읽을 수 있는 2~3문장의 존댓말. 반드시 자료의 주장으로서 전합니다(예: "~라는 분석이 나왔습니다", "~로 본다는 의견입니다"). "오를 것입니다" 같은 단정, "사시는 게 좋습니다" 같은 권유, 수익 보장 표현은 쓰지 않습니다. readable 이 false 면 빈 문자열입니다.
- counterpoint: 자료를 다르게 볼 수 있는 점 최대 3개 — 자료 안에 있는 반대 근거, 주장이 성립하려면 필요한 전제·조건, 논리의 빈틈. 자료 밖의 사실이나 시세를 끌어오지 않습니다. 찾을 것이 없으면 빈 배열입니다.
"""

JSON_INSTRUCTION = "\n\n다음 JSON 스키마에 맞춘 JSON 객체 하나만 출력하십시오. 앞뒤 설명이나 코드펜스를 붙이지 마십시오.\n" + json.dumps(SUMMARY_SCHEMA, ensure_ascii=False)


class AIError(Exception):
    pass


# 글 하나를 정리하는 데 쓸 수 있는 시간. 서버리스 함수는 300초에 끊기므로 그 안에서 끝낸다.
RUN_BUDGET_SEC = 280 if SERVERLESS else 900
AI_ATTEMPT_SEC = 150 if SERVERLESS else 600    # 한 번 부를 때 기다리는 최대 시간 — 넘으면 끊고 다시 부른다
_run_ctx = threading.local()


QUOTA_TAG = "QUOTA:"   # 하루 한도 소진 — AIError 메시지 머리말
QUOTA_PROBE_SEC = 600   # 한도가 막힌 동안에도 이 간격마다 한 번은 실제로 불러 본다


def _quota_key(url: str) -> str:
    return "aiquota:" + urllib.parse.urlsplit(url).netloc


def _retry_after(detail: str) -> int:
    """구글 429 본문의 'retry in 1h3m12.2s' / retryDelay '3792s' 를 초로."""
    m = re.search(r"retry in ((?:\d+h)?(?:\d+m)?(?:[\d.]+s)?)", detail)
    if m and m.group(1):
        t = m.group(1)
        sec = sum(float(v or 0) * k for v, k in zip(re.match(r"(?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?", t).groups(), (3600, 60, 1)))
        if sec > 0:
            return int(sec) + 30
    m = re.search(r'"retryDelay":\s*"(\d+)s"', detail)
    return int(m.group(1)) + 30 if m else 3600


QUOTA_MSG_HEAD = "오늘 쓸 수 있는 AI 무료 사용량"   # 이 머리말로 시작하는 실패 글은 한도가 풀리면 저절로 다시 돈다
AUTO_RETRY_DAYS = 3        # 이보다 오래된 실패 글은 저절로 다시 돌리지 않는다
AUTO_RETRY_BATCH = 10      # 한 번 훑을 때 다시 줄 세우는 글 수 — 풀리자마자 한도를 몰아 쓰지 않게


def quota_message(err: str, auto: bool = False) -> str:
    """'QUOTA:<until>:<limit>' → 직원이 읽을 안내. auto=True 는 자료 정리 실패용(저절로 다시 돈다)."""
    try:
        _, until, limit = err.split(":", 2)
        until = int(until)
        at = time.strftime("%H:%M", time.gmtime(until + KST))
        lim = f"(하루 {limit}회)" if limit.isdigit() else ""
    except ValueError:
        at, lim = "몇 시간 뒤", ""
    if auto:
        return (f"{QUOTA_MSG_HEAD}{lim}을 다 썼습니다. {at}쯤 한도가 풀리면 저절로 다시 정리합니다 — "
                "누르지 않으셔도 됩니다. 자주 막히면 관리자에게 알려 주세요.")
    return (f"{QUOTA_MSG_HEAD}{lim}을 다 썼습니다. {at}쯤부터 다시 됩니다 — "
            "그때 「다시 시도」를 눌러 주세요. 자주 막히면 관리자에게 알려 주세요.")


def ai_error_text(e: Exception, auto: bool = False) -> str:
    m = str(e)
    return quota_message(m, auto) if m.startswith(QUOTA_TAG) else ""


def requeue_quota_failures() -> int:
    """하루 한도가 풀린 뒤, 한도 때문에 실패한 글을 다시 줄 세운다(화면이 목록을 불러올 때 함께 돈다).
    한도가 풀리는 시각(until) 전에 실패한 글만 고른다 — 풀린 뒤 또 막힌 글은 새 until 이 지나야 다시 돈다."""
    try:
        qc = cache_get(_quota_key(GEMINI_BASE))
        if not qc:
            return 0
        until = int(json.loads(qc["body"]).get("until", 0))
        if not until or until > now():
            return 0
        rows = q("SELECT id FROM posts WHERE status='failed' AND status_msg LIKE ? AND updated_at<? AND updated_at>? "
                 "ORDER BY id LIMIT ?", (QUOTA_MSG_HEAD + "%", until, now() - AUTO_RETRY_DAYS * 86400, AUTO_RETRY_BATCH))
        if not rows or not lock_take("autoretry", 30):
            return 0
        n = 0
        # 서버리스에선 화면이 20초 넘게 대기 중인 글을 /run 으로 부른다 — 곧바로 불리게 시각을 앞당겨 둔다
        t = now() - (30 if SERVERLESS else 0)
        for r in rows:
            if xn("UPDATE posts SET status='queued', status_msg='한도가 풀려 다시 정리합니다', updated_at=? "
                  "WHERE id=? AND status='failed'", (t, r["id"])) == 1:
                enqueue(r["id"])
                n += 1
        if n:
            print(f"[autoretry] 한도 풀림 — {n}건 다시 줄 세움", file=sys.stderr)
        return n
    except Exception:
        traceback.print_exc()
        return 0


def _post_json(url: str, headers: dict, body: dict, timeout: int = 300) -> dict:
    # 하루 한도를 다 쓴 상태면 구글을 부르지 않는다 — 부를수록 실패만 쌓인다.
    try:
        qc = cache_get(_quota_key(url))
    except Exception:
        qc = None
    probing = False
    if qc:
        b = json.loads(qc["body"])
        if b.get("until", 0) > now():
            # 막힌 뒤 10분마다 한 번은 실제로 불러 본다 — 유료로 바꿨거나 한도가 올라갔으면 바로 풀리게
            if now() - qc["created_at"] < QUOTA_PROBE_SEC:
                raise AIError(f"{QUOTA_TAG}{b['until']}:{b.get('limit', '')}")
            probing = True
            try:
                cache_put(_quota_key(url), "", b)   # 시각만 새로 — 동시에 여럿이 떠보지 않게
            except Exception:
                pass
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                                 headers={"content-type": "application/json", **headers})
    deadline = getattr(_run_ctx, "deadline", None) or time.time() + RUN_BUDGET_SEC
    # 429(한도)·5xx(과부하)·응답 없음은 다시 부르면 대개 된다 — 남은 시간 안에서 두 번까지 다시 부른다.
    # 한 번에 오래 매달리지 않게 시도마다 상한(AI_ATTEMPT_SEC)을 둔다: 응답 없이 멈춘 요청 하나가
    # 함수 시간을 다 써 버리던 일(240초 대기 후 실패)을 막는다.
    for attempt, wait in enumerate((2, 5, None)):
        t0 = time.time()
        left = deadline - t0
        if left < 25:
            raise AIError("시간 초과: AI가 정해진 시간 안에 답하지 않았습니다")
        per_try = max(20, min(timeout, AI_TIMEOUT_CAP, AI_ATTEMPT_SEC if attempt == 0 else left, left - 3))
        try:
            with urllib.request.urlopen(req, timeout=per_try) as resp:
                out = json.loads(resp.read())
            print(f"[ai] {url.rsplit('/', 1)[-1]} {time.time() - t0:.1f}s (시도 {attempt + 1})", file=sys.stderr)
            if probing:
                # 한도가 풀렸다: 막힌 기록을 '이미 풀림'으로 바꿔 두면 한도로 실패한 글이 저절로 다시 돈다
                print("[ai] 한도 풀림 확인 — 막힘 기록 해제", file=sys.stderr)
                try:
                    cache_put(_quota_key(url), "", {"until": now() - 1, "limit": b.get("limit", "")})
                except Exception:
                    pass
            return out
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:3000]
            print(f"[ai] HTTP {e.code} {time.time() - t0:.1f}s (시도 {attempt + 1}): {detail[:200]}", file=sys.stderr)
            if e.code == 429 and re.search(r"per ?day|PerDay", detail):
                # 하루 한도 소진: 다시 불러도 소용없다. 풀릴 때까지 모두 멈춘다.
                until = now() + _retry_after(detail)
                lm = re.search(r"limit: (\d+)", detail)
                try:
                    cache_put(_quota_key(url), "", {"until": until, "limit": lm.group(1) if lm else ""})
                except Exception:
                    pass
                raise AIError(f"{QUOTA_TAG}{until}:{lm.group(1) if lm else ''}") from None
            if e.code in (429, 500, 502, 503, 504) and wait is not None:
                time.sleep(wait)
                continue
            raise AIError(f"HTTP {e.code}: {detail}") from None
        except (urllib.error.URLError, TimeoutError, socket.timeout) as e:
            print(f"[ai] 연결 실패 {time.time() - t0:.1f}s (시도 {attempt + 1}): {e}", file=sys.stderr)
            timed_out = isinstance(e, (TimeoutError, socket.timeout)) or "timed out" in str(e)
            if timed_out and wait is not None and deadline - time.time() > 40:
                continue
            if timed_out:
                raise AIError("시간 초과: AI가 정해진 시간 안에 답하지 않았습니다") from None
            raise AIError(f"연결 실패: {e}") from None


def gemini_upload(raw: bytes, mime: str, key: str) -> str:
    """Gemini Files API(재개형 올리기)로 파일을 올리고 file_uri 를 돌려준다. 파일은 48시간 뒤 저절로 지워진다."""
    def call(req, timeout):
        try:
            with urllib.request.urlopen(req, timeout=min(timeout, AI_TIMEOUT_CAP)) as resp:
                return resp.headers, json.loads(resp.read() or b"{}")
        except urllib.error.HTTPError as e:
            raise AIError(f"HTTP {e.code}: 파일 올리기 실패 {e.read().decode('utf-8', 'replace')[:300]}") from None
        except (urllib.error.URLError, TimeoutError, socket.timeout) as e:
            raise AIError(f"연결 실패(파일 올리기): {e}") from None
    hdrs, _ = call(urllib.request.Request(
        f"{GEMINI_BASE}/upload/v1beta/files", method="POST",
        data=json.dumps({"file": {"display_name": "insight-upload"}}).encode(),
        headers={"x-goog-api-key": key, "content-type": "application/json",
                 "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start",
                 "X-Goog-Upload-Header-Content-Length": str(len(raw)),
                 "X-Goog-Upload-Header-Content-Type": mime}), 60)
    up = hdrs.get("X-Goog-Upload-URL")
    if not up:
        raise AIError("Gemini 가 파일 올릴 주소를 주지 않았습니다")
    _, info = call(urllib.request.Request(up, data=raw, method="POST", headers={
        "x-goog-api-key": key, "Content-Length": str(len(raw)),
        "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize"}), 180)
    f = info.get("file") or {}
    t0 = time.time()
    while f.get("state") == "PROCESSING" and time.time() - t0 < 90:
        time.sleep(3)
        _, f = call(urllib.request.Request(f"{GEMINI_BASE}/v1beta/{f['name']}", headers={"x-goog-api-key": key}), 30)
    if f.get("state") not in (None, "ACTIVE") or not f.get("uri"):
        raise AIError(f"Gemini 가 파일을 받지 못했습니다({f.get('state') or '주소 없음'})")
    return f["uri"]


def call_claude(content: list[dict]) -> tuple[dict, str]:
    """Claude Messages API(raw HTTP — 저장소 규칙상 외부 패키지를 쓰지 않는다)."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise AIError("ANTHROPIC_API_KEY 가 설정되지 않았습니다")
    body = {
        "model": CLAUDE_MODEL,
        "max_tokens": 16000,
        "system": SYSTEM_PROMPT,
        "output_config": {"effort": CLAUDE_EFFORT,
                          "format": {"type": "json_schema", "schema": SUMMARY_SCHEMA}},
        "fallbacks": "default",  # 안전 분류기가 거절하면 서버가 대체 모델로 다시 돌린다
        "messages": [{"role": "user", "content": content}],
    }
    headers = {"x-api-key": key, "anthropic-version": ANTHROPIC_VERSION,
               "anthropic-beta": "server-side-fallback-2026-07-01"}
    try:
        resp = _post_json(f"{ANTHROPIC_BASE}/v1/messages", headers, body)
    except AIError as e:
        if "HTTP 400" in str(e) and "fallback" in str(e).lower():
            body.pop("fallbacks")
            headers.pop("anthropic-beta")
            resp = _post_json(f"{ANTHROPIC_BASE}/v1/messages", headers, body)
        else:
            raise
    if resp.get("stop_reason") == "refusal":
        raise AIError("모델이 이 자료의 정리를 거절했습니다")
    if resp.get("stop_reason") == "max_tokens":
        raise AIError("응답이 길이 상한에서 잘렸습니다")
    text = "".join(b.get("text", "") for b in resp.get("content", []) if b.get("type") == "text")
    return parse_json(text), resp.get("model", CLAUDE_MODEL)


def call_gemini(video_url: str, note: str) -> tuple[dict, str]:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise AIError("GEMINI_API_KEY 가 설정되지 않았습니다 — 영상 정리는 Gemini 키가 있어야 합니다")
    prompt = (SYSTEM_PROMPT + "\n\n위 영상을 정리하십시오. key_points 의 at 에는 해당 내용이 나오는 영상 시각(mm:ss)을 적습니다."
              + (f"\n올린 직원의 메모: {note}" if note else "") + JSON_INSTRUCTION)
    # 긴 영상도 제한 시간(서버리스 240초) 안에 끝나게: 화면은 낮은 해상도·드문 프레임으로 보고
    # (말로 하는 영상은 소리가 핵심), 생각은 짧게. 이 설정을 모르는 모델이면 400 → 기본값으로 다시.
    fast = {"mediaResolution": "MEDIA_RESOLUTION_LOW", "thinkingConfig": {"thinkingLevel": "low"}}
    vpart = {"file_data": {"file_uri": video_url}}
    body = {
        "contents": [{"parts": [{**vpart, "videoMetadata": {"fps": 0.25}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2, **fast},
    }
    url = f"{GEMINI_BASE}/v1beta/models/{urllib.parse.quote(GEMINI_MODEL)}:generateContent"
    try:
        resp = _post_json(url, {"x-goog-api-key": key}, body, timeout=600)
    except AIError as e:
        if "HTTP 400" not in str(e):
            if "timed out" in str(e) or "시간" in str(e):
                raise AIError("영상이 길어 제한 시간 안에 다 보지 못했습니다. 「자막 붙여 AI 정리」로 유튜브 자막(스크립트)을 붙여 넣어 주세요.") from None
            raise
        body["contents"][0]["parts"][0] = vpart
        for k in fast:
            body["generationConfig"].pop(k)
        resp = _post_json(url, {"x-goog-api-key": key}, body, timeout=600)
    cands = resp.get("candidates") or []
    if not cands:
        reason = (resp.get("promptFeedback") or {}).get("blockReason", "응답 없음")
        raise AIError(f"Gemini 가 응답하지 않았습니다 ({reason})")
    parts = (cands[0].get("content") or {}).get("parts") or []
    text = "".join(p.get("text", "") for p in parts)
    return parse_json(text), resp.get("modelVersion", GEMINI_MODEL)


def text_engine() -> str:
    """글·PDF·캡처를 누가 정리하나: Claude 키가 있으면 Claude, 없고 Gemini 키만 있으면 Gemini."""
    if not os.environ.get("ANTHROPIC_API_KEY") and os.environ.get("GEMINI_API_KEY"):
        return "gemini"
    return "claude"


def call_gemini_blocks(content: list[dict]) -> tuple[dict, str]:
    """Claude 형식의 내용 블록(글·PDF·이미지)을 Gemini 로 정리한다 — Claude 키가 없을 때의 대체 길."""
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise AIError("GEMINI_API_KEY 가 설정되지 않았습니다")
    parts: list[dict] = []
    big = sum(len(b["source"]["data"]) for b in content if b.get("type") in ("document", "image")) > GEMINI_INLINE_MAX * 4 // 3
    for b in content:
        if b.get("type") in ("document", "image"):
            src = b["source"]
            if big:  # 요청 한 번에 담기엔 커서 Files API 로 먼저 올리고 주소만 넘긴다
                uri = gemini_upload(base64.b64decode(src["data"]), src["media_type"], key)
                parts.append({"file_data": {"mime_type": src["media_type"], "file_uri": uri}})
            else:
                parts.append({"inline_data": {"mime_type": src["media_type"], "data": src["data"]}})
        elif b.get("type") == "text":
            parts.append({"text": b["text"]})
    parts.append({"text": JSON_INSTRUCTION})
    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2},
    }
    url = f"{GEMINI_BASE}/v1beta/models/{urllib.parse.quote(GEMINI_MODEL)}:generateContent"
    # 글 정리는 깊이 생각할 일이 아니다 — 생각 수준을 낮춰 기다림을 줄인다.
    # 모델이 그 설정을 모르면(HTTP 400) 설정 없이 한 번 더 부른다.
    # 기본은 "low"(gemini-3.8-flash 는 "minimal" 을 받지 않는다 — 2026-11-16 서버 기록).
    # 모델이 모르면(HTTP 400) "low" → 설정 없음 순으로 내려가고, 통한 수준을 기억해 다음부터 바로 쓴다.
    level = os.environ.get("INSIGHT_GEMINI_THINKING", "low").strip()
    levels = [lv for lv in dict.fromkeys([level, "low"] if level else []) if lv] + [None]
    levels = levels[levels.index(_gemini_level_ok[0]):] if _gemini_level_ok and _gemini_level_ok[0] in levels else levels
    for i, lv in enumerate(levels):
        if lv:
            body["generationConfig"]["thinkingConfig"] = {"thinkingLevel": lv}
        else:
            body["generationConfig"].pop("thinkingConfig", None)
        try:
            resp = _post_json(url, {"x-goog-api-key": key}, body)
            _gemini_level_ok[:] = [lv]
            break
        except AIError as e:
            if i == len(levels) - 1 or not str(e).startswith("HTTP 400"):
                raise
    cands = resp.get("candidates") or []
    if not cands:
        reason = (resp.get("promptFeedback") or {}).get("blockReason", "응답 없음")
        raise AIError(f"Gemini 가 응답하지 않았습니다 ({reason})")
    if cands[0].get("finishReason") == "MAX_TOKENS":
        raise AIError("응답이 길이 상한에서 잘렸습니다")
    parts_out = (cands[0].get("content") or {}).get("parts") or []
    text = "".join(p.get("text", "") for p in parts_out if not p.get("thought"))
    return parse_json(text), resp.get("modelVersion", GEMINI_MODEL)


_gemini_level_ok: list = []   # 이 서버에서 통한 생각 수준(첫 원소)


# ───────────────────── 짧은 AI 일(브리핑·고객 말투·물어보기) ─────────────────────

# AI는 새 글·기사·유튜브 링크의 요약에만 쓴다. 아래 셋은 하루 무료 한도를 아끼려고 껐다.
BRIEF_ON = False    # 오늘의 브리핑
EXTRAS_ON = False   # 고객 말투 · 다르게 볼 점
ASK_ON = False      # 룸 자료로 물어보기


def ai_ready() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("GEMINI_API_KEY"))


def ai_json(system: str, user_text: str, schema: dict, budget: int = 100, max_tokens: int = 4000) -> dict:
    """정해진 JSON 모양으로 짧게 답을 받는다. 엔진은 글 정리와 같은 규칙(text_engine)을 따른다."""
    _run_ctx.deadline = time.time() + budget
    try:
        if text_engine() == "claude":
            key = os.environ.get("ANTHROPIC_API_KEY")
            if not key:
                raise AIError("AI 키가 설정되지 않았습니다")
            body = {"model": CLAUDE_MODEL, "max_tokens": max_tokens, "system": system,
                    "output_config": {"effort": "low", "format": {"type": "json_schema", "schema": schema}},
                    "messages": [{"role": "user", "content": user_text}]}
            resp = _post_json(f"{ANTHROPIC_BASE}/v1/messages",
                              {"x-api-key": key, "anthropic-version": ANTHROPIC_VERSION}, body, timeout=budget)
            if resp.get("stop_reason") in ("refusal", "max_tokens"):
                raise AIError("AI가 답을 끝내지 못했습니다")
            text = "".join(b.get("text", "") for b in resp.get("content", []) if b.get("type") == "text")
        else:
            key = os.environ.get("GEMINI_API_KEY")
            body = {"system_instruction": {"parts": [{"text": system}]},
                    "contents": [{"role": "user", "parts": [{"text": user_text + "\n\n다음 JSON 스키마에 맞춘 JSON 객체 하나만 출력하십시오.\n"
                                                                     + json.dumps(schema, ensure_ascii=False)}]}],
                    "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2}}
            url = f"{GEMINI_BASE}/v1beta/models/{urllib.parse.quote(GEMINI_MODEL)}:generateContent"
            levels = (["low"] if not _gemini_level_ok or _gemini_level_ok[0] else []) + [None]
            for i, lv in enumerate(levels):
                if lv:
                    body["generationConfig"]["thinkingConfig"] = {"thinkingLevel": lv}
                else:
                    body["generationConfig"].pop("thinkingConfig", None)
                try:
                    resp = _post_json(url, {"x-goog-api-key": key}, body, timeout=budget)
                    break
                except AIError as e:
                    if i == len(levels) - 1 or not str(e).startswith("HTTP 400"):
                        raise
            cands = resp.get("candidates") or []
            if not cands:
                raise AIError("AI가 응답하지 않았습니다")
            text = "".join(p_.get("text", "") for p_ in ((cands[0].get("content") or {}).get("parts") or [])
                           if not p_.get("thought"))
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
        try:
            out = json.loads(text)
        except json.JSONDecodeError:
            m = re.search(r"\{.*\}", text, re.S)
            if not m:
                raise AIError("AI 응답을 해석하지 못했습니다")
            out = json.loads(m.group(0))
        if not isinstance(out, dict):
            raise AIError("AI 응답을 해석하지 못했습니다")
        return out
    finally:
        _run_ctx.deadline = None


def cache_get(key: str):
    return q("SELECT sig, body, created_at FROM ai_cache WHERE key=?", (key,), one=True)


def cache_put(key: str, sig: str, body) -> None:
    xn("INSERT INTO ai_cache(key, sig, body, created_at) VALUES (?,?,?,?) "
       "ON CONFLICT(key) DO UPDATE SET sig=excluded.sig, body=excluded.body, created_at=excluded.created_at",
       (key, sig, json.dumps(body, ensure_ascii=False), now()))


def lock_take(name: str, hold: int = 120) -> bool:
    """같은 AI 일이 동시에 여러 번 돌지 않게 하는 짧은 자물쇠."""
    k = "lock:" + name
    xn("DELETE FROM ai_cache WHERE key=? AND created_at<?", (k, now() - hold))
    return xn("INSERT INTO ai_cache(key, sig, body, created_at) VALUES (?,?,?,?) ON CONFLICT(key) DO NOTHING",
              (k, "", "1", now())) == 1


def lock_drop(name: str) -> None:
    xn("DELETE FROM ai_cache WHERE key=?", ("lock:" + name,))


# ───────────────────────────── 새 글 알림(웹 푸시) ─────────────────────────────
# 요약이 끝난 글을, 알림을 켠 다른 직원의 휴대폰·PC 로 알린다(RFC 8030/8291/8292).
# 알림 내용은 기기에서만 풀리게 암호화해 보낸다 — 구글·애플의 푸시 서버는 내용을 읽지 못한다.
# 암호화에 `cryptography` 가 필요하다. 클라우드(Vercel)에는 requirements.txt 로 깔리고,
# 없는 곳(표준 라이브러리만 쓰는 로컬 판)에서는 알림만 꺼지고 나머지는 그대로 돈다.
# 서명 열쇠(VAPID)는 처음 쓸 때 서버가 만들어 DB 에 둔다. 저장소·환경 변수에 둘 것이 없다.
PUSH_HOSTS = ("fcm.googleapis.com", "android.googleapis.com", "push.services.mozilla.com",
              "push.apple.com", "notify.windows.com")
PUSH_TTL = 24 * 3600          # 기기가 꺼져 있으면 하루까지 기다렸다 전한다
PUSH_SUB_MAX = 10             # 한 사람이 알림을 켤 수 있는 기기 수


def _b64u(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def _unb64u(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def push_crypto():
    try:
        from cryptography.hazmat.primitives.asymmetric import ec  # noqa: F401
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM  # noqa: F401
        return True
    except Exception:
        return False


def vapid_keys() -> tuple[object, str] | None:
    """(서명용 개인 열쇠, 화면에 줄 공개 열쇠) — 없으면 한 번 만들어 DB 에 둔다."""
    if not push_crypto():
        return None
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import ec
    row = cache_get("push:vapid")
    if not row:
        k = ec.generate_private_key(ec.SECP256R1())
        d = k.private_numbers().private_value.to_bytes(32, "big")
        # 두 요청이 동시에 만들어도 먼저 넣은 것 하나만 남는다
        xn("INSERT INTO ai_cache(key, sig, body, created_at) VALUES (?,?,?,?) ON CONFLICT(key) DO NOTHING",
           ("push:vapid", "", json.dumps({"d": _b64u(d)}), now()))
        row = cache_get("push:vapid")
    d = int.from_bytes(_unb64u(json.loads(row["body"])["d"]), "big")
    key = ec.derive_private_key(d, ec.SECP256R1())
    pub = key.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
    return key, _b64u(pub)


def push_endpoint_ok(endpoint: str) -> bool:
    """서버가 POST 를 보낼 곳이므로, 알려진 브라우저 푸시 서버 주소만 받는다."""
    try:
        u = urllib.parse.urlsplit(endpoint)
    except ValueError:
        return False
    host = (u.hostname or "").lower()
    return (u.scheme == "https" and len(endpoint) < 1000 and not u.username and u.port in (None, 443)
            and any(host == h or host.endswith("." + h) for h in PUSH_HOSTS))


def push_encrypt(payload: bytes, p256dh: str, auth: str) -> bytes:
    """RFC 8291(aes128gcm) — 받는 기기의 공개 열쇠로만 풀리는 본문을 만든다."""
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.hkdf import HKDF
    ua_pub = _unb64u(p256dh)
    secret = _unb64u(auth)
    eph = ec.generate_private_key(ec.SECP256R1())
    as_pub = eph.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
    shared = eph.exchange(ec.ECDH(), ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), ua_pub))
    ikm = HKDF(hashes.SHA256(), 32, secret, b"WebPush: info\x00" + ua_pub + as_pub).derive(shared)
    salt = secrets.token_bytes(16)
    prk = hmac.new(salt, ikm, hashlib.sha256).digest()
    cek = hmac.new(prk, b"Content-Encoding: aes128gcm\x00\x01", hashlib.sha256).digest()[:16]
    nonce = hmac.new(prk, b"Content-Encoding: nonce\x00\x01", hashlib.sha256).digest()[:12]
    body = AESGCM(cek).encrypt(nonce, payload + b"\x02", None)
    return salt + (4096).to_bytes(4, "big") + bytes([len(as_pub)]) + as_pub + body


def vapid_header(endpoint: str, key, pub: str, sub: str) -> str:
    """RFC 8292 — 이 서버가 보낸 알림임을 푸시 서버에 밝히는 서명."""
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
    u = urllib.parse.urlsplit(endpoint)
    head = _b64u(json.dumps({"typ": "JWT", "alg": "ES256"}, separators=(",", ":")).encode())
    claims = _b64u(json.dumps({"aud": f"{u.scheme}://{u.netloc}", "exp": now() + 12 * 3600, "sub": sub},
                              separators=(",", ":")).encode())
    r, s_ = decode_dss_signature(key.sign(f"{head}.{claims}".encode(), ec.ECDSA(hashes.SHA256())))
    sig = _b64u(r.to_bytes(32, "big") + s_.to_bytes(32, "big"))
    return f"vapid t={head}.{claims}.{sig}, k={pub}"


def push_send(sub_row, data: dict, keys) -> str:
    """한 기기로 보낸다. 돌려주는 값: ok | gone(구독이 사라짐 — 지운다) | fail."""
    key, pub = keys
    endpoint = sub_row["endpoint"]
    if not push_endpoint_ok(endpoint):
        return "gone"
    body = push_encrypt(json.dumps(data, ensure_ascii=False).encode(), sub_row["p256dh"], sub_row["auth"])
    origin = sub_row["origin"] or ""
    sub = origin if origin.startswith("https://") else "https://insightroom-wm.vercel.app"
    req = urllib.request.Request(endpoint, data=body, method="POST", headers={
        "Content-Type": "application/octet-stream", "Content-Encoding": "aes128gcm",
        "TTL": str(PUSH_TTL), "Urgency": "normal",
        "Authorization": vapid_header(endpoint, key, pub, sub), "User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=10, context=ssl.create_default_context()) as r:
            r.read(2048)
        return "ok"
    except urllib.error.HTTPError as e:
        detail = e.read(300).decode("utf-8", "replace")
        if e.code in (404, 410):
            return "gone"
        print(f"[push] HTTP {e.code} {urllib.parse.urlsplit(endpoint).hostname}: {detail[:200]}", file=sys.stderr)
        # 403 은 대개 서명 열쇠가 바뀐 옛 구독 — 다시 켜면 살아난다. 지우지 않고 실패로만 센다
        return "fail"
    except (urllib.error.URLError, TimeoutError, socket.timeout, OSError) as e:
        print(f"[push] 보내기 실패 {urllib.parse.urlsplit(endpoint).hostname}: {e}", file=sys.stderr)
        return "fail"


def push_fanout(rows, data: dict) -> dict:
    keys = vapid_keys()
    out = {"ok": 0, "gone": 0, "fail": 0}
    if not keys or not rows:
        return out
    from concurrent.futures import ThreadPoolExecutor

    def one(r):
        try:
            return r, push_send(r, data, keys)
        except Exception as e:
            print(f"[push] 오류 {type(e).__name__}: {e}", file=sys.stderr)
            return r, "fail"

    with ThreadPoolExecutor(max_workers=min(8, len(rows))) as ex:
        results = list(ex.map(one, rows))
    for r, res in results:
        out[res] += 1
        if res == "gone":
            xn("DELETE FROM push_subs WHERE endpoint=?", (r["endpoint"],))
        elif res == "ok":
            xn("UPDATE push_subs SET last_ok=? WHERE endpoint=?", (now(), r["endpoint"]))
    return out


def _clip(s: str, n: int) -> str:
    s = " ".join((s or "").split())
    return s if len(s) <= n else s[:n - 1] + "…"


def notify_post(pid: int, force: bool = False):
    """요약이 끝난 글을 알림을 켠 다른 직원에게 한 번만 알린다(다시 정리해도 또 보내지 않는다).
    force=True 는 관리자가 손으로 보내는 경우 — 이미 보낸 글이라도 다시 보낸다.
    돌려주는 값: 보낸 결과 {ok, gone, fail} 또는 보내지 않은 까닭(문자열)."""
    if not push_crypto():
        return "알림 기능을 쓸 수 없는 서버입니다"
    p = q("SELECT p.id, p.user_id, p.source_title, p.title_edit, p.summary_json, p.kind, u.name "
          "FROM posts p JOIN users u ON u.id=p.user_id WHERE p.id=? AND p.status='done'", (pid,), one=True)
    if not p:
        return "요약이 끝난 글만 알릴 수 있습니다"
    rows = q("SELECT s.endpoint, s.p256dh, s.auth, s.origin FROM push_subs s JOIN users u ON u.id=s.user_id "
             "WHERE u.active=1 AND s.user_id<>?", (p["user_id"],))
    if not rows:
        return "알림을 켠 직원이 아직 없습니다(올린 사람 본인은 받지 않습니다)"
    key = f"push:sent:{pid}"
    if force:
        x("DELETE FROM ai_cache WHERE key=?", (key,))
    if xn("INSERT INTO ai_cache(key, sig, body, created_at) VALUES (?,?,?,?) ON CONFLICT(key) DO NOTHING",
          (key, "", "1", now())) != 1:
        return "이미 알림을 보낸 글입니다"
    try:
        sm = json.loads(p["summary_json"] or "{}")
    except ValueError:
        sm = {}
    title = p["title_edit"] or p["source_title"] or sm.get("title") or "새 글"
    data = {"title": _clip(title, 80),
            "body": _clip(f"{p['name']} · " + (sm.get("one_line") or ""), 180),
            "url": f"/#p{pid}", "tag": f"post-{pid}"}
    t0 = time.time()
    res = push_fanout(rows, data)
    print(f"[push] 글 {pid} 알림{' (관리자 수동)' if force else ''} {res} {time.time() - t0:.1f}s", file=sys.stderr)
    return res


KST = 9 * 3600


def kst_day_start(ts: int) -> int:
    return ts - (ts + KST) % 86400


BRIEF_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["headline", "points"],
    "properties": {
        "headline": {"type": "string"},
        "points": {"type": "array", "items": {
            "type": "object", "additionalProperties": False, "required": ["text", "ids"],
            "properties": {"text": {"type": "string"}, "ids": {"type": "array", "items": {"type": "integer"}}}}}},
}
BRIEF_SYSTEM = """당신은 증권사 WM 센터의 리서치 보조입니다. 직원들이 공유한 자료의 요약 목록을 받아,
직원이 30초 안에 훑어볼 '오늘의 브리핑'을 만듭니다.

반드시 지킬 것:
- 목록에 있는 내용만 씁니다. 바깥 지식, 최신 시세, 전망을 덧붙이지 않습니다.
- 숫자·종목명은 목록에 적힌 그대로 옮깁니다.
- 매수·매도 권유, 단정적 전망을 쓰지 않습니다. 자료의 주장은 자료의 주장으로 전합니다.
- headline: 자료 전체를 꿰는 한 문장(40자 안팎, 마침표 없이).
- points: 서로 다른 흐름 최대 3개. 각 text 는 한 문장(60자 안팎). ids 에는 그 문장의 근거가 된 자료 번호를 넣습니다.
- 자료가 한두 건이면 그만큼만 씁니다. 억지로 늘리지 않습니다."""

EXTRA_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["client_talk", "counterpoint"],
    "properties": {"client_talk": {"type": "string"},
                   "counterpoint": {"type": "array", "items": {"type": "string"}}},
}
EXTRA_SYSTEM = """당신은 증권사 WM 센터의 리서치 보조입니다. 이미 정리된 자료 요약을 받아 두 가지를 씁니다.

- client_talk: 직원이 고객에게 이 자료를 소개할 때 그대로 읽을 수 있는 2~3문장의 존댓말.
  반드시 자료의 주장으로서 전합니다(예: "~라는 분석이 나왔습니다", "~로 본다는 의견입니다").
  단정("오를 것입니다"), 권유("사시는 게 좋습니다"), 수익 보장 표현은 쓰지 않습니다.
- counterpoint: 이 자료를 다르게 볼 수 있는 점 최대 3개 — 요약 안에 있는 반대 근거·위험,
  주장이 성립하려면 필요한 전제·조건, 논리의 빈틈. 요약 밖의 사실이나 시세를 끌어오지 않습니다.
  찾을 것이 없으면 빈 배열입니다.
- 숫자·종목명은 요약에 적힌 그대로 옮깁니다. 한국어로 씁니다."""

ASK_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["answer", "enough", "cites"],
    "properties": {"answer": {"type": "string"}, "enough": {"type": "boolean"},
                   "cites": {"type": "array", "items": {"type": "integer"}}},
}
ASK_SYSTEM = """당신은 증권사 WM 센터 자료실의 도우미입니다. 직원의 질문에, 함께 받은 '룸 자료' 목록만 근거로 답합니다.

반드시 지킬 것:
- 룸 자료에 있는 내용만 씁니다. 당신이 아는 바깥 지식, 최신 시세, 추정을 쓰지 않습니다.
- 자료로 답하기에 부족하면 enough 를 false 로 하고, 무엇이 부족한지 answer 에 분명히 적습니다. 지어내지 않습니다.
- answer 는 3~6문장의 한국어. 자료의 주장은 "~라는 자료가 있습니다", "~로 본다는 분석입니다"처럼 전합니다.
- 숫자·날짜·종목명은 자료에 적힌 그대로 옮깁니다.
- 매수·매도 권유, 단정적 전망을 쓰지 않습니다.
- cites 에는 답의 근거로 쓴 자료 번호만 넣습니다."""


def summary_brief(sm: dict) -> str:
    """AI에 다시 넘길 요약 한 덩어리(저장된 요약만 쓴다 — 원문을 다시 읽지 않는다)."""
    lines = [f"제목: {sm.get('title', '')}", f"한 줄: {sm.get('one_line', '')}"]
    kp = [k.get("point", "") for k in sm.get("key_points") or [] if isinstance(k, dict)]
    if kp:
        lines.append("핵심: " + " / ".join(kp))
    if sm.get("implications"):
        lines.append("시사점: " + " / ".join(sm["implications"]))
    fg = [f"{f.get('label', '')} {f.get('value', '')}" + (f"({f['as_of']})" if f.get("as_of") else "")
          for f in sm.get("figures") or [] if isinstance(f, dict)]
    if fg:
        lines.append("수치: " + " / ".join(fg))
    if sm.get("risks"):
        lines.append("위험: " + " / ".join(sm["risks"]))
    if sm.get("unverified"):
        lines.append("확인 안 된 주장: " + " / ".join(sm["unverified"]))
    if sm.get("tags"):
        lines.append("태그: " + ", ".join(sm["tags"]))
    return "\n".join(lines)


def parse_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", text, re.S)
        if not m:
            raise AIError("AI 응답을 해석하지 못했습니다")
        data = json.loads(m.group(0))
    return normalize_summary(data)


def normalize_summary(d: dict) -> dict:
    """스키마를 강제하지 못하는 경로(Gemini)도 같은 모양이 되게 다듬는다."""
    def strs(v, n=12):
        return [str(s).strip() for s in (v or []) if str(s).strip()][:n]

    def objs(v, keys, n=12):
        out = []
        for o in (v or [])[:n]:
            if isinstance(o, dict):
                out.append({k: str(o.get(k, "") or "").strip() for k in keys})
            elif str(o).strip():
                out.append({keys[0]: str(o).strip(), **{k: "" for k in keys[1:]}})
        return out

    cat = d.get("category") if d.get("category") in CATEGORIES else "기타"
    sen = d.get("sentiment") if d.get("sentiment") in SENTIMENTS else "중립"
    tags = [re.sub(r"^#", "", t)[:30] for t in strs(d.get("tags"), 8)]
    return {
        "readable": bool(d.get("readable", True)),
        "title": str(d.get("title") or "").strip()[:300],
        "one_line": str(d.get("one_line") or "").strip()[:500],
        "key_points": objs(d.get("key_points"), ["point", "at"], 5),
        "implications": strs(d.get("implications"), 3),
        "related": objs(d.get("related"), ["name", "kind", "code"], 8),
        "figures": objs(d.get("figures"), ["label", "value", "as_of"], 5),
        "risks": strs(d.get("risks"), 3),
        "category": cat,
        "sentiment": sen,
        "tags": tags,
        "unverified": strs(d.get("unverified"), 3),
        "client_talk": str(d.get("client_talk") or "").strip()[:800],
        "counterpoint": strs(d.get("counterpoint"), 3),
    }


def text_block(label: str, text: str, meta: dict) -> tuple[str, list[str]]:
    notes = []
    if len(text) > MAX_TEXT_CHARS:
        notes.append(f"본문이 길어 앞 {MAX_TEXT_CHARS:,}자만 AI에 넘겼습니다(전체 {len(text):,}자).")
        text = text[:MAX_TEXT_CHARS]
    head = "\n".join(f"{k}: {v}" for k, v in meta.items() if v)
    return f"<{label}>\n{head}\n\n{text}\n</{label}>", notes


# ───────────────────────────── 작업 큐 ─────────────────────────────

jobs: "queue.Queue[int]" = queue.Queue()


def set_status(pid: int, status: str, msg: str = "", **cols) -> None:
    sets = ["status=?", "status_msg=?", "updated_at=?"]
    args: list = [status, msg, now()]
    for k, v in cols.items():
        sets.append(f"{k}=?")
        args.append(v)
    args.append(pid)
    x(f"UPDATE posts SET {', '.join(sets)} WHERE id=?", args)


def process(pid: int) -> None:
    try:
        _process(pid)
    finally:
        _run_ctx.deadline = None   # 같은 스레드의 다음 요청이 지난 마감을 물려받지 않게


def _process(pid: int) -> None:
    p = q("SELECT * FROM posts WHERE id=?", (pid,), one=True)
    if not p:
        return
    set_status(pid, "working", "AI가 읽는 중")
    _run_ctx.deadline = time.time() + RUN_BUDGET_SEC
    notes: list[str] = []
    note = p["note"] or ""
    user_hint = f"\n\n올린 직원의 메모(참고용, 자료 내용이 아님): {note}" if note else ""
    try:
        if p["kind"] == "video":
            summary, model = call_gemini(p["url"], note)
        else:
            content: list[dict] = []
            meta = {"주소": p["url"] or "", "제목": p["source_title"] or "", "매체": p["source_site"] or "",
                    "게시일": p["source_published"] or ""}
            if p["file_path"]:
                raw = blob_get(p["file_path"])
                b64 = base64.b64encode(raw).decode()
                if p["file_type"] == "application/pdf":
                    content.append({"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": b64}})
                else:
                    content.append({"type": "image", "source": {"type": "base64", "media_type": p["file_type"], "data": b64}})
                if p["pasted_text"]:
                    blk, n = text_block("직원이_붙여넣은_본문", p["pasted_text"], meta)
                    content.append({"type": "text", "text": blk})
                    notes += n
                content.append({"type": "text", "text": "위 자료를 정리하십시오." + user_hint})
            else:
                text = p["pasted_text"] or ""
                label = "직원이_붙여넣은_본문"
                if not text and p["url"]:
                    t_fetch = time.time()
                    data, ctype, final = fetch(p["url"])
                    print(f"[run {pid}] 원문 받기 {time.time() - t_fetch:.1f}s, {len(data):,}바이트", file=sys.stderr)
                    if "pdf" in ctype.lower() or data[:5] == b"%PDF-":
                        content.append({"type": "document", "source": {"type": "base64", "media_type": "application/pdf",
                                                                        "data": base64.b64encode(data).decode()}})
                        x("UPDATE posts SET kind='pdf' WHERE id=?", (pid,))
                    else:
                        art = extract_article(decode_html(data, ctype))
                        text, label = art["text"], "기사_본문"
                        x("UPDATE posts SET source_title=COALESCE(NULLIF(source_title,''),?), source_site=?, source_published=? WHERE id=?",
                          (art["title"], art["site"], art["published"], pid))
                        meta.update({"제목": art["title"], "매체": art["site"], "게시일": art["published"]})
                        if len(text) < MIN_TEXT_CHARS:
                            print(f"[run {pid}] 본문 짧음 {len(text)}자 — 읽지 못함으로 멈춤", file=sys.stderr)
                            set_status(pid, "blocked",
                                       "이 페이지에서 본문을 읽지 못했습니다(로그인·유료 기사이거나 화면을 스크립트로 그리는 사이트). "
                                       "본문을 복사해 붙여넣거나 스크린샷·PDF로 올려 주세요.")
                            return
                if text:
                    blk, n = text_block(label, text, meta)
                    notes += n
                    content.append({"type": "text", "text": blk})
                content.append({"type": "text", "text": "위 자료를 정리하십시오." + user_hint})
            t_ai = time.time()
            summary, model = (call_gemini_blocks(content) if text_engine() == "gemini" else call_claude(content))
            print(f"[run {pid}] AI 정리 {time.time() - t_ai:.1f}s ({model})", file=sys.stderr)
        summary["notes"] = notes
        if not summary["readable"]:
            set_status(pid, "blocked", "AI가 자료 본문을 읽을 수 없다고 판단했습니다: " + summary["one_line"],
                       summary_json=json.dumps(summary, ensure_ascii=False), model=model)
            return
        tags = "," + ",".join(summary["tags"]) + "," if summary["tags"] else ""
        set_status(pid, "done", "", summary_json=json.dumps(summary, ensure_ascii=False),
                   category=summary["category"], sentiment=summary["sentiment"], tags=tags, model=model,
                   source_title=p["source_title"] or summary["title"])
        try:
            notify_post(pid)
        except Exception as e:  # 알림이 안 가도 요약은 이미 끝났다
            print(f"[push] 글 {pid} 알림 실패: {type(e).__name__}: {e}", file=sys.stderr)
    except BlockedURL as e:
        set_status(pid, "failed", str(e))
    except AIError as e:
        print(f"[run {pid}] AI 실패: {str(e)[:300]}", file=sys.stderr)
        msg = ai_error_text(e, auto=True) or str(e)
        if re.match(r"HTTP (429|5\d\d)|시간 초과", msg):
            msg = "AI 서버가 붐벼 여러 번 불러도 제때 답하지 않았습니다. 잠시 뒤 「다시 시도」를 눌러 주세요. (" + msg[:80] + ")"
        set_status(pid, "failed", msg)
    except urllib.error.HTTPError as e:
        set_status(pid, "blocked", f"원문 사이트가 접근을 거절했습니다(HTTP {e.code}). 본문을 붙여넣거나 스크린샷·PDF로 올려 주세요.")
    except (urllib.error.URLError, TimeoutError, socket.timeout) as e:
        set_status(pid, "failed", f"원문을 받아 오지 못했습니다: {e}")
    except Exception as e:  # 예상 못 한 오류도 화면에 남긴다
        traceback.print_exc()
        set_status(pid, "failed", f"처리 중 오류: {type(e).__name__}: {e}")


def worker() -> None:
    while True:
        pid = jobs.get()
        try:
            process(pid)
        finally:
            jobs.task_done()


def enqueue(pid: int) -> None:
    # 서버리스에선 줄을 세우지 않는다 — 화면이 곧바로 /run 을 부른다
    if not SERVERLESS:
        jobs.put(pid)


def queue_size() -> int:
    if SERVERLESS:
        return q("SELECT COUNT(*) AS n FROM posts WHERE status IN ('queued','working')", one=True)["n"]
    return jobs.qsize()


def claim(pid: int) -> bool:
    """정리할 차례를 가져온다. 대기 중이거나, 정리 중인데 너무 오래 멈춰 있는 글만."""
    t = now()
    return xn("UPDATE posts SET status='working', status_msg='AI가 읽는 중', updated_at=? "
              "WHERE id=? AND (status='queued' OR (status='working' AND updated_at<?))",
              (t, pid, t - STALE_WORK_SEC)) == 1


def start_workers(n: int = 3) -> None:
    # 서버가 꺼졌다 켜지면 하다 만 일을 다시 줄 세운다
    for r in q("SELECT id FROM posts WHERE status IN ('queued','working') ORDER BY id"):
        jobs.put(r["id"])
    for _ in range(n):
        threading.Thread(target=worker, daemon=True).start()


# ───────────────────────────── HTTP ─────────────────────────────

class HTTPError_(Exception):
    def __init__(self, code: int, msg: str, extra: dict | None = None):
        super().__init__(msg)
        self.code, self.msg, self.extra = code, msg, extra or {}


def post_row(r: sqlite3.Row, me: int, full: bool = False, admin: bool = False) -> dict:
    d = {
        "id": r["id"], "url": r["url"], "kind": r["kind"], "engine": r["engine"], "note": r["note"],
        "file_name": r["file_name"], "has_file": bool(r["file_path"]),
        "source_title": r["source_title"], "title_edit": r["title_edit"], "source_site": r["source_site"], "source_published": r["source_published"],
        "status": r["status"], "status_msg": r["status_msg"],
        "summary": json.loads(r["summary_json"]) if r["summary_json"] else None,
        "category": r["category"], "sentiment": r["sentiment"], "model": r["model"],
        "created_at": r["created_at"], "updated_at": r["updated_at"], "author": r["author"], "author_id": r["user_id"],
        "likes": r["likes"], "liked": bool(r["liked"]), "comments": r["ncomments"], "mine": r["user_id"] == me,
        "views": r["nviews"],
    }
    if full:
        d["comment_list"] = [dict(c) | {"mine": c["user_id"] == me} for c in q(
            "SELECT c.id, c.body, c.created_at, c.user_id, u.name AS author FROM comments c JOIN users u ON u.id=c.user_id "
            "WHERE c.post_id=? ORDER BY c.id", (r["id"],))]
        d["liker_names"] = [x_["name"] for x_ in q(
            "SELECT u.name FROM likes l JOIN users u ON u.id=l.user_id WHERE l.post_id=? ORDER BY l.created_at", (r["id"],))]
        if admin:  # 본 사람 명단은 관리자에게만 — 직원끼리는 수만 보인다
            d["viewers"] = [dict(v) for v in q(
                "SELECT u.name, v.created_at FROM post_views v JOIN users u ON u.id=v.user_id "
                "WHERE v.post_id=? AND v.user_id<>? ORDER BY v.created_at", (r["id"], r["user_id"]))]
    return d


POST_SELECT = """
SELECT p.*, u.name AS author,
  (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id) AS likes,
  (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id AND l.user_id=?) AS liked,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) AS ncomments,
  (SELECT COUNT(*) FROM post_views v WHERE v.post_id=p.id AND v.user_id<>p.user_id) AS nviews
FROM posts p JOIN users u ON u.id=p.user_id
"""

STATIC_FILES = {
    "/": ("v2.html" if UI_DEFAULT == "v2" else "index.html", "text/html; charset=utf-8"),
    "/index.html": ("index.html", "text/html; charset=utf-8"),
    "/classic": ("index.html", "text/html; charset=utf-8"),      # 이전 화면은 늘 여기서 열린다
    "/new": ("v2.html", "text/html; charset=utf-8"),
    "/v2.html": ("v2.html", "text/html; charset=utf-8"),
    "/manifest.webmanifest": ("manifest.webmanifest", "application/manifest+json"),
    "/sw.js": ("sw.js", "text/javascript; charset=utf-8"),
    "/icon.svg": ("icon.svg", "image/svg+xml"),
    "/icon-192.png": ("icon-192.png", "image/png"),
    "/icon-512.png": ("icon-512.png", "image/png"),
}


class Handler(BaseHTTPRequestHandler):
    server_version = "CenterInsight/1.0"
    sys_version = ""

    # ── 공통 ──
    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (time.strftime("%m-%d %H:%M:%S"), fmt % args))

    def via_local_tunnel(self) -> bool:
        """같은 PC의 터널(cloudflared)이 넘겨준 요청인가 — 루프백에서 왔고 HTTPS 표시가 붙어 있다."""
        return (self.client_address[0] in ("127.0.0.1", "::1")
                and self.headers.get("X-Forwarded-Proto", "").lower() == "https")

    def client_ip(self) -> str:
        if self.via_local_tunnel():
            cf = self.headers.get("Cf-Connecting-Ip", "").strip()
            if cf:
                return cf
        if os.environ.get("INSIGHT_TRUST_PROXY") == "1" or self.via_local_tunnel():
            fwd = self.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            if fwd:
                return fwd
        return self.client_address[0]

    def secure(self) -> bool:
        return (isinstance(self.connection, ssl.SSLSocket) or os.environ.get("INSIGHT_COOKIE_SECURE") == "1"
                or self.via_local_tunnel())

    def send_json(self, code: int, obj, cookie: str | None = None) -> None:
        if cookie is None:
            cookie = getattr(self, "_renew_cookie", None)
        self._renew_cookie = None
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        if cookie is not None:
            self.send_header("Set-Cookie", cookie)
        self._sec_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _sec_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Robots-Tag", "noindex, nofollow")

    def cookie(self, token: str, max_age: int) -> str:
        c = f"ih_session={token}; Path=/; HttpOnly; SameSite=Strict; Max-Age={max_age}"
        return c + ("; Secure" if self.secure() else "")

    def body_json(self) -> dict:
        n = int(self.headers.get("Content-Length") or 0)
        if n > MAX_UPLOAD * 1.4 + 100_000:
            raise HTTPError_(413, f"파일이 너무 큽니다({MAX_UPLOAD // 1048576}MB 이하)")
        raw = self.rfile.read(n) if n else b"{}"
        try:
            d = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            raise HTTPError_(400, "요청 형식이 잘못되었습니다")
        if not isinstance(d, dict):
            raise HTTPError_(400, "요청 형식이 잘못되었습니다")
        return d

    def session_token(self) -> str | None:
        try:
            c = SimpleCookie(self.headers.get("Cookie", ""))
        except Exception:
            return None
        tok = c.get("ih_session")
        return tok.value if tok and tok.value else None

    def current_user(self):
        tok = self.session_token()
        if not tok:
            return None
        th = sha(tok)
        row = q("SELECT u.*, s.expires_at AS s_exp FROM sessions s JOIN users u ON u.id=s.user_id "
                "WHERE s.token_hash=? AND s.expires_at>? AND u.active=1", (th, now()), one=True)
        if row and row["s_exp"] < now() + SESSION_DAYS * 86400 - SESSION_RENEW_SEC:
            # 쓰는 기기는 기한을 다시 늘리고 쿠키도 새로 준다 → 앱을 누르면 바로 피드
            x("UPDATE sessions SET expires_at=? WHERE token_hash=?", (now() + SESSION_DAYS * 86400, th))
            x("UPDATE users SET last_login=? WHERE id=?", (now(), row["id"]))
            self._renew_cookie = self.cookie(tok, SESSION_DAYS * 86400)
        return row

    def need_user(self, admin=False):
        u = self.current_user()
        if not u:
            raise HTTPError_(401, "로그인이 필요합니다")
        if admin and u["role"] != "admin":
            raise HTTPError_(403, "관리자만 할 수 있습니다")
        return u

    def check_csrf(self):
        # 같은 출처의 화면만 상태를 바꿀 수 있다: 사용자 헤더 + (있다면) Origin 일치
        if self.headers.get("X-Insight") != "1":
            raise HTTPError_(403, "허용되지 않은 요청입니다")
        origin = self.headers.get("Origin")
        if origin:
            host = self.headers.get("Host", "")
            if urllib.parse.urlsplit(origin).netloc != host:
                raise HTTPError_(403, "허용되지 않은 출처입니다")

    # ── 라우팅 ──
    def do_GET(self):
        self.route("GET")

    def do_POST(self):
        self.route("POST")

    def do_DELETE(self):
        self.route("DELETE")

    def route(self, method: str):
        parts = urllib.parse.urlsplit(self.path)
        path = parts.path
        qs = urllib.parse.parse_qs(parts.query)
        self._renew_cookie = None
        try:
            if method == "GET" and path in STATIC_FILES:
                return self.static(*STATIC_FILES[path])
            if not path.startswith("/api/"):
                raise HTTPError_(404, "없는 주소입니다")
            if method != "GET":
                self.check_csrf()
            handler = None
            args: list = []
            for (m, pat), fn in ROUTES.items():
                if m != method:
                    continue
                mm = re.fullmatch(pat, path)
                if mm:
                    handler, args = fn, [int(g) if g.isdigit() else g for g in mm.groups()]
                    break
            if not handler:
                raise HTTPError_(404, "없는 주소입니다")
            handler(self, qs, *args)
        except HTTPError_ as e:
            self.send_json(e.code, {"error": e.msg, **e.extra})
        except BrokenPipeError:
            pass
        except Exception as e:
            traceback.print_exc()
            self.send_json(500, {"error": f"서버 오류: {type(e).__name__}"})

    def static(self, name: str, ctype: str):
        data = (STATIC / name).read_bytes()
        is_html = name in ("index.html", "v2.html")
        if is_html:
            data = data.replace(b"{{CENTER_NAME}}", html.escape(CENTER_NAME).encode())
            data = data.replace(b"{{APP_NAME}}", html.escape(V2_NAME).encode())
            # 바탕화면 아이콘·창 제목은 어느 화면에서 설치해도 앱 이름(manifest 와 같은 이름)으로
            data = data.replace(b"{{INSTALL_NAME}}", html.escape(APP_NAME).encode())
            data = data.replace(b"{{BUILD_ID}}", BUILD_ID.encode())
        if name == "manifest.webmanifest":
            data = data.replace(b"{{CENTER_NAME}}", json.dumps(APP_NAME, ensure_ascii=False)[1:-1].encode())
            if UI_DEFAULT == "v2":
                data = data.replace(b'"#f4f5f7"', b'"#13294b"')
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-cache")
        if is_html:
            self.send_header("Content-Security-Policy",
                             "default-src 'self'; img-src 'self' data: https://i.ytimg.com; style-src 'self' 'unsafe-inline'; "
                             "script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'")
        self._sec_headers()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    # ── 인증 ──
    def api_version(self, qs):
        self.send_json(200, {"build": BUILD_ID})

    def api_me(self, qs):
        u = self.current_user()
        if not u:
            return self.send_json(200, {"user": None, "center": CENTER_NAME, "invite_label": invite_label()})
        self.send_json(200, {"user": {"id": u["id"], "name": u["name"], "role": u["role"]}, "center": CENTER_NAME,
                             "categories": CATEGORIES, "session_days": SESSION_DAYS, "invite_label": invite_label(),
                             "serverless": SERVERLESS, "max_upload": MAX_UPLOAD, "upload_chunk": UPLOAD_CHUNK, "now": now(),
                             "text_engine": text_engine(), "app_name": V2_NAME, "ui": UI_DEFAULT,
                             "authors": [dict(r) for r in q(
                                 "SELECT u.id, u.name FROM users u WHERE EXISTS (SELECT 1 FROM posts p WHERE p.user_id=u.id) "
                                 "ORDER BY u.name")]})

    def api_login(self, qs):
        d = self.body_json()
        name, pw = norm_name(d.get("name", "")), d.get("password", "")
        key = f"{name}|{self.client_ip()}"
        if acct_locked(name):
            raise HTTPError_(429, "이 계정은 짧은 시간에 비밀번호가 너무 많이 틀려 1시간 잠겼습니다. "
                                  "본인이 아니라면 관리자에게 알려 주시고, 급하면 관리자에게 잠금 풀기를 요청하세요.")
        if login_blocked(key):
            raise HTTPError_(429, "여러 번 틀려 15분간 막혔습니다. 잠시 뒤 다시 시도하거나 관리자에게 문의하세요.")
        u = q("SELECT * FROM users WHERE name=?", (name,), one=True)
        if not u or not u["active"] or not check_pw(pw, u["pw_hash"]):
            login_failed(key)
            login_failed(acct_key(name), ACCT_LOCK_SEC)
            if acct_locked(name):
                print(f"[보안] 계정 잠김: 로그인 실패 {ACCT_MAX_FAIL}회 (마지막 IP {self.client_ip()})", file=sys.stderr)
            raise HTTPError_(401, "이름 또는 비밀번호가 맞지 않습니다")
        x("DELETE FROM login_fail WHERE key=? OR key=?", (key, acct_key(name)))
        tok = new_session(u["id"])
        self.send_json(200, {"ok": True}, cookie=self.cookie(tok, SESSION_DAYS * 86400))

    def api_join(self, qs):
        """초대 코드로 첫 입장: 이름 + 초대 코드 + 새 비밀번호."""
        d = self.body_json()
        name = norm_name(d.get("name", ""))
        code = re.sub(r"[\s-]", "", d.get("code", "")).upper()
        pw = d.get("password", "")
        key = f"join|{self.client_ip()}"
        if login_blocked(key):
            raise HTTPError_(429, "여러 번 틀려 15분간 막혔습니다")
        if not name or not code:
            raise HTTPError_(400, "이름과 초대 코드를 넣어 주세요")
        bad = password_problem(pw, name)
        if bad:
            raise HTTPError_(400, bad)
        bootstrap_invite(name)
        live = q("SELECT * FROM invites WHERE name=? AND used_at IS NULL AND expires_at>? ORDER BY id DESC",
                 (name, now()), one=True)
        if not live or not hmac.compare_digest(live["code_hash"], sha(code)):
            login_failed(key)
            if live:
                # 이 이름의 코드를 계속 틀리면 코드 자체를 없앤다 → 관리자에게 새 코드를 받아야 함
                x("UPDATE invites SET fails=fails+1 WHERE id=?", (live["id"],))
                if live["fails"] + 1 >= INVITE_MAX_FAIL:
                    x("UPDATE invites SET used_at=? WHERE id=?", (now(), live["id"]))
                    raise HTTPError_(401, f"초대 코드를 {INVITE_MAX_FAIL}번 틀려 코드가 무효가 되었습니다. 관리자에게 새 코드를 받으세요.")
            raise HTTPError_(401, f"이름과 초대 코드가 맞지 않거나, 이미 쓰였거나 기한({invite_label()})이 지났습니다")
        inv = live
        with _db_lock:
            x("UPDATE invites SET used_at=? WHERE id=?", (now(), inv["id"]))
            u = q("SELECT * FROM users WHERE name=?", (name,), one=True)
            acct_unlock(name)  # 관리자가 준 코드로 새 비밀번호를 정했으니 잠금도 푼다
            if u:  # 비밀번호 재설정용 초대
                x("UPDATE users SET pw_hash=?, active=1 WHERE id=?", (hash_pw(pw), u["id"]))
                x("DELETE FROM sessions WHERE user_id=?", (u["id"],))
                uid = u["id"]
            else:
                uid = x("INSERT INTO users(name, pw_hash, role, created_at) VALUES (?,?,?,?)",
                        (name, hash_pw(pw), inv["role"], now()))
        tok = new_session(uid)
        self.send_json(200, {"ok": True}, cookie=self.cookie(tok, SESSION_DAYS * 86400))

    def api_logout(self, qs):
        tok = self.session_token()
        if tok:
            x("DELETE FROM sessions WHERE token_hash=?", (sha(tok),))
        self.send_json(200, {"ok": True}, cookie=self.cookie("", 0))

    def api_logout_others(self, qs):
        """휴대폰을 잃어버렸을 때 등: 지금 이 기기만 남기고 모든 기기를 로그아웃."""
        u = self.need_user()
        n = q("SELECT COUNT(*) AS n FROM sessions WHERE user_id=? AND token_hash<>?",
              (u["id"], sha(self.session_token() or "")), one=True)["n"]
        x("DELETE FROM sessions WHERE user_id=? AND token_hash<>?", (u["id"], sha(self.session_token() or "")))
        # 잃어버린 휴대폰의 잠금 화면에 새 글 알림이 계속 뜨지 않게, 이 기기 것만 남기고 알림도 끈다
        keep = str(self.body_json().get("endpoint") or "")
        xn("DELETE FROM push_subs WHERE user_id=? AND endpoint<>?", (u["id"], keep))
        self.send_json(200, {"ok": True, "removed": n})

    # ── 새 글 알림 ──
    def api_push(self, qs):
        u = self.need_user()
        keys = vapid_keys()
        n = q("SELECT COUNT(*) AS n FROM push_subs WHERE user_id=?", (u["id"],), one=True)["n"]
        self.send_json(200, {"available": bool(keys), "key": keys[1] if keys else "", "devices": n})

    def api_push_subscribe(self, qs):
        u = self.need_user()
        d = self.body_json()
        ep = str(d.get("endpoint") or "")
        k = d.get("keys") if isinstance(d.get("keys"), dict) else {}
        p256dh, auth = str(k.get("p256dh") or ""), str(k.get("auth") or "")
        if not vapid_keys():
            raise HTTPError_(503, "이 서버에서는 알림을 보낼 수 없습니다")
        if not push_endpoint_ok(ep):
            raise HTTPError_(400, "이 브라우저의 알림 주소는 받지 않습니다")
        try:
            ok = len(_unb64u(p256dh)) == 65 and _unb64u(p256dh)[0] == 4 and len(_unb64u(auth)) == 16
        except (ValueError, TypeError):
            ok = False
        if not ok:
            raise HTTPError_(400, "알림 구독 정보가 잘못되었습니다")
        origin = ("https://" if self.secure() else "http://") + self.headers.get("Host", "")
        xn("INSERT INTO push_subs(endpoint, user_id, p256dh, auth, origin, created_at) VALUES (?,?,?,?,?,?) "
           "ON CONFLICT(endpoint) DO UPDATE SET user_id=excluded.user_id, p256dh=excluded.p256dh, "
           "auth=excluded.auth, origin=excluded.origin",
           (ep, u["id"], p256dh, auth, origin, now()))
        # 오래된 기기부터 정리해 한 사람당 PUSH_SUB_MAX 대까지만 둔다
        old = q("SELECT endpoint FROM push_subs WHERE user_id=? ORDER BY created_at DESC, endpoint", (u["id"],))
        for r in old[PUSH_SUB_MAX:]:
            xn("DELETE FROM push_subs WHERE endpoint=?", (r["endpoint"],))
        self.send_json(200, {"ok": True})

    def api_push_unsubscribe(self, qs):
        u = self.need_user()
        ep = str(self.body_json().get("endpoint") or "")
        xn("DELETE FROM push_subs WHERE user_id=? AND endpoint=?", (u["id"], ep))
        self.send_json(200, {"ok": True})

    def api_push_test(self, qs):
        """알림을 켠 본인 기기로 시험 알림 한 통."""
        u = self.need_user()
        ep = str(self.body_json().get("endpoint") or "")
        rows = q("SELECT endpoint, p256dh, auth, origin FROM push_subs WHERE user_id=? AND endpoint=?", (u["id"], ep))
        if not rows:
            raise HTTPError_(404, "이 기기는 알림이 켜져 있지 않습니다")
        res = push_fanout(rows, {"title": "알림 시험", "body": "새 글이 정리되면 이렇게 알려 드립니다.",
                                 "url": "/", "tag": "push-test"})
        if not res["ok"]:
            raise HTTPError_(502, "알림을 보내지 못했습니다. 알림을 껐다가 다시 켜 보세요.")
        self.send_json(200, {"ok": True})

    def api_password(self, qs):
        u = self.need_user()
        d = self.body_json()
        if not check_pw(d.get("old", ""), u["pw_hash"]):
            raise HTTPError_(401, "지금 비밀번호가 맞지 않습니다")
        bad = password_problem(d.get("new", ""), u["name"])
        if bad:
            raise HTTPError_(400, bad)
        x("UPDATE users SET pw_hash=? WHERE id=?", (hash_pw(d["new"]), u["id"]))
        x("DELETE FROM sessions WHERE user_id=?", (u["id"],))
        tok = new_session(u["id"])
        self.send_json(200, {"ok": True}, cookie=self.cookie(tok, SESSION_DAYS * 86400))

    # ── 글 ──
    def api_posts(self, qs):
        u = self.need_user()
        requeue_quota_failures()
        where, args = [], [u["id"]]
        g = lambda k: (qs.get(k) or [""])[0].strip()
        if g("category"):
            where.append("p.category=?"); args.append(g("category"))
        if g("tag"):
            where.append("p.tags LIKE ?"); args.append(f"%,{g('tag')},%")
        if g("mine") == "1":
            where.append("p.user_id=?"); args.append(u["id"])
        if g("liked") == "1":
            where.append("EXISTS (SELECT 1 FROM likes l WHERE l.post_id=p.id AND l.user_id=?)"); args.append(u["id"])
        kinds = [k for k in g("kind").split(",") if k in ("article", "pdf", "image", "video", "text")]
        if kinds:
            where.append("p.kind IN (" + ",".join("?" * len(kinds)) + ")"); args += kinds
        if g("author").isdigit():
            where.append("p.user_id=?"); args.append(int(g("author")))
        if g("since").isdigit():
            where.append("p.created_at>=?"); args.append(int(g("since")))
        if g("until").isdigit():
            where.append("p.created_at<?"); args.append(int(g("until")))
        rng = g("range")
        if rng in ("1", "7", "30"):
            where.append("p.created_at>?"); args.append(now() - int(rng) * 86400)
        if g("q"):
            like = f"%{g('q')}%"
            where.append("(p.source_title LIKE ? OR p.title_edit LIKE ? OR p.summary_json LIKE ? OR p.note LIKE ? OR p.url LIKE ? OR u.name LIKE ?)")
            args += [like] * 6
        if g("before").isdigit():
            where.append("p.id<?"); args.append(int(g("before")))
        order = "likes DESC, nviews DESC, ncomments DESC, p.id DESC" if g("sort") == "popular" else "p.id DESC"
        sql = POST_SELECT + (" WHERE " + " AND ".join(where) if where else "") + f" ORDER BY {order} LIMIT 30"
        rows = q(sql, args)
        self.send_json(200, {"posts": [post_row(r, u["id"]) for r in rows]})

    def api_post_get(self, qs, pid):
        u = self.need_user()
        if (qs.get("view") or [""])[0] == "1":  # 화면에서 글을 열었을 때만 센다(새로 고침·자동 갱신은 세지 않음)
            xn("INSERT INTO post_views(post_id, user_id, created_at) SELECT id, ?, ? FROM posts WHERE id=? AND user_id<>? "
               "ON CONFLICT(post_id, user_id) DO NOTHING", (u["id"], now(), pid, u["id"]))
        r = q(POST_SELECT + " WHERE p.id=?", (u["id"], pid), one=True)
        if not r:
            raise HTTPError_(404, "글이 없습니다")
        self.send_json(200, post_row(r, u["id"], full=True, admin=u["role"] == "admin"))

    def api_post_create(self, qs):
        u = self.need_user()
        d = self.body_json()
        url = (d.get("url") or "").strip()
        note = (d.get("note") or "").strip()[:1000]
        pasted = (d.get("text") or "").strip()[:400_000]
        f = d.get("file")
        if url and not looks_like_url(url):
            # 링크 칸에 제목·본문을 넣은 경우: 주소로 읽지 않고 붙여넣은 글로 다룬다
            if url not in pasted:
                pasted = (url + "\n\n" + pasted).strip()[:400_000]
            url = ""
        if not url and not f and not pasted:
            raise HTTPError_(400, "링크, 파일, 본문 중 하나는 있어야 합니다")
        kind, engine, title, site = "article", text_engine(), "", ""
        file_name = file_path = file_type = None
        if url:
            if not re.match(r"^https?://", url, re.I):
                url = "https://" + url
            try:
                check_public_url(url)
            except BlockedURL as e:
                raise HTTPError_(400, str(e))
            vid = youtube_id(url)
            if vid:
                url = f"https://www.youtube.com/watch?v={vid}"
                kind, engine = "video", "gemini"
                title, site = youtube_title(vid)
            elif urllib.parse.urlsplit(url).hostname and urllib.parse.urlsplit(url).hostname.endswith(VIDEO_HOSTS):
                raise HTTPError_(400, "유튜브 영상 주소를 알아보지 못했습니다(watch?v=… 또는 youtu.be/… 형태)")
            elif url.lower().split("?")[0].endswith(".pdf"):
                kind = "pdf"
            # 같은 링크가 최근 30일 안에 올라와 있으면 그 글로 안내한다
            dup = q("SELECT p.id, u.name FROM posts p JOIN users u ON u.id=p.user_id WHERE p.url=? AND p.created_at>? "
                    "AND p.status!='failed' ORDER BY p.id DESC LIMIT 1", (url, now() - 30 * 86400), one=True)
            if dup and not d.get("force"):
                raise HTTPError_(409, f"{dup['name']} 님이 이미 올린 링크입니다", {"existing": dup["id"]})
        if f:
            if kind == "video":
                raise HTTPError_(400, "영상 링크와 파일은 따로 올려 주세요")
            ftype = (f.get("type") or "").lower()
            if ftype not in ALLOWED_UPLOAD:
                raise HTTPError_(400, "PDF 또는 이미지(PNG·JPG·WEBP·GIF)만 올릴 수 있습니다")
            if f.get("upload"):  # 조각으로 먼저 올린 파일을 이어 붙인다
                up, n = f.get("upload"), f.get("parts")
                if not isinstance(up, str) or not re.fullmatch(r"\d+-[0-9a-f]{16}", up) \
                        or not isinstance(n, int) or not 1 <= n <= MAX_PARTS:
                    raise HTTPError_(400, "파일 조각 정보가 맞지 않습니다")
                names = [f"up-{u['id']}-{up}-{i:03d}" for i in range(n)]
                try:
                    raw = b"".join(blob_get(nm) for nm in names)
                except FileNotFoundError:
                    raise HTTPError_(400, "파일 조각이 빠졌습니다. 다시 올려 주세요")
                for nm in names:
                    blob_del(nm)
            else:
                try:
                    raw = base64.b64decode(f.get("data") or "", validate=True)
                except ValueError:
                    raise HTTPError_(400, "파일을 읽지 못했습니다")
            if len(raw) > MAX_UPLOAD:
                raise HTTPError_(413, f"파일이 {MAX_UPLOAD // 1048576}MB를 넘습니다")
            if ftype == "application/pdf" and not raw.startswith(b"%PDF-"):
                raise HTTPError_(400, "PDF 파일이 아닙니다")
            file_type = ftype
            file_name = re.sub(r"[\\/\x00-\x1f]", "_", (f.get("name") or "file"))[:150]
            file_path = f"{secrets.token_hex(16)}{ALLOWED_UPLOAD[ftype]}"
            blob_put(file_path, raw)
            kind = "pdf" if ftype == "application/pdf" else "image"
            title = title or re.sub(r"\.[^.]+$", "", file_name)
        elif pasted and not url:
            kind = "text"
            title = re.sub(r"\s+", " ", (d.get("title") or "")).strip()[:200]
        if kind == "video" and pasted:
            engine = text_engine()  # 영상 대본을 붙여넣었으면 글로 정리한다
            kind = "text"
        t = now()
        pid = x("""INSERT INTO posts(user_id, url, kind, engine, note, pasted_text, file_name, file_path, file_type,
                   source_title, source_site, status, created_at, updated_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (u["id"], url or None, kind, engine, note, pasted or None, file_name, file_path, file_type,
                 title, site, "queued", t, t))
        enqueue(pid)
        self.send_json(201, {"id": pid})

    def api_post_delete(self, qs, pid):
        u = self.need_user()
        p = q("SELECT * FROM posts WHERE id=?", (pid,), one=True)
        if not p:
            raise HTTPError_(404, "글이 없습니다")
        if p["user_id"] != u["id"] and u["role"] != "admin":
            raise HTTPError_(403, "올린 사람이나 관리자만 지울 수 있습니다")
        if p["file_path"]:
            blob_del(p["file_path"])
        with _db_lock:
            x("DELETE FROM likes WHERE post_id=?", (pid,))
            x("DELETE FROM comments WHERE post_id=?", (pid,))
            x("DELETE FROM post_views WHERE post_id=?", (pid,))
            x("DELETE FROM posts WHERE id=?", (pid,))
        self.send_json(200, {"ok": True})

    def api_post_update(self, qs, pid):
        """막힌 글에 본문을 붙여넣어 다시 정리하거나, 그냥 다시 시도한다."""
        u = self.need_user()
        p = q("SELECT * FROM posts WHERE id=?", (pid,), one=True)
        if not p:
            raise HTTPError_(404, "글이 없습니다")
        if p["user_id"] != u["id"] and u["role"] != "admin":
            raise HTTPError_(403, "올린 사람이나 관리자만 다시 정리할 수 있습니다")
        if p["status"] in ("queued", "working"):
            raise HTTPError_(409, "이미 정리 중입니다")
        d = self.body_json()
        text = (d.get("text") or "").strip()[:400_000]
        if text:
            x("UPDATE posts SET pasted_text=?, engine=?, kind=CASE WHEN kind='video' THEN 'text' ELSE kind END WHERE id=?",
              (text, text_engine(), pid))
        set_status(pid, "queued", "")
        enqueue(pid)
        self.send_json(200, {"ok": True})

    def api_post_notify(self, qs, pid):
        """관리자가 요약이 끝난 글의 알림을 손으로 보낸다(지난 글, 다시 보내기)."""
        self.need_user(admin=True)
        r = notify_post(int(pid), force=True)
        if isinstance(r, str):
            raise HTTPError_(409, r)
        if not r.get("ok"):
            raise HTTPError_(502, f"보내지 못했습니다(실패 {r.get('fail', 0)} · 만료 {r.get('gone', 0)})")
        self.send_json(200, r)

    def api_post_title(self, qs, pid):
        """올린 사람이나 관리자가 글 제목을 고친다. 빈칸으로 보내면 원래 제목으로 되돌린다."""
        u = self.need_user()
        p = q("SELECT user_id FROM posts WHERE id=?", (pid,), one=True)
        if not p:
            raise HTTPError_(404, "글이 없습니다")
        if p["user_id"] != u["id"] and u["role"] != "admin":
            raise HTTPError_(403, "제목은 올린 사람이나 관리자만 고칠 수 있습니다")
        d = self.body_json()
        title = re.sub(r"\s+", " ", str(d.get("title") or "")).strip()[:200]
        x("UPDATE posts SET title_edit=? WHERE id=?", (title or None, pid))
        print(f"[title] post={pid} by={u['id']} {'set' if title else 'cleared'}", file=sys.stderr)
        self.send_json(200, {"ok": True, "title_edit": title or None})

    def api_post_run(self, qs, pid):
        """서버리스용: 이 요청 안에서 글을 정리한다. 일꾼이 도는 보통 서버에선 할 일이 없다."""
        self.need_user()
        if not SERVERLESS:
            return self.send_json(200, {"ok": True, "ran": False})
        if not claim(pid):
            return self.send_json(200, {"ok": True, "ran": False})
        process(pid)
        r = q("SELECT status FROM posts WHERE id=?", (pid,), one=True)
        self.send_json(200, {"ok": True, "ran": True, "status": r["status"] if r else None})

    def api_like(self, qs, pid):
        u = self.need_user()
        if not q("SELECT 1 FROM posts WHERE id=?", (pid,), one=True):
            raise HTTPError_(404, "글이 없습니다")
        with _db_lock:
            if q("SELECT 1 FROM likes WHERE post_id=? AND user_id=?", (pid, u["id"]), one=True):
                x("DELETE FROM likes WHERE post_id=? AND user_id=?", (pid, u["id"]))
                liked = False
            else:
                x("INSERT INTO likes(post_id, user_id, created_at) VALUES (?,?,?)", (pid, u["id"], now()))
                liked = True
            n = q("SELECT COUNT(*) AS n FROM likes WHERE post_id=?", (pid,), one=True)["n"]
        self.send_json(200, {"liked": liked, "likes": n})

    def api_comment(self, qs, pid):
        u = self.need_user()
        body = (self.body_json().get("body") or "").strip()
        if not body:
            raise HTTPError_(400, "댓글이 비었습니다")
        if not q("SELECT 1 FROM posts WHERE id=?", (pid,), one=True):
            raise HTTPError_(404, "글이 없습니다")
        cid = x("INSERT INTO comments(post_id, user_id, body, created_at) VALUES (?,?,?,?)",
                (pid, u["id"], body[:2000], now()))
        self.send_json(201, {"id": cid})

    def api_comment_delete(self, qs, cid):
        u = self.need_user()
        c = q("SELECT * FROM comments WHERE id=?", (cid,), one=True)
        if not c:
            raise HTTPError_(404, "댓글이 없습니다")
        if c["user_id"] != u["id"] and u["role"] != "admin":
            raise HTTPError_(403, "쓴 사람이나 관리자만 지울 수 있습니다")
        x("DELETE FROM comments WHERE id=?", (cid,))
        self.send_json(200, {"ok": True})

    def api_upload(self, qs):
        """파일 조각 하나를 받아 둔다. 첫 조각(i=0)이 올림 번호를 받고, 나머지는 그 번호로 잇는다."""
        u = self.need_user()
        d = self.body_json()
        i, up = d.get("i"), d.get("id")
        if not isinstance(i, int) or not 0 <= i < MAX_PARTS:
            raise HTTPError_(400, "파일 조각 번호가 맞지 않습니다")
        try:
            raw = base64.b64decode(d.get("data") or "", validate=True)
        except ValueError:
            raise HTTPError_(400, "파일 조각을 읽지 못했습니다")
        if not raw or len(raw) > UPLOAD_CHUNK:
            raise HTTPError_(400, "파일 조각 크기가 맞지 않습니다")
        if i == 0:
            upload_gc()
            up = f"{int(now())}-{secrets.token_hex(8)}"
        elif not isinstance(up, str) or not re.fullmatch(r"\d+-[0-9a-f]{16}", up):
            raise HTTPError_(400, "파일 조각 정보가 맞지 않습니다")
        name = f"up-{u['id']}-{up}-{i:03d}"
        blob_del(name)
        blob_put(name, raw)
        self.send_json(200, {"id": up})

    def api_file(self, qs, pid):
        self.need_user()
        p = q("SELECT file_path, file_type, file_name FROM posts WHERE id=?", (pid,), one=True)
        if not p or not p["file_path"]:
            raise HTTPError_(404, "파일이 없습니다")
        part = (qs.get("part") or [""])[0]
        if part.isdigit():  # 조각으로 내려받기 — 화면이 이어 붙여 연다
            try:
                data, size = blob_slice(p["file_path"], int(part) * UPLOAD_CHUNK, UPLOAD_CHUNK)
            except FileNotFoundError:
                raise HTTPError_(404, "파일이 없습니다")
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("X-File-Parts", str(max(1, -(-size // UPLOAD_CHUNK))))
            self.send_header("X-File-Type", p["file_type"])
            self.send_header("Cache-Control", "private, no-store")
            self._sec_headers()
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        try:
            data = blob_get(p["file_path"])
        except FileNotFoundError:
            raise HTTPError_(404, "파일이 없습니다")
        self.send_response(200)
        self.send_header("Content-Type", p["file_type"])
        self.send_header("Content-Disposition", "inline; filename*=UTF-8''" + urllib.parse.quote(p["file_name"] or "file"))
        self.send_header("Cache-Control", "private, max-age=3600")
        self.send_header("Content-Security-Policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox")
        self._sec_headers()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def api_tags(self, qs):
        self.need_user()
        counts: dict[str, int] = {}
        for r in q("SELECT tags FROM posts WHERE tags IS NOT NULL AND created_at>?", (now() - 30 * 86400,)):
            for t in r["tags"].strip(",").split(","):
                if t:
                    counts[t] = counts.get(t, 0) + 1
        top = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:20]
        self.send_json(200, {"tags": [{"tag": t, "n": n} for t, n in top]})

    # ── 새 화면(v2): 오늘의 브리핑 · 고객 말투 · 룸 자료로 물어보기 ──
    def _brief_rows(self):
        t = now()
        start = kst_day_start(t)
        sel = "SELECT id, summary_json, source_title, title_edit, sentiment, tags FROM posts WHERE status='done' AND created_at>=? ORDER BY id DESC LIMIT 40"
        rows, scope = q(sel, (start,)), "today"
        if not rows:
            rows, scope = q(sel, (start - 2 * 86400,)), "recent"
        today_n = q("SELECT COUNT(*) AS n FROM posts WHERE created_at>=?", (start,), one=True)["n"]
        return rows, scope, today_n, time.strftime("%Y-%m-%d", time.gmtime(start + KST))

    def _brief_out(self, rows, scope, today_n, date, c):
        counts: dict[str, int] = {}
        sen = {"긍정": 0, "중립": 0, "부정": 0, "혼재": 0}
        for r in rows:
            for tg in (r["tags"] or "").strip(",").split(","):
                if tg:
                    counts[tg] = counts.get(tg, 0) + 1
            if r["sentiment"] in sen:
                sen[r["sentiment"]] += 1
        themes = [{"tag": k, "n": v} for k, v in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:6]]
        sig = ",".join(str(r["id"]) for r in rows)
        body = json.loads(c["body"]) if c else {}
        need = BRIEF_ON and bool(rows) and ai_ready() and (not c or (c["sig"] != sig and now() - c["created_at"] >= 300))
        return {"date": date, "scope": scope if rows else "none", "today": today_n, "n": len(rows),
                "headline": body.get("headline", ""), "points": body.get("points", []),
                "themes": themes, "sentiment": sen, "generated_at": c["created_at"] if c else None,
                "needs_gen": need, "ai": ai_ready()}

    def api_briefing(self, qs):
        self.need_user()
        rows, scope, today_n, date = self._brief_rows()
        self.send_json(200, self._brief_out(rows, scope, today_n, date, cache_get(f"briefing:{date}")))

    def api_briefing_make(self, qs):
        self.need_user()
        rows, scope, today_n, date = self._brief_rows()
        key = f"briefing:{date}"
        c = cache_get(key)
        out = self._brief_out(rows, scope, today_n, date, c)
        if not BRIEF_ON or not out["needs_gen"]:
            return self.send_json(200, out)
        bf = cache_get(f"brieffail:{date}")
        if bf and now() - bf["created_at"] < 900:   # 실패 뒤 15분은 다시 부르지 않는다 (화면 열 때마다 한도를 갉아먹지 않게)
            return self.send_json(200, out | {"error": json.loads(bf["body"])})
        if not lock_take(key, 100):
            return self.send_json(200, out | {"busy": True})
        try:
            items, ids = [], set()
            for r in rows[:30]:
                sm = json.loads(r["summary_json"] or "{}")
                if not sm.get("readable", True):
                    continue
                if r["title_edit"]:
                    sm["title"] = r["title_edit"]
                ids.add(r["id"])
                items.append(f"[{r['id']}] {sm.get('title') or r['source_title'] or ''}\n"
                             f"한 줄: {sm.get('one_line', '')}\n논조: {r['sentiment'] or ''} · 태그: {', '.join(sm.get('tags') or [])}")
            if not items:
                return self.send_json(200, out)
            res = ai_json(BRIEF_SYSTEM, "자료 목록:\n\n" + "\n\n".join(items), BRIEF_SCHEMA, budget=90)
            pts = []
            for pt in (res.get("points") or [])[:3]:
                if isinstance(pt, dict) and str(pt.get("text", "")).strip():
                    pts.append({"text": str(pt["text"]).strip()[:200],
                                "ids": [i for i in (pt.get("ids") or []) if isinstance(i, int) and i in ids][:4]})
            body = {"headline": str(res.get("headline") or "").strip()[:120], "points": pts}
            cache_put(key, ",".join(str(r["id"]) for r in rows), body)
            self.send_json(200, self._brief_out(rows, scope, today_n, date, cache_get(key)))
        except AIError as e:
            print(f"[briefing] {str(e)[:300]}", file=sys.stderr)
            cache_put(f"brieffail:{date}", "", ai_error_text(e) or "브리핑을 만들지 못했습니다. 잠시 뒤 다시 열어 보세요.")
            self.send_json(200, out | {"error": ai_error_text(e) or "브리핑을 만들지 못했습니다. 잠시 뒤 다시 열어 보세요."})
        finally:
            lock_drop(key)

    def api_post_extras(self, qs, pid):
        self.need_user()
        r = q("SELECT id, status, summary_json FROM posts WHERE id=?", (pid,), one=True)
        if not r:
            raise HTTPError_(404, "글이 없습니다")
        if r["status"] != "done" or not r["summary_json"]:
            raise HTTPError_(409, "AI 정리가 끝난 뒤에 볼 수 있습니다")
        sm = json.loads(r["summary_json"])
        if sm.get("client_talk") or sm.get("extras_at"):
            return self.send_json(200, {"client_talk": sm.get("client_talk", ""), "counterpoint": sm.get("counterpoint", [])})
        if not EXTRAS_ON or not sm.get("readable", True) or not ai_ready():
            return self.send_json(200, {"client_talk": "", "counterpoint": []})
        name = f"extras:{pid}"
        if not lock_take(name, 100):
            return self.send_json(202, {"pending": True})
        try:
            res = ai_json(EXTRA_SYSTEM, "자료 요약:\n\n" + summary_brief(sm), EXTRA_SCHEMA, budget=90)
            ct = str(res.get("client_talk") or "").strip()[:800]
            cp = [str(v).strip() for v in (res.get("counterpoint") or []) if str(v).strip()][:3]
            cur = q("SELECT summary_json FROM posts WHERE id=?", (pid,), one=True)
            if cur and cur["summary_json"]:
                sm2 = json.loads(cur["summary_json"])
                sm2["client_talk"], sm2["counterpoint"], sm2["extras_at"] = ct, cp, now()
                x("UPDATE posts SET summary_json=? WHERE id=?", (json.dumps(sm2, ensure_ascii=False), pid))
            self.send_json(200, {"client_talk": ct, "counterpoint": cp})
        except AIError as e:
            print(f"[extras] {pid}: {str(e)[:300]}", file=sys.stderr)
            raise HTTPError_(502, ai_error_text(e) or "AI가 지금 답하지 않습니다. 잠시 뒤 다시 눌러 주세요.")
        finally:
            lock_drop(name)

    def api_ask(self, qs):
        u = self.need_user()
        d = self.body_json()
        question = re.sub(r"\s+", " ", str(d.get("question") or "")).strip()[:300]
        tag = str(d.get("tag") or "").strip()[:30]
        if not ASK_ON:
            raise HTTPError_(410, "물어보기 기능은 꺼져 있습니다")
        if len(question) < 2:
            raise HTTPError_(400, "질문을 적어 주세요")
        if not ai_ready():
            raise HTTPError_(503, "AI 키가 설정되지 않았습니다")
        hour = now() // 3600
        rk = f"askrl:{u['id']}:{hour}"
        c = cache_get(rk)
        used = int(c["body"]) if c else 0
        if used >= ASK_PER_HOUR:
            raise HTTPError_(429, f"물어보기는 한 시간에 {ASK_PER_HOUR}번까지입니다. 잠시 뒤 다시 해 주세요.")
        cache_put(rk, "", used + 1)
        if used == 0:
            xn("DELETE FROM ai_cache WHERE key LIKE ? AND created_at<?", ("askrl:%", now() - 7200))
        sql = ("SELECT id, summary_json, source_title, title_edit, created_at, tags FROM posts "
               "WHERE status='done' AND created_at>?" + (" AND tags LIKE ?" if tag else "") + " ORDER BY id DESC LIMIT 300")
        rows = q(sql, (now() - 60 * 86400,) + ((f"%,{tag},%",) if tag else ()))
        words = [w for w in re.findall(r"[0-9A-Za-z가-힣]+", question) if len(w) >= 2]
        scored = []
        for r in rows:
            sm = json.loads(r["summary_json"] or "{}")
            if not sm.get("readable", True):
                continue
            if r["title_edit"]:
                sm["title"] = r["title_edit"]
            hay = (summary_brief(sm) + " " + (r["source_title"] or "")).lower()
            sc = sum(hay.count(w.lower()) for w in words)
            scored.append((sc, r["id"], r, sm))
        top = [t_ for t_ in sorted(scored, key=lambda t_: (-t_[0], -t_[1])) if t_[0] > 0][:12]
        if not top:
            top = sorted(scored, key=lambda t_: -t_[1])[:12]
        if not top:
            return self.send_json(200, {"answer": "아직 룸에 정리된 자료가 없어 답할 수 없습니다.", "enough": False,
                                        "cites": [], "used": 0, "left": ASK_PER_HOUR - used - 1})
        blocks = [f"[{r['id']}] {time.strftime('%Y-%m-%d', time.gmtime(r['created_at'] + KST))}\n{summary_brief(sm)}"
                  for _, _, r, sm in top]
        try:
            res = ai_json(ASK_SYSTEM, f"질문: {question}\n\n룸 자료:\n\n" + "\n\n".join(blocks), ASK_SCHEMA, budget=110)
        except AIError as e:
            print(f"[ask] {str(e)[:300]}", file=sys.stderr)
            cache_put(rk, "", used)   # 실패한 질문은 횟수에서 빼 준다
            raise HTTPError_(502, ai_error_text(e) or "AI가 지금 답하지 않습니다. 잠시 뒤 다시 해 주세요.")
        valid = {r["id"]: (sm.get("title") or r["source_title"] or "") for _, _, r, sm in top}
        cites = [{"id": i, "title": valid[i]} for i in dict.fromkeys(res.get("cites") or []) if isinstance(i, int) and i in valid]
        self.send_json(200, {"answer": str(res.get("answer") or "").strip()[:2000], "enough": bool(res.get("enough")),
                             "cites": cites[:6], "used": len(top), "left": ASK_PER_HOUR - used - 1})

    # ── 관리 ──
    def api_admin_users(self, qs):
        self.need_user(admin=True)
        users = [dict(r) for r in q(
            "SELECT u.id, u.name, u.role, u.active, u.created_at, u.last_login, "
            "(SELECT COUNT(*) FROM posts p WHERE p.user_id=u.id) AS posts, "
            "(SELECT COUNT(*) FROM push_subs s WHERE s.user_id=u.id) AS push FROM users u ORDER BY u.name")]
        for u in users:
            u["locked"] = acct_locked(u["name"])
        invites = [dict(r) for r in q(
            "SELECT id, name, role, created_at, expires_at FROM invites WHERE used_at IS NULL AND expires_at>? ORDER BY id DESC",
            (now(),))]
        self.send_json(200, {"users": users, "invites": invites, "ai": {
            "claude": bool(os.environ.get("ANTHROPIC_API_KEY")), "claude_model": CLAUDE_MODEL,
            "gemini": bool(os.environ.get("GEMINI_API_KEY")), "gemini_model": GEMINI_MODEL},
            "queue": queue_size(), "storage": storage_usage()})

    def api_admin_invite(self, qs):
        me = self.need_user(admin=True)
        d = self.body_json()
        role = "admin" if d.get("role") == "admin" else "member"
        try:
            code = new_invite(d.get("name", ""), role, me["id"])
        except ValueError as e:
            raise HTTPError_(400, str(e))
        self.send_json(201, {"name": norm_name(d.get("name", "")), "code": code, "valid": invite_label()})

    def api_admin_user(self, qs, uid):
        me = self.need_user(admin=True)
        d = self.body_json()
        u = q("SELECT * FROM users WHERE id=?", (uid,), one=True)
        if not u:
            raise HTTPError_(404, "사용자가 없습니다")
        if uid == me["id"] and ("active" in d or "role" in d):
            raise HTTPError_(400, "자기 자신의 권한·상태는 바꿀 수 없습니다")
        if "active" in d:
            x("UPDATE users SET active=? WHERE id=?", (1 if d["active"] else 0, uid))
            if not d["active"]:
                x("DELETE FROM sessions WHERE user_id=?", (uid,))
        if d.get("role") in ("admin", "member"):
            x("UPDATE users SET role=? WHERE id=?", (d["role"], uid))
        if d.get("unlock"):
            acct_unlock(u["name"])
        out = {"ok": True}
        if d.get("reset"):
            out["code"] = new_invite(u["name"], u["role"], me["id"])
            out["name"] = u["name"]
            out["valid"] = invite_label()
        self.send_json(200, out)

    def api_admin_invite_delete(self, qs, iid):
        self.need_user(admin=True)
        x("UPDATE invites SET used_at=? WHERE id=?", (now(), iid))
        self.send_json(200, {"ok": True})


ROUTES = {
    ("GET", r"/api/me"): Handler.api_me,
    ("GET", r"/api/version"): Handler.api_version,
    ("POST", r"/api/login"): Handler.api_login,
    ("POST", r"/api/join"): Handler.api_join,
    ("POST", r"/api/logout"): Handler.api_logout,
    ("POST", r"/api/password"): Handler.api_password,
    ("POST", r"/api/logout-others"): Handler.api_logout_others,
    ("GET", r"/api/push"): Handler.api_push,
    ("POST", r"/api/push/subscribe"): Handler.api_push_subscribe,
    ("POST", r"/api/push/unsubscribe"): Handler.api_push_unsubscribe,
    ("POST", r"/api/push/test"): Handler.api_push_test,
    ("GET", r"/api/posts"): Handler.api_posts,
    ("POST", r"/api/posts"): Handler.api_post_create,
    ("GET", r"/api/posts/(\d+)"): Handler.api_post_get,
    ("DELETE", r"/api/posts/(\d+)"): Handler.api_post_delete,
    ("POST", r"/api/posts/(\d+)/retry"): Handler.api_post_update,
    ("POST", r"/api/posts/(\d+)/title"): Handler.api_post_title,
    ("POST", r"/api/posts/(\d+)/notify"): Handler.api_post_notify,
    ("POST", r"/api/posts/(\d+)/run"): Handler.api_post_run,
    ("POST", r"/api/posts/(\d+)/like"): Handler.api_like,
    ("POST", r"/api/posts/(\d+)/comments"): Handler.api_comment,
    ("DELETE", r"/api/comments/(\d+)"): Handler.api_comment_delete,
    ("GET", r"/api/files/(\d+)"): Handler.api_file,
    ("POST", r"/api/uploads"): Handler.api_upload,
    ("GET", r"/api/tags"): Handler.api_tags,
    ("GET", r"/api/briefing"): Handler.api_briefing,
    ("POST", r"/api/briefing"): Handler.api_briefing_make,
    ("POST", r"/api/posts/(\d+)/extras"): Handler.api_post_extras,
    ("POST", r"/api/ask"): Handler.api_ask,
    ("GET", r"/api/admin/users"): Handler.api_admin_users,
    ("POST", r"/api/admin/invites"): Handler.api_admin_invite,
    ("DELETE", r"/api/admin/invites/(\d+)"): Handler.api_admin_invite_delete,
    ("POST", r"/api/admin/users/(\d+)"): Handler.api_admin_user,
}


# ───────────────────────────── 실행 ─────────────────────────────

def cmd_serve(a) -> None:
    db()
    start_workers()
    srv = ThreadingHTTPServer((a.host, a.port), Handler)
    scheme = "http"
    if a.cert:
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ctx.load_cert_chain(a.cert, a.key)
        srv.socket = ctx.wrap_socket(srv.socket, server_side=True)
        scheme = "https"
    users = q("SELECT COUNT(*) AS n FROM users", one=True)["n"]
    print(f"[{CENTER_NAME}] {scheme}://{a.host}:{a.port}  데이터: {DATA_DIR}")
    print(f"  Claude: {'키 있음' if os.environ.get('ANTHROPIC_API_KEY') else '키 없음'} ({CLAUDE_MODEL})"
          f" · Gemini: {'키 있음' if os.environ.get('GEMINI_API_KEY') else '키 없음'} ({GEMINI_MODEL})")
    if users == 0 and not q("SELECT 1 FROM invites WHERE used_at IS NULL AND expires_at>?", (now(),), one=True):
        print("  아직 사용자가 없습니다 → python3 server.py invite <이름> --admin 으로 첫 관리자 코드를 만드세요")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


def cmd_invite(a) -> None:
    db()
    code = new_invite(a.name, "admin" if a.admin else "member")
    print(f"이름: {norm_name(a.name)}  초대 코드: {code}  ({invite_label()} 안에 한 번만 쓸 수 있음"
          f"{', 관리자' if a.admin else ''})")


def main(argv=None) -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("serve", help="서버 시작")
    s.add_argument("--host", default=os.environ.get("INSIGHT_HOST", "0.0.0.0"))
    s.add_argument("--port", type=int, default=int(os.environ.get("INSIGHT_PORT", "8080")))
    s.add_argument("--cert", help="HTTPS 인증서(PEM)")
    s.add_argument("--key", help="HTTPS 개인키(PEM)")
    s.set_defaults(fn=cmd_serve)
    i = sub.add_parser("invite", help="초대 코드 발급(같은 이름이 이미 있으면 비밀번호 재설정 코드)")
    i.add_argument("name")
    i.add_argument("--admin", action="store_true")
    i.set_defaults(fn=cmd_invite)
    a = ap.parse_args(argv)
    a.fn(a)


if __name__ == "__main__":
    main()
