# -*- coding: utf-8 -*-
"""발행 **직전** 한 번 더 도는 재검증기.

만들면서 도는 검사(폭 훑기·중복 줄·JS)는 「만든 것이 망가지지 않았나」를 봅니다.
이 스크립트는 다른 것을 봅니다 &mdash; **만든 것이 서로 맞는가.** 표와 표, 표와 글,
글과 시세 파일이 어긋나는 자리를 찾습니다. 눈으로 읽으면 매번 다른 깊이로 읽히므로
도구로 고정했습니다.

    python3 scripts/recheck.py docs/briefings/2026-08-20-close.html
    python3 scripts/recheck.py docs/briefings/<파일>.html data/market/latest.json

끝 상태 0 이면 발행해도 됩니다. 1 이면 고칠 것이 남았습니다.
경고(WARN)는 판단이 필요한 것이고, 오류(FAIL)는 반드시 고쳐야 하는 것입니다.

`audit_numbers.py` 와 겹치지 않습니다 &mdash; 그쪽은 「이름 옆 숫자」를 시세와 맞춰
보고, 이쪽은 구조와 파생 계산을 봅니다. 둘 다 돌리십시오.
"""
import io
import json
import re
import sys
import html as H

FAIL, WARN = [], []


def fail(tag, msg):
    FAIL.append((tag, msg))


def warn(tag, msg):
    WARN.append((tag, msg))


CELL = re.compile(r"(?is)<(td|th)\b([^>]*)>(.*?)</\1\s*>")
ROW = re.compile(r"(?is)<tr\b[^>]*>.*?</tr\s*>")
TABLE = re.compile(r"(?is)<table\b([^>]*)>(.*?)</table\s*>")
CAPTION = re.compile(r"(?is)<caption[^>]*>(.*?)</caption>")


def text(s):
    return re.sub(r"\s+", " ", H.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def ko_of(s):
    """data-lang-ko 안의 글만 남긴다 — 한/영이 붙어 나오는 것을 가른다."""
    out = re.findall(r'(?is)<span data-lang-ko>(.*?)</span>', s)
    return text(" ".join(out)) if out else text(s)


# ──────────────────────────────────────────────────────────────────
def check_sections(h):
    secs = re.findall(r'<section class="section" id="([^"]+)"', h)
    toc = re.findall(r'<ul class="sidenav-toc">(.*?)</ul>', h, re.S)
    tocids = re.findall(r'href="#([^"]+)"', toc[0]) if toc else []
    if len(secs) != len(tocids):
        fail("절/목차", "절 %d 개인데 목차는 %d 개입니다" % (len(secs), len(tocids)))
    elif secs != tocids:
        fail("절/목차", "순서가 다릅니다: %s ≠ %s" % (secs, tocids))
    nums = [int(x) for x in re.findall(r'<span class="sec-num">(\d+)</span>', h)]
    if nums != list(range(1, len(secs) + 1)):
        fail("절 번호", "문서 순서대로 매겨져 있지 않습니다: %s" % nums)
    # 본문에서 절을 번호로 가리키면 절이 늘 때 조용히 어긋난다
    for m in re.finditer(r'(\d{1,2})\s*번\s*(절|섹션|참고|참조)', text(h)):
        warn("상호참조", "본문이 절을 번호로 가리킵니다: %s" % m.group(0))
    return len(secs)


def check_tables(h):
    n_tbl = 0
    for tm in TABLE.finditer(h):
        n_tbl += 1
        inner = tm.group(2)
        cap = text(CAPTION.search(inner).group(1))[:28] if CAPTION.search(inner) else "(캡션 없음)"
        rows = list(ROW.finditer(inner))
        if not rows:
            continue
        head = rows[0].group(0)
        ncols = sum(int(re.search(r'colspan="?(\d+)', c.group(2) or "").group(1))
                    if re.search(r'colspan="?(\d+)', c.group(2) or "") else 1
                    for c in CELL.finditer(head))
        for i, r in enumerate(rows[1:], 1):
            k = sum(int(re.search(r'colspan="?(\d+)', c.group(2) or "").group(1))
                    if re.search(r'colspan="?(\d+)', c.group(2) or "") else 1
                    for c in CELL.finditer(r.group(0)))
            if k != ncols:
                fail("열 수", "%s 행 %d: %d 칸 ≠ 머리행 %d 칸" % (cap, i, k, ncols))
        # 기간 열은 넷이거나 없거나
        np_ = len(re.findall(r'class="[^"]*\bperf\b[^"]*"', head))
        if np_ not in (0, 4):
            warn("기간 열", "%s: 기간 열이 %d 개입니다(4 개여야 합니다)" % (cap, np_))
        # opt 는 th 와 td 에 짝으로
        oh = len([c for c in CELL.finditer(head) if "opt" in (c.group(2) or "")])
        if oh:
            for i, r in enumerate(rows[1:], 1):
                ot = len([c for c in CELL.finditer(r.group(0)) if "opt" in (c.group(2) or "")])
                if ot != oh:
                    fail("opt 짝", "%s 행 %d: opt 가 머리 %d 개 대 몸 %d 개" % (cap, i, oh, ot))
                    break
    return n_tbl


def check_dupe_lines(h):
    """이름 칸 안에서 같은 문장이 두 번 나오는 것 — inline_notes 를 두 번 먹인 자국."""
    bad = 0
    for m in re.finditer(r'(?is)<t[hd][^>]*class="[^"]*hasnote[^"]*"[^>]*>(.*?)</t[hd]>', h):
        subs = [ko_of(x) for x in re.findall(r'(?is)<span class="sub">(.*?)</span>', m.group(1))]
        seen = set()
        for s in subs:
            if s and s in seen:
                bad += 1
                fail("설명 중복", "이름 칸에 같은 줄이 두 번: %s" % s[:60])
            seen.add(s)
    return bad


def check_lang_pairs(h):
    """한쪽 언어만 있는 자리를 찾는다. 영문 모드에서 빈칸으로 보이는 사고를 막는다."""
    body = h.split("<main>", 1)[-1]
    ko = len(re.findall(r'<span data-lang-ko>', body))
    en = len(re.findall(r'<span data-lang-en>', body))
    if ko != en:
        fail("한/영 짝", "data-lang-ko %d 개 대 data-lang-en %d 개 — %d 개가 짝이 없습니다"
             % (ko, en, abs(ko - en)))
    return ko, en


def check_minus(h):
    """음수 부호는 &minus; 로 씁니다. ASCII 하이픈은 글꼴에서 짧아 눈에 안 띕니다."""
    body = h.split("<main>", 1)[-1]
    body = re.sub(r'(?is)<(script|style)\b.*?</\1>', ' ', body)
    t = re.sub(r"<[^>]+>", " ", body)
    hits = re.findall(r'(?<![\w&;/=-])-\d[\d,]*\.?\d*\s*(?:%|bp|조|억|포인트|원|p\b)', t)
    for x in set(hits):
        fail("음수 부호", "ASCII 하이픈으로 적힌 음수가 있습니다: «%s» &mdash; &minus; 를 쓰십시오" % x.strip())
    return len(hits)


def check_details(h):
    n = h.count('<details class="exp"')
    if n == 0:
        fail("상세 블록", "접는 상세가 하나도 없습니다 — 요약 PDF 와 전체 PDF 가 같은 파일이 됩니다")
    elif n < 3:
        warn("상세 블록", "접는 상세가 %d 개뿐입니다 — 셋 이상 두십시오" % n)
    return n


def check_archive(h):
    side = re.findall(r'<ul class="sidenav-dates">(.*?)</ul>', h, re.S)
    pr = re.findall(r'<div class="archive-print">.*?<ul>(.*?)</ul>', h, re.S)
    ns = len(re.findall(r'<li', side[0])) if side else 0
    npr = len(re.findall(r'<li', pr[0])) if pr else 0
    if not side:
        fail("지난 브리핑", "사이드바 목록이 없습니다")
    if not pr:
        fail("지난 브리핑", "인쇄용 목록이 없습니다 — PDF 에 지난 판으로 가는 길이 사라집니다")
    if side and pr and ns != npr:
        fail("지난 브리핑", "사이드바 %d 항목 대 인쇄용 %d 항목" % (ns, npr))
    cur = len(re.findall(r'aria-current="page"', side[0])) if side else 0
    if cur != 1:
        fail("지난 브리핑", "현재 판 표시가 %d 개입니다(1 개여야 합니다)" % cur)
    return ns


def check_limits(h, d):
    """상한가 개수: 등락 종목 수 표의 합과 종목 명단의 개수가 맞는가."""
    mi = d.get("market_internals") or {}
    ln = d.get("limit_names") or {}
    for key, ko in (("upper", "상한가"), ("lower", "하한가")):
        fld = "limit_up" if key == "upper" else "limit_down"
        want = sum((mi.get(m, {}).get("breadth", {}) or {}).get(fld, 0) for m in ("kospi", "kosdaq"))
        got = (ln.get(key) or {}).get("count")
        if got is None:
            continue
        if want != got:
            warn("%s 개수" % ko,
                 "등락 종목 수 합계는 %d 개인데 명단은 %d 개입니다 — 판에 그 차이를 적으십시오" % (want, got))


def check_dates(h, d):
    """미국 계열은 국내 마감 시각에 전 거래일입니다. 「오늘」로 적히면 하루가 어긋납니다."""
    today = (d.get("indices", {}).get("kospi", {}) or {}).get("date")
    us = (d.get("rates_us") or {}).get("date")
    if today and us and us != today:
        t = text(h)
        # 미 국채 표 캡션에 전일 표시가 있는지
        if "전일 마감" not in t and "previous close" not in t.lower():
            fail("날짜 이름표", "미 국채는 %s 인데 국내는 %s 입니다 — 「전일 마감(날짜)」 이름표가 없습니다" % (us, today))
    # 24시간 시장과 장중 지수의 시각 차이
    fx = {r["key"]: r for r in (d.get("fx") or {}).get("rows", [])}
    if "dxy" in fx and "eurusd" in fx:
        dx, eu = fx["dxy"]["change_pct"], fx["eurusd"]["change_pct"]
        if abs(eu) > 0.3 and abs(dx) < 0.15:
            warn("달러인덱스",
                 "유로/달러가 %+.2f%% 인데 달러인덱스는 %+.2f%% 입니다 — 달러인덱스는 미국 장중 지수라 "
                 "국내 마감 시각에는 갱신되지 않습니다. 표에 그 사실을 적으십시오" % (eu, dx))


BYLINE = re.compile(r'미래에셋증권 마포WM\s*(?:&middot;|·)\s*송재섭\s*(?:&middot;|·)\s*'
                    r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\([^)]*\)\s*(\d{1,2}):(\d{2})\s*KST 작성')
BYLINE_EN = re.compile(r'Jaeseop Song\s*(?:&middot;|·)\s*Compiled\s*(\d{1,2}):(\d{2})\s*KST')
HEROMETA = re.compile(r'작성\s*(\d{4})-(\d{2})-(\d{2})\([^)]*\)\s*(\d{1,2}):(\d{2})\s*KST')


def check_byline(h, path):
    """꼬리말의 작성일 — **껍데기에서 물려받는 자리**라 조용히 어제 날짜로 남습니다.

    8/20 모닝과 장마감 두 판이 8/19 판의 껍데기를 물려 쓰면서 「2026년 8월 19일
    07:45 작성」을 달고 나갔습니다. 머리말만 고치면 한 문서 안에 작성 시각이
    둘이 됩니다.
    """
    import datetime
    import os

    fm = re.match(r"(\d{4})-(\d{2})-(\d{2})-", os.path.basename(path))
    fdate = tuple(int(x) for x in fm.groups()) if fm else None

    b = BYLINE.search(h)
    if not b:
        fail("작성일", "꼬리말에서 작성일 줄을 찾지 못했습니다")
        return
    by = (int(b.group(1)), int(b.group(2)), int(b.group(3)))
    bt = (int(b.group(4)), int(b.group(5)))

    hm = HEROMETA.search(h)
    if hm:
        hy = (int(hm.group(1)), int(hm.group(2)), int(hm.group(3)))
        ht = (int(hm.group(4)), int(hm.group(5)))
        if by != hy or bt != ht:
            fail("작성일", "머리말은 %04d-%02d-%02d %02d:%02d 인데 꼬리말은 %04d-%02d-%02d %02d:%02d 입니다 "
                 "— 한 문서에 작성 시각이 둘입니다" % (hy + ht + by + bt))
    else:
        warn("작성일", "머리말에서 작성 시각을 찾지 못해 꼬리말만 봤습니다")

    if fdate and by != fdate:
        fail("작성일", "파일은 %04d-%02d-%02d 판인데 꼬리말 작성일은 %04d-%02d-%02d 입니다 "
             "— 껍데기를 물려 쓰면서 안 고친 자국입니다" % (fdate + by))

    en = BYLINE_EN.search(h)
    if not en:
        fail("작성일", "영문 꼬리말에서 Compiled 시각을 찾지 못했습니다")
    elif (int(en.group(1)), int(en.group(2))) != bt:
        fail("작성일", "국문 꼬리말은 %02d:%02d 인데 영문은 %02d:%02d 입니다"
             % (bt + (int(en.group(1)), int(en.group(2)))))

    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))
    when = datetime.datetime(by[0], by[1], by[2], bt[0], bt[1],
                             tzinfo=datetime.timezone(datetime.timedelta(hours=9)))
    if when > now + datetime.timedelta(minutes=1):
        fail("작성일", "작성 시각 %02d:%02d 이 지금(%02d:%02d)보다 **미래**입니다 "
             "— 예정 시각이 아니라 실제 시각을 적으십시오" % (bt + (now.hour, now.minute)))


def check_derived(h, d):
    """판에 적힌 파생 계산을 다시 해 본다."""
    t = text(h)
    I = d.get("indices", {})
    ks, kq = I.get("kospi"), I.get("kosdaq")
    mi = d.get("market_internals", {})
    if ks and mi.get("kospi"):
        f = mi["kospi"]["fifty_two_week"]
        # 모닝·해외 판은 **전 거래일 종가** 위에 서 있고 장마감 판만 오늘 종가입니다.
        # 둘 중 어느 쪽과도 안 맞을 때만 신고합니다.
        ser = ((d.get("index_daily") or {}).get("kospi") or {}).get("series") or []
        closes = [ks["close"]] + ([ser[1]["close"]] if len(ser) > 1 else [])
        cand = [(c - f["low"]) / (f["high"] - f["low"]) * 100 for c in closes]
        flat = t.replace(" ", "")
        if not any(("%.1f%%" % p) in flat for p in cand):
            warn("52주 위치", "다시 계산하면 %s 인데 판에서 찾지 못했습니다"
                 % " 또는 ".join("%.1f%%" % p for p in cand))
        # 52주 고점이 최근 종가 흐름과 크게 다르면 표기 기준을 확인해야 한다
        ser = ((d.get("index_daily") or {}).get("kospi") or {}).get("series") or []
        if ser:
            hi = max(x["close"] for x in ser)
            if f["high"] > hi * 1.2:
                warn("52주 고점", "52주 최고 %s 가 최근 최고 종가 %s 보다 20%% 넘게 높습니다 — 표기 기준을 적으십시오"
                     % ("{:,.2f}".format(f["high"]), "{:,.2f}".format(hi)))
    if ks and kq:
        b = mi.get("kospi", {}).get("breadth")
        if b and b["advancing"] + b["declining"]:
            r = b["advancing"] / float(b["declining"])
            if ("%.2f" % r) not in t:
                warn("상승/하락 비율", "다시 계산하면 %.2f 인데 판에서 찾지 못했습니다" % r)


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    path = argv[0]
    dpath = argv[1] if len(argv) > 1 else "data/market/latest.json"
    h = io.open(path, encoding="utf-8").read()
    d = json.load(io.open(dpath, encoding="utf-8"))

    ns = check_sections(h)
    nt = check_tables(h)
    check_dupe_lines(h)
    ko, en = check_lang_pairs(h)
    check_minus(h)
    nd = check_details(h)
    na = check_archive(h)
    check_limits(h, d)
    check_dates(h, d)
    check_byline(h, path)
    check_derived(h, d)

    print("재검증: %s" % path)
    print("  절 %d · 표 %d · 상세 %d · 지난 브리핑 %d · 한/영 %d:%d" % (ns, nt, nd, na, ko, en))
    for tag, msg in WARN:
        print("  WARN  [%s] %s" % (tag, msg))
    for tag, msg in FAIL:
        print("  FAIL  [%s] %s" % (tag, msg))
    if not FAIL and not WARN:
        print("  걸린 것 없음 — 발행해도 됩니다")
    elif not FAIL:
        print("  오류 0 · 경고 %d — 경고는 하나씩 판단하십시오" % len(WARN))
    else:
        print("  오류 %d · 경고 %d — 고치고 다시 도십시오" % (len(FAIL), len(WARN)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
