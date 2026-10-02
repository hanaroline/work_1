# -*- coding: utf-8 -*-
"""KRX 화면이 보낸 요청을 **그대로 되보내** 브라우저 없이 열리는지 본다.

앞선 관찰(`probe_krx_xhr.mjs`)이 화면이 보낸 POST 를 `krx_posts.json` 에
모아 둔다. 이 파일은 그것을 **한 줄도 고치지 않고 되보낸다.**

왜 이렇게 하나. 2026-09-18 첫 시도에서 `bld` 이름을 외워 적었다가
`MDCSTAT00301` 로 400 을 받았다. 상한가 때 다섯 바퀴를 헛돌게 한 것과
같은 잘못이다 — 기록을 사람이 읽고 주소를 옮겨 적는 자리가 곧 짐작이
끼어드는 자리다. 그 자리를 없앤다.

날마다 도는 수집기는 브라우저를 띄우지 않으므로, 화면에서 찾아도 평범한
요청으로 열리지 않으면 못 쓴다. 그래서 되보내 확인하는 이 걸음이 필요하다.

거래대금이 든 응답은 `ACC_TRDVAL` 로 가린다 — KRX 가 쓰는 이름이다.

브리핑 세션은 KRX 에 직접 못 붙으므로 **러너에서만** 돈다.

    node scripts/probe_krx_xhr.mjs && python3 scripts/probe_krx_index.py
"""
import json
import os
import urllib.request
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
OUT = "data/market/raw"
POSTS = os.path.join(OUT, "krx_posts.json")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
REF = "https://data.krx.co.kr/contents/MDC/MAIN/main/index.cmd"


def post(url, raw):
    req = urllib.request.Request(url, data=raw.encode("utf-8"), headers={
        "User-Agent": UA,
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Referer": REF,
        "Origin": "https://data.krx.co.kr",
        "X-Requested-With": "XMLHttpRequest",
    })
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")


def rows_of(j):
    """KRX 는 자료를 담는 이름이 화면마다 다르다 — 첫 목록을 찾아 쓴다."""
    if isinstance(j, dict):
        for k, v in j.items():
            if isinstance(v, list) and v and isinstance(v[0], dict):
                return k, v
    return None, None


def main():
    os.makedirs(OUT, exist_ok=True)
    lines = ["KRX 요청 되보내기 %s"
             % datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"),
             "관찰이 모아 둔 요청을 그대로 되보낸다 — 주소를 옮겨 적지 않는다.", ""]

    if not os.path.exists(POSTS):
        lines.append("%s 가 없다 — 관찰(probe_krx_xhr.mjs)이 먼저 돌아야 한다." % POSTS)
        with open(os.path.join(OUT, "krx_index.txt"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")
        print("\n".join(lines))
        return 0

    with open(POSTS, encoding="utf-8") as fh:
        posts = json.load(fh)

    # 같은 요청이 여러 번 오간다 — 본문이 같으면 한 번만 되보낸다.
    seen = set()
    uniq = []
    for p in posts:
        key = (p.get("url"), p.get("data"))
        if key in seen:
            continue
        seen.add(key)
        uniq.append(p)
    lines.append("모인 요청 %d건 가운데 서로 다른 것 %d건." % (len(posts), len(uniq)))
    lines.append("")

    hits = []
    for i, p in enumerate(uniq):
        url, raw = p.get("url") or "", p.get("data") or ""
        lines.append("### [%d] %s" % (i, p.get("entry") or ""))
        lines.append("    %s" % url)
        lines.append("    보낸 본문: %s" % raw[:300])
        if not raw:
            lines.append("    본문이 비어 있다 — 건너뛴다")
            lines.append("")
            continue
        try:
            body = post(url, raw)
        except Exception as e:                                    # noqa: BLE001
            lines.append("    실패: %s: %s" % (type(e).__name__, str(e)[:140]))
            lines.append("")
            continue
        lines.append("    200 · %d bytes" % len(body))
        try:
            j = json.loads(body)
        except ValueError:
            lines.append("    JSON 이 아니다 — 앞 160자: %s" % body[:160])
            lines.append("")
            continue
        name, rows = rows_of(j)
        if rows is None:
            lines.append("    행이 없다 — 통째로: %s" % body[:200])
            lines.append("")
            continue
        cols = list(rows[0].keys())
        money = [c for c in cols if "TRDVAL" in c.upper()]
        lines.append("    행 %d개 (%s)" % (len(rows), name))
        lines.append("    항목: %s" % ", ".join(cols)[:300])
        if money:
            lines.append("    ★ 거래대금 항목 있음: %s" % ", ".join(money))
            lines.append("    첫 행: %s" % json.dumps(rows[0], ensure_ascii=False)[:300])
            f = os.path.join(OUT, "krx_hit_%d.json" % len(hits))
            with open(f, "w", encoding="utf-8") as fh:
                fh.write(body[:400000])
            hits.append({"url": url, "data": raw, "cols": cols, "file": f})
            lines.append("    → 본문을 %s 에 남겼다" % f)
        lines.append("")

    lines.append("거래대금이 든 응답 %d건." % len(hits))
    if hits:
        with open(os.path.join(OUT, "krx_hits.json"), "w", encoding="utf-8") as fh:
            json.dump(hits, fh, ensure_ascii=False, indent=1)
        lines.append("쓸 만한 것을 %s/krx_hits.json 에 모았다." % OUT)
    else:
        lines.append("아직 없다 — 관찰이 지수 일별시세 화면까지 들어가야 한다.")

    dest = os.path.join(OUT, "krx_index.txt")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
