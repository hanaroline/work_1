# -*- coding: utf-8 -*-
"""브리핑을 짓는 데 쓰는 공용 조각 — 서식·표·날짜.

**이 파일에는 그날의 서술이 한 줄도 없다.** 서술은 날마다 새로 쓰고, 여기 있는
것은 판이 바뀌어도 변하지 않는 것뿐이다. 판을 물려 지으면서 글이 굳는 사고
(지침 7-2-1)를 구조로 막으려는 것이다.

날짜 이름표는 전부 여기서 만든다. 문자열로 적으면 반드시 굳는다.
"""
import datetime
import html as _html
import re

KST = datetime.timezone(datetime.timedelta(hours=9))
WD = "월화수목금토일"

VF_OK = '<span class="vf ok">2 SOURCES</span>'
VF_MD = '<span class="vf ok">MARKET DATA</span>'
VF_C = '<span class="vf ok">CALCULATED</span>'
VF_1 = '<span class="vf solo">1 SOURCE</span>'
VF_N = '<span class="vf none">NOT FOUND</span>'


# ── 날짜 ──────────────────────────────────────────────────────────
def d(s):
    """'2026-08-26' → date"""
    return datetime.date(int(s[:4]), int(s[5:7]), int(s[8:10]))


def DK(x, wd=False):
    """8월 26일 / 8월 26일(수)"""
    t = "%d월 %d일" % (x.month, x.day)
    return t + ("(" + WD[x.weekday()] + ")" if wd else "")


def DE(x, wd=False):
    """26 August / Wednesday 26 August"""
    t = "%d %s" % (x.day, x.strftime("%B"))
    return (x.strftime("%A") + " " + t) if wd else t


def DD(x):
    """26일"""
    return "%d일" % x.day


def DS(x):
    """8/26"""
    return "%d/%d" % (x.month, x.day)


# ── 숫자 ──────────────────────────────────────────────────────────
def n(v, dp=2):
    if v is None:
        return "&mdash;"
    return ("{:,.%df}" % dp).format(v)


def pct(v, dp=2):
    if v is None:
        return '<span class="mut">&mdash;</span>'
    s = ("{:+,.%df}" % dp).format(v).replace("-", "&minus;")
    cls = "up" if v > 0 else ("down" if v < 0 else "flat")
    return '<span class="%s">%s%%</span>' % (cls, s)


def bp(v, dp=1):
    if v is None:
        return '<span class="mut">&mdash;</span>'
    s = ("{:+,.%df}" % dp).format(v).replace("-", "&minus;")
    cls = "up" if v > 0 else ("down" if v < 0 else "flat")
    return '<span class="%s">%sbp</span>' % (cls, s)


def eok(v, dp=0):
    """억원 단위 값을 조/억으로 읽기 좋게. 부호를 살린다."""
    if v is None:
        return "&mdash;"
    sign = "&minus;" if v < 0 else "+"
    a = abs(v)
    if a >= 10000:
        return sign + n(a / 10000.0, 2) + "조"
    return sign + n(a, dp) + "억"


def jo(v, dp=2):
    """억원 → 조원 (부호 없이 수준값으로)"""
    if v is None:
        return "&mdash;"
    return n(v / 10000.0, dp) + "조"


def esc(s):
    return _html.escape(s or "", quote=False)


# ── 표 ────────────────────────────────────────────────────────────
def L(ko, en):
    return ('<span data-lang-ko>' + ko + '</span>'
            '<span data-lang-en>' + en + '</span>')


def TH(ko, en, cls=""):
    return '<th' + (' class="%s"' % cls if cls else '') + '>' + L(ko, en) + '</th>'


# 핵심본 여부. `build_briefing.py --core` 가 켜고, **표를 만드는 쪽 전부**가
# 이것을 본다. 예전에는 build_briefing 안에서만 갈랐는데, 그러면
# briefing_prepare 가 만든 표(환율·원자재·업종 ETF·지역 종목)에는 기간 열이
# 그대로 남아 열이 여덟이 되고 — 반 칸짜리 격자에 넣으면 246px 씩 넘쳤다.
CORE = [False]


def THP():
    """기간 수익률 네 열 — w1 · m1 · m3 · ytd (지침 4-3절).

    **핵심본에서는 세우지 않는다.** 「지금이 신고가인지 되돌림인지」를 말해 주는
    값이라 전체 판에는 반드시 있어야 하지만, 개장 전에 한 번 훑는 여섯 쪽짜리
    시트에서 오늘 결정에 닿는 것은 전일 대비이고, 기간 사다리는 같은 날짜의
    전체 판에 그대로 있다. 열을 넷 덜어야 표를 나란히 세울 수 있다.
    """
    if CORE[0]:
        return ""
    return "".join(TH(a, b, "n perf") for a, b in
                   (("1주", "1W"), ("1개월", "1M"), ("3개월", "3M"), ("연초", "YTD")))


def perf_cells(p, unit="%"):
    if CORE[0]:
        return ""
    p = p or {}
    f = bp if unit == "bp" else pct
    return "".join('<td class="n perf">' +
                   (f(p.get(k)) if p.get(k) is not None
                    else '<span class="mut">&mdash;</span>') + '</td>'
                   for k in ("w1", "m1", "m3", "ytd"))


def tbl(tko, ten, head, rows, cls="data", foot_ko="", foot_en=""):
    out = ['<div class="table-wrap">',
           '<table class="' + cls + '">',
           '  <caption>' + L(tko, ten) + '</caption>',
           '  <thead><tr>' + "".join(head) + '</tr></thead>',
           '  <tbody>']
    out += rows
    out += ['  </tbody>', '</table>']
    if foot_ko or foot_en:
        out.append('<p class="tbl-foot">' + L(foot_ko, foot_en) + '</p>')
    out.append('</div>')
    return "\n".join(out)


def exp(tko, ten, body):
    """접는 상세. **최소 서넛은 있어야** 요약 PDF 와 전체 PDF 가 갈린다."""
    return ('<details class="exp">\n  <summary>' + L(tko, ten) + '</summary>\n'
            '  <div class="exp-body">\n' + body + '\n  </div>\n</details>')


def P(ko, en):
    return '<p>' + L(ko, en) + '</p>'


def lede(ko, en):
    return '<p class="lede">' + L(ko, en) + '</p>'


def stat(lko, len_, val, chg, nko, nen):
    return ('<div class="stat">\n'
            '  <p class="stat-label">' + L(lko, len_) + '</p>\n'
            '  <p class="stat-value">' + val + '</p>\n'
            '  <p class="stat-chg">' + chg + '</p>\n'
            '  <p class="stat-note">' + L(nko, nen) + '</p>\n</div>')


def card(qko, qen, bko, ben):
    return ('<div class="soft-card">\n  <p class="q">' + L(qko, qen) + '</p>\n'
            '  <p>' + L(bko, ben) + '</p>\n</div>')


def callout(tko, ten, paras):
    return ('<div class="callout">\n  <p class="callout-title">' + L(tko, ten) + '</p>\n'
            + "\n".join(paras) + '\n</div>')


# ── 흐름을 눈으로 보는 도표 (요건 5) ────────────────────────────────
def sparkline(vals, w=132, h=30):
    """인라인 SVG 스파크라인. CSP 가 외부 라이브러리를 막으므로 직접 그린다.

    색은 currentColor 라 다크 모드를 따라온다. **세로 축은 줄마다 따로 맞추므로
    높이를 줄끼리 비교하면 안 된다** — 캡션에 적으십시오(지침 4-2절).
    """
    vals = [v for v in vals if v is not None]
    if len(vals) < 2:
        return '<span class="mut">&mdash;</span>'
    lo, hi = min(vals), max(vals)
    rng = (hi - lo) or 1.0
    step = (w - 4) / (len(vals) - 1)
    pts = " ".join("%.1f,%.1f" % (2 + i * step, h - 3 - (v - lo) / rng * (h - 6))
                   for i, v in enumerate(vals))
    last_up = vals[-1] >= vals[0]
    return ('<svg class="spark ' + ("up" if last_up else "down") + '" width="%d" height="%d" '
            'viewBox="0 0 %d %d" role="img" aria-hidden="true">'
            '<polyline fill="none" stroke="currentColor" stroke-width="1.4" '
            'stroke-linejoin="round" stroke-linecap="round" points="%s"/></svg>'
            % (w, h, w, h, pts))


def bar(share, w=110, h=11):
    """가로 막대 — 매물대 비중처럼 「어디에 얼마나」를 한눈에 보이려는 것."""
    share = max(0.0, min(100.0, share or 0.0))
    return ('<span class="hbar" role="img" aria-hidden="true">'
            '<span class="hbar-fill" style="width:%.1f%%"></span></span>' % share)


# ── 절 ────────────────────────────────────────────────────────────
class Doc(object):
    """절을 순서대로 모으고 번호는 **문서 순서대로 다시 매긴다.**

    절 번호를 손으로 적으면 절이 하나 늘 때마다 뒤가 전부 어긋난다(지침 7-3절).
    """

    def __init__(self):
        self.secs = []

    def sec(self, sid, tko, ten, body):
        self.secs.append((sid, tko, ten, body))

    def toc(self):
        return "\n".join(
            '    <li><a href="#%s"><span class="sn">%02d</span>%s</a></li>'
            % (sid, i + 1, L(tko, ten))
            for i, (sid, tko, ten, _) in enumerate(self.secs))

    def html(self):
        out = []
        for i, (sid, tko, ten, body) in enumerate(self.secs):
            out.append(
                '<section class="section" id="%s">\n'
                '  <div class="section-rule"></div>\n'
                '  <span class="sec-num">%02d</span>\n'
                '  <h2 class="section-title">%s</h2>\n%s\n</section>'
                % (sid, i + 1, L(tko, ten), body))
        return "\n\n".join(out)


# ── 서술 파일 ──────────────────────────────────────────────────────
class Narrative(object):
    """그날 손으로 쓴 서술. **없으면 자료에서 만든 문장이 대신 나간다.**

    어제 것을 물려받는 길을 아예 두지 않는 것이 요점이다. 키가 없으면 조용히
    옛 문장이 남는 게 아니라, 자료에서 계산한 한 줄이 나가고 그 사실이
    used/missing 에 기록된다.
    """

    def __init__(self, data):
        self.d = data or {}
        self.used = set()
        self.missing = []

    def get(self, key, fb_ko, fb_en):
        v = self.d.get(key)
        if isinstance(v, (list, tuple)) and len(v) == 2:
            self.used.add(key)
            return v[0], v[1]
        self.missing.append(key)
        return fb_ko, fb_en

    def has(self, key):
        return isinstance(self.d.get(key), (list, tuple, dict))

    def report(self):
        return {"written": sorted(self.used), "fell_back": sorted(set(self.missing))}


# ── 조립 ──────────────────────────────────────────────────────────
def assemble(chrome_dir, doc, title, hero, now, title_en=None):
    head = open(chrome_dir + "/head.html", encoding="utf-8").read()
    tail = open(chrome_dir + "/tail.html", encoding="utf-8").read()
    nav = open(chrome_dir + "/nav.html", encoding="utf-8").read()

    # 제목도 한/영 쌍으로 심는다. 예전에는 영문 제목이 꼬리말 스크립트 안에
    # 문자열로 박혀 있어서, 판을 물려 지을 때마다 8월 8일이 그대로 따라왔다
    # (실제로 모든 판의 EN 탭 제목이 "Saturday 8 August 2026" 이었다).
    ten = title_en or title
    head = re.sub(r"<title[^>]*>.*?</title>",
                  '<title data-en="%s">%s</title>' % (esc(ten), title),
                  head, count=1, flags=re.S)

    # 꼬리말 작성일 — 시계에서 읽는다. 손으로 적으면 예정 시각을 적게 된다.
    hhmm = now.strftime("%H:%M")
    bko = ("미래에셋증권 마포WM · 송재섭 · %d년 %s %s KST 작성."
           % (now.year, DK(now.date(), True), hhmm))
    ben = ("Mirae Asset Securities, Mapo WM · Jaeseop Song · Compiled %s KST, %s %d."
           % (hhmm, DE(now.date(), True), now.year))
    dot = r'(?:&middot;|·)'
    for pat, rep, what in (
            (r'미래에셋증권 마포WM\s*' + dot + r'\s*송재섭\s*' + dot + r'\s*[^<]*작성\.', bko, "국문"),
            (r'Mirae Asset Securities, Mapo WM\s*' + dot + r'\s*Jaeseop Song\s*'
             + dot + r'\s*Compiled[^<]*\.', ben, "영문")):
        cnt = len(re.findall(pat, tail))
        assert cnt == 1, "꼬리말의 %s 작성일 줄을 %d 개 찾았다 — 1 개여야 한다" % (what, cnt)
        tail = re.sub(pat, rep, tail, count=1)

    n_toc = len(re.findall(r'<ul class="sidenav-toc">', nav))
    assert n_toc == 1, "껍데기에서 목차 <ul> 을 %d 개 찾았다 — 1 개여야 한다" % n_toc
    nav = re.sub(r'(?s)(<ul class="sidenav-toc">).*?(</ul>)',
                 lambda m: m.group(1) + "\n" + doc.toc() + "\n  " + m.group(2),
                 nav, count=1)

    # 순서를 지킨다 — 히어로가 <div class="shell"> **앞**에 오고, 절은 <main> 안에
    # 들어간다. 이 순서가 틀리면 본문 칸이 사이드바 옆 200px 로 접혀 표가 전부
    # 넘친다(실제로 그렇게 나왔다). nav.html 이 shell 과 nav 를 열고, tail.html 이
    # </main> 과 </div> 로 닫는다.
    assert "</main>" in tail, "껍데기 꼬리에 </main> 이 없다"
    return (head + "\n" + hero + "\n" + nav + "\n<main>\n\n"
            + doc.html() + "\n\n" + tail)
