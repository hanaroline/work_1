#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
종목 통합 리포트 · 실시간 실행기 (single-file launcher)
--------------------------------------------------------
브라우저에서 파일을 직접 열면(file://) 외부 시세 API가 CORS로 막혀
샘플 데이터만 표시됩니다. 이 스크립트는

  1) 페이지를 http://localhost 로 서빙하고 (origin=null 문제 해결)
  2) /proxy?url=... 로 들어온 요청을 '서버가 대신' 받아와 돌려줍니다.
     (브라우저 CORS 우회 → 네이버/야후/구글뉴스 실시간 데이터 사용)

사용법:
    python serve.py            # 기본 포트 8000, 브라우저 자동 오픈
    python serve.py 9000       # 포트 지정

별도 설치 불필요(파이썬 표준 라이브러리만 사용). Python 3.7+ 권장.
서버(=이 PC)가 finance.naver.com 등에 접근 가능해야 실시간이 됩니다.
"""
import sys, os, json, gzip, io, webbrowser, threading, time
from urllib.parse import urlparse, parse_qs, unquote
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
# 서빙할 기본 문서(있는 것을 우선순위로)
INDEX_CANDIDATES = ["money.html", "money-standalone.html", "index.html"]
# 프록시 허용 호스트(오남용 방지: 필요한 데이터 소스만 통과)
ALLOW_HOSTS = (
    "stock.naver.com", "m.stock.naver.com", "finance.naver.com", "polling.finance.naver.com",
    "query1.finance.yahoo.com", "query2.finance.yahoo.com",
    "news.google.com",
)
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")


def host_allowed(url):
    try:
        h = urlparse(url).hostname or ""
    except Exception:
        return False
    h = h.lower()
    return any(h == a or h.endswith("." + a) for a in ALLOW_HOSTS)


def fetch(url, timeout=8):
    req = Request(url, headers={
        "User-Agent": UA,
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        "Referer": "https://m.stock.naver.com/",
    })
    with urlopen(req, timeout=timeout) as r:
        raw = r.read()
        if r.headers.get("Content-Encoding", "").lower() == "gzip":
            try:
                raw = gzip.decompress(raw)
            except Exception:
                pass
        ctype = r.headers.get("Content-Type", "application/octet-stream")
        return r.status, ctype, raw


def default_index():
    for name in INDEX_CANDIDATES:
        if os.path.exists(os.path.join(ROOT, name)):
            return name
    return None


class Handler(BaseHTTPRequestHandler):
    server_version = "StockReportLauncher/1.0"

    def log_message(self, fmt, *args):
        # 프록시 접근만 간단히 로깅
        if "/proxy" in (self.path or ""):
            sys.stderr.write("  · %s\n" % (self.path[:120]))

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/proxy":
            return self.handle_proxy(parsed)
        return self.handle_static(parsed)

    def handle_proxy(self, parsed):
        qs = parse_qs(parsed.query)
        url = (qs.get("url") or [None])[0]
        if url:
            url = unquote(url)
        if not url or not host_allowed(url):
            self.send_response(403)
            self._cors(); self.send_header("Content-Type", "application/json; charset=utf-8"); self.end_headers()
            self.wfile.write(json.dumps({"error": "host not allowed", "url": url}).encode("utf-8"))
            return
        try:
            status, ctype, body = fetch(url)
        except HTTPError as e:
            status, ctype, body = e.code, "text/plain; charset=utf-8", (str(e).encode("utf-8"))
        except (URLError, Exception) as e:
            self.send_response(502)
            self._cors(); self.send_header("Content-Type", "application/json; charset=utf-8"); self.end_headers()
            self.wfile.write(json.dumps({"error": "fetch failed", "detail": str(e), "url": url}).encode("utf-8"))
            return
        self.send_response(status if 200 <= status < 600 else 200)
        self._cors()
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        try:
            self.wfile.write(body)
        except BrokenPipeError:
            pass

    def handle_static(self, parsed):
        rel = unquote(parsed.path.lstrip("/"))
        if rel in ("", "/"):
            idx = default_index()
            if not idx:
                self.send_error(404, "no index html found")
                return
            rel = idx
        # 디렉터리 탈출 방지
        full = os.path.normpath(os.path.join(ROOT, rel))
        if not full.startswith(ROOT) or not os.path.isfile(full):
            self.send_error(404, "not found: %s" % rel)
            return
        ext = os.path.splitext(full)[1].lower()
        ctype = {
            ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
            ".svg": "image/svg+xml",
        }.get(ext, "application/octet-stream")
        with open(full, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        try:
            self.wfile.write(data)
        except BrokenPipeError:
            pass


def main():
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    idx = default_index()
    if not idx:
        print("[오류] 같은 폴더에 money.html 또는 money-standalone.html 이 필요합니다.")
        sys.exit(1)
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = "http://localhost:%d/" % port
    print("=" * 56)
    print("  종목 통합 리포트 · 실시간 실행기")
    print("  문서 : %s" % idx)
    print("  주소 : %s" % url)
    print("  종료 : Ctrl+C")
    print("=" * 56)

    def open_browser():
        time.sleep(0.8)
        try:
            webbrowser.open(url)
        except Exception:
            pass
    threading.Thread(target=open_browser, daemon=True).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n종료합니다.")
        httpd.shutdown()


if __name__ == "__main__":
    main()
