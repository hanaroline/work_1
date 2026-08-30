#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""수집물 재검산 — 인쇄될 모든 숫자를 원자료에서 다시 세고, 인쇄될 모든
문장이 리포트 본문에 그대로 있는지 대조한다.

    python3 scripts/verify_reports.py [data/reports/latest.json]

왜 필요한가. 이 도구가 지어낸 숫자는 하나도 없어야 한다 — 요약은 리포트가
쓴 문장을 고른 것이고, 셈은 모아 놓은 것을 센 것이다. 그런데 「그렇게 짰다」는
것과 「그렇게 나왔다」는 것은 다르다. 8월 20일 판에서 머리 요약이 그날이
아닌 무더기를 세고 있었던 적이 있다. 코드는 옳았고 넘긴 무더기가 틀렸다.
그래서 산출물을 만들기 전에, 실려 나갈 값을 저장된 원자료에서 **다시** 셈해
맞대어 본다.

이 검산기가 증명하는 것과 못 하는 것을 분명히 해 둔다.

  증명한다 — (1) 인쇄되는 셈이 실린 리포트 목록과 맞는다, (2) 인쇄되는
             문장·수치가 리포트 본문에 글자 그대로 있다(지어낸 문장이 없다),
             (3) 모든 항목에 원문 주소가 달려 있다.
  증명하지 않는다 — 증권사가 한 말이 맞는지. 그건 이 도구의 일이 아니고,
             각 카드에 원문 주소를 달아 둔 까닭이다.

나가는 값: 흠이 없으면 0, 있으면 1.
"""
import json
import re
import sys
import os
import glob

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_reports import THEMES, theme_counts, _sentences  # noqa: E402

OK, BAD, WARN = [], [], []


def check(name, cond, detail=""):
    (OK if cond else BAD).append((name, detail))


def warn(name, detail=""):
    WARN.append((name, detail))


# ── 글자 대조용 ───────────────────────────────────────────────────────────
# 본문에서 문장을 떼어 올 때 앞뒤 기호와 공백이 깎인다. 그러니 「글자 그대로」를
# 따질 때는 기호·공백을 걷어낸 알맹이끼리 견준다. 낱말과 숫자가 그대로면
# 옮겨 적은 것이고, 하나라도 바뀌면 지어낸 것이다.
_SQ = re.compile(r"[^0-9A-Za-z가-힣%]")


def sq(s):
    return _SQ.sub("", s or "")


_SENT = re.compile(r"(?<=다\.)\s+|(?<=[.!?])\s+")


def sentences(s):
    return [x for x in _SENT.split(s or "") if len(sq(x)) >= 8]


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def keep(box, r):
    """같은 리포트가 판마다 한 벌씩 있다. 요약을 가진 쪽을 남긴다.

    나중 판이 그 리포트의 본문을 다시 열지 않았으면 요약이 비어 있다. 뒤엣
    것으로 덮으면 멀쩡히 인용된 문장이 「어디에도 없는 문장」으로 몰린다.
    """
    k = (r.get("source"), r.get("nid"))
    cur = box.get(k)
    if cur is None or (not cur.get("summary") and r.get("summary")):
        box[k] = r


def verify(path):
    d = load(path)
    rows = d["reports"]
    day = d["report_date"]
    todays = [r for r in rows if r.get("date") == day]
    by_url = {r["url"]: r for r in rows}
    S = d["summary"]

    print("검산 대상: %s" % path)
    print("수집 %s · 그날 판 %s · 실린 리포트 %d건\n"
          % (d.get("generated_at_kst"), day, len(rows)))

    # ── 가. 수집 정합성 ──────────────────────────────────────────────────
    need = ("nid", "category", "title", "url", "broker", "date")
    miss = [r.get("url", "?") for r in rows if any(not r.get(k) and r.get(k) != 0
                                                   for k in need)]
    check("가1 모든 행에 nid·갈래·제목·주소·증권사·날짜", not miss,
          "빠진 행 %d" % len(miss))

    # 조회수는 네이버에만 있다. 증권사 제 목록에는 없는 값이라 「빠졌다」가
    # 아니라 「없다」다 — 다만 인기순 줄세우기가 그 값을 쓰므로, 없는 몫이
    # 얼마인지는 산출물을 보는 사람이 알아야 한다.
    novw = [r for r in rows if r.get("views") is None]
    warn("가1-1 조회수 없는 행",
         "%d건 (%s) — 인기순에서는 맨 뒤로 밀린다"
         % (len(novw), ", ".join(sorted({r.get("source") or "-" for r in novw}))))

    urls = [r["url"] for r in rows]
    dup = len(urls) - len(set(urls))
    check("가2 주소 중복 없음", dup == 0, "중복 %d" % dup)

    keys = [(r.get("source"), r["nid"]) for r in rows]
    dupk = len(keys) - len(set(keys))
    check("가3 원천 안에서 nid 중복 없음", dupk == 0, "중복 %d" % dupk)

    baddate = [r["url"] for r in rows
               if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", r.get("date") or "")]
    check("가4 날짜꼴 YYYY-MM-DD", not baddate, "어긋난 행 %d" % len(baddate))

    future = [r["date"] for r in rows if (r.get("date") or "") > d["date"]]
    check("가5 수집일보다 뒤인 날짜 없음", not future, "앞선 날짜 %d" % len(future))

    negv = [r["url"] for r in rows if (r.get("views") or 0) < 0]
    check("가6 조회수 음수 없음", not negv, "음수 %d" % len(negv))

    # ── 나. 셈 재계산 ────────────────────────────────────────────────────
    check("나1 전체 건수", S["count_collected"] == len(rows),
          "실린 값 %d · 다시 센 값 %d" % (S["count_collected"], len(rows)))
    check("나2 그날 건수", S["count_report_date"] == len(todays),
          "실린 값 %d · 다시 센 값 %d" % (S["count_report_date"], len(todays)))

    cat = {}
    for r in todays:
        cat[r["category"]] = cat.get(r["category"], 0) + 1
    check("나3 갈래별 건수", S["by_category"] == cat,
          "어긋난 갈래 %s" % [k for k in set(cat) | set(S["by_category"])
                              if cat.get(k) != S["by_category"].get(k)])

    src = {}
    for r in todays:
        src[r.get("source") or "-"] = src.get(r.get("source") or "-", 0) + 1
    check("나4 원천별 건수", S["by_source"] == src, "")

    brk = {}
    for r in todays:
        if r.get("broker"):
            brk[r["broker"]] = brk.get(r["broker"], 0) + 1
    shown = {e["broker"]: e["count"] for e in S["by_broker"]}
    check("나5 증권사별 건수", all(brk.get(b) == c for b, c in shown.items()),
          "어긋난 증권사 %s" % [b for b, c in shown.items() if brk.get(b) != c])

    st = {}
    for r in todays:
        code = (r.get("stock") or {}).get("code")
        if code:
            st.setdefault(code, []).append(r)
    crowd_re = sorted(((c, len(v)) for c, v in st.items() if len(v) >= 2),
                      key=lambda t: -t[1])[:12]
    crowd_shown = [(c["code"], c["count"]) for c in S["crowded_stocks"]]
    check("나6 여러 곳이 함께 본 종목", crowd_shown == crowd_re,
          "실린 %d건 · 다시 센 %d건" % (len(crowd_shown), len(crowd_re)))

    mv_re = [r for r in todays if r.get("target_move")][:20]
    check("나7 목표주가 변경 건수", len(S["target_moves"]) == len(mv_re),
          "실린 %d · 다시 센 %d" % (len(S["target_moves"]), len(mv_re)))
    mv_bad = [m for m in S["target_moves"]
              if by_url.get(m["url"], {}).get("target_move") != m["move"]
              or by_url.get(m["url"], {}).get("target_price") != m.get("target_price")]
    check("나8 목표주가 변경의 방향·값이 원 행과 같음", not mv_bad,
          "어긋난 건 %d" % len(mv_bad))

    ov = S.get("overview") or {}
    th_re = theme_counts(todays)
    check("나9 주제별 건수", ov.get("themes") == th_re,
          "실린 %s" % [(t["theme"], t["count"]) for t in (ov.get("themes") or [])[:3]])

    # 머리 요약 문장에 박힌 숫자가 다시 센 값과 같은가 — 문장은 사람이 읽는
    # 자리라 여기가 어긋나면 아무도 눈치채지 못한 채 나간다.
    txt = ov.get("text") or ""
    want = ["리포트는 %d건입니다" % len(todays)]
    if cat:
        top = sorted(cat.items(), key=lambda t: -t[1])[0]
        want.append("%d건으로 가장 많습니다" % top[1])
    for t in th_re[:3]:
        want.append("%s %d건" % (t["theme"], t["count"]))
    ups = [m for m in S["target_moves"] if m["move"] == "상향"]
    dns = [m for m in S["target_moves"] if m["move"] == "하향"]
    if ups:
        want.append("%d건 상향" % len(ups))
    if dns:
        want.append("%d건 하향" % len(dns))
    missing = [w for w in want if w not in txt]
    check("나10 머리 요약 문장의 숫자가 다시 센 값과 같음", not missing,
          "어긋난 대목 %s" % missing)

    # ── 다. 인용 무결성 ─────────────────────────────────────────────────
    # 요약은 리포트가 쓴 문장을 고른 것이어야 한다. 본문을 1200자까지만
    # 보관하므로 그 뒤에서 온 문장은 여기서 대조할 수 없다 — 못 한 것을
    # 「했다」고 세지 않고 따로 센다.
    # 대조하는 법: 요약을 문장 부호로 자르면 안 된다. 요약은 본문에서 **떨어진
    # 자리의 문장들**을 이어 붙인 것이라, 마침표 없이 끝나는 소제목 뒤에 다른
    # 대목이 붙으면 한 덩이로 보인다. 그래서 본문을 수집기와 똑같은 규칙으로
    # 잘라 문장 꾸러미를 만들고, 요약을 그 꾸러미만으로 **되짚어 쌓을 수 있는지**
    # 본다. 하나라도 꾸러미에 없는 글자가 끼면 그 자리에서 걸린다.
    tot = ver = unk = 0
    bad_quote = []
    for r in rows:
        if not r.get("summary"):
            continue
        pool = sorted({sq(s) for s in _sentences(r.get("excerpt") or "")},
                      key=len, reverse=True)
        long_body = (r.get("body_chars") or 0) > len(r.get("excerpt") or "")
        rest = sq(r["summary"])
        while rest:
            tot += 1
            hit = next((p for p in pool if p and rest.startswith(p)), None)
            if hit:
                ver += 1
                rest = rest[len(hit):]
            elif long_body:
                unk += 1
                break                      # 보관하지 않은 뒷부분에서 온 대목
            else:
                bad_quote.append((r["url"], r["summary"][:60]))
                break
    check("다1 요약이 본문 문장만으로 되짚어짐", not bad_quote,
          "대조 %d대목 · 확인 %d · 본문 뒷부분이라 대조 불가 %d · 어긋남 %d"
          % (tot, ver, unk, len(bad_quote)))
    for u, s in bad_quote[:5]:
        warn("다1 눈으로 볼 것", "%s — %s" % (s, u))
    if unk:
        warn("다1 참고", "%d문장은 보관한 본문(앞 1200자) 밖이라 대조하지 못함" % unk)

    lead_bad = [r["url"] for r in rows
                if r.get("lead") and sq(r["lead"]) not in sq(r.get("summary") or "")]
    check("다2 첫 줄이 요약 안에 있음", not lead_bad, "어긋난 행 %d" % len(lead_bad))

    fact_bad, fact_n = [], 0
    for r in rows:
        for f in r.get("facts") or []:
            fact_n += 1
            body = sq(r.get("excerpt") or "")
            # 조각은 {"k": 이름, "v": 값} 꼴이다. 값이 본문에 그대로 있어야 한다.
            val = f.get("v") if isinstance(f, dict) else f
            if sq(val) not in body and (r.get("body_chars") or 0) <= len(r.get("excerpt") or ""):
                fact_bad.append((r["url"], val))
    check("다3 수치 조각이 본문에 글자 그대로 있음", not fact_bad,
          "%d개 중 어긋남 %d" % (fact_n, len(fact_bad)))

    # 목표주가는 이 도구가 셈해서는 안 되는 값이다. 원문에 그 수가 적혀 있는지
    # 본다 — 15만원/150,000원/150000 어느 꼴이든 하나는 있어야 한다.
    tp_bad = []
    for r in rows:
        tp = r.get("target_price")
        if not tp:
            continue
        hay = sq((r.get("excerpt") or "") + (r.get("summary") or "") + (r.get("title") or ""))
        forms = {sq("%d" % tp), sq("{:,}".format(tp))}
        if tp % 10000 == 0:
            forms.add(sq("%d만" % (tp // 10000)))
        if tp % 1000 == 0:
            forms.add(sq("%s만" % ("%g" % (tp / 10000))))
        if not any(f and f in hay for f in forms):
            tp_bad.append((r["url"], tp))
    check("다4 목표주가가 원문에 적힌 수임", not tp_bad,
          "%d건 중 원문에서 못 찾음 %d" % (sum(1 for r in rows if r.get("target_price")),
                                          len(tp_bad)))
    for u, tp in tp_bad[:5]:
        warn("다4 눈으로 볼 것", "%s → %s" % (tp, u))

    # 머리 요약에 실리는 인용도 같은 잣대로 본다.
    brief_bad, brief_n = [], 0
    for b in ov.get("brief") or []:
        for p in b.get("points") or []:
            brief_n += 1
            r = by_url.get(p.get("url"))
            if not r or sq(p.get("text") or "") not in sq(r.get("summary") or ""):
                brief_bad.append(p.get("url"))
    for m in ov.get("moves") or []:
        if m.get("why"):
            brief_n += 1
            r = by_url.get(m.get("url"))
            if not r or sq(m["why"]) not in sq(r.get("summary") or ""):
                brief_bad.append(m.get("url"))
    for c in ov.get("crowd") or []:
        for p in c.get("points") or []:
            brief_n += 1
            r = by_url.get(p.get("url"))
            if not r or sq(p.get("text") or "") not in sq(r.get("summary") or ""):
                brief_bad.append(p.get("url"))
    check("다5 논점 브리핑의 인용이 해당 리포트 요약에서 옴", not brief_bad,
          "%d개 중 어긋남 %d" % (brief_n, len(brief_bad)))

    # ── 라. 오염 ────────────────────────────────────────────────────────
    pats = [("파일이름", r"\.pdf", re.I),
            ("컴플라이언스 머리글", r"본\s*조사분석자료는|Compliance|준법감시인|KRP\s*보고서", 0),
            ("사이트 길잡이줄", r"증권홈\s*>|>\s*리서치\s*>", 0),
            ("연락처", r"02-\d{3,4}-\d{4}|@[a-z]+\.com", re.I)]
    for name, pat, fl in pats:
        hit = [r["url"] for r in rows
               if r.get("summary") and re.search(pat, r["summary"], fl)]
        check("라1 요약에 %s 섞이지 않음" % name, not hit, "섞인 행 %d" % len(hit))
    q = [r["url"] for r in rows if (r.get("summary") or "").startswith(('"', "'", "“", "”"))]
    check("라2 요약이 따옴표로 시작하지 않음", not q, "%d" % len(q))
    tit = [r["url"] for r in rows if re.search(r"[\"']\s*/?>\s*$|Npay", r.get("title") or "")]
    check("라3 제목에 마크업 부스러기 없음", not tit, "%d" % len(tit))

    # ── 마. 출처 ────────────────────────────────────────────────────────
    hosts = ("finance.naver.com", "m.stock.naver.com", "securities.miraeasset.com",
             "www.hanaw.com", "hanaw.com")
    off = [r["url"] for r in rows
           if not any(("://%s/" % h) in r["url"] for h in hosts)]
    check("마1 모든 주소가 알려진 원문 서버", not off, "바깥 주소 %d" % len(off))
    nopdf = sum(1 for r in rows if not r.get("pdf"))
    warn("마2 원문 PDF 주소 없는 행", "%d건 (본문 화면만 있는 리포트)" % nopdf)

    ovs = [r for r in rows if r.get("overseas")]
    ovs_bad = [r["url"] for r in ovs
               if r.get("category") != "해외 리서치"
               and not re.search(r"\([A-Z0-9]{1,8}\.(US|CH|HK|JP|TW|DE|LN)\)",
                                 r.get("title") or "", re.I)
               and r.get("source") not in ("미래에셋증권 리서치",)]
    check("마3 「해외」 표는 외국 종목·해외 판에서만", not ovs_bad,
          "%d건 중 근거 못 찾음 %d" % (len(ovs), len(ovs_bad)))

    # ── 바. 주간 ────────────────────────────────────────────────────────
    W = d.get("weekly") or {}
    if W:
        out_dir = os.path.dirname(os.path.abspath(path))
        hist = {}
        for f in sorted(glob.glob(os.path.join(out_dir, "20*.json"))):
            dd = os.path.basename(f)[:-5]
            if W["since"] <= dd <= W["until"]:
                try:
                    snap = load(f)["reports"]
                except (OSError, ValueError, KeyError):
                    continue
                for r in snap:
                    if W["since"] <= (r.get("date") or "") <= W["until"]:
                        keep(hist, r)
        for r in rows:
            if W["since"] <= (r.get("date") or "") <= W["until"]:
                keep(hist, r)
        check("바1 주간 건수", W["count"] == len(hist),
              "실린 %d · 스냅숏에서 다시 센 %d" % (W["count"], len(hist)))
        span_bad = [r["url"] for r in W["reports"]
                    if not (W["since"] <= (r.get("date") or "") <= W["until"])]
        check("바2 주간 목록이 모두 기간 안", not span_bad, "벗어난 행 %d" % len(span_bad))
        wt = W.get("top") or []
        check("바3 인기 상위가 조회수 내림차순",
              all((W["reports"][i].get("views") or 0) >= (W["reports"][i + 1].get("views") or 0)
                  for i in range(min(len(wt), len(W["reports"])) - 1))
              if W.get("reports") else True, "")
        wov = W.get("overview") or {}
        wtxt = wov.get("text") or ""
        check("바4 주간 머리 요약의 건수", "리포트는 %d건입니다" % W["count"] in wtxt,
              wtxt[:60])
        # 한 주 브리핑의 인용은 지난 판에서 온 것도 있다. 오늘 판에만 견주면
        # 「없는 리포트」로 보여 애먼 흠이 잡힌다 — 스냅숏까지 합쳐 놓고 본다.
        # 같은 주소가 판마다 한 벌씩 있다. 오늘 판은 그 리포트의 본문을 다시
        # 열지 않았을 수 있어 요약이 비어 있다 — 뒤에 온 것으로 덮으면 멀쩡한
        # 인용이 「없는 문장」으로 몰린다. 요약을 가진 쪽을 남긴다.
        wbad, wn, wunk = [], 0, 0
        wurl = {}
        for r in list(hist.values()) + list(W.get("reports") or []) + rows:
            cur = wurl.get(r["url"])
            if cur is None or (not cur.get("summary") and r.get("summary")):
                wurl[r["url"]] = r

        def wcheck(url, text):
            r = wurl.get(url)
            if not r:
                return "unk"
            return "ok" if sq(text) in sq(r.get("summary") or "") else "bad"

        for b in wov.get("brief") or []:
            for p in b.get("points") or []:
                wn += 1
                v = wcheck(p.get("url"), p.get("text") or "")
                if v == "bad":
                    wbad.append(p.get("url"))
                elif v == "unk":
                    wunk += 1
        for m in wov.get("moves") or []:
            if m.get("why"):
                wn += 1
                v = wcheck(m.get("url"), m["why"])
                if v == "bad":
                    wbad.append(m.get("url"))
                elif v == "unk":
                    wunk += 1
        if wunk:
            warn("바5 참고", "%d개는 원 리포트를 스냅숏에서 찾지 못해 대조 못 함" % wunk)
        check("바5 주간 브리핑의 인용이 해당 리포트 요약에서 옴", not wbad,
              "%d개 중 어긋남 %d" % (wn, len(wbad)))

    # ── 결과 ────────────────────────────────────────────────────────────
    print("── 통과 %d ─────────────────────────────" % len(OK))
    for n, det in OK:
        print("  OK  %s%s" % (n, ("  — " + det) if det else ""))
    if WARN:
        print("\n── 참고 %d ─────────────────────────────" % len(WARN))
        for n, det in WARN:
            print("  ..  %s — %s" % (n, det))
    if BAD:
        print("\n── 어긋남 %d ───────────────────────────" % len(BAD))
        for n, det in BAD:
            print("  !!  %s — %s" % (n, det))
    print("\n%s" % ("모두 맞음" if not BAD else "어긋난 검사 %d개 — 산출물을 내지 말 것" % len(BAD)))
    return 1 if BAD else 0


if __name__ == "__main__":
    sys.exit(verify(sys.argv[1] if len(sys.argv) > 1 else "data/reports/latest.json"))
