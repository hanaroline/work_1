# -*- coding: utf-8 -*-
"""시장일지를 짓는 데 쓰는 조각 — 서식·표·검증 배지.

`scripts/briefing_lib.py` 와 같은 뜻으로 둔다. **여기에는 그날의 서술이 한
줄도 없다.** 날마다 달라지는 것은 빌더가 자료에서 만들고, 여기 있는 것은
판이 바뀌어도 변하지 않는 것뿐이다.

시장일지는 브리핑과 판형이 다르다 — 브리핑은 훑어 읽는 여러 쪽짜리이고,
시장일지는 **A4 한 장에 눈으로 훑는 표**다. 그래서 껍데기를 물려쓰지 않고
따로 둔다. 색·글꼴은 미래에셋 기준(오렌지 #F58220 · 블루 #043B72 ·
표 머리 #FAB072)을 그대로 쓰되, 본문 크기는 인쇄 밀도에 맞춘다.
"""
from __future__ import annotations

import datetime
import html as _html

KST = datetime.timezone(datetime.timedelta(hours=9))
WD = "월화수목금토일"
WD_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# ── 검증 배지 ────────────────────────────────────────────────────────
# 브리핑과 같은 체계를 쓴다(지침 3절). 자료 출처가 거래소·수집 파일이면
# MARKET DATA, 우리가 센 값이면 CALCULATED, 못 찾으면 NOT FOUND.
VF_MD = '<span class="vf ok">MARKET DATA</span>'
VF_C = '<span class="vf ok">CALCULATED</span>'
VF_1 = '<span class="vf solo">1 SOURCE</span>'
VF_N = '<span class="vf none">NOT FOUND</span>'
VF_P = '<span class="vf solo">PARTIAL</span>'


def d(s: str) -> datetime.date:
    return datetime.date(int(s[:4]), int(s[5:7]), int(s[8:10]))


def DK(x: datetime.date, wd: bool = False) -> str:
    t = "%d년 %d월 %d일" % (x.year, x.month, x.day)
    return t + ("(" + WD[x.weekday()] + ")" if wd else "")


def DE(x: datetime.date, wd: bool = False) -> str:
    t = "%d %s %d" % (x.day, x.strftime("%B"), x.year)
    return (WD_EN[x.weekday()] + " " + t) if wd else t


def DS(x: datetime.date) -> str:
    return "%d/%d" % (x.month, x.day)


def esc(s) -> str:
    return _html.escape("" if s is None else str(s), quote=False)


def L(ko: str, en: str) -> str:
    """한/영 쌍. 토글이 둘 중 하나만 보여 준다."""
    return '<span data-lang-ko>%s</span><span data-lang-en>%s</span>' % (ko, en)


# ── 숫자 ─────────────────────────────────────────────────────────────
DASH = "&mdash;"


def n(v, dp: int = 2) -> str:
    if v is None:
        return DASH
    return ("{:,.%df}" % dp).format(v)


def sgn(v, dp: int = 2, unit: str = "") -> str:
    """부호를 살려 색을 입힌다. 오름은 빨강, 내림은 파랑 — 국내 관행."""
    if v is None:
        return '<span class="mut">%s</span>' % DASH
    s = ("{:+,.%df}" % dp).format(v).replace("-", "&minus;")
    cls = "up" if v > 0 else ("down" if v < 0 else "flat")
    return '<span class="%s">%s%s</span>' % (cls, s, unit)


def pct(v, dp: int = 2) -> str:
    return sgn(v, dp, "%")


def bp(v, dp: int = 1) -> str:
    return sgn(v, dp, "bp")


def eok(v, dp: int = 0) -> str:
    """억원 값을 조/억으로 읽기 좋게. 부호를 살린다."""
    if v is None:
        return DASH
    sign = "&minus;" if v < 0 else "+"
    a = abs(v)
    cls = "up" if v > 0 else ("down" if v < 0 else "flat")
    body = (n(a / 10000.0, 2) + "조") if a >= 10000 else (n(a, dp) + "억")
    return '<span class="%s">%s%s</span>' % (cls, sign, body)


def eok_plain(v, dp: int = 0) -> str:
    """부호 없이 수준값으로 — 거래대금·예탁금처럼 크기만 보는 값."""
    if v is None:
        return DASH
    a = abs(v)
    return (n(a / 10000.0, 2) + "조") if a >= 10000 else (n(a, dp) + "억")


def won(v) -> str:
    if v is None:
        return DASH
    return n(v, 0) if abs(v) >= 1000 else n(v, 1)


# ── 표 ───────────────────────────────────────────────────────────────
def th(ko: str, en: str, cls: str = "") -> str:
    return '<th%s>%s</th>' % ((' class="%s"' % cls) if cls else "", L(ko, en))


def table(headers, rows, cls: str = "dt", foot: str = "") -> str:
    """headers = [(ko, en, cls), …] · rows = [[cell, …], …] (cell 은 이미 HTML)"""
    h = "".join(th(a, b, c) for a, b, c in headers)
    body = "".join("<tr>" + "".join("<td%s>%s</td>" % (
        (' class="%s"' % headers[i][2]) if i < len(headers) and headers[i][2] else "", c)
        for i, c in enumerate(r)) + "</tr>" for r in rows)
    f = ('<tfoot><tr><td colspan="%d">%s</td></tr></tfoot>' % (len(headers), foot)) if foot else ""
    return ('<table class="%s"><thead><tr>%s</tr></thead><tbody>%s</tbody>%s</table>'
            % (cls, h, body, f))


def strong(s: str) -> str:
    """주석에 쓰는 **굵게** 를 태그로 바꾼다.

    별표가 그대로 인쇄된 판이 나온 적이 있다. 주석은 사람이 쓰는 글이라
    별표가 섞이기 쉬우므로 넘기는 자리에서 한 번에 처리한다.
    """
    out, parts = [], (s or "").split("**")
    for i, p in enumerate(parts):
        out.append(("<b>%s</b>" % p) if (i % 2 == 1 and p) else p)
    return "".join(out)


def block(title_ko: str, title_en: str, body: str, badge: str = "", note: str = "") -> str:
    """1px 오렌지 룰 + 제목 — 미래에셋 시그니처(§9.1)."""
    nt = ('<p class="note">%s</p>' % strong(note)) if note else ""
    return (
        '<section class="blk">'
        '<div class="rule"></div>'
        '<h2>%s%s</h2>%s%s</section>'
        % (L(title_ko, title_en), (" " + badge) if badge else "", body, nt)
    )


def empty(ko: str, en: str) -> str:
    """빈 자리는 그럴듯한 문장으로 채우지 않는다. 비었다고 적는다."""
    return '<p class="empty">%s %s</p>' % (L(ko, en), VF_N)
