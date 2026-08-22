#!/usr/bin/env python3
"""금융상품 통합조회 — 로컬 실행 서버 (표준 라이브러리만 사용, 설치 불필요)

브라우저가 KRX 를 직접 호출하면 CORS 로 막힌다. 이 스크립트를 실행하면
파이썬이 서버 대 서버로 KRX 를 호출해 주므로 CORS 자체가 발생하지 않고
화면에 실데이터가 들어온다.

사용법
    python serve-products.py                # 서버 실행 + 브라우저 자동 열기
    python serve-products.py --port 9000    # 포트 지정
    python serve-products.py --no-browser   # 브라우저 자동 열기 없이
    python serve-products.py --snapshot     # 실데이터를 파일로 저장(오프라인용)
    python serve-products.py --check        # KRX 연결만 점검하고 종료

윈도우에서는 같은 폴더의 `조회화면 실행.bat` 을 더블클릭해도 된다.

--snapshot 으로 만든 data/krx-snapshot.js 를 products-standalone.html 과 같은
폴더에 두면, 서버를 켜지 않아도(파일 더블클릭) 저장된 실데이터로 조회할 수 있다.
"""

import argparse
import http.cookiejar
import json
import os
import re
import socket
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
KRX_URL = "https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd"
KRX_REFERER = "https://data.krx.co.kr/contents/MDC/MDI/outerLoader/index.cmd"
# 쿠키를 받기 위해 먼저 방문하는 페이지. KRX 는 세션 쿠키(JSESSIONID) 없이
# getJsonData.cmd 를 POST 하면 HTTP 400 을 돌려준다.
KRX_WARMUP = [
    "https://data.krx.co.kr/",
    "https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020101",
]
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

# 쿠키를 유지하는 opener — 이걸로 warmup 과 POST 를 같은 세션으로 처리한다
_cookies = http.cookiejar.CookieJar()
_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_cookies))
_warmed = False

# 화면(data/sources.js)이 호출하는 것과 동일한 엔드포인트.
# ID·파라미터명은 pykrx 에 공개된 KRX 메뉴 카탈로그에서 확인한 값이다.
BLD = "dbms/MDC/STAT/standard/"
SNAPSHOT_PLAN = [
    ("ETF 전종목 기본정보", BLD + "MDCSTAT04601", {}),
    ("ETF 전종목 시세", BLD + "MDCSTAT04301", {"trdDd": "@D0"}),
    ("ETF 등락률 1개월", BLD + "MDCSTAT04401", {"strtDd": "@M1", "endDd": "@D0"}),
    ("ETF 등락률 3개월", BLD + "MDCSTAT04401", {"strtDd": "@M3", "endDd": "@D0"}),
    ("ETF 등락률 6개월", BLD + "MDCSTAT04401", {"strtDd": "@M6", "endDd": "@D0"}),
    ("ETF 등락률 1년", BLD + "MDCSTAT04401", {"strtDd": "@M12", "endDd": "@D0"}),
    ("ETN 전종목 기본정보", BLD + "MDCSTAT06701", {}),
    ("ETN 전종목 시세", BLD + "MDCSTAT06401", {"trdDd": "@D0"}),
    ("채권 전종목 시세", BLD + "MDCSTAT09801", {"trdDd": "@D0"}),
]

krx_url = KRX_URL          # --krx-url 로 사내 프록시/테스트 서버로 바꿀 수 있다
timeout_s = 20


# --------------------------------------------------------------------- 날짜
def last_business_day(ts):
    """주말이면 직전 금요일로 당긴다(공휴일은 응답이 비면 하루씩 물러난다)."""
    t = time.localtime(ts)
    while t.tm_wday >= 5:
        ts -= 86400
        t = time.localtime(ts)
    return ts


def resolve_date_token(token, base_ts):
    """@D0=기준일, @M3=3개월 전 → YYYYMMDD"""
    m = re.fullmatch(r"@D0", token)
    if m:
        return time.strftime("%Y%m%d", time.localtime(last_business_day(base_ts)))
    m = re.fullmatch(r"@M(\d+)", token)
    if m:
        months = int(m.group(1))
        t = time.localtime(base_ts)
        year, month = t.tm_year, t.tm_mon - months
        while month <= 0:
            month += 12
            year -= 1
        day = min(t.tm_mday, 28)
        ts = time.mktime((year, month, day, 12, 0, 0, 0, 0, -1))
        return time.strftime("%Y%m%d", time.localtime(last_business_day(ts)))
    return token


# ---------------------------------------------------------------- KRX 호출
def warmup(force=False, verbose=False):
    """KRX 페이지를 먼저 방문해 세션 쿠키를 받아 둔다.

    이 단계를 건너뛰면 getJsonData.cmd 가 HTTP 400 을 돌려준다.
    사내 프록시(--krx-url)로 우회하는 경우에는 필요 없으므로 건너뛴다.
    """
    global _warmed
    if _warmed and not force:
        return True
    # 워밍업 대상은 실제 호출 주소의 origin 에서 유도한다 (사내 프록시도 동일하게 처리)
    parts = urllib.parse.urlsplit(krx_url)
    origin = "%s://%s/" % (parts.scheme, parts.netloc)
    targets = [origin]
    if parts.netloc.endswith("data.krx.co.kr"):
        targets = KRX_WARMUP
    got = False
    for url in targets:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with _opener.open(req, timeout=timeout_s) as r:
                r.read(2048)    # 본문은 필요 없다 — 쿠키만 받으면 된다
            got = True
        except Exception as e:
            if verbose:
                print("  [warmup] %s -> %s" % (url, e))
    names = sorted(c.name for c in _cookies)
    if verbose:
        print("  [warmup] 쿠키 %d개: %s" % (len(names), ", ".join(names) or "(없음)"))
    _warmed = got
    return got


def krx_post(bld, params, base_ts=None, _retry=True):
    """서버에서 KRX 를 직접 호출한다 — 브라우저가 아니므로 CORS 가 없다."""
    base_ts = base_ts if base_ts is not None else time.time()
    warmup()
    body = {"bld": bld}
    for k, v in (params or {}).items():
        body[k] = resolve_date_token(v, base_ts) if isinstance(v, str) and v.startswith("@") else v
    data = urllib.parse.urlencode(body).encode("utf-8")
    req = urllib.request.Request(
        krx_url, data=data,
        headers={
            # pykrx 가 보내는 것과 동일하게 맞춘다 (charset 접미사 없음)
            "User-Agent": UA,
            "Referer": KRX_REFERER,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
        })
    try:
        with _opener.open(req, timeout=timeout_s) as r:
            raw = r.read()
    except urllib.error.HTTPError as e:
        # 400/401/403 은 세션이 만료·누락된 경우가 많다 — 한 번 다시 워밍업해 재시도
        if _retry and e.code in (400, 401, 403):
            warmup(force=True)
            return krx_post(bld, params, base_ts, _retry=False)
        detail = ""
        try:
            detail = e.read(400).decode("utf-8", "replace").strip().replace("\n", " ")
        except Exception:
            pass
        raise RuntimeError("HTTP %s%s" % (e.code, (" | " + detail) if detail else ""))
    text = raw.decode("utf-8", "replace")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise RuntimeError("JSON 이 아닌 응답: %s" % text[:200].replace("\n", " "))


def rows_of(payload):
    if not isinstance(payload, dict):
        return []
    for key in ("output", "OutBlock_1", "block1"):
        v = payload.get(key)
        if isinstance(v, list):
            return v
    for v in payload.values():
        if isinstance(v, list):
            return v
    return []


# ------------------------------------------------------------------ 스냅샷
def build_snapshot(out_path, base_ts=None):
    """모든 엔드포인트를 호출해 원본 응답을 그대로 저장한다.

    파싱은 화면(data/sources.js)이 담당하므로 여기서는 가공하지 않는다.
    같은 로직을 파이썬에 중복 구현하지 않기 위한 의도적인 선택이다.
    """
    base_ts = base_ts if base_ts is not None else time.time()
    snap, ok, fail = {}, 0, 0
    for label, bld, params in SNAPSHOT_PLAN:
        short = bld.rsplit("/", 1)[-1]
        try:
            payload = krx_post(bld, params, base_ts)
            n = len(rows_of(payload))
            snap.setdefault(short, []).append(payload)
            if n:
                ok += 1
                print("  [OK]   %-22s %6d건" % (label, n))
            else:
                fail += 1
                print("  [빈값] %-22s (거래일이 아니거나 조회 조건 확인 필요)" % label)
        except Exception as e:  # 개별 실패는 건너뛴다 — 나머지는 저장한다
            fail += 1
            snap.setdefault(short, []).append({"__error__": str(e)})
            print("  [실패] %-22s %s" % (label, e))

    payload = {
        "asOf": time.strftime("%Y-%m-%d %H:%M", time.localtime()),
        "source": "KRX",
        "calls": snap,
    }
    js = ("/* KRX 실데이터 스냅샷 — serve-products.py --snapshot 으로 생성\n"
          "   생성 시각: %s\n"
          "   원본 응답을 그대로 담고 있으며 파싱은 data/sources.js 가 담당한다.\n"
          "   products-standalone.html 과 같은 폴더에 두면 서버 없이도 실데이터로 조회된다. */\n"
          "window.MASP_SNAPSHOT = %s;\n" % (payload["asOf"], json.dumps(payload, ensure_ascii=False)))
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(js)
    size = os.path.getsize(out_path) / 1024.0
    print("\n저장: %s (%.0f KB)  성공 %d / 실패 %d" % (out_path, size, ok, fail))
    return ok, fail


# -------------------------------------------------------------------- 서버
class Handler(SimpleHTTPRequestHandler):
    """정적 파일 + /api/krx 프록시. 로컬 전용이므로 외부에 열지 않는다."""

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        if "/api/" in self.path:
            sys.stderr.write("  proxy %s\n" % (fmt % args))

    def _send_json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if urllib.parse.urlparse(self.path).path != "/api/krx":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(length).decode("utf-8") if length else ""
            fields = urllib.parse.parse_qs(raw, keep_blank_values=True)
            bld = (fields.pop("bld", [""]) or [""])[0]
            if not bld:
                self._send_json({"error": "bld 파라미터가 없습니다"}, 400)
                return
            params = {k: v[0] for k, v in fields.items()}
            self._send_json(krx_post(bld, params))
        except urllib.error.HTTPError as e:
            self._send_json({"error": "KRX HTTP %s" % e.code}, 502)
        except Exception as e:
            self._send_json({"error": str(e)}, 502)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json({"ok": True, "root": ROOT})
            return
        if parsed.path == "/api/proxy":
            target = urllib.parse.parse_qs(parsed.query).get("url", [""])[0]
            if not target.startswith(("http://", "https://")):
                self._send_json({"error": "url 파라미터가 필요합니다"}, 400)
                return
            try:
                req = urllib.request.Request(target, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=timeout_s) as r:
                    body, ctype = r.read(), r.headers.get("Content-Type", "text/plain")
                self.send_response(200)
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                self._send_json({"error": str(e)}, 502)
            return
        if parsed.path == "/":
            self.path = "/products.html"
        super().do_GET()


def pick_port(preferred):
    for port in [preferred] + [preferred + i for i in range(1, 20)]:
        with socket.socket() as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return preferred


def main():
    global krx_url, timeout_s
    ap = argparse.ArgumentParser(description="금융상품 통합조회 로컬 실행 서버")
    ap.add_argument("--port", type=int, default=8800)
    ap.add_argument("--no-browser", action="store_true", help="브라우저 자동 열기 없이 실행")
    ap.add_argument("--snapshot", action="store_true", help="실데이터를 파일로 저장하고 종료")
    ap.add_argument("--check", action="store_true", help="KRX 연결만 점검하고 종료")
    ap.add_argument("--out", default=os.path.join(ROOT, "data", "krx-snapshot.js"))
    ap.add_argument("--krx-url", default=KRX_URL, help="사내 프록시 등으로 KRX 주소 변경")
    ap.add_argument("--timeout", type=int, default=20)
    args = ap.parse_args()
    krx_url, timeout_s = args.krx_url, args.timeout

    if args.check:
        print("KRX 연결 점검: %s" % krx_url)
        warmup(force=True, verbose=True)
        try:
            payload = krx_post(BLD + "MDCSTAT04601", {})
            n = len(rows_of(payload))
            print("  응답 OK — ETF 기본정보 %d건" % n)
            if n:
                print("  응답 키: %s" % " ".join(list(rows_of(payload)[0].keys())))
            return 0 if n else 2
        except Exception as e:
            print("  실패: %s" % e)
            print("\n  사내망에서 프록시가 필요하면 환경변수 HTTPS_PROXY 를 설정하거나")
            print("  --krx-url 로 사내 프록시 주소를 지정하세요.")
            return 2

    if args.snapshot:
        print("KRX 실데이터 조회 중 (%s)\n" % krx_url)
        os.makedirs(os.path.dirname(args.out), exist_ok=True)
        ok, _ = build_snapshot(args.out, time.time())
        if ok:
            print("\nproducts-standalone.html 을 다시 만들면 스냅샷이 포함됩니다:")
            print("  python build-products-standalone.py")
        return 0 if ok else 2

    port = pick_port(args.port)
    url = "http://127.0.0.1:%d/products.html" % port
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print("=" * 64)
    print(" 금융상품 통합조회 — 로컬 실행")
    print("=" * 64)
    print(" 주소   : %s" % url)
    print(" 폴더   : %s" % ROOT)
    print(" KRX    : %s (서버에서 호출하므로 CORS 없음)" % krx_url)
    print(" 종료   : 이 창에서 Ctrl+C")
    print("=" * 64)
    if not args.no_browser:
        def open_browser():
            # 잠긴 환경에서는 자동 열기가 실패할 수 있다 — 실패해도 서버는 계속 돈다
            try:
                if not webbrowser.open(url):
                    raise RuntimeError("기본 브라우저를 찾지 못했습니다")
            except Exception as e:
                print("\n [알림] 브라우저 자동 열기 실패(%s)\n"
                      "        위 주소를 브라우저에 직접 붙여넣어 주세요: %s\n" % (e, url))
        threading.Timer(0.7, open_browser).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n종료합니다.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
