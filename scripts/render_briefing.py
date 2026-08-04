#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
아침 증시시황 브리핑 렌더러 (JSON -> HTML)

  python3 scripts/render_briefing.py briefing/data/2026-08-04.json
  python3 scripts/render_briefing.py --all        # 전체 재생성
  python3 scripts/render_briefing.py --schema     # JSON 스키마 출력

네트워크를 사용하지 않는 순수 렌더러다. 데이터 수집은
.claude/skills/market-briefing/SKILL.md 절차에 따라 별도로 수행하고,
그 결과를 briefing/data/YYYY-MM-DD.json 으로 저장한 뒤 이 스크립트를 돌린다.

출력물
  briefing/YYYY-MM-DD.html   일자별 브리핑
  briefing/index.html        가장 최근 브리핑
  briefing/archive.html      일자 목록
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "briefing", "data")
OUT_DIR = os.path.join(ROOT, "briefing")

# ----------------------------------------------------------------------------
# 디자인 토큰 — Mirae Asset Design System
# ----------------------------------------------------------------------------
CSS = """
*, *::before, *::after { box-sizing: border-box; }
:root {
  --primary: #F58220;
  --primary-active: #CB6015;
  --primary-soft: #FAB072;
  --secondary: #043B72;
  --canvas: #FFFFFF;
  --surface-soft: #ECEFF4;
  --surface-subtle: #F7F8FA;
  --hairline: #CDCECB;
  --hairline-soft: #E5E4E1;
  --ink: #1A1A1A;
  --body: #3D3D3D;
  --muted: #6C6C6C;
  --muted-soft: #84888B;
  --line-dark: #49535B;
  --up: #C62828;
  --down: #043B72;
  --warning: #D4A017;
  --success: #2E8540;
  --font-kr: 'Spoqa Han Sans Neo', 'Noto Sans KR', sans-serif;
  --font-en: 'Inter', 'Aptos', 'Segoe UI', system-ui, sans-serif;
  --font-num: 'Inter', 'SF Mono', monospace;
  --space-section: 104px;
  --space-block: 56px;
  --space-content: 28px;
  --space-tight: 14px;
}
@media (max-width: 768px) {
  :root { --space-section: 72px; --space-block: 36px; }
}
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--canvas);
  color: var(--body);
  font-family: var(--font-kr);
  font-size: 19px;
  line-height: 1.65;
  font-variant-numeric: tabular-nums;
}
html[lang="en"] body { font-family: var(--font-en); }
.num { font-family: var(--font-num); font-variant-numeric: tabular-nums; }
a { color: var(--secondary); text-decoration: none; border-bottom: 1px solid var(--hairline); }
a:hover { color: var(--primary-active); border-bottom-color: var(--primary); }
strong { color: var(--ink); font-weight: 700; }

.page { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
@media (max-width: 768px) { .page { padding: 0 20px; } }

/* ---- 한/영 토글 ---- */
.topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 19px; padding-top: 24px; }
.tag {
  display: inline-block; font-size: 14px; letter-spacing: .6px; font-weight: 500;
  color: var(--muted); border: 1px solid var(--hairline); padding: 4px 10px; border-radius: 2px;
}
.lang-toggle { display: inline-flex; border: 1px solid var(--hairline); border-radius: 2px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); flex: none; }
.lang-toggle button {
  font-family: var(--font-en); font-size: 14px; font-weight: 500; letter-spacing: .5px;
  padding: 10px 17px; border: 0; background: #FFFFFF; color: var(--muted); cursor: pointer;
}
.lang-toggle button + button { border-left: 1px solid var(--hairline); }
.lang-toggle button:hover:not([aria-checked="true"]) { background: var(--surface-subtle); color: var(--ink); }
.lang-toggle button[aria-checked="true"] { background: var(--primary); color: #FFFFFF; }
.lang-toggle button:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

/* ---- Hero ---- */
.hero { margin-top: 28px; padding-bottom: var(--space-block); border-bottom: 1px solid var(--hairline-soft); }
.hero-kicker { font-size: 16px; font-weight: 500; letter-spacing: .6px; color: var(--primary-active); margin: 0 0 14px; }
.hero h1 { font-size: 48px; font-weight: 700; line-height: 1.15; letter-spacing: -0.5px; color: var(--ink); margin: 0 0 19px; }
.hero-lede { font-size: 21px; line-height: 1.6; color: var(--body); margin: 0; max-width: 62em; }
.hero-meta { margin-top: 19px; font-size: 14px; letter-spacing: .2px; color: var(--muted-soft); }
@media (max-width: 768px) { .hero h1 { font-size: 32px; } .hero-lede { font-size: 19px; } }

.tone { display: inline-block; font-size: 14px; font-weight: 500; letter-spacing: .4px; padding: 4px 10px; border-radius: 2px; color: #FFFFFF; background: var(--muted-soft); }
.tone.risk-off { background: var(--up); }
.tone.risk-on { background: var(--success); }
.tone.mixed { background: var(--warning); }
.tone.neutral { background: var(--muted-soft); }

/* ---- 섹션 ---- */
.section { margin-top: var(--space-section); }
.section-rule { height: 1px; background: var(--primary); margin-bottom: 19px; }
.section-title { font-size: 26px; font-weight: 700; letter-spacing: 0; color: var(--ink); margin: 0 0 var(--space-content); }
@media (max-width: 768px) { .section-title { font-size: 22px; } }
.section h3 { font-size: 22px; font-weight: 600; color: var(--ink); margin: var(--space-block) 0 var(--space-tight); }
@media (max-width: 768px) { .section h3 { font-size: 19px; } }
.section h3:first-of-type { margin-top: 0; }
.section p { margin: 0 0 var(--space-content); max-width: 62em; }
.sub { font-size: 17px; line-height: 1.55; color: var(--muted); }

/* ---- 핵심 요약 ---- */
.keypoints { list-style: none; margin: 0; padding: 0; counter-reset: kp; }
.keypoints li {
  counter-increment: kp; position: relative; padding: 19px 0 19px 52px;
  border-bottom: 1px solid var(--hairline-soft);
}
.keypoints li:first-child { border-top: 1px solid var(--hairline-soft); }
.keypoints li::before {
  content: counter(kp, decimal-leading-zero); position: absolute; left: 0; top: 21px;
  font-family: var(--font-num); font-size: 16px; font-weight: 700; color: var(--primary);
  letter-spacing: .6px;
}

/* ---- 지표 카드 ---- */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--hairline-soft); border: 1px solid var(--hairline); }
@media (max-width: 1023px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .stat-grid { grid-template-columns: 1fr; } }
.stat { background: #FFFFFF; padding: 24px 22px; }
.stat-label { font-size: 16px; font-weight: 500; letter-spacing: .6px; line-height: 1.2; color: var(--muted); margin: 0 0 10px; }
.stat-value { font-family: var(--font-num); font-size: 34px; font-weight: 700; line-height: 1.0; letter-spacing: -0.6px; color: var(--ink); }
.stat-chg { font-size: 14px; line-height: 1.4; margin-top: 10px; font-family: var(--font-num); }
.stat-chg.up { color: var(--up); }
.stat-chg.down { color: var(--down); }
.stat-chg.flat { color: var(--muted-soft); }
.stat-note { font-size: 14px; line-height: 1.4; color: var(--muted-soft); margin-top: 8px; font-family: var(--font-kr); }
html[lang="en"] .stat-note { font-family: var(--font-en); }
.hero-stat .stat-value { font-size: 48px; }

/* ---- 표 ---- */
.table-wrap { overflow-x: auto; border: 1px solid var(--hairline); }
table.data { width: 100%; border-collapse: collapse; font-size: 17px; min-width: 560px; }
table.data caption { caption-side: top; text-align: left; font-size: 14px; color: var(--muted-soft); padding: 0 0 10px; }
table.data th, table.data td { padding: 12px 14px; border-bottom: 1px solid var(--hairline-soft); text-align: left; vertical-align: top; }
table.data thead th { background: var(--primary-soft); color: var(--ink); font-size: 16px; font-weight: 700; white-space: nowrap; }
table.data tbody tr:hover { background: var(--surface-subtle); }
table.data td.n, table.data th.n { text-align: right; font-family: var(--font-num); white-space: nowrap; }
table.data td.up { color: var(--up); }
table.data td.down { color: var(--down); }
table.data tr.hl td { background: #D7D7D7; font-weight: 700; }
table.data tr.hl:hover td { background: #D7D7D7; }

/* ---- 등락률 바 ---- */
.bars { display: grid; gap: 10px; margin: 0 0 var(--space-content); }
.bar-row { display: grid; grid-template-columns: minmax(96px, 168px) 1fr 74px; align-items: center; gap: 14px; font-size: 16px; }
.bar-name { color: var(--body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-track { position: relative; height: 20px; background: var(--surface-subtle); border: 1px solid var(--hairline-soft); }
.bar-track .zero { position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: var(--hairline); }
.bar-fill { position: absolute; top: 3px; bottom: 3px; }
.bar-fill.up { background: var(--up); left: 50%; }
.bar-fill.down { background: var(--down); }
.bar-val { text-align: right; font-family: var(--font-num); font-size: 16px; }
.bar-val.up { color: var(--up); }
.bar-val.down { color: var(--down); }
.bar-val.flat { color: var(--muted-soft); }

/* ---- 하우스 뷰 ---- */
.views { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--hairline-soft); border: 1px solid var(--hairline); }
@media (max-width: 860px) { .views { grid-template-columns: 1fr; } }
.view { background: #FFFFFF; padding: 24px 22px; }
.view-firm { font-size: 16px; font-weight: 700; letter-spacing: .3px; color: var(--primary-active); margin: 0 0 4px; }
.view-who { font-size: 14px; color: var(--muted-soft); margin: 0 0 12px; }
.view-body { font-size: 17px; line-height: 1.55; margin: 0; color: var(--body); }
.view-stance { display: inline-block; margin-top: 12px; font-size: 14px; font-weight: 500; letter-spacing: .4px; padding: 3px 9px; border-radius: 2px; border: 1px solid var(--hairline); color: var(--muted); }
.view-stance.bull { border-color: var(--up); color: var(--up); }
.view-stance.bear { border-color: var(--down); color: var(--down); }
.view-stance.neutral { border-color: var(--muted-soft); color: var(--muted); }

/* ---- 콜아웃 ---- */
.callout { background: var(--primary); color: #FFFFFF; border-radius: 4px; padding: 38px; margin: 0 0 var(--space-content); }
.callout h3 { color: #FFFFFF; margin: 0 0 14px; font-size: 22px; font-weight: 600; }
.callout p, .callout li { color: #FFFFFF; }
.callout ul { margin: 0; padding-left: 22px; }
.callout li { margin-bottom: 10px; font-size: 17px; line-height: 1.55; }
.callout li:last-child { margin-bottom: 0; }
.soft-card { background: var(--surface-soft); border-radius: 4px; padding: 28px; }
.soft-card h3 { margin-top: 0; }

/* ---- 리스크 / 체크리스트 ---- */
.risks { list-style: none; margin: 0; padding: 0; }
.risks li { padding: 14px 0 14px 22px; border-bottom: 1px solid var(--hairline-soft); position: relative; font-size: 17px; line-height: 1.55; }
.risks li::before { content: ""; position: absolute; left: 0; top: 24px; width: 10px; height: 1px; background: var(--primary); }
.qa { margin: 0; }
.qa dt { font-size: 19px; font-weight: 700; color: var(--ink); margin-top: 28px; }
.qa dt:first-child { margin-top: 0; }
.qa dd { margin: 10px 0 0; font-size: 17px; line-height: 1.6; color: var(--body); max-width: 62em; }

/* ---- 출처 / 푸터 ---- */
.sources { list-style: none; margin: 0; padding: 0; font-size: 14px; line-height: 1.5; columns: 2; column-gap: 38px; }
@media (max-width: 768px) { .sources { columns: 1; } }
.sources li { margin-bottom: 10px; break-inside: avoid; }
.sources .pub { color: var(--muted-soft); }
footer.foot { margin-top: var(--space-section); padding: 28px 0 56px; border-top: 1px solid var(--hairline); font-size: 14px; color: var(--muted-soft); }
footer.foot p { margin: 0 0 8px; max-width: none; }
.navlinks { margin-top: 19px; font-size: 16px; }
.navlinks a { margin-right: 19px; }

/* ---- 아카이브 ---- */
.arch { list-style: none; margin: 0; padding: 0; }
.arch li { border-bottom: 1px solid var(--hairline-soft); }
.arch li:first-child { border-top: 1px solid var(--hairline-soft); }
.arch a { display: grid; grid-template-columns: 140px 1fr; gap: 19px; padding: 19px 0; border: 0; align-items: baseline; }
@media (max-width: 640px) { .arch a { grid-template-columns: 1fr; gap: 6px; } }
.arch a:hover { background: var(--surface-subtle); }
.arch .d { font-family: var(--font-num); font-size: 16px; color: var(--primary-active); font-weight: 700; }
.arch .t { font-size: 19px; color: var(--ink); }

[data-lang-en] { display: none; }
html[lang="en"] [data-lang-ko] { display: none; }
html[lang="en"] [data-lang-en] { display: revert; }

@media print {
  .lang-toggle, .navlinks { display: none !important; }
  body { font-size: 11pt; line-height: 1.4; color: #000; }
  .page { max-width: 100%; padding: 0; }
  .section { margin-top: 28px; }
  :root { --space-section: 28px; --space-block: 19px; --space-content: 14px; }
  .hero h1 { font-size: 24pt; }
  .hero-lede { font-size: 12pt; }
  .section-title { font-size: 15pt; }
  .stat-grid, .views { break-inside: avoid; }
  .section-rule, .section-title, h3 { break-after: avoid; }
  table, .stat, .view, .callout { break-inside: avoid; }
  .callout { background: #FFF !important; color: #000 !important; border: 1px solid #999; }
  .callout h3, .callout p, .callout li { color: #000 !important; }
  a { border-bottom: 0; }
}
"""

JS = """
(function () {
  var root = document.documentElement;
  var KEY = 'mas-briefing-lang';
  function apply(lang) {
    root.setAttribute('lang', lang);
    var btns = document.querySelectorAll('.lang-toggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-checked', btns[i].getAttribute('data-lang') === lang ? 'true' : 'false');
    }
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'ko' || saved === 'en') apply(saved);
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.lang-toggle button') : null;
    if (b) apply(b.getAttribute('data-lang'));
  });
})();
"""

FONT_LINKS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    'family=Noto+Sans+KR:wght@300;400;500;700&family=Inter:wght@400;500;600;700&display=swap">'
)

# ----------------------------------------------------------------------------
# UI 문구 (한/영)
# ----------------------------------------------------------------------------
T = {
    "brand":       ("Mirae Asset Securities", "Mirae Asset Securities"),
    "doc":         ("모닝 마켓 브리핑", "Morning Market Briefing"),
    "internal":    ("고객 브리핑용", "For client briefing"),
    "asof":        ("기준", "As of"),
    "keypoints":   ("한눈에 보는 핵심", "Key Takeaways"),
    "kr":          ("국내 증시", "Korean Equities"),
    "global":      ("글로벌 증시", "Global Equities"),
    "macro":       ("금리 · 환율 · 원자재", "Rates, FX & Commodities"),
    "flows":       ("수급", "Fund Flows"),
    "sectors":     ("업종 · 종목 흐름", "Sectors & Movers"),
    "views":       ("증권사 · 글로벌 하우스 시각", "House Views"),
    "calendar":    ("오늘의 일정 · 체크포인트", "Today's Calendar & Checkpoints"),
    "risks":       ("리스크 점검", "Risk Check"),
    "talking":     ("고객 응대 포인트", "Client Talking Points"),
    "sources":     ("출처", "Sources"),
    "chg":         ("전일대비", "Change"),
    "pct":         ("등락률", "% Change"),
    "index":       ("지수", "Index"),
    "close":       ("종가", "Close"),
    "note":        ("비고", "Note"),
    "investor":    ("투자자", "Investor"),
    "amount":      ("순매수(억원)", "Net buy (KRW bn)"),
    "sector":      ("업종 · 종목", "Sector / Name"),
    "move":        ("등락", "Move"),
    "comment":     ("코멘트", "Comment"),
    "time":        ("시각", "Time"),
    "event":       ("일정", "Event"),
    "impact":      ("체크 포인트", "What to watch"),
    "latest":      ("최신 브리핑", "Latest briefing"),
    "archive":     ("지난 브리핑", "Archive"),
    "archive_ttl": ("모닝 마켓 브리핑 아카이브", "Morning Market Briefing Archive"),
    "barcap":      ("주요 지수 등락률", "Index performance"),
    "disc": (
        "본 자료는 공개된 시장 정보와 언론 보도를 자동 수집·요약한 정보 제공 목적의 참고 자료입니다. "
        "특정 종목의 매매를 권유하거나 수익을 보장하지 않으며, 투자 판단과 그 결과에 대한 책임은 투자자 본인에게 있습니다. "
        "수치는 원출처 기준이며 정정·재집계로 변경될 수 있으므로, 고객 안내 전 원출처를 확인하십시오.",
        "This material is an automatically compiled summary of publicly available market information and news reports, "
        "provided for reference only. It is not a solicitation to trade any security and does not guarantee any return. "
        "Investment decisions and their outcomes are the responsibility of the investor. "
        "Figures follow the original sources and may be revised; please verify against the original source before briefing clients.",
    ),
    "auto": ("자동 생성 브리핑", "Auto-generated briefing"),
    "nodata": ("확인된 수치 없음", "No verified figure"),
}

TONE_LABEL = {
    "risk-off": ("위험회피", "Risk-off"),
    "risk-on": ("위험선호", "Risk-on"),
    "mixed": ("혼조", "Mixed"),
    "neutral": ("중립", "Neutral"),
}

MONTHS_EN = ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"]
DOW_KO = ["월", "화", "수", "목", "금", "토", "일"]
DOW_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


# ----------------------------------------------------------------------------
# 유틸
# ----------------------------------------------------------------------------
def esc(s):
    if s is None:
        return ""
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def rich(s):
    """**강조** 만 지원하는 최소 인라인 마크업."""
    out = esc(s)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    return out


def bi(node, key, wrap="span"):
    """key / key_en 쌍을 한/영 토글 마크업으로 만든다. EN 이 없으면 KO 하나만."""
    ko = node.get(key)
    en = node.get(key + "_en")
    if ko is None and en is None:
        return ""
    if en is None or en == ko:
        return rich(ko)
    return ('<%s data-lang-ko>%s</%s><%s data-lang-en>%s</%s>'
            % (wrap, rich(ko), wrap, wrap, rich(en), wrap))


def label(key):
    ko, en = T[key]
    return ('<span data-lang-ko>%s</span><span data-lang-en>%s</span>'
            % (esc(ko), esc(en)))


def dual(ko, en, wrap="span"):
    if en is None or en == ko:
        return rich(ko)
    return ('<%s data-lang-ko>%s</%s><%s data-lang-en>%s</%s>'
            % (wrap, rich(ko), wrap, wrap, rich(en), wrap))


def parse_date(d):
    y, m, day = (int(x) for x in d.split("-"))
    return y, m, day


def dow_index(y, m, d):
    """Zeller 기반 요일 (0=월)."""
    import datetime
    return datetime.date(y, m, d).weekday()


def date_ko(d):
    y, m, day = parse_date(d)
    return "%d년 %d월 %d일(%s)" % (y, m, day, DOW_KO[dow_index(y, m, day)])


def date_en(d):
    y, m, day = parse_date(d)
    return "%s %s %d, %d" % (DOW_EN[dow_index(y, m, day)], MONTHS_EN[m - 1], day, y)


def dircls(v):
    """등락 방향 클래스. v 는 숫자 또는 부호 있는 문자열."""
    if v is None or v == "":
        return "flat"
    try:
        f = float(str(v).replace(",", "").replace("%", "").replace("+", ""))
    except ValueError:
        s = str(v)
        if s.startswith("-") or "▼" in s:
            return "down"
        if s.startswith("+") or "▲" in s:
            return "up"
        return "flat"
    if f > 0:
        return "up"
    if f < 0:
        return "down"
    return "flat"


def signed(v, suffix=""):
    """숫자를 부호 포함 문자열로."""
    if v is None or v == "":
        return "&mdash;"
    if isinstance(v, str):
        return esc(v)
    s = "{:+,.2f}".format(v) if isinstance(v, float) else "{:+,}".format(v)
    return esc(s + suffix)


def plain(v):
    if v is None or v == "":
        return "&mdash;"
    if isinstance(v, float):
        return esc("{:,.2f}".format(v))
    if isinstance(v, int):
        return esc("{:,}".format(v))
    return esc(v)


# ----------------------------------------------------------------------------
# 블록 렌더러
# ----------------------------------------------------------------------------
def render_stat_grid(rows, hero=False):
    if not rows:
        return ""
    cells = []
    for r in rows:
        cls = dircls(r.get("change_pct", r.get("change")))
        chg_bits = []
        if r.get("change") not in (None, ""):
            chg_bits.append(signed(r.get("change")))
        if r.get("change_pct") not in (None, ""):
            chg_bits.append("(" + signed(r.get("change_pct"), "%") + ")")
        chg = " ".join(chg_bits) or "&mdash;"
        note = bi(r, "note") if r.get("note") else ""
        cells.append(
            '<div class="stat">'
            '<p class="stat-label">%s</p>'
            '<div class="stat-value">%s</div>'
            '<div class="stat-chg %s">%s</div>'
            '%s'
            '</div>' % (
                bi(r, "name"), plain(r.get("value")), cls, chg,
                ('<div class="stat-note">%s</div>' % note) if note else "",
            )
        )
    return '<div class="stat-grid%s">%s</div>' % (" hero-stat" if hero else "", "".join(cells))


def render_bars(rows):
    """등락률 수평 바. 상승=적색, 하락=청색 (국내 관행)."""
    vals = []
    for r in rows:
        p = r.get("change_pct")
        if isinstance(p, (int, float)):
            vals.append(abs(float(p)))
    if not vals:
        return ""
    scale = max(vals) or 1.0
    out = []
    for r in rows:
        p = r.get("change_pct")
        cls = dircls(p)
        if isinstance(p, (int, float)):
            w = abs(float(p)) / scale * 50.0
            if cls == "up":
                fill = '<span class="bar-fill up" style="width:%.2f%%"></span>' % w
            elif cls == "down":
                fill = ('<span class="bar-fill down" style="left:%.2f%%;width:%.2f%%"></span>'
                        % (50.0 - w, w))
            else:
                fill = ""
            val = signed(float(p), "%")
        else:
            fill, val = "", "&mdash;"
        out.append(
            '<div class="bar-row">'
            '<span class="bar-name">%s</span>'
            '<span class="bar-track"><span class="zero"></span>%s</span>'
            '<span class="bar-val %s">%s</span>'
            '</div>' % (bi(r, "name"), fill, cls, val)
        )
    return ('<div class="bars" role="img" aria-label="%s">%s</div>'
            % (esc(T["barcap"][0]), "".join(out)))


def render_index_table(rows, caption_ko=None, caption_en=None):
    if not rows:
        return ""
    body = []
    for r in rows:
        cls = dircls(r.get("change_pct", r.get("change")))
        body.append(
            '<tr><td>%s</td><td class="n">%s</td><td class="n %s">%s</td>'
            '<td class="n %s">%s</td><td>%s</td></tr>' % (
                bi(r, "name"), plain(r.get("value")),
                cls, signed(r.get("change")),
                cls, signed(r.get("change_pct"), "%"),
                bi(r, "note") if r.get("note") else "&mdash;",
            )
        )
    cap = ""
    if caption_ko:
        cap = "<caption>%s</caption>" % dual(caption_ko, caption_en)
    return (
        '<div class="table-wrap"><table class="data">%s<thead><tr>'
        '<th>%s</th><th class="n">%s</th><th class="n">%s</th>'
        '<th class="n">%s</th><th>%s</th>'
        '</tr></thead><tbody>%s</tbody></table></div>'
        % (cap, label("index"), label("close"), label("chg"), label("pct"),
           label("note"), "".join(body))
    )


def render_flow_table(rows):
    if not rows:
        return ""
    body = []
    for r in rows:
        cls = dircls(r.get("amount"))
        tr_cls = ' class="hl"' if r.get("highlight") else ""
        body.append(
            '<tr%s><td>%s</td><td class="n %s">%s</td><td>%s</td></tr>' % (
                tr_cls, bi(r, "name"), cls, signed(r.get("amount")),
                bi(r, "note") if r.get("note") else "&mdash;",
            )
        )
    return (
        '<div class="table-wrap"><table class="data"><thead><tr>'
        '<th>%s</th><th class="n">%s</th><th>%s</th>'
        '</tr></thead><tbody>%s</tbody></table></div>'
        % (label("investor"), label("amount"), label("note"), "".join(body))
    )


def render_mover_table(rows):
    if not rows:
        return ""
    body = []
    for r in rows:
        cls = dircls(r.get("change_pct"))
        body.append(
            '<tr><td>%s</td><td class="n">%s</td><td class="n %s">%s</td><td>%s</td></tr>' % (
                bi(r, "name"), plain(r.get("value")),
                cls, signed(r.get("change_pct"), "%"),
                bi(r, "comment") if r.get("comment") else "&mdash;",
            )
        )
    return (
        '<div class="table-wrap"><table class="data"><thead><tr>'
        '<th>%s</th><th class="n">%s</th><th class="n">%s</th><th>%s</th>'
        '</tr></thead><tbody>%s</tbody></table></div>'
        % (label("sector"), label("close"), label("move"), label("comment"), "".join(body))
    )


def render_calendar(rows):
    if not rows:
        return ""
    body = []
    for r in rows:
        body.append(
            '<tr><td class="n">%s</td><td>%s</td><td>%s</td></tr>' % (
                bi(r, "time") if r.get("time") else "&mdash;", bi(r, "event"),
                bi(r, "watch") if r.get("watch") else "&mdash;",
            )
        )
    return (
        '<div class="table-wrap"><table class="data"><thead><tr>'
        '<th class="n">%s</th><th>%s</th><th>%s</th>'
        '</tr></thead><tbody>%s</tbody></table></div>'
        % (label("time"), label("event"), label("impact"), "".join(body))
    )


def render_views(rows):
    if not rows:
        return ""
    cards = []
    for r in rows:
        stance = (r.get("stance") or "neutral").lower()
        stance = stance if stance in ("bull", "bear", "neutral") else "neutral"
        who = r.get("analyst") or ""
        cards.append(
            '<div class="view">'
            '<p class="view-firm">%s</p>'
            '%s'
            '<p class="view-body">%s</p>'
            '%s'
            '</div>' % (
                bi(r, "firm"),
                ('<p class="view-who">%s</p>' % bi(r, "analyst")) if who else "",
                bi(r, "view"),
                ('<span class="view-stance %s">%s</span>' % (stance, bi(r, "stance_label")))
                if r.get("stance_label") else "",
            )
        )
    return '<div class="views">%s</div>' % "".join(cards)


def render_sources(rows):
    if not rows:
        return ""
    items = []
    for r in rows:
        title = esc(r.get("title") or r.get("url"))
        url = esc(r.get("url") or "")
        pub = r.get("publisher")
        items.append(
            '<li>%s%s</li>' % (
                ('<a href="%s" target="_blank" rel="noopener">%s</a>' % (url, title))
                if url else title,
                (' <span class="pub">&middot; %s</span>' % esc(pub)) if pub else "",
            )
        )
    return '<ul class="sources">%s</ul>' % "".join(items)


def section(anchor, title_key, inner, custom_title=None):
    if not inner:
        return ""
    ttl = custom_title if custom_title else label(title_key)
    return (
        '<section class="section" id="%s">'
        '<div class="section-rule"></div>'
        '<h2 class="section-title">%s</h2>'
        '%s</section>' % (esc(anchor), ttl, inner)
    )


def paras(node, key):
    """문단 목록(list) 또는 단일 문자열을 <p> 로."""
    ko = node.get(key)
    en = node.get(key + "_en")
    if not ko:
        return ""
    ko_list = ko if isinstance(ko, list) else [ko]
    en_list = en if isinstance(en, list) else ([en] if en else [])
    out = []
    for i, p in enumerate(ko_list):
        e = en_list[i] if i < len(en_list) else None
        if e:
            out.append('<p data-lang-ko>%s</p><p data-lang-en>%s</p>' % (rich(p), rich(e)))
        else:
            out.append('<p>%s</p>' % rich(p))
    return "".join(out)


# ----------------------------------------------------------------------------
# 페이지 렌더
# ----------------------------------------------------------------------------
def page_shell(title_ko, title_en, body, start_lang="ko"):
    return (
        '<!DOCTYPE html>\n<html lang="%s">\n<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title>%s</title>\n'
        '<meta name="description" content="%s">\n'
        '%s\n<style>%s</style>\n</head>\n<body>\n%s\n<script>%s</script>\n</body>\n</html>\n'
        % (start_lang, esc(title_ko), esc(title_en or title_ko), FONT_LINKS, CSS, body, JS)
    )


def topbar():
    return (
        '<div class="topbar">'
        '<span class="tag">%s</span>'
        '<div class="lang-toggle" role="radiogroup" aria-label="Language">'
        '<button type="button" data-lang="ko" role="radio" aria-checked="true">KO</button>'
        '<button type="button" data-lang="en" role="radio" aria-checked="false">EN</button>'
        '</div></div>' % label("internal")
    )


def render_briefing(d, prev_date=None, next_date=None):
    date = d["date"]
    tone = (d.get("tone") or "neutral").lower()
    tone = tone if tone in TONE_LABEL else "neutral"

    # --- Hero ---
    kicker = '%s &middot; %s' % (
        dual(date_ko(date), date_en(date)), label("doc"))
    hero = (
        '<div class="hero">'
        '<p class="hero-kicker">%s</p>'
        '<h1>%s</h1>'
        '<p class="hero-lede">%s</p>'
        '<p class="hero-meta"><span class="tone %s">%s</span> &nbsp; %s %s</p>'
        '</div>' % (
            kicker, bi(d, "headline"), bi(d, "lede"), tone,
            dual(TONE_LABEL[tone][0], TONE_LABEL[tone][1]),
            label("asof"), esc(d.get("asof") or ""),
        )
    )

    parts = [topbar(), hero]

    # --- 핵심 요약 ---
    kp = d.get("keypoints") or []
    if kp:
        lis = []
        for item in kp:
            if isinstance(item, dict):
                lis.append("<li>%s</li>" % bi(item, "text", wrap="div"))
            else:
                lis.append("<li>%s</li>" % rich(item))
        parts.append(section("keypoints", "keypoints",
                             '<ul class="keypoints">%s</ul>' % "".join(lis)))

    m = d.get("markets") or {}

    # --- 국내 증시 ---
    kr_inner = "".join([
        render_stat_grid(m.get("kr") or [], hero=True),
        paras(d, "kr_comment"),
    ])
    parts.append(section("kr", "kr", kr_inner))

    # --- 수급 ---
    flows = d.get("flows") or {}
    flow_inner = "".join([
        render_flow_table(flows.get("rows") or []),
        paras(flows, "comment"),
    ])
    parts.append(section("flows", "flows", flow_inner))

    # --- 업종 / 종목 ---
    sect_inner = "".join([
        render_mover_table(d.get("movers") or []),
        paras(d, "sector_comment"),
    ])
    parts.append(section("sectors", "sectors", sect_inner))

    # --- 글로벌 증시 ---
    g = m.get("global") or []
    global_inner = "".join([
        render_bars(g),
        render_index_table(g),
        paras(d, "global_comment"),
    ])
    parts.append(section("global", "global", global_inner))

    # --- 금리 / 환율 / 원자재 ---
    macro_inner = "".join([
        render_index_table(m.get("macro") or []),
        paras(d, "macro_comment"),
    ])
    parts.append(section("macro", "macro", macro_inner))

    # --- 하우스 뷰 ---
    parts.append(section("views", "views", render_views(d.get("views") or [])))

    # --- 일정 ---
    parts.append(section("calendar", "calendar", render_calendar(d.get("calendar") or [])))

    # --- 리스크 ---
    risks = d.get("risks") or []
    if risks:
        lis = []
        for r in risks:
            lis.append("<li>%s</li>" % (bi(r, "text", wrap="div")
                                        if isinstance(r, dict) else rich(r)))
        parts.append(section("risks", "risks", '<ul class="risks">%s</ul>' % "".join(lis)))

    # --- 고객 응대 포인트 ---
    tp = d.get("talking_points") or []
    if tp:
        dl = []
        for item in tp:
            dl.append("<dt>%s</dt><dd>%s</dd>" % (bi(item, "q", wrap="div"),
                                                  bi(item, "a", wrap="div")))
        parts.append(section("talking", "talking", '<dl class="qa">%s</dl>' % "".join(dl)))

    # --- 출처 ---
    parts.append(section("sources", "sources", render_sources(d.get("sources") or [])))

    # --- 푸터 ---
    nav = ['<a href="index.html">%s</a>' % label("latest"),
           '<a href="archive.html">%s</a>' % label("archive")]
    if prev_date:
        nav.append('<a href="%s.html">&larr; %s</a>' % (esc(prev_date), esc(prev_date)))
    if next_date:
        nav.append('<a href="%s.html">%s &rarr;</a>' % (esc(next_date), esc(next_date)))
    parts.append(
        '<footer class="foot">'
        '<p>%s</p>'
        '<p>%s &middot; %s</p>'
        '<div class="navlinks">%s</div>'
        '</footer>' % (
            dual(T["disc"][0], T["disc"][1], wrap="span"),
            label("auto"), esc(d.get("asof") or date),
            " ".join(nav),
        )
    )

    title_ko = "%s %s | %s" % (date, T["doc"][0], T["brand"][0])
    title_en = "%s %s | %s" % (date, T["doc"][1], T["brand"][1])
    return page_shell(title_ko, title_en, '<div class="page">%s</div>' % "".join(parts))


def render_archive(entries):
    lis = []
    for d in entries:
        lis.append(
            '<li><a href="%s.html"><span class="d">%s</span>'
            '<span class="t">%s</span></a></li>'
            % (esc(d["date"]), esc(d["date"]), bi(d, "headline"))
        )
    body = (
        '<div class="page">%s'
        '<div class="hero"><p class="hero-kicker">%s</p><h1>%s</h1>'
        '<p class="hero-lede">%s</p></div>'
        '<section class="section"><div class="section-rule"></div>'
        '<h2 class="section-title">%s</h2><ul class="arch">%s</ul></section>'
        '<footer class="foot"><p>%s</p><div class="navlinks">'
        '<a href="index.html">%s</a></div></footer>'
        '</div>' % (
            topbar(), label("doc"), label("archive_ttl"),
            dual("일자별 아침 증시시황 브리핑입니다. 최신 브리핑은 index.html 에서 확인하십시오.",
                 "Daily morning market briefings. The most recent briefing is at index.html."),
            label("archive"), "".join(lis),
            dual(T["disc"][0], T["disc"][1], wrap="span"),
            label("latest"),
        )
    )
    return page_shell("%s | %s" % (T["archive_ttl"][0], T["brand"][0]),
                      "%s | %s" % (T["archive_ttl"][1], T["brand"][1]), body)


# ----------------------------------------------------------------------------
# 실행
# ----------------------------------------------------------------------------
SCHEMA_DOC = """\
briefing/data/YYYY-MM-DD.json 스키마
------------------------------------
_en 접미사 필드는 모두 선택. 있으면 EN 토글에 쓰이고, 없으면 KO 를 그대로 노출.
숫자는 문자열이 아닌 number 로 넣는다 (부호/콤마는 렌더러가 붙인다).
확인되지 않은 수치는 필드를 비우거나 생략한다. 절대 추정치를 채우지 않는다.

{
  "date": "2026-08-04",
  "asof": "2026-08-04 07:40 KST",
  "tone": "risk-off | risk-on | mixed | neutral",
  "headline": "...", "headline_en": "...",
  "lede": "...", "lede_en": "...",
  "keypoints": [ {"text": "...", "text_en": "..."} ],
  "markets": {
    "kr":     [ {"name","name_en","value","change","change_pct","note","note_en"} ],
    "global": [ {"name","name_en","value","change","change_pct","note","note_en"} ],
    "macro":  [ {"name","name_en","value","change","change_pct","note","note_en"} ]
  },
  "kr_comment":     ["문단", ...],  "kr_comment_en":     [...],
  "global_comment": [...],          "global_comment_en": [...],
  "macro_comment":  [...],          "macro_comment_en":  [...],
  "sector_comment": [...],          "sector_comment_en": [...],
  "flows": {
    "rows": [ {"name","name_en","amount": -28427, "note","note_en","highlight": false} ],
    "comment": [...], "comment_en": [...]
  },
  "movers":   [ {"name","name_en","value","change_pct","comment","comment_en"} ],
  "views":    [ {"firm","firm_en","analyst","analyst_en","view","view_en",
                 "stance": "bull|bear|neutral", "stance_label","stance_label_en"} ],
  "calendar": [ {"time","event","event_en","watch","watch_en"} ],
  "risks":    [ {"text","text_en"} ],
  "talking_points": [ {"q","q_en","a","a_en"} ],
  "sources":  [ {"title","url","publisher"} ]
}
"""


def load_all():
    if not os.path.isdir(DATA_DIR):
        return []
    out = []
    for fn in sorted(os.listdir(DATA_DIR)):
        if not fn.endswith(".json"):
            continue
        with open(os.path.join(DATA_DIR, fn), encoding="utf-8") as f:
            d = json.load(f)
        d.setdefault("date", fn[:-5])
        out.append(d)
    out.sort(key=lambda x: x["date"])
    return out


def write(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print("wrote %s (%d bytes)" % (os.path.relpath(path, ROOT), len(text.encode("utf-8"))))


def build(targets=None):
    entries = load_all()
    if not entries:
        sys.exit("no data files in %s" % os.path.relpath(DATA_DIR, ROOT))
    os.makedirs(OUT_DIR, exist_ok=True)
    dates = [e["date"] for e in entries]
    for i, e in enumerate(entries):
        if targets and e["date"] not in targets:
            continue
        prev_d = dates[i - 1] if i > 0 else None
        next_d = dates[i + 1] if i < len(dates) - 1 else None
        write(os.path.join(OUT_DIR, e["date"] + ".html"),
              render_briefing(e, prev_d, next_d))
    latest = entries[-1]
    write(os.path.join(OUT_DIR, "index.html"),
          render_briefing(latest, dates[-2] if len(dates) > 1 else None, None))
    write(os.path.join(OUT_DIR, "archive.html"),
          render_archive(list(reversed(entries))))


def main(argv):
    if "--schema" in argv:
        print(SCHEMA_DOC)
        return
    if "--all" in argv or not argv:
        build()
        return
    targets = set()
    for a in argv:
        if a.startswith("-"):
            continue
        base = os.path.basename(a)
        targets.add(base[:-5] if base.endswith(".json") else base)
    build(targets)


if __name__ == "__main__":
    main(sys.argv[1:])
