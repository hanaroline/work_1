#!/usr/bin/env python3
"""로컬 실행 서버 (정적 파일 + 시세 API 프록시)

사용법
    python3 serve.py            # http://localhost:8000
    python3 serve.py 9000       # 포트 지정

왜 필요한가
    datacenter.html / index.html 은 브라우저에서 네이버·Yahoo 시세 API를 직접 호출한다.
    브라우저는 다른 도메인의 응답을 CORS 정책으로 차단하기 때문에, 파일을 그냥 열면
    (file://) 시세가 표시되지 않는 경우가 많다. 이 서버를 띄우면 브라우저가 아니라
    이 서버가 시세 API를 대신 호출(/api/proxy)하므로 CORS 문제가 사라진다.

    화면의 시세 조회는 /api/proxy 를 1순위로 시도하고, 실패 시 공개 CORS 프록시로
    폴백한다. 즉 이 서버로 접속하면 가장 확실하게 시세가 나온다.

사내 프록시 환경
    HTTPS_PROXY / HTTP_PROXY 환경변수를 그대로 사용한다.
        HTTPS_PROXY=http://proxy.company.co.kr:8080 python3 serve.py
"""

import http.server
import json
import os
import socketserver
import sys
import urllib.error
import urllib.parse
import urllib.request

# /api/proxy 로 호출을 허용하는 호스트 (시세·뉴스 조회용으로 한정)
ALLOWED_HOSTS = (
    "m.stock.naver.com",
    "polling.finance.naver.com",
    "api.stock.naver.com",
    "finance.naver.com",
    "query1.finance.yahoo.com",
    "query2.finance.yahoo.com",
    "stooq.com",
    "stooq.pl",
    "news.google.com",
)

TIMEOUT = 8


def host_allowed(hostname):
    if not hostname:
        return False
    hostname = hostname.lower()
    return any(hostname == h or hostname.endswith("." + h) for h in ALLOWED_HOSTS)


class Handler(http.server.SimpleHTTPRequestHandler):
    server_version = "dc-map-serve/1.0"

    def do_GET(self):
        if self.path.split("?")[0].rstrip("/") in ("/api/proxy", "api/proxy"):
            self.handle_proxy()
            return
        http.server.SimpleHTTPRequestHandler.do_GET(self)

    def handle_proxy(self):
        query = urllib.parse.urlparse(self.path).query
        target = urllib.parse.parse_qs(query).get("url", [""])[0]
        parsed = urllib.parse.urlparse(target)

        if parsed.scheme not in ("http", "https") or not host_allowed(parsed.hostname):
            self.send_json(403, {"error": "host not allowed", "url": target})
            return

        req = urllib.request.Request(target, headers={
            "User-Agent": "Mozilla/5.0 (compatible; dc-map-serve)",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "ko,en;q=0.8",
            "Referer": "%s://%s/" % (parsed.scheme, parsed.hostname),
        })
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
                body = res.read()
                ctype = res.headers.get("Content-Type", "application/json; charset=utf-8")
        except urllib.error.HTTPError as e:
            self.send_json(502, {"error": "upstream HTTP %s" % e.code, "url": target})
            return
        except Exception as e:  # 네트워크 차단·타임아웃 등
            self.send_json(502, {"error": "%s: %s" % (type(e).__name__, e), "url": target})
            return

        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # 정적 파일도 캐시하지 않도록(수정 후 새로고침만으로 반영)
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s\n" % (fmt % args))


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or "-"
    with Server(("0.0.0.0", port), Handler) as httpd:
        print("데이터센터 밸류체인 맵 : http://localhost:%d/datacenter.html" % port)
        print("종목 통합 리포트      : http://localhost:%d/index.html" % port)
        print("시세 프록시           : /api/proxy?url=...  (허용 호스트 %d개)" % len(ALLOWED_HOSTS))
        print("상위 프록시(HTTPS_PROXY): %s" % proxy)
        print("종료: Ctrl+C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n종료")


if __name__ == "__main__":
    main()
