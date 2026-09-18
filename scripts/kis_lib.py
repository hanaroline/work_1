#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""한국투자증권 오픈API(KIS Developers) 공통 붙임쇠.

왜 만드는가
──────────────────────────────────────────────────────────────────────
국내 일봉을 야후에서 네이버로 갈아탔지만(kr-prices-naver.yml) **어느 쪽도
증권사 원본이 아니다.** 두 출처는 100 종목 19,400 봉에서 8.1% 가 갈리고,
최근 5봉은 75.8% 가 갈린다 — 아직 심판하지 못한 채로 남아 있다.

한국투자증권 오픈API 는 증권사가 직접 주는 시세다. 갈림을 심판할 **제3의 잣대**로
쓸 수 있고, 맞다고 판정되면 기준 일봉을 여기로 옮길 수 있다.

두 가지 제약을 먼저 적어 둔다
──────────────────────────────────────────────────────────────────────
1. **브리핑 세션에서는 못 붙는다.** KIS 는 9443(실전)·29443(모의) 이라는 비표준
   포트를 쓰는데 이그레스 프록시가 비-443 포트를 지원하지 않는다. 443 으로 가도
   호스트가 403 이다. 그러므로 **러너에서만 돈다** — 네이버·ETFCHECK 수집과 같다.

2. **모의투자 앱키의 시세 지원 범위를 모른다.** 모의투자는 주문·잔고 검증용이고
   시세 API 중 상당수에 「모의투자 미지원」이 붙는다. 어디까지 되는지는 문서를
   믿지 않고 `probe_kis.py` 로 실측한다.

토큰을 반드시 캐싱해야 하는 까닭
──────────────────────────────────────────────────────────────────────
접근토큰은 **24시간 유효한데 발급은 1분에 1회**로 막혀 있다. 호출마다 발급받는
구조로 짜면 두 번째 호출에서 바로 EGW00133 을 맞는다. 그래서 파일에 적어 두고
만료 전까지 재사용한다. 러너는 회차마다 새 컨테이너라 캐시가 비는데, 그때는
한 번만 발급하고 그 회차 안에서 계속 쓴다.

환경변수
  KIS_APP_KEY      APP Key          (필수)
  KIS_APP_SECRET   APP Secret       (필수)
  KIS_ENV          vps | prod       (기본 vps = 모의투자)
  KIS_ACCOUNT      계좌번호 8자리    (주문·잔고를 쓸 때만)
  KIS_TOKEN_CACHE  토큰 캐시 경로    (기본 <저장소>/.kis-token.json)

쓰는 법
  from kis_lib import KisClient
  kis = KisClient()
  res = kis.get("/uapi/domestic-stock/v1/quotations/inquire-price",
                "FHKST01010100",
                {"FID_COND_MRKT_DIV_CODE": "J", "FID_INPUT_ISCD": "005930"})
"""

import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KST = timezone(timedelta(hours=9))

# 실전과 모의는 호스트도 포트도 다르다. 앱키도 서로 못 섞는다 — 실전 앱키로 모의
# 도메인을 때리면 8030(투자구분이 달라서 Appkey 를 쓸 수 없습니다)이 돌아온다.
DOMAINS = {
    "prod": "https://openapi.koreainvestment.com:9443",
    "vps": "https://openapivts.koreainvestment.com:29443",
}

TIMEOUT = 20

# 초당 호출 제한. **실측으로 고친 값이다.**
#
# 처음에는 「모의 2건/초」라는 말을 믿고 0.55 초를 두었는데, 2026-09-18 관찰에서
# 13 번 가운데 3 번이 EGW00201(초당 거래건수를 초과하였습니다)로 물렸다. 초당
# 1.8 건꼴이면 이미 넘는다는 뜻이다. 그래서 모의는 1 건/초 아래로 내린다.
#
# 이것만으로는 모자라다. 유량 제한은 내 쪽 간격만이 아니라 서버가 보는 전체
# 흐름으로 걸리므로, 넘었을 때 **물러섰다 다시 거는** 길이 있어야 한다.
# 아래 RETRY_* 가 그 몫이다.
MIN_INTERVAL = {"prod": 0.15, "vps": 1.1}

# 유량 제한에 물렸을 때만 다시 건다. 다른 거절(없는 종목, 미지원 TR)은 몇 번을
# 다시 걸어도 같은 답이 오므로 한 번에 끝낸다.
RETRY_CODES = {"EGW00201"}      # 초당 거래건수 초과
RETRY_MAX = 4
RETRY_BACKOFF = 1.5             # 1.5s → 3s → 6s


class KisError(RuntimeError):
    """KIS 가 rt_cd 로 거절한 것. HTTP 는 200 이어도 여기로 온다."""

    def __init__(self, msg_cd, msg1, tr_id=None):
        self.msg_cd = msg_cd
        self.msg1 = msg1
        self.tr_id = tr_id
        super().__init__("%s %s (tr_id=%s)" % (msg_cd, msg1, tr_id))


def _now():
    return datetime.now(KST)


class KisClient(object):
    def __init__(self, env=None, app_key=None, app_secret=None,
                 token_cache=None, verbose=True):
        self.env = (env or os.environ.get("KIS_ENV") or "vps").strip().lower()
        if self.env not in DOMAINS:
            raise ValueError("KIS_ENV 는 vps 나 prod 라야 한다: %r" % self.env)

        self.app_key = app_key or os.environ.get("KIS_APP_KEY", "")
        self.app_secret = app_secret or os.environ.get("KIS_APP_SECRET", "")
        if not self.app_key or not self.app_secret:
            raise SystemExit(
                "KIS_APP_KEY / KIS_APP_SECRET 이 없다.\n"
                "  러너에서는 저장소 Secrets 에 넣고 env 로 넘긴다.\n"
                "  손으로 돌릴 때는 export KIS_APP_KEY=... 처럼 넣는다.\n"
                "  ** 앱키를 저장소에 커밋하지 않는다. **")

        self.base = DOMAINS[self.env]
        self.verbose = verbose
        self._token = None
        self._token_expires = None
        self._last_call = 0.0

        self.token_cache = (token_cache
                            or os.environ.get("KIS_TOKEN_CACHE")
                            or os.path.join(ROOT, ".kis-token.json"))

        # 사내망·러너 어느 쪽이든 기본 신뢰저장소를 쓴다. 검증을 끄지 않는다.
        self._ssl = ssl.create_default_context()

    # ── 토큰 ──────────────────────────────────────────────────────────

    def _cache_key(self):
        """캐시는 (환경, 앱키) 별로 따로 둔다. 실전과 모의 토큰이 섞이면 안 된다."""
        return "%s:%s" % (self.env, self.app_key[:8])

    def _read_cache(self):
        try:
            with open(self.token_cache, "r", encoding="utf-8") as fp:
                blob = json.load(fp)
        except Exception:                                          # noqa: BLE001
            return None
        got = blob.get(self._cache_key())
        if not isinstance(got, dict):
            return None
        try:
            expires = datetime.fromisoformat(got["expires"])
        except Exception:                                          # noqa: BLE001
            return None
        # 만료 10분 전이면 새로 받는다. 긴 수집 도중에 끊기지 않게.
        if expires - timedelta(minutes=10) <= _now():
            return None
        return got["token"], expires

    def _write_cache(self, token, expires):
        blob = {}
        try:
            with open(self.token_cache, "r", encoding="utf-8") as fp:
                blob = json.load(fp)
        except Exception:                                          # noqa: BLE001
            blob = {}
        if not isinstance(blob, dict):
            blob = {}
        blob[self._cache_key()] = {"token": token,
                                   "expires": expires.isoformat()}
        tmp = self.token_cache + ".tmp"
        with open(tmp, "w", encoding="utf-8") as fp:
            json.dump(blob, fp, ensure_ascii=False, indent=1)
        os.replace(tmp, self.token_cache)
        try:
            os.chmod(self.token_cache, 0o600)     # 토큰은 남이 읽을 것이 아니다
        except OSError:
            pass

    def token(self):
        """접근토큰. 캐시가 살아 있으면 그것을 쓴다(발급은 1분에 1회 제한)."""
        if self._token and self._token_expires and \
                self._token_expires - timedelta(minutes=10) > _now():
            return self._token

        cached = self._read_cache()
        if cached:
            self._token, self._token_expires = cached
            if self.verbose:
                print("  토큰: 캐시 사용 (만료 %s)"
                      % self._token_expires.strftime("%m-%d %H:%M"))
            return self._token

        body = json.dumps({"grant_type": "client_credentials",
                           "appkey": self.app_key,
                           "appsecret": self.app_secret}).encode("utf-8")
        req = urllib.request.Request(
            self.base + "/oauth2/tokenP", data=body, method="POST",
            headers={"content-type": "application/json; charset=utf-8"})
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT,
                                        context=self._ssl) as res:
                got = json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")[:300]
            raise SystemExit(
                "토큰 발급 실패 HTTP %s — %s\n"
                "  EGW00133 이면 1분에 1회 제한에 걸린 것이다. 잠시 뒤 다시.\n"
                "  8030 이면 실전/모의 앱키를 반대 도메인에 쓴 것이다 "
                "(지금 KIS_ENV=%s)." % (exc.code, detail, self.env))

        token = got.get("access_token")
        if not token:
            raise SystemExit("토큰 발급 응답에 access_token 이 없다: %r"
                             % str(got)[:300])

        # access_token_token_expired 는 "2026-09-18 23:59:59" 꼴. 없으면
        # expires_in(초)으로 셈한다. 둘 다 없으면 보수적으로 6시간만 믿는다.
        expires = None
        raw = got.get("access_token_token_expired")
        if raw:
            try:
                expires = datetime.strptime(raw, "%Y-%m-%d %H:%M:%S") \
                                  .replace(tzinfo=KST)
            except ValueError:
                expires = None
        if expires is None and got.get("expires_in"):
            try:
                expires = _now() + timedelta(seconds=int(got["expires_in"]))
            except (TypeError, ValueError):
                expires = None
        if expires is None:
            expires = _now() + timedelta(hours=6)

        self._token, self._token_expires = token, expires
        self._write_cache(token, expires)
        if self.verbose:
            print("  토큰: 새로 발급 (만료 %s)" % expires.strftime("%m-%d %H:%M"))
        return token

    def approval_key(self):
        """실시간(웹소켓) 접속키. 접근토큰과 별개로 받는다.

        모의투자에서 실시간 시세가 되는지는 확인되지 않았다 — probe 가 답한다.
        """
        body = json.dumps({"grant_type": "client_credentials",
                           "appkey": self.app_key,
                           "secretkey": self.app_secret}).encode("utf-8")
        req = urllib.request.Request(
            self.base + "/oauth2/Approval", data=body, method="POST",
            headers={"content-type": "application/json; charset=utf-8"})
        with urllib.request.urlopen(req, timeout=TIMEOUT,
                                    context=self._ssl) as res:
            return json.loads(res.read().decode("utf-8")).get("approval_key")

    # ── 호출 ──────────────────────────────────────────────────────────

    def _throttle(self):
        gap = MIN_INTERVAL.get(self.env, 0.55)
        wait = gap - (time.time() - self._last_call)
        if wait > 0:
            time.sleep(wait)
        self._last_call = time.time()

    def _once(self, path, tr_id, params, tr_cont):
        """한 번 건다. KIS 의 거절은 (몸통, msg_cd) 로 돌려준다.

        **KIS 는 거절을 HTTP 500 에 실어 보낸다.** 2026-09-18 관찰에서
        EGW00201 이 그렇게 왔다. 그러므로 HTTPError 를 곧장 「HTTP 오류」로
        적으면 안 된다 — 몸통에 rt_cd·msg_cd 가 그대로 들어 있어서, 그것을
        읽지 않으면 「유량 초과」와 「경로가 틀림」을 구별하지 못한다.
        처음 판이 그 둘을 뭉뚱그렸고, 그래서 멀쩡한 TR 세 개가 틀린 것으로
        적혔다.
        """
        self._throttle()
        url = self.base + path + "?" + urllib.parse.urlencode(params)
        headers = {
            "content-type": "application/json; charset=utf-8",
            "authorization": "Bearer " + self.token(),
            "appkey": self.app_key,
            "appsecret": self.app_secret,
            "tr_id": tr_id,
            "custtype": "P",          # 개인
        }
        if tr_cont:
            headers["tr_cont"] = tr_cont

        req = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT,
                                        context=self._ssl) as res:
                got = json.loads(res.read().decode("utf-8"))
            return got, str(got.get("msg_cd", "")) if \
                str(got.get("rt_cd", "")) != "0" else None
        except urllib.error.HTTPError as exc:
            raw_body = exc.read().decode("utf-8", "replace")
            try:
                got = json.loads(raw_body)
            except ValueError:
                # 정말로 JSON 이 아니면 그때는 HTTP 오류로 적는다
                return {"_http": exc.code, "_body": raw_body[:400]}, None
            got.setdefault("_http", exc.code)
            return got, str(got.get("msg_cd", "")) or ("HTTP%s" % exc.code)

    def get(self, path, tr_id, params, tr_cont="", raw=False):
        """시세 조회. rt_cd 가 0 이 아니면 KisError 를 던진다.

        유량 제한(EGW00201)에 물리면 물러섰다 다시 건다. 이 재시도가 없으면
        100 종목을 훑는 수집기가 중간부터 무너진다 — 간격을 아무리 벌려도
        서버가 보는 흐름은 내 쪽 간격만으로 정해지지 않기 때문이다.

        raw=True 면 rt_cd 를 보지 않고 응답을 그대로 준다 — 무엇이 돌아오는지
        살피는 probe 에서 쓴다.
        """
        wait = RETRY_BACKOFF
        for attempt in range(RETRY_MAX):
            got, refused = self._once(path, tr_id, params, tr_cont)
            if refused in RETRY_CODES and attempt < RETRY_MAX - 1:
                if self.verbose:
                    print("    유량 초과(%s) — %.1f초 물러섰다 다시 겁니다 (%d/%d)"
                          % (refused, wait, attempt + 1, RETRY_MAX - 1))
                time.sleep(wait)
                wait *= 2
                continue
            break

        if raw:
            return got
        if "_body" in got:
            raise KisError("HTTP%s" % got.get("_http"), got["_body"], tr_id)
        if str(got.get("rt_cd", "")) != "0":
            raise KisError(got.get("msg_cd", "?"), got.get("msg1", "?"), tr_id)
        return got


def env_banner(kis):
    """어느 환경으로 돌고 있는지 산출물에 남긴다. 실전/모의를 헷갈리면 안 된다."""
    return "%s (%s)" % ("모의투자" if kis.env == "vps" else "실전투자", kis.base)


if __name__ == "__main__":
    # 토큰만 받아 본다 — 앱키가 살아 있는지 확인하는 가장 싼 방법.
    client = KisClient()
    print("환경: %s" % env_banner(client))
    client.token()
    print("토큰 정상.")
    sys.exit(0)
