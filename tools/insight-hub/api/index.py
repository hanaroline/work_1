"""Vercel 입구 — 기존 server.py 의 요청 처리기를 WSGI 앱으로 감싼다.

Vercel 의 Python 런타임은 이 파일의 `app`(WSGI)을 부른다. 화면·API 처리는 모두 server.py 가
그대로 맡고, 여기서는 WSGI 요청을 BaseHTTPRequestHandler 가 읽는 모양으로 바꿔 넘긴 뒤
처리기가 써 낸 HTTP 응답을 다시 WSGI 로 풀어 돌려줄 뿐이다.
"""
from __future__ import annotations

import io
import sys
from email.message import Message
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import server  # noqa: E402

_REASONS = {200: "OK", 201: "Created", 204: "No Content", 304: "Not Modified", 400: "Bad Request",
            401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed",
            409: "Conflict", 413: "Payload Too Large", 429: "Too Many Requests", 500: "Internal Server Error"}


class _Handler(server.Handler):
    """소켓 없이 한 요청을 처리한다(BaseHTTPRequestHandler 의 생성자를 건너뛴다)."""

    def __init__(self, environ):  # noqa: D401 — 부모 생성자는 소켓을 읽으므로 부르지 않는다
        method = environ.get("REQUEST_METHOD", "GET").upper()
        path = environ.get("PATH_INFO", "/") or "/"
        query = environ.get("QUERY_STRING", "")
        self.command = method
        self.path = path + ("?" + query if query else "")
        self.request_version = "HTTP/1.1"
        self.requestline = f"{method} {self.path} HTTP/1.1"
        self.close_connection = True
        self.connection = None  # ssl.SSLSocket 이 아니다 → 보안 쿠키는 SERVERLESS 판단으로 붙인다
        h = Message()
        for k, v in environ.items():
            if k.startswith("HTTP_"):
                h[k[5:].replace("_", "-").title()] = v
        if environ.get("CONTENT_TYPE"):
            h["Content-Type"] = environ["CONTENT_TYPE"]
        if environ.get("CONTENT_LENGTH"):
            h["Content-Length"] = environ["CONTENT_LENGTH"]
        self.headers = h
        # Vercel 이 덧씌우는 x-forwarded-for 의 첫 값이 실제 접속 주소다(사용자가 위조할 수 없음)
        ip = (h.get("X-Real-Ip") or h.get("X-Forwarded-For", "").split(",")[0]).strip() \
            or environ.get("REMOTE_ADDR", "0.0.0.0")
        self.client_address = (ip, 0)
        n = int(environ.get("CONTENT_LENGTH") or 0)
        body = environ["wsgi.input"].read(n) if n > 0 else b""
        self.rfile = io.BytesIO(body)
        self.wfile = io.BytesIO()

    def client_ip(self) -> str:
        return self.client_address[0]

    def secure(self) -> bool:
        return True  # Vercel 은 HTTPS 로만 들어온다


def _split(raw: bytes):
    head, _, body = raw.partition(b"\r\n\r\n")
    lines = head.decode("latin-1").split("\r\n")
    code = int(lines[0].split(" ", 2)[1])
    headers = []
    for ln in lines[1:]:
        if ":" in ln:
            k, v = ln.split(":", 1)
            if k.lower() not in ("server", "date", "connection", "transfer-encoding"):
                headers.append((k.strip(), v.strip()))
    return code, headers, body


def app(environ, start_response):
    hd = _Handler(environ)
    method = hd.command
    if method in ("GET", "HEAD", "POST", "DELETE"):
        hd.route("GET" if method == "HEAD" else method)
    else:
        hd.send_json(405, {"error": "허용되지 않은 요청입니다"})
    code, headers, body = _split(hd.wfile.getvalue())
    start_response(f"{code} {_REASONS.get(code, 'OK')}", headers)
    return [b"" if method == "HEAD" else body]
