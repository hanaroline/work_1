#!/usr/bin/env python3
"""튜더 존스·드러켄밀러 노트 — data/gurus/ptj-druckenmiller.json 에서 gurus.html 을 짓는다.

    python3 scripts/build_gurus_page.py            # 시세는 origin/main 의 data/market 에서
    python3 scripts/build_gurus_page.py --ref HEAD # 다른 가지의 시세로
    python3 scripts/build_gurus_page.py --check    # 판정 표만 찍고 파일은 쓰지 않음

「지금까지」 칸은 손으로 적지 않는다. 견해가 나온 날의 저장 스냅샷
(data/market/<날짜>.json)과 지금의 latest.json 을 견줘 계산한다. 스냅샷이 없으면
비워 둔다 — 지어내지 않는다. 표준 라이브러리만 쓴다.
"""
import argparse
import html
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "gurus", "ptj-druckenmiller.json")
OUT = os.path.join(ROOT, "gurus.html")

WHO = {"tudor_jones": "폴 튜더 존스", "druckenmiller": "스탠리 드러켄밀러"}
FIRM = {"tudor_jones": "Tudor Investment", "druckenmiller": "Duquesne Family Office"}
VIEW = {"long": "강세", "short": "약세", "neutral": "중립", "watch": "시점 견해", "position": "보유(공시)"}
HORIZON = {"near": "몇 주~몇 달", "yearend": "연말까지", "long": "구조적"}
KEYNAME = {"wti": "WTI", "sp500": "S&P 500", "ust10y": "미 10년물", "btc": "비트코인",
           "gold": "금", "copper": "구리", "dxy": "달러지수"}


def read_market(ref, name):
    """ref 가지의 data/market/<name> 을 읽는다. 없으면 작업 트리, 그래도 없으면 None."""
    path = "data/market/" + name
    if ref:
        try:
            raw = subprocess.run(["git", "-C", ROOT, "show", "%s:%s" % (ref, path)],
                                 capture_output=True, check=True).stdout
            return json.loads(raw)
        except (subprocess.CalledProcessError, ValueError):
            pass
    p = os.path.join(ROOT, path)
    if os.path.exists(p):
        with open(p, encoding="utf-8") as fp:
            return json.load(fp)
    return None


def judge(st, ref, now):
    """견해 한 줄의 「그 뒤 시장」과 판정. 값을 못 찾으면 빈칸."""
    ck = st.get("check")
    out = {"base": None, "now": None, "move": "", "verdict": "", "tone": "none"}
    if not ck:
        out["verdict"] = "견줄 지표 없음"
        return out
    snap = read_market(ref, ck["from"] + ".json")
    b = ((snap or {}).get("indices") or {}).get(ck["key"])
    n = ((now or {}).get("indices") or {}).get(ck["key"])
    if not b or not n or not b.get("close") or not n.get("close"):
        out["verdict"] = "시세 스냅샷 없음"
        return out
    out["base"], out["now"] = b, n
    bp = ck["key"] == "ust10y"
    diff = n["close"] - b["close"]
    pct = diff / b["close"] * 100
    out["move"] = ("%+.0fbp" % (diff * 100)) if bp else ("%+.1f%%" % pct)
    view, hz = st["view"], st["horizon"]
    up = diff > 0
    if ck.get("higher_is") == "short":     # 금리가 오르면 채권 약세 견해가 맞는 쪽
        view = {"short": "long", "long": "short"}.get(view, view)
    small = abs(diff * 100) < 5 if bp else abs(pct) < 0.5
    if view not in ("long", "short"):
        out["verdict"] = "판정 안 함 · %s" % VIEW[st["view"]]
    elif hz == "long":
        out["verdict"] = "판정 안 함 · 구조적 견해"
    elif small:
        out["verdict"], out["tone"] = "아직 차이 없음", "flat"
    elif (view == "long") == up:
        out["verdict"], out["tone"] = "지금까지 맞는 쪽", "good"
    else:
        out["verdict"], out["tone"] = "지금까지 어긋난 쪽", "bad"
    if hz == "yearend" and out["tone"] == "none":
        out["verdict"] = "연말에 판정"
    return out


def e(s):
    return html.escape(str(s), quote=True)


def fmt_val(key, v):
    if v is None:
        return ""
    if key == "ust10y":
        return "%.2f%%" % v
    if key in ("btc", "sp500", "gold"):
        return "{:,.0f}".format(v)
    return "{:,.2f}".format(v)


def link(url, label):
    return '<a href="%s" target="_blank" rel="noopener">%s</a>' % (e(url), e(label))


CSS = r"""
/* 두 사람을 나란히 세운 뒤, 그 아래로 견해 흐름 → 13F → 원문 순으로 내려간다 */
:root{
  --paper:#f5f6f8; --sheet:#ffffff; --ink:#18202b; --muted:#4f5b6b; --rule:#d9dee6;
  --accent:#0f5c6e; --accent-soft:#e3f0f2;
  --good:#1d6b3f; --good-soft:#e2f2e8; --bad:#a3361f; --bad-soft:#f8e6e1; --flat:#6a5a12; --flat-soft:#f4efd6;
  --f-body:"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;
  --f-num:"IBM Plex Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --paper:#11161d; --sheet:#18202a; --ink:#e7ebf0; --muted:#a6b0bd; --rule:#2c3643;
  --accent:#6cc3d4; --accent-soft:#163039;
  --good:#7fd3a0; --good-soft:#163024; --bad:#f19a85; --bad-soft:#3a1d16; --flat:#e3cf74; --flat-soft:#332d12; color-scheme:dark}}
:root[data-theme="dark"]{
  --paper:#11161d; --sheet:#18202a; --ink:#e7ebf0; --muted:#a6b0bd; --rule:#2c3643;
  --accent:#6cc3d4; --accent-soft:#163039;
  --good:#7fd3a0; --good-soft:#163024; --bad:#f19a85; --bad-soft:#3a1d16; --flat:#e3cf74; --flat-soft:#332d12; color-scheme:dark}
body{background:var(--paper);color:var(--ink);font:15px/1.65 var(--f-body);margin:0}
.wrap{max-width:1080px;margin:0 auto;padding-block:28px 56px;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));
  display:grid;gap:36px}
header h1{font-size:1.75rem;line-height:1.25;margin:0 0 6px;text-wrap:balance;font-weight:700}
header p{margin:0;color:var(--muted)}
h2{font-size:1.15rem;margin:0 0 4px;text-wrap:balance}
.sub{color:var(--muted);margin:0 0 14px;font-size:.92rem}
.wrap>*{min-width:0}
.people{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:16px}
.person{background:var(--sheet);border:1px solid var(--rule);border-radius:10px;padding:18px 20px;min-width:0;display:grid;gap:10px;align-content:start}
.person h3{margin:0;font-size:1.1rem}
.person .firm{color:var(--muted);font-size:.85rem;margin:0}
.person .last{margin:0;font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font-size:.8rem;padding:2px 9px;border-radius:999px;border:1px solid var(--rule);white-space:nowrap}
.chip b{font-weight:600}
.v-long{background:var(--good-soft);border-color:transparent}
.v-short{background:var(--bad-soft);border-color:transparent}
.v-neutral,.v-watch{background:var(--flat-soft);border-color:transparent}
.v-position{background:var(--accent-soft);border-color:transparent}
.tbl{overflow-x:auto;background:var(--sheet);border:1px solid var(--rule);border-radius:10px}
table{border-collapse:collapse;width:100%;min-width:760px;font-size:.9rem}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--rule);vertical-align:top}
th{font-size:.78rem;letter-spacing:.04em;color:var(--muted);font-weight:600;background:var(--paper)}
tr:last-child td{border-bottom:0}
td:nth-child(2){white-space:nowrap}
td.num{font-family:var(--f-num);font-variant-numeric:tabular-nums;white-space:nowrap}
.date{font-family:var(--f-num);font-variant-numeric:tabular-nums;white-space:nowrap}
.verdict{font-weight:600;white-space:nowrap;padding:2px 8px;border-radius:6px}
.t-good{color:var(--good);background:var(--good-soft)}
.t-bad{color:var(--bad);background:var(--bad-soft)}
.t-flat{color:var(--flat);background:var(--flat-soft)}
.t-none{color:var(--muted)}
.basis{color:var(--muted);font-size:.8rem;display:block}
.filings{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:16px}
.filing{background:var(--sheet);border:1px solid var(--rule);border-radius:10px;padding:16px 18px;min-width:0}
.filing h3{margin:0 0 2px;font-size:1rem}
.filing dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 14px;margin:12px 0}
.filing dt{color:var(--muted);font-size:.85rem}
.filing dd{margin:0;min-width:0}
.items{display:grid;gap:14px}
.item{background:var(--sheet);border:1px solid var(--rule);border-radius:10px;padding:18px 20px;min-width:0}
.item .meta{display:flex;flex-wrap:wrap;gap:6px 12px;color:var(--muted);font-size:.85rem;margin-bottom:4px}
.item h3{margin:0 0 10px;font-size:1.05rem;text-wrap:balance}
.item ul{margin:0;padding-left:1.2em;display:grid;gap:4px}
.item .disputed{margin:12px 0 0;font-size:.88rem;color:var(--muted)}
.item .links{margin:12px 0 0;display:flex;flex-wrap:wrap;gap:6px 16px;font-size:.9rem}
.tag{font-size:.75rem;padding:1px 7px;border-radius:4px;background:var(--accent-soft);color:var(--accent);font-weight:600}
a{color:var(--accent);text-underline-offset:2px}
a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.notes{color:var(--muted);font-size:.88rem;display:grid;gap:4px;margin:0;padding-left:1.2em}
"""


def build(d, ref):
    now = read_market(ref, "latest.json")
    stamp = (now or {}).get("generated_at_kst", "")
    seen = sorted(d["seen"], key=lambda x: x["date"], reverse=True)
    byid = {x["id"]: x for x in d["seen"]}
    stances = sorted(d.get("stances", []), key=lambda x: (x["date"], x["who"]), reverse=True)
    rows = [(st, judge(st, ref, now)) for st in stances]

    out = ['<title>튜더 존스·드러켄밀러 노트</title>',
           '<meta name="claude:viewport-fit-sides" content="cover">',
           '<link rel="preconnect" href="https://fonts.googleapis.com">',
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500'
           '&family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap">',
           "<style>" + CSS + "</style>", '<div class="wrap">']
    out.append('<header><h1>튜더 존스·드러켄밀러 노트</h1>'
               '<p>발언·13F 공시 %d건 · 마지막 점검 %s · 시세 기준 %s</p></header>'
               % (len(seen), e(d.get("baseline_date", "")), e(stamp or "확인 못 함")))

    # 1. 사람별 — 자산마다 가장 최근 견해
    out.append('<section><h2>지금 어느 쪽에 서 있나</h2>'
               '<p class="sub">자산마다 가장 최근 견해만 모았습니다. 「보유(공시)」는 전망 발언이 아니라 분기 말 포트폴리오입니다.</p>'
               '<div class="people">')
    for who in ("druckenmiller", "tudor_jones"):
        latest = {}
        for st in stances:
            if st["who"] == who and st["asset"] not in latest:
                latest[st["asset"]] = st
        last = next((x for x in seen if x["who"] == who), None)
        chips = "".join('<span class="chip v-%s">%s <b>%s</b></span>' % (st["view"], e(a), e(VIEW[st["view"]]))
                        for a, st in latest.items())
        out.append('<article class="person"><div><h3>%s</h3><p class="firm">%s</p></div>'
                   '<p class="last">%s</p><div class="chips">%s</div>'
                   '<p class="firm">가장 최근 소식 %s · %s</p></article>'
                   % (e(WHO[who]), e(FIRM[who]), e(last["headline"] if last else "기록 없음"), chips,
                      e(last["date"] if last else ""), e(last["venue"] if last else "")))
    out.append("</div></section>")

    # 2. 견해 흐름과 그 뒤 시장
    out.append('<section><h2>견해 흐름과 그 뒤 시장</h2>'
               '<p class="sub">견해가 나온 날의 저장 시세와 지금 시세를 견줬습니다. 몇 주~몇 달짜리 견해만 판정하고, 연말·구조적 견해와 공시 보유는 움직임만 보입니다.</p>'
               '<div class="tbl"><table><thead><tr><th>날짜</th><th>누가</th><th>자산</th><th>견해</th>'
               '<th>내용</th><th>그날</th><th>지금</th><th>변화</th><th>판정</th></tr></thead><tbody>')
    for st, j in rows:
        key = (st.get("check") or {}).get("key")
        b, n = j["base"], j["now"]
        out.append('<tr><td class="date">%s</td><td>%s</td><td>%s</td>'
                   '<td><span class="chip v-%s">%s</span><span class="basis">%s · %s</span></td>'
                   '<td>%s</td><td class="num">%s<span class="basis">%s</span></td>'
                   '<td class="num">%s<span class="basis">%s</span></td><td class="num">%s</td>'
                   '<td><span class="verdict t-%s">%s</span></td></tr>'
                   % (e(st["date"]), e(WHO[st["who"]]), e(st["asset"]),
                      st["view"], e(VIEW[st["view"]]), e(st["basis"]), e(HORIZON[st["horizon"]]),
                      e(st["text"]),
                      e(fmt_val(key, b and b["close"])), e((KEYNAME.get(key, "") + " " + b["date"]) if b else ""),
                      e(fmt_val(key, n and n["close"])), e(n["date"] if n else ""),
                      e(j["move"]), j["tone"], e(j["verdict"])))
    out.append("</tbody></table></div></section>")

    # 3. 13F
    out.append('<section><h2>13F 분기 변화</h2>'
               '<p class="sub">분기 말 미국 상장 롱 포지션만 나옵니다. 공매도·헤지·매매 시점은 빠지고, 제출은 분기 말 뒤 최대 45일입니다.</p>'
               '<div class="filings">')
    for f in d.get("filings", []):
        dl = "".join("<dt>%s</dt><dd>%s</dd>" % (e(a), e(b)) for a, b in f["rows"])
        out.append('<article class="filing"><h3>%s</h3><p class="firm">%s 기준 · %s 제출%s</p><dl>%s</dl>%s</article>'
                   % (e(WHO[f["who"]]), e(f["period"]), e(f["filed"]),
                      "" if f.get("verified") else " · 기사 보도 기준(원본 표와 아직 대조 안 함)",
                      dl, link(f["url"], "SEC 공시 원본")))
    out.append('</div><p class="sub" style="margin-top:12px">다음 제출 예정: %s</p></section>' % e(d.get("next_13f_due", "")))

    # 4. 소식 원문
    out.append('<section><h2>소식과 원문</h2><p class="sub">따옴표는 본인 발언, 「보도:」는 기사가 옮긴 내용입니다.</p><div class="items">')
    for it in seen:
        pts = "".join("<li>%s</li>" % e(p) for p in it["points"])
        links = []
        if it.get("full_text"):
            links.append(link(it["full_text"], "전문"))
        elif it.get("full_text_note"):
            links.append('<span>전문 없음 — %s</span>' % e(it["full_text_note"]))
        links += [link(c["url"], c["name"]) for c in it.get("coverage", [])]
        disp = ('<p class="disputed">엇갈리는 점: %s</p>' % e(it["disputed"])) if it.get("disputed") else ""
        out.append('<article class="item" id="%s"><div class="meta"><span class="date">%s</span><span>%s</span>'
                   '<span>%s</span><span class="tag">%s</span></div><h3>%s</h3><ul>%s</ul>%s'
                   '<p class="links">%s</p></article>'
                   % (e(it["id"]), e(it["date"]), e(WHO[it["who"]]), e(it["venue"]),
                      e(it["kind"] + (" · 직접" if it.get("direct") else " · 보도만")),
                      e(it["headline"]), pts, disp, " · ".join(links)))
    out.append("</div></section>")

    out.append('<section><h2>읽는 법</h2><ul class="notes">'
               '<li>「지금까지 맞는 쪽」은 그 뒤 시세 방향이 견해와 같다는 뜻일 뿐, 수익률이나 매매 시점을 말하지 않습니다.</li>'
               '<li>시세는 저장소가 모은 스냅샷이고 수집 시각 기준이라 종가와 조금 다를 수 있습니다. 스냅샷이 없는 날은 비웁니다.</li>'
               '<li>매수·매도 권유가 아닙니다. 고객에게 옮길 때는 「직접 발언」과 「보도」를 구분해 말하십시오.</li>'
               '</ul></section></div>')
    return "\n".join(out) + "\n", rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ref", default="origin/main")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--out", default=OUT)
    a = ap.parse_args()
    with open(SRC, encoding="utf-8") as fp:
        d = json.load(fp)
    page, rows = build(d, a.ref)
    for st, j in rows:
        print("%s %-6s %-12s %-8s %-7s %s" % (st["date"], st["who"][:6], st["asset"], st["view"], j["move"], j["verdict"]))
    if not a.check:
        with open(a.out, "w", encoding="utf-8") as fp:
            fp.write(page)
        print("→", os.path.relpath(a.out, ROOT))


if __name__ == "__main__":
    sys.exit(main())
