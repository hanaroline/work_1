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
    python serve-products.py --report       # 진단 리포트 출력/저장
    python serve-products.py --krx-login    # KRX 계정으로 로그인해서 실행

KRX(data.krx.co.kr)는 2025년 이후 비로그인 조회를 HTTP 400 "LOGOUT" 으로
거부한다. 실데이터를 받으려면 무료 KRX 회원 계정이 필요하다.
계정은 https://data.krx.co.kr 에서 만들 수 있고, 아래 중 하나로 전달한다.
    --krx-login                (권장: 비밀번호가 화면·명령기록에 남지 않음)
    환경변수 KRX_ID / KRX_PW

윈도우에서는 같은 폴더의 `조회화면 실행.bat` 을 더블클릭해도 된다.

--snapshot 으로 만든 data/krx-snapshot.js 를 products-standalone.html 과 같은
폴더에 두면, 서버를 켜지 않아도(파일 더블클릭) 저장된 실데이터로 조회할 수 있다.
"""

import argparse
import getpass
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
# 파일이 실제로 교체됐는지 한눈에 확인하기 위한 빌드 표시
BUILD = "2026-08-22.4 (krx-login)"
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

# KRX 회원 로그인 절차 (data.krx.co.kr 는 로그인 없이 조회하면 400 "LOGOUT" 을 준다)
KRX_LOGIN_PAGE = "https://data.krx.co.kr/contents/MDC/COMS/client/MDCCOMS001.cmd"
KRX_LOGIN_JSP = "https://data.krx.co.kr/contents/MDC/COMS/client/view/login.jsp?site=mdc"
KRX_LOGIN_URL = "https://data.krx.co.kr/contents/MDC/COMS/client/MDCCOMS001D1.cmd"

# 쿠키를 유지하는 opener — 이걸로 warmup/로그인/POST 를 같은 세션으로 처리한다
_cookies = http.cookiejar.CookieJar()
_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_cookies))
_warmed = False
_logged_in = False
krx_id = None
krx_pw = None

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


def krx_login(verbose=False):
    """KRX 회원 로그인. data.krx.co.kr 는 비로그인 조회를 400 'LOGOUT' 으로 거부한다.

    절차는 pykrx 와 동일하다.
      1) 로그인 페이지 GET (세션 발급)   2) login.jsp GET (iframe 세션 초기화)
      3) MDCCOMS001D1.cmd POST (로그인)  4) CD011(중복 로그인) 이면 skipDup=Y 재전송
    반환: (성공여부, 코드, 메시지)
    """
    global _logged_in
    if not (krx_id and krx_pw):
        return False, "NO_CREDENTIAL", "KRX 계정 정보가 없습니다"

    # 로그인 주소도 실제 호출 주소의 origin 에서 유도한다. 사내 프록시가 KRX 경로를
    # 그대로 중계하는 경우에도 동작하고, 테스트 서버로 검증할 수 있다.
    parts = urllib.parse.urlsplit(krx_url)
    origin = "%s://%s" % (parts.scheme, parts.netloc)
    page = origin + "/contents/MDC/COMS/client/MDCCOMS001.cmd"
    jsp = origin + "/contents/MDC/COMS/client/view/login.jsp?site=mdc"
    post_url = origin + "/contents/MDC/COMS/client/MDCCOMS001D1.cmd"

    for url, ref in ((page, None), (jsp, page)):
        try:
            h = {"User-Agent": UA}
            if ref:
                h["Referer"] = ref
            with _opener.open(urllib.request.Request(url, headers=h), timeout=timeout_s) as r:
                r.read(2048)
        except Exception as e:
            if verbose:
                print("  [login] 준비 요청 실패 %s -> %s" % (url[:52], e))

    payload = {"mbrNm": "", "telNo": "", "di": "", "certType": "", "mbrId": krx_id, "pw": krx_pw}

    def attempt(p):
        data = urllib.parse.urlencode(p).encode("utf-8")
        req = urllib.request.Request(post_url, data=data, headers={
            "User-Agent": UA, "Referer": page,
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
        })
        with _opener.open(req, timeout=timeout_s) as r:
            return json.loads(r.read().decode("utf-8", "replace"))

    try:
        res = attempt(payload)
        code = res.get("_error_code", "")
        msg = res.get("_error_message", "")
        if code == "CD011":            # 중복 로그인 — 기존 세션을 밀어내고 재시도
            payload["skipDup"] = "Y"
            res = attempt(payload)
            code = res.get("_error_code", "")
            msg = res.get("_error_message", "")
        _logged_in = (code == "CD001")
        if verbose:
            if _logged_in:
                print("  [login] 로그인 성공 (%s)" % krx_id)
            elif code == "CD010":
                print("  [login] 비밀번호 변경이 필요합니다. www.krx.co.kr 에서 변경 후 다시 시도하세요.")
            else:
                print("  [login] 로그인 실패 code=%s msg=%s" % (code, msg))
        return _logged_in, code, msg
    except Exception as e:
        if verbose:
            print("  [login] 로그인 요청 실패: %s" % e)
        return False, "ERROR", str(e)


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
        detail = ""
        try:
            detail = e.read(400).decode("utf-8", "replace").strip().replace("\n", " ")
        except Exception:
            pass
        if _retry and e.code in (400, 401, 403):
            # 본문이 LOGOUT 이면 회원 로그인이 필요하다는 뜻 — 로그인 후 재시도
            if "LOGOUT" in detail.upper() and krx_id and krx_pw:
                if krx_login()[0]:
                    return krx_post(bld, params, base_ts, _retry=False)
            else:
                warmup(force=True)
                return krx_post(bld, params, base_ts, _retry=False)
        if "LOGOUT" in detail.upper() and not (krx_id and krx_pw):
            raise RuntimeError(
                "HTTP %s | LOGOUT — KRX 회원 로그인이 필요합니다. "
                "data.krx.co.kr 계정을 만든 뒤 KRX_ID/KRX_PW 환경변수 또는 "
                "--krx-login 옵션으로 로그인하세요." % e.code)
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


# ------------------------------------------------------------------ 진단 리포트
def write_report(path):
    """한 번 실행으로 진단에 필요한 모든 정보를 모아 출력하고 파일로도 남긴다."""
    lines = []

    def out(s=""):
        print(s)
        lines.append(s)

    out("=" * 62)
    out(" 금융상품 통합조회 — 진단 리포트")
    out("=" * 62)
    out("빌드        : %s" % BUILD)
    out("파이썬      : %s" % sys.version.split()[0])
    out("실행 경로   : %s" % sys.executable)
    out("폴더        : %s" % ROOT)
    out("KRX 주소    : %s" % krx_url)
    out("프록시 환경변수:")
    found_proxy = False
    for k in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "NO_PROXY", "no_proxy"):
        v = os.environ.get(k)
        if v:
            out("   %-12s = %s" % (k, v))
            found_proxy = True
    if not found_proxy:
        out("   (설정 없음)")
    out("파일 존재 확인:")
    for rel in ("products.html", "data/sources.js", "data/products.js", "products-standalone.html"):
        p = os.path.join(ROOT, rel.replace("/", os.sep))
        out("   %-28s %s" % (rel, "있음 (%d bytes)" % os.path.getsize(p) if os.path.exists(p) else "없음"))
    out()

    out("[1] 워밍업 (세션 쿠키 확보)")
    for url in (KRX_WARMUP if krx_url.startswith("https://data.krx.co.kr") else [krx_url]):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with _opener.open(req, timeout=timeout_s) as r:
                out("   GET %s -> HTTP %s" % (url[:58], r.status))
        except urllib.error.HTTPError as e:
            out("   GET %s -> HTTP %s" % (url[:58], e.code))
        except Exception as e:
            out("   GET %s -> 실패: %s" % (url[:58], e))
    names = sorted(c.name for c in _cookies)
    out("   확보한 쿠키: %s" % (", ".join(names) if names else "(없음)"))
    global _warmed
    _warmed = True          # 위에서 직접 워밍업했으므로 재시도하지 않는다
    out()

    out("[2] KRX 회원 로그인")
    if krx_id and krx_pw:
        ok_l, code_l, msg_l = krx_login(verbose=False)
        out("   ID          : %s" % krx_id)
        out("   결과        : %s (code=%s) %s" % ("성공" if ok_l else "실패", code_l, msg_l or ""))
        out("   로그인 후 쿠키: %s" % ", ".join(sorted(c.name for c in _cookies)))
    else:
        out("   계정 정보 없음 — 비로그인 상태로 조회합니다.")
        out("   KRX 는 비로그인 조회를 HTTP 400 'LOGOUT' 으로 거부합니다.")
        out("   data.krx.co.kr 계정을 만든 뒤 다음처럼 실행하세요:")
        out("       python serve-products.py --krx-login")
    out()

    out("[3] 엔드포인트별 조회")
    base_ts = time.time()
    ok = 0
    for label, bld, params in SNAPSHOT_PLAN:
        try:
            payload = krx_post(bld, params, base_ts)
            rows = rows_of(payload)
            if rows:
                ok += 1
                out("   [OK]   %-22s %5d건" % (label, len(rows)))
                if ok == 1:
                    out("          응답 키: %s" % " ".join(list(rows[0].keys())))
            else:
                keys = ", ".join(list(payload.keys())[:8]) if isinstance(payload, dict) else "?"
                out("   [빈값] %-22s (최상위 키: %s)" % (label, keys))
        except Exception as e:
            out("   [실패] %-22s %s" % (label, str(e)[:150]))
    out()
    out("결과: 성공 %d / 전체 %d" % (ok, len(SNAPSHOT_PLAN)))
    if ok:
        out("=> 실데이터 조회가 됩니다. 서버를 실행하세요:  python serve-products.py")
    else:
        out("=> 위 [실패] 사유를 그대로 전달해 주세요.")
    out("=" * 62)

    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
        print("\n리포트 저장: %s" % path)
    except Exception as e:
        print("\n리포트 파일 저장 실패(%s) — 위 내용을 복사해 주세요." % e)
    return 0 if ok else 2


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
            self._send_json({"ok": True, "build": BUILD, "root": ROOT})
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
    ap.add_argument("--probe", action="store_true",
                    help="런처가 이 파이썬으로 스크립트가 실행되는지 확인용 (아무 것도 안 하고 종료)")
    ap.add_argument("--report", action="store_true",
                    help="진단 리포트를 출력하고 파일로 저장 (문제 보고용)")
    ap.add_argument("--out-report", default=os.path.join(ROOT, "diag-report.txt"))
    ap.add_argument("--out", default=os.path.join(ROOT, "data", "krx-snapshot.js"))
    ap.add_argument("--krx-url", default=KRX_URL, help="사내 프록시 등으로 KRX 주소 변경")
    ap.add_argument("--krx-id", default=os.environ.get("KRX_ID"),
                    help="KRX 회원 ID (환경변수 KRX_ID 로도 지정 가능)")
    ap.add_argument("--krx-pw", default=os.environ.get("KRX_PW"),
                    help="KRX 비밀번호 (명령줄 노출을 피하려면 --krx-login 사용)")
    ap.add_argument("--krx-login", action="store_true",
                    help="KRX 계정을 화면에서 입력받아 로그인 (비밀번호가 화면·기록에 남지 않음)")
    ap.add_argument("--timeout", type=int, default=20)
    args = ap.parse_args()
    global krx_id, krx_pw
    krx_url, timeout_s = args.krx_url, args.timeout
    krx_id, krx_pw = args.krx_id, args.krx_pw
    if args.krx_login:
        # 비밀번호는 화면에 표시되지 않고 명령 기록에도 남지 않는다
        if not krx_id:
            krx_id = input("KRX 회원 ID: ").strip()
        krx_pw = getpass.getpass("KRX 비밀번호(입력 시 표시되지 않음): ")

    # 런처가 "이 파이썬으로 이 스크립트가 실제로 돌아가는가" 만 확인하는 용도.
    # Microsoft Store 자리표시자는 스크립트를 실행하지 못해 0 이 아닌 코드로 죽는다.
    if args.probe:
        return 0

    if args.report:
        return write_report(args.out_report)

    if args.check:
        print("빌드: %s" % BUILD)
        print("KRX 연결 점검: %s" % krx_url)
        warmup(force=True, verbose=True)
        if krx_id and krx_pw:
            krx_login(verbose=True)
        else:
            print("  [login] KRX 계정 정보 없음 — 비로그인 상태로 시도합니다")
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
        if krx_id and krx_pw:
            krx_login(verbose=True)
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
    print(" 금융상품 통합조회 — 로컬 실행   (빌드 %s)" % BUILD)
    print("=" * 64)
    print(" 주소   : %s" % url)
    print(" 폴더   : %s" % ROOT)
    print(" KRX    : %s (서버에서 호출하므로 CORS 없음)" % krx_url)
    if krx_id and krx_pw:
        ok_l, code_l, msg_l = krx_login(verbose=False)
        print(" 로그인 : %s (%s)" % ("성공" if ok_l else "실패 " + str(code_l), krx_id))
        if not ok_l and msg_l:
            print("          %s" % msg_l)
    else:
        print(" 로그인 : 계정 없음 — KRX 는 비로그인 조회를 거부합니다(400 LOGOUT)")
        print("          실데이터가 필요하면: python serve-products.py --krx-login")
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
