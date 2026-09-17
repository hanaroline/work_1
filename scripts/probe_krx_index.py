# -*- coding: utf-8 -*-
"""KRX 지수 일별 시세를 **브라우저 없이** 받아 볼 수 있는지 확인한다.

`probe_krx_xhr.mjs` 가 화면을 열어 `bld` 이름을 읽어 온다. 이 파일은 그
옆에서 **평범한 요청으로도 열리는지**를 확인한다 — 날마다 도는 수집기는
브라우저를 띄우지 않기 때문에, 열리지 않으면 찾아도 못 쓴다.

여기 적은 `bld` 이름은 **확정이 아니라 후보**다. 관찰이 다른 이름을 읽어
오면 그쪽이 맞다 — 짐작을 믿지 않고 둘을 나란히 돌려 맞춰 본다.

보는 것 둘.
  ① `getJsonData.cmd` 로 바로 받을 수 있는가 (가장 가볍다).
  ② 안 되면 OTP → CSV 길(수집기가 선물 투자자별에 이미 쓰는 틀)은 열리는가.

브리핑 세션은 KRX 에 직접 못 붙으므로 **러너에서만** 돈다.

    python3 scripts/probe_krx_index.py
"""
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
OUT = "data/market/raw"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
REF = "http://data.krx.co.kr/contents/MDC/MDI/mainChart/index.cmd"
JSOND = "http://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd"
GEN = "http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd"
DL = "http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd"

_now = datetime.now(KST)
END = _now.strftime("%Y%m%d")
START = (_now - timedelta(days=21)).strftime("%Y%m%d")

# 지수 일별 시세 후보. `indIdx`/`indIdx2` 는 지수 코드(코스피 1·001,
# 코스닥 2·001)이고 `tboxindIdx_finder_equidx0_0` 는 화면이 같이 보내는
# 이름표다. 관찰이 읽어 오는 것과 맞춰 본다.
BLD = "dbms/MDC/STAT/standard/MDCSTAT00301"
CASES = [
    ("코스피 지수 일별시세", {"indIdx": "1", "indIdx2": "001",
                     "tboxindIdx_finder_equidx0_0": "코스피"}),
    ("코스닥 지수 일별시세", {"indIdx": "2", "indIdx2": "001",
                     "tboxindIdx_finder_equidx0_0": "코스닥"}),
]


def post(url, data, encoding="utf-8"):
    body = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={
        "User-Agent": UA,
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Referer": REF,
        "Origin": "http://data.krx.co.kr",
        "X-Requested-With": "XMLHttpRequest",
    })
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode(encoding, "replace")


def main():
    os.makedirs(OUT, exist_ok=True)
    lines = ["KRX 지수 일별시세 후보 확인 %s"
             % datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"),
             "기간 %s ~ %s · bld 후보 %s" % (START, END, BLD), ""]

    for i, (label, extra) in enumerate(CASES):
        lines.append("### %s — getJsonData" % label)
        p = {"bld": BLD, "locale": "ko_KR", "strtDd": START, "endDd": END,
             "share": "1", "money": "1", "csvxls_isNo": "false"}
        p.update(extra)
        try:
            body = post(JSOND, p)
        except Exception as e:                                    # noqa: BLE001
            lines.append("    실패: %s: %s" % (type(e).__name__, str(e)[:140]))
            lines.append("")
            continue
        lines.append("    200 · %d bytes" % len(body))
        try:
            j = json.loads(body)
        except ValueError:
            lines.append("    JSON 이 아니다 — 앞 200자: %s" % body[:200])
            lines.append("")
            continue
        rows = None
        for k, v in j.items():
            if isinstance(v, list) and v and isinstance(v[0], dict):
                rows = v
                lines.append("    행 %d개 (%s)" % (len(v), k))
                lines.append("    첫 행: %s"
                             % json.dumps(v[0], ensure_ascii=False)[:400])
                break
        if rows is None:
            lines.append("    행이 없다 — 통째로: %s" % body[:300])
        elif not any("TRDVAL" in c.upper() or "거래대금" in c for c in rows[0]):
            lines.append("    ⚠ 거래대금 항목이 안 보인다 — 다른 bld 일 수 있다")
        f = os.path.join(OUT, "krx_index_%d.json" % i)
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(body[:400000])
        lines.append("    → 본문을 %s 에 남겼다" % f)
        lines.append("")

    # OTP → CSV 길도 확인한다. 수집기가 선물 투자자별에 이미 쓰는 틀이라,
    # getJsonData 가 막히면 이쪽으로 돌 수 있다.
    lines.append("### OTP → CSV 길 (코스피)")
    try:
        p = {"locale": "ko_KR", "bld": BLD, "name": "fileDown",
             "url": BLD, "strtDd": START, "endDd": END,
             "indIdx": "1", "indIdx2": "001", "share": "1", "money": "1",
             "csvxls_isNo": "false"}
        otp = urllib.request.urlopen(urllib.request.Request(
            GEN + "?" + urllib.parse.urlencode(p),
            headers={"User-Agent": UA, "Referer": REF}), timeout=25
        ).read().decode("utf-8", "replace").strip()
        if not otp or "<" in otp[:20]:
            lines.append("    OTP 발급 실패 (%d bytes): %s" % (len(otp), otp[:120]))
        else:
            csv = post(DL, {"code": otp}, encoding="cp949")
            rows = [r for r in csv.splitlines() if r.strip()]
            lines.append("    CSV %d행" % len(rows))
            for r in rows[:3]:
                lines.append("      %s" % r[:220])
    except Exception as e:                                        # noqa: BLE001
        lines.append("    실패: %s: %s" % (type(e).__name__, str(e)[:140]))

    dest = os.path.join(OUT, "krx_index.txt")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
