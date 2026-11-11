#!/usr/bin/env python3
"""센터 인사이트 — 링크만 올리면 AI가 읽고 정리해 센터 전체가 함께 보는 공간.

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
DATA_DIR = Path(os.environ.get("INSIGHT_DATA_DIR", Path.home() / ".insight-hub")).expanduser()
DB_PATH = DATA_DIR / "insight.db"
UPLOAD_DIR = DATA_DIR / "uploads"

CENTER_NAME = os.environ.get("INSIGHT_CENTER_NAME", "센터 인사이트")
CLAUDE_MODEL = os.environ.get("INSIGHT_CLAUDE_MODEL", "claude-opus-5-5")
CLAUDE_EFFORT = os.environ.get("INSIGHT_CLAUDE_EFFORT", "medium")
GEMINI_MODEL = os.environ.get("INSIGHT_GEMINI_MODEL", "gemini-3.8-flash")
ANTHROPIC_VERSION = "2026-10-21"
# 회사 프록시·시험용 가짜 서버를 쓸 때만 바꾼다
ANTHROPIC_BASE = os.environ.get("ANTHROPIC_BASE_URL", "https://api.anthropic.com").rstrip("/")
GEMINI_BASE = os.environ.get("INSIGHT_GEMINI_BASE_URL", "https://generativelanguage.googleapis.com").rstrip("/")

SESSION_DAYS = 30
INVITE_DAYS = 7
MAX_UPLOAD = 20 * 1024 * 1024        # 첨부 한 건 상한
MAX_FETCH = 20 * 1024 * 1024         # 링크에서 받아 올 상한
MAX_TEXT_CHARS = 150_000             # AI에 넘길 본문 상한 — 넘으면 화면에 그 사실을 적는다
MIN_TEXT_CHARS = 300                 # 이보다 짧으면 "본문을 읽지 못함"으로 본다
LOGIN_MAX_FAIL = 5
LOGIN_LOCK_SEC = 15 * 60
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
_db: sqlite3.Connection | None = None

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
  used_at INTEGER
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
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS comments_post ON comments(post_id);
"""


def db() -> sqlite3.Connection:
    global _db
    if _db is None:
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
        _db = conn
    return _db


def q(sql: str, args=(), one=False):
    with _db_lock:
        cur = db().execute(sql, args)
        rows = cur.fetchall()
    return (rows[0] if rows else None) if one else rows


def x(sql: str, args=()) -> int:
    with _db_lock:
        cur = db().execute(sql, args)
        return cur.lastrowid


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
        (name, sha(code), role, created_by, now(), now() + INVITE_DAYS * 86400),
    )
    return code


def login_blocked(key: str) -> bool:
    row = q("SELECT count, first_at FROM login_fail WHERE key=?", (key,), one=True)
    if not row:
        return False
    if now() - row["first_at"] > LOGIN_LOCK_SEC:
        x("DELETE FROM login_fail WHERE key=?", (key,))
        return False
    return row["count"] >= LOGIN_MAX_FAIL


def login_failed(key: str) -> None:
    row = q("SELECT count, first_at FROM login_fail WHERE key=?", (key,), one=True)
    if row and now() - row["first_at"] <= LOGIN_LOCK_SEC:
        x("UPDATE login_fail SET count=count+1 WHERE key=?", (key,))
    else:
        x("INSERT OR REPLACE INTO login_fail(key, count, first_at) VALUES (?,?,?)", (key, 1, now()))


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
                 "figures", "risks", "category", "sentiment", "tags", "unverified"],
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
                       "description": "자료 안에서 근거가 약하거나 출처가 밝혀지지 않은 주장"}},
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
- 한국어로, 짧고 단정한 문장으로 씁니다. key_points 는 3~6개, tags 는 3~6개(종목명·테마·지표 위주, '#' 없이).
- category 는 다음 중 하나: {", ".join(CATEGORIES)}.
"""

JSON_INSTRUCTION = "\n\n다음 JSON 스키마에 맞춘 JSON 객체 하나만 출력하십시오. 앞뒤 설명이나 코드펜스를 붙이지 마십시오.\n" + json.dumps(SUMMARY_SCHEMA, ensure_ascii=False)


class AIError(Exception):
    pass


def _post_json(url: str, headers: dict, body: dict, timeout: int = 300) -> dict:
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                                 headers={"content-type": "application/json", **headers})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:600]
        raise AIError(f"HTTP {e.code}: {detail}") from None
    except (urllib.error.URLError, TimeoutError, socket.timeout) as e:
        raise AIError(f"연결 실패: {e}") from None


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
    body = {
        "contents": [{"parts": [{"file_data": {"file_uri": video_url}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2},
    }
    url = f"{GEMINI_BASE}/v1beta/models/{urllib.parse.quote(GEMINI_MODEL)}:generateContent"
    resp = _post_json(url, {"x-goog-api-key": key}, body, timeout=600)
    cands = resp.get("candidates") or []
    if not cands:
        reason = (resp.get("promptFeedback") or {}).get("blockReason", "응답 없음")
        raise AIError(f"Gemini 가 응답하지 않았습니다 ({reason})")
    parts = (cands[0].get("content") or {}).get("parts") or []
    text = "".join(p.get("text", "") for p in parts)
    return parse_json(text), resp.get("modelVersion", GEMINI_MODEL)


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
        "key_points": objs(d.get("key_points"), ["point", "at"]),
        "implications": strs(d.get("implications")),
        "related": objs(d.get("related"), ["name", "kind", "code"], 20),
        "figures": objs(d.get("figures"), ["label", "value", "as_of"], 20),
        "risks": strs(d.get("risks")),
        "category": cat,
        "sentiment": sen,
        "tags": tags,
        "unverified": strs(d.get("unverified")),
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
    p = q("SELECT * FROM posts WHERE id=?", (pid,), one=True)
    if not p:
        return
    set_status(pid, "working", "AI가 읽는 중")
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
                raw = (UPLOAD_DIR / p["file_path"]).read_bytes()
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
                    data, ctype, final = fetch(p["url"])
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
                            set_status(pid, "blocked",
                                       "이 페이지에서 본문을 읽지 못했습니다(로그인·유료 기사이거나 화면을 스크립트로 그리는 사이트). "
                                       "본문을 복사해 붙여넣거나 스크린샷·PDF로 올려 주세요.")
                            return
                if text:
                    blk, n = text_block(label, text, meta)
                    notes += n
                    content.append({"type": "text", "text": blk})
                content.append({"type": "text", "text": "위 자료를 정리하십시오." + user_hint})
            summary, model = call_claude(content)
        summary["notes"] = notes
        if not summary["readable"]:
            set_status(pid, "blocked", "AI가 자료 본문을 읽을 수 없다고 판단했습니다: " + summary["one_line"],
                       summary_json=json.dumps(summary, ensure_ascii=False), model=model)
            return
        tags = "," + ",".join(summary["tags"]) + "," if summary["tags"] else ""
        set_status(pid, "done", "", summary_json=json.dumps(summary, ensure_ascii=False),
                   category=summary["category"], sentiment=summary["sentiment"], tags=tags, model=model,
                   source_title=p["source_title"] or summary["title"])
    except BlockedURL as e:
        set_status(pid, "failed", str(e))
    except AIError as e:
        set_status(pid, "failed", str(e))
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


def post_row(r: sqlite3.Row, me: int, full: bool = False) -> dict:
    d = {
        "id": r["id"], "url": r["url"], "kind": r["kind"], "engine": r["engine"], "note": r["note"],
        "file_name": r["file_name"], "has_file": bool(r["file_path"]),
        "source_title": r["source_title"], "source_site": r["source_site"], "source_published": r["source_published"],
        "status": r["status"], "status_msg": r["status_msg"],
        "summary": json.loads(r["summary_json"]) if r["summary_json"] else None,
        "category": r["category"], "sentiment": r["sentiment"], "model": r["model"],
        "created_at": r["created_at"], "author": r["author"], "author_id": r["user_id"],
        "likes": r["likes"], "liked": bool(r["liked"]), "comments": r["ncomments"], "mine": r["user_id"] == me,
    }
    if full:
        d["comment_list"] = [dict(c) | {"mine": c["user_id"] == me} for c in q(
            "SELECT c.id, c.body, c.created_at, c.user_id, u.name AS author FROM comments c JOIN users u ON u.id=c.user_id "
            "WHERE c.post_id=? ORDER BY c.id", (r["id"],))]
        d["liker_names"] = [x_["name"] for x_ in q(
            "SELECT u.name FROM likes l JOIN users u ON u.id=l.user_id WHERE l.post_id=? ORDER BY l.created_at", (r["id"],))]
    return d


POST_SELECT = """
SELECT p.*, u.name AS author,
  (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id) AS likes,
  (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id AND l.user_id=?) AS liked,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) AS ncomments
FROM posts p JOIN users u ON u.id=p.user_id
"""

STATIC_FILES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/index.html": ("index.html", "text/html; charset=utf-8"),
    "/manifest.webmanifest": ("manifest.webmanifest", "application/manifest+json"),
    "/sw.js": ("sw.js", "text/javascript; charset=utf-8"),
    "/icon.svg": ("icon.svg", "image/svg+xml"),
}


class Handler(BaseHTTPRequestHandler):
    server_version = "CenterInsight/1.0"
    sys_version = ""

    # ── 공통 ──
    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (time.strftime("%m-%d %H:%M:%S"), fmt % args))

    def client_ip(self) -> str:
        if os.environ.get("INSIGHT_TRUST_PROXY") == "1":
            fwd = self.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            if fwd:
                return fwd
        return self.client_address[0]

    def secure(self) -> bool:
        return isinstance(self.connection, ssl.SSLSocket) or os.environ.get("INSIGHT_COOKIE_SECURE") == "1"

    def send_json(self, code: int, obj, cookie: str | None = None) -> None:
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
            raise HTTPError_(413, "파일이 너무 큽니다(20MB 이하)")
        raw = self.rfile.read(n) if n else b"{}"
        try:
            d = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            raise HTTPError_(400, "요청 형식이 잘못되었습니다")
        if not isinstance(d, dict):
            raise HTTPError_(400, "요청 형식이 잘못되었습니다")
        return d

    def current_user(self):
        c = SimpleCookie(self.headers.get("Cookie", ""))
        tok = c.get("ih_session")
        if not tok:
            return None
        row = q("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1",
                (sha(tok.value), now()), one=True)
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
        if name == "index.html":
            data = data.replace(b"{{CENTER_NAME}}", html.escape(CENTER_NAME).encode())
        if name == "manifest.webmanifest":
            data = data.replace(b"{{CENTER_NAME}}", json.dumps(CENTER_NAME, ensure_ascii=False)[1:-1].encode())
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-cache")
        if name == "index.html":
            self.send_header("Content-Security-Policy",
                             "default-src 'self'; img-src 'self' data: https://i.ytimg.com; style-src 'self' 'unsafe-inline'; "
                             "script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'")
        self._sec_headers()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    # ── 인증 ──
    def api_me(self, qs):
        u = self.current_user()
        if not u:
            return self.send_json(200, {"user": None, "center": CENTER_NAME})
        self.send_json(200, {"user": {"id": u["id"], "name": u["name"], "role": u["role"]}, "center": CENTER_NAME,
                             "categories": CATEGORIES})

    def api_login(self, qs):
        d = self.body_json()
        name, pw = norm_name(d.get("name", "")), d.get("password", "")
        key = f"{name}|{self.client_ip()}"
        if login_blocked(key):
            raise HTTPError_(429, "여러 번 틀려 15분간 막혔습니다. 잠시 뒤 다시 시도하거나 관리자에게 문의하세요.")
        u = q("SELECT * FROM users WHERE name=?", (name,), one=True)
        if not u or not u["active"] or not check_pw(pw, u["pw_hash"]):
            login_failed(key)
            raise HTTPError_(401, "이름 또는 비밀번호가 맞지 않습니다")
        x("DELETE FROM login_fail WHERE key=?", (key,))
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
        if len(pw) < 8:
            raise HTTPError_(400, "비밀번호는 8자 이상이어야 합니다")
        inv = q("SELECT * FROM invites WHERE name=? AND code_hash=? AND used_at IS NULL AND expires_at>?",
                (name, sha(code), now()), one=True)
        if not inv:
            login_failed(key)
            raise HTTPError_(401, "이름과 초대 코드가 맞지 않거나, 이미 쓰였거나 기한(7일)이 지났습니다")
        with _db_lock:
            x("UPDATE invites SET used_at=? WHERE id=?", (now(), inv["id"]))
            u = q("SELECT * FROM users WHERE name=?", (name,), one=True)
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
        c = SimpleCookie(self.headers.get("Cookie", ""))
        if c.get("ih_session"):
            x("DELETE FROM sessions WHERE token_hash=?", (sha(c["ih_session"].value),))
        self.send_json(200, {"ok": True}, cookie=self.cookie("", 0))

    def api_password(self, qs):
        u = self.need_user()
        d = self.body_json()
        if not check_pw(d.get("old", ""), u["pw_hash"]):
            raise HTTPError_(401, "지금 비밀번호가 맞지 않습니다")
        if len(d.get("new", "")) < 8:
            raise HTTPError_(400, "비밀번호는 8자 이상이어야 합니다")
        x("UPDATE users SET pw_hash=? WHERE id=?", (hash_pw(d["new"]), u["id"]))
        x("DELETE FROM sessions WHERE user_id=?", (u["id"],))
        tok = new_session(u["id"])
        self.send_json(200, {"ok": True}, cookie=self.cookie(tok, SESSION_DAYS * 86400))

    # ── 글 ──
    def api_posts(self, qs):
        u = self.need_user()
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
        rng = g("range")
        if rng in ("1", "7", "30"):
            where.append("p.created_at>?"); args.append(now() - int(rng) * 86400)
        if g("q"):
            like = f"%{g('q')}%"
            where.append("(p.source_title LIKE ? OR p.summary_json LIKE ? OR p.note LIKE ? OR p.url LIKE ? OR u.name LIKE ?)")
            args += [like] * 5
        if g("before").isdigit():
            where.append("p.id<?"); args.append(int(g("before")))
        order = "likes DESC, ncomments DESC, p.id DESC" if g("sort") == "popular" else "p.id DESC"
        sql = POST_SELECT + (" WHERE " + " AND ".join(where) if where else "") + f" ORDER BY {order} LIMIT 30"
        rows = q(sql, args)
        self.send_json(200, {"posts": [post_row(r, u["id"]) for r in rows]})

    def api_post_get(self, qs, pid):
        u = self.need_user()
        r = q(POST_SELECT + " WHERE p.id=?", (u["id"], pid), one=True)
        if not r:
            raise HTTPError_(404, "글이 없습니다")
        self.send_json(200, post_row(r, u["id"], full=True))

    def api_post_create(self, qs):
        u = self.need_user()
        d = self.body_json()
        url = (d.get("url") or "").strip()
        note = (d.get("note") or "").strip()[:1000]
        pasted = (d.get("text") or "").strip()[:400_000]
        f = d.get("file")
        if not url and not f and not pasted:
            raise HTTPError_(400, "링크, 파일, 본문 중 하나는 있어야 합니다")
        kind, engine, title, site = "article", "claude", "", ""
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
            try:
                raw = base64.b64decode(f.get("data") or "", validate=True)
            except ValueError:
                raise HTTPError_(400, "파일을 읽지 못했습니다")
            if len(raw) > MAX_UPLOAD:
                raise HTTPError_(413, "파일이 20MB를 넘습니다")
            if ftype == "application/pdf" and not raw.startswith(b"%PDF-"):
                raise HTTPError_(400, "PDF 파일이 아닙니다")
            file_type = ftype
            file_name = re.sub(r"[\\/\x00-\x1f]", "_", (f.get("name") or "file"))[:150]
            file_path = f"{secrets.token_hex(16)}{ALLOWED_UPLOAD[ftype]}"
            (UPLOAD_DIR / file_path).write_bytes(raw)
            kind = "pdf" if ftype == "application/pdf" else "image"
            title = title or re.sub(r"\.[^.]+$", "", file_name)
        elif pasted and not url:
            kind = "text"
        if kind == "video" and pasted:
            engine = "claude"  # 영상 대본을 붙여넣었으면 글로 정리한다
            kind = "text"
        t = now()
        pid = x("""INSERT INTO posts(user_id, url, kind, engine, note, pasted_text, file_name, file_path, file_type,
                   source_title, source_site, status, created_at, updated_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (u["id"], url or None, kind, engine, note, pasted or None, file_name, file_path, file_type,
                 title, site, "queued", t, t))
        jobs.put(pid)
        self.send_json(201, {"id": pid})

    def api_post_delete(self, qs, pid):
        u = self.need_user()
        p = q("SELECT * FROM posts WHERE id=?", (pid,), one=True)
        if not p:
            raise HTTPError_(404, "글이 없습니다")
        if p["user_id"] != u["id"] and u["role"] != "admin":
            raise HTTPError_(403, "올린 사람이나 관리자만 지울 수 있습니다")
        if p["file_path"]:
            try:
                (UPLOAD_DIR / p["file_path"]).unlink()
            except FileNotFoundError:
                pass
        with _db_lock:
            x("DELETE FROM likes WHERE post_id=?", (pid,))
            x("DELETE FROM comments WHERE post_id=?", (pid,))
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
            x("UPDATE posts SET pasted_text=?, engine='claude', kind=CASE WHEN kind='video' THEN 'text' ELSE kind END WHERE id=?",
              (text, pid))
        set_status(pid, "queued", "")
        jobs.put(pid)
        self.send_json(200, {"ok": True})

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

    def api_file(self, qs, pid):
        self.need_user()
        p = q("SELECT file_path, file_type, file_name FROM posts WHERE id=?", (pid,), one=True)
        if not p or not p["file_path"]:
            raise HTTPError_(404, "파일이 없습니다")
        data = (UPLOAD_DIR / p["file_path"]).read_bytes()
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

    # ── 관리 ──
    def api_admin_users(self, qs):
        self.need_user(admin=True)
        users = [dict(r) for r in q(
            "SELECT u.id, u.name, u.role, u.active, u.created_at, u.last_login, "
            "(SELECT COUNT(*) FROM posts p WHERE p.user_id=u.id) AS posts FROM users u ORDER BY u.name")]
        invites = [dict(r) for r in q(
            "SELECT id, name, role, created_at, expires_at FROM invites WHERE used_at IS NULL AND expires_at>? ORDER BY id DESC",
            (now(),))]
        self.send_json(200, {"users": users, "invites": invites, "ai": {
            "claude": bool(os.environ.get("ANTHROPIC_API_KEY")), "claude_model": CLAUDE_MODEL,
            "gemini": bool(os.environ.get("GEMINI_API_KEY")), "gemini_model": GEMINI_MODEL},
            "queue": jobs.qsize()})

    def api_admin_invite(self, qs):
        me = self.need_user(admin=True)
        d = self.body_json()
        role = "admin" if d.get("role") == "admin" else "member"
        try:
            code = new_invite(d.get("name", ""), role, me["id"])
        except ValueError as e:
            raise HTTPError_(400, str(e))
        self.send_json(201, {"name": norm_name(d.get("name", "")), "code": code, "days": INVITE_DAYS})

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
        out = {"ok": True}
        if d.get("reset"):
            out["code"] = new_invite(u["name"], u["role"], me["id"])
            out["name"] = u["name"]
        self.send_json(200, out)

    def api_admin_invite_delete(self, qs, iid):
        self.need_user(admin=True)
        x("UPDATE invites SET used_at=? WHERE id=?", (now(), iid))
        self.send_json(200, {"ok": True})


ROUTES = {
    ("GET", r"/api/me"): Handler.api_me,
    ("POST", r"/api/login"): Handler.api_login,
    ("POST", r"/api/join"): Handler.api_join,
    ("POST", r"/api/logout"): Handler.api_logout,
    ("POST", r"/api/password"): Handler.api_password,
    ("GET", r"/api/posts"): Handler.api_posts,
    ("POST", r"/api/posts"): Handler.api_post_create,
    ("GET", r"/api/posts/(\d+)"): Handler.api_post_get,
    ("DELETE", r"/api/posts/(\d+)"): Handler.api_post_delete,
    ("POST", r"/api/posts/(\d+)/retry"): Handler.api_post_update,
    ("POST", r"/api/posts/(\d+)/like"): Handler.api_like,
    ("POST", r"/api/posts/(\d+)/comments"): Handler.api_comment,
    ("DELETE", r"/api/comments/(\d+)"): Handler.api_comment_delete,
    ("GET", r"/api/files/(\d+)"): Handler.api_file,
    ("GET", r"/api/tags"): Handler.api_tags,
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
    print(f"이름: {norm_name(a.name)}  초대 코드: {code}  ({INVITE_DAYS}일 안에 한 번만 쓸 수 있음"
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
