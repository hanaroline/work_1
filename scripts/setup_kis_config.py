#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""한국투자증권 개인 환경파일(~/KIS/config/kis_devlp.yaml)을 만든다.

왜 필요한가
──────────────────────────────────────────────────────────────────────
공식 저장소(koreainvestment/open-trading-api)의 전략빌더는 `kis_auth.py` 가
**import 시점에** 이 파일을 연다. 없으면 백엔드가 뜨지도 못하고 이렇게 죽는다:

    FileNotFoundError: [Errno 2] No such file or directory:
      '/home/<나>/KIS/config/KIS20260918'

README 의 「빠른 시작」에는 `./start.sh` 만 적혀 있어 이 단계가 눈에 띄지 않는다.
실제로 돌려 보고 걸린 자리라 도구로 만들어 둔다.

앱키를 어디에도 흘리지 않는다
──────────────────────────────────────────────────────────────────────
- 입력은 getpass 로 받는다 — 터미널에 찍히지 않고 셸 기록에도 남지 않는다.
- 파일은 0600 으로 쓴다(나만 읽기).
- **이 스크립트는 앱키를 저장소나 망 밖으로 내보내지 않는다.** 앱키를 채팅·
  이슈·PR 에 붙여 넣지 않는다. 한 번 새면 남이 내 계좌로 주문할 수 있다.

쓰는 법 (내 PC 에서)
  python3 scripts/setup_kis_config.py                 # 모의투자만
  python3 scripts/setup_kis_config.py --with-prod     # 실전까지 같이
  python3 scripts/setup_kis_config.py --show          # 지금 설정 확인(값은 가림)
"""

import argparse
import os
import sys
from getpass import getpass

CONFIG_DIR = os.path.join(os.path.expanduser("~"), "KIS", "config")
CONFIG_PATH = os.path.join(CONFIG_DIR, "kis_devlp.yaml")

TEMPLATE = """\
# 한국투자증권 오픈API 개인 환경파일
# scripts/setup_kis_config.py 가 만들었다. 저장소에 커밋하지 않는다.

#실전투자
my_app: "{my_app}"
my_sec: "{my_sec}"

#모의투자
paper_app: "{paper_app}"
paper_sec: "{paper_sec}"

# HTS ID
my_htsid: "{my_htsid}"

#계좌번호 앞 8자리
my_acct_stock: "{my_acct_stock}"
my_acct_future: "{my_acct_future}"
my_paper_stock: "{my_paper_stock}"
my_paper_future: "{my_paper_future}"

#계좌번호 뒤 2자리
my_prod: "{my_prod}" # 01 종합계좌 / 03 국내선물옵션 / 08 해외선물옵션 / 22 개인연금 / 29 퇴직연금

#domain infos
prod: "https://openapi.koreainvestment.com:9443" # 서비스
ops: "ws://ops.koreainvestment.com:21000" # 웹소켓
vps: "https://openapivts.koreainvestment.com:29443" # 모의투자 서비스
vops: "ws://ops.koreainvestment.com:31000" # 모의투자 웹소켓

my_token: ""

my_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 \
(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
"""


def ask(label, default="", secret=False):
    tail = " [%s]" % default if default else ""
    got = (getpass if secret else input)("  %s%s: " % (label, tail))
    return (got or default).strip()


def mask(value):
    if not value or value.startswith("여기에"):
        return "(비어 있음)"
    if len(value) <= 8:
        return "*" * len(value)
    return value[:4] + "…" + value[-4:] + " (%d자)" % len(value)


def show():
    if not os.path.exists(CONFIG_PATH):
        print("설정 파일이 없다: %s" % CONFIG_PATH)
        print("먼저 인자 없이 한 번 돌린다.")
        return 1
    try:
        import yaml
    except ImportError:
        print("pyyaml 이 없다: pip install pyyaml")
        return 1
    with open(CONFIG_PATH, encoding="utf-8") as fp:
        cfg = yaml.safe_load(fp) or {}
    print("설정: %s" % CONFIG_PATH)
    print("권한: %s" % oct(os.stat(CONFIG_PATH).st_mode & 0o777))
    for key in ("my_app", "my_sec", "paper_app", "paper_sec"):
        print("  %-11s %s" % (key, mask(str(cfg.get(key, "")))))
    for key in ("my_htsid", "my_acct_stock", "my_paper_stock", "my_prod"):
        print("  %-11s %s" % (key, cfg.get(key, "")))
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--with-prod", action="store_true",
                    help="실전투자 앱키도 같이 넣는다")
    ap.add_argument("--show", action="store_true",
                    help="지금 설정을 확인한다(비밀값은 가려서 보여 준다)")
    args = ap.parse_args()

    if args.show:
        return show()

    print("한국투자증권 개인 환경파일을 만든다.")
    print("  둘 곳: %s" % CONFIG_PATH)
    print("  앱키·시크릿은 화면에 찍히지 않는다(getpass).")
    print("  ** 여기 넣은 값을 채팅이나 저장소에 붙여 넣지 않는다. **\n")

    if os.path.exists(CONFIG_PATH):
        if ask("이미 있다. 덮어쓸까 (y/N)", "N").lower() != "y":
            print("그만둔다.")
            return 0

    print("\n[모의투자] KIS Developers 에서 모의계좌로 신청해 받은 값")
    paper_app = ask("모의투자 APP Key", secret=True)
    paper_sec = ask("모의투자 APP Secret", secret=True)
    paper_stock = ask("모의투자 증권계좌 앞 8자리")

    my_app = my_sec = ""
    acct_stock = acct_future = ""
    if args.with_prod:
        print("\n[실전투자] 실계좌로 신청해 받은 값")
        my_app = ask("실전 APP Key", secret=True)
        my_sec = ask("실전 APP Secret", secret=True)
        acct_stock = ask("실전 증권계좌 앞 8자리")
        acct_future = ask("실전 선물옵션계좌 앞 8자리", acct_stock)

    print("\n[공통]")
    htsid = ask("HTS ID")
    prod_cd = ask("계좌번호 뒤 2자리", "01")

    if not paper_app or not paper_sec:
        print("\n모의투자 앱키가 비었다. 그만둔다.")
        return 1

    os.makedirs(CONFIG_DIR, exist_ok=True)
    try:
        os.chmod(os.path.dirname(CONFIG_DIR), 0o700)
        os.chmod(CONFIG_DIR, 0o700)
    except OSError:
        pass

    body = TEMPLATE.format(
        my_app=my_app, my_sec=my_sec,
        paper_app=paper_app, paper_sec=paper_sec,
        my_htsid=htsid,
        my_acct_stock=acct_stock, my_acct_future=acct_future,
        my_paper_stock=paper_stock, my_paper_future=paper_stock,
        my_prod=prod_cd)

    # 0600 으로 먼저 열고 쓴다 — 잠깐이라도 남이 읽을 수 있는 틈을 두지 않는다.
    fd = os.open(CONFIG_PATH, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as fp:
        fp.write(body)

    print("\n만들었다: %s (권한 600)" % CONFIG_PATH)
    print("\n다음:")
    print("  1) 토큰이 나오는지 본다")
    print("     KIS_APP_KEY=<모의 앱키> KIS_APP_SECRET=<모의 시크릿> \\")
    print("       python3 scripts/kis_lib.py")
    print("  2) 전략빌더를 띄운다")
    print("     cd <open-trading-api>/strategy_builder && ./start.sh")
    print("     브라우저에서 http://localhost:3000 → 우측 상단 설정에서 인증")
    return 0


if __name__ == "__main__":
    sys.exit(main())
