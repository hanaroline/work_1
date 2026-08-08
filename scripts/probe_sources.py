#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""남은 공백(선물 투자자별 / 신용융자·반대매매)을 채울 경로를 찾는 탐색 스크립트.

수집 서버(깃허브 러너)에서 돌리고 로그를 읽어, 어느 경로가 실제로 응답하는지 확인한다.
본 수집기(fetch_market.py)에는 여기서 살아남은 경로만 옮긴다.

1차 탐색에서 알아낸 것:
  - 네이버 /sise/ 목차에 선물·예탁금·공매도 화면이 있다. 실물을 열어 본다.
  - freeSis 는 응답한다. OBJ_NM 은 맞는데 날짜 파라미터 이름이 틀려 값이 null 이었다.
    화면 자바스크립트를 받아 실제 파라미터 이름을 확인한다.
  - KRX 는 공개 리더(allorigins)를 경유해도 차단 안내 페이지를 준다. 내용을 확인한다.
"""
import json
import re
import urllib.error
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
DAY = "20260807"


def get(url, data=None, headers=None, referer=None, encoding="utf-8", timeout=30):
    h = {"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"}
    if referer:
        h["Referer"] = referer
    if headers:
        h.update(headers)
    body = None
    if data is not None:
        if isinstance(data, (dict, list)):
            if h.get("Content-Type", "").startswith("application/json"):
                body = json.dumps(data).encode()
            else:
                body = urllib.parse.urlencode(data).encode()
        else:
            body = data.encode() if isinstance(data, str) else data
    req = urllib.request.Request(url, data=body, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode(encoding, "replace")


def strip(html):
    t = re.sub(r"(?is)<(script|style).*?</\1>", " ", html)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return re.sub(r"[ \t]+", " ", re.sub(r"&nbsp;?", " ", t)).strip()


def probe(label, url, show=170, **kw):
    try:
        raw = get(url, **kw)
    except urllib.error.HTTPError as e:
        print("  [%-26s] HTTP %s" % (label, e.code))
        return None
    except Exception as e:
        print("  [%-26s] %s: %s" % (label, type(e).__name__, str(e)[:70]))
        return None
    print("  [%-26s] OK %6d bytes | %s" % (label, len(raw), strip(raw)[:show]))
    return raw


print("=" * 78)
print("A. 네이버 선물 화면 — 투자자별/미결제약정이 실려 있는지")
print("=" * 78)
fut = probe("선물 지수", "https://finance.naver.com/sise/sise_index.naver?code=FUT",
            encoding="cp949")
if fut:
    txt = strip(fut)
    # 화면에 어떤 표가 있는지 캡션/제목으로 확인한다.
    print("   └ 표 제목:", re.findall(r"<caption[^>]*>(.*?)</caption>", fut, re.S)[:12])
    for kw in ["투자자", "미결제", "외국인", "개인", "기관", "베이시스", "선물"]:
        for m in re.finditer(kw, txt):
            print("      …%s…" % txt[max(0, m.start() - 60):m.start() + 90].replace("\n", " "))
            break

print()
print("=" * 78)
print("B. 네이버 — 예탁금 / 공매도 / 투자자별 매매상위")
print("=" * 78)
dep = probe("고객예탁금", "https://finance.naver.com/sise/sise_deposit.naver",
            encoding="cp949", show=400)
if dep:
    print("   └ 캡션:", re.findall(r"<caption[^>]*>(.*?)</caption>", dep, re.S)[:8])
probe("공매도", "https://finance.naver.com/sise/short_trade.naver", encoding="cp949", show=300)
probe("투자자별 매매상위",
      "https://finance.naver.com/sise/sise_deal_rank.naver?investor_gubun=1000",
      encoding="cp949", show=300)

print()
print("=" * 78)
print("C. freeSis — 화면 자바스크립트에서 실제 파라미터 이름 찾기")
print("=" * 78)
for sid in ["STATSCU0100000070", "STATSCU0100000140"]:
    page = probe("화면 %s" % sid[-4:],
                 "https://freesis.kofia.or.kr/stat/FreeSIS.do"
                 "?parentDivId=MSIS10000000000000&serviceId=" + sid,
                 timeout=45, show=120)
    if not page:
        continue
    # 조회 파라미터는 화면 스크립트 안에 그대로 적혀 있다.
    for pat in [r'OBJ_NM["\']?\s*[:=]\s*["\']([^"\']+)', r'(tmpV\d+)', r'(start\w*Dd?|end\w*Dd?)',
                r'setValue\(["\']([^"\']+)["\']', r'name=["\'](dm\w+|ds\w+)']:
        found = sorted(set(re.findall(pat, page)))
        if found:
            print("      %-28s %s" % (pat[:26], found[:14]))
    for src in sorted(set(re.findall(r'src=["\']([^"\']+\.js[^"\']*)', page)))[:8]:
        print("      js: %s" % src)

print()
print("=" * 78)
print("D. freeSis — 날짜 파라미터 후보를 바꿔 가며 값이 채워지는 조합 찾기")
print("=" * 78)
FS = "https://freesis.kofia.or.kr/meta/getMetaDataList.do"
JH = {"Content-Type": "application/json; charset=UTF-8",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest"}
CANDIDATES = [
    ("tmpV1/tmpV12", {"tmpV1": "20260701", "tmpV12": DAY}),
    ("tmpV41/tmpV42", {"tmpV41": "20260701", "tmpV42": DAY}),
    ("tmpV20/tmpV21", {"tmpV20": "20260701", "tmpV21": DAY}),
    ("startDd/endDd+tmpV40=D", {"startDd": "20260701", "endDd": DAY, "tmpV40": "D"}),
    ("날짜없음", {}),
]
for obj in ["STATSCU0100000140BO", "STATSCU0100000070BO"]:
    for name, extra in CANDIDATES:
        body = {"dmSearch": dict({"OBJ_NM": obj}, **extra)}
        probe("%s %s" % (obj[-6:], name), FS, data=body, headers=JH,
              referer="https://freesis.kofia.or.kr/", timeout=45, show=220)

print()
print("=" * 78)
print("E. KRX 차단 안내문 원문 — 무엇이라고 거절하는지")
print("=" * 78)
KRX_Q = {"bld": "dbms/MDC/STAT/standard/MDCSTAT12801", "locale": "ko_KR", "trdDd": DAY,
         "prodId": "KRDRVFUK2I", "mktTpCd": "T", "rghtTpCd": "T",
         "share": "1", "money": "1", "csvxls_isNo": "false"}
krx_get = ("https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd?"
           + urllib.parse.urlencode(KRX_Q))
probe("allorigins(EUC-KR 해독)",
      "https://api.allorigins.win/raw?url=" + urllib.parse.quote(krx_get, safe=""),
      encoding="cp949", timeout=60, show=400)

print()
print("탐색 종료")
