# -*- coding: utf-8 -*-
"""PDF 에 생기는 큰 빈칸을 없앤다 — 긴 블록이 쪽을 넘겨 이어지게 한다.

인쇄 규칙이 `table,.stat,.view,.callout,.soft-card{break-inside:avoid}` 였다.
짧은 블록에는 맞는 규칙이지만 **긴 블록에는 정반대로 작동한다.** 쪽에 남은
자리가 모자라면 블록을 통째로 다음 쪽으로 미루므로 앞 쪽이 그만큼 비어 버린다.
8월 15일 판에서 43쪽 중 24쪽에 12%가 넘는 빈 띠가 생겼고, 34쪽은 981px 짜리
휴장일 표 하나 때문에 **83%가 비었다.**

    python3 scripts/inline_notes.py docs/briefings/<파일>.html
    python3 scripts/fold_perf.py   docs/briefings/<파일>.html
    python3 scripts/print_fit.py   docs/briefings/<파일>.html   # 맨 마지막

그래서 길이에 따라 갈라 준다.

* **긴 표** — 쪽을 넘겨 잇되 **줄은 쪼개지 않고 머리행을 되풀이**한다.
  이것이 긴 표를 인쇄하는 정공법이다.
* **짧은 표**(본문 4줄 이하) — 종전대로 붙든다. 세 줄짜리를 두 쪽에 걸치면
  빈칸보다 나쁘다. 짧으므로 밀려도 빈칸이 크지 않다.
* **긴 카드**(글자 수로 잰다) — 쪽을 넘겨 잇는다. 짧은 카드는 붙든다.
* 문단은 `orphans`/`widows` 로 한 줄만 떨어져 남는 것을 막는다.

높이를 직접 재려면 브라우저가 있어야 한다. 줄 수와 글자 수로 대신 재는 이유는
이 스크립트가 루틴 안에서 브라우저 없이 돌아야 하기 때문이다. 실제 판에서
빈 띠 평균 21.2% → 5%대로 떨어지는 것을 확인하고 고른 기준이다.
"""
import re
import sys

TABLE = re.compile(r"(?is)<table\b([^>]*)>(.*?)</table\s*>")
TR = re.compile(r"(?is)<tr\b[^>]*>.*?</tr\s*>")
TBODY = re.compile(r"(?is)<tbody\b[^>]*>(.*?)</tbody\s*>")
GRID_OPEN = re.compile(r'(?is)<div\b[^>]*\bclass="[^"]*\b(stat-grid|views)\b[^"]*"[^>]*>')
CARD_OPEN = re.compile(r'(?is)<div\b[^>]*\bclass="[^"]*\b(soft-card|callout)\b[^"]*"[^>]*>')
DIV_ANY = re.compile(r"(?is)<div\b|</div\s*>")
CLASS = re.compile(r'(?i)\bclass\s*=\s*"([^"]*)"')

# 붙들지 이어붙일지는 **높이**로 가른다. 줄 수만 세면 틀린다 — 줄이 넷뿐인
# 표가 300px 인 경우가 있다(칸마다 두세 줄씩 들어간 표). 브라우저 없이 재야
# 하므로 줄 수와 글자 수로 높이를 어림한다. 실측과 견줘 맞춘 계수다.
KEEP_PX = 260       # 어림 높이가 이보다 낮은 표·카드만 통째로 붙든다


def est_px(rows, chars):
    return 70 + rows * 18 + chars * 0.45

FIT_CSS = """
/* 인쇄: 긴 블록을 통째로 붙들면 앞 쪽에 큰 빈칸이 남는다. 쪽을 넘겨 잇되
   줄은 쪼개지 않고 머리행을 되풀이한다. 짧은 것만 종전대로 붙든다. */
@media print{
  table.data{break-inside:auto!important}
  table.data thead{display:table-header-group}
  table.data tr{break-inside:avoid;break-after:auto}
  table.data caption{break-after:avoid}
  table.data.keep{break-inside:avoid!important}
  .soft-card,.callout,.exp{break-inside:auto!important}
  .soft-card.keep,.callout.keep{break-inside:avoid!important}
  .stat,.view{break-inside:avoid}
  p,li,dd{orphans:3;widows:3}
  /* 제목만 남고 내용이 다음 쪽으로 넘어가는 것을 막는다. 절 번호도 포함한다
     — 빼면 「01」 한 글자만 앞 쪽에 남는다. 실제로 그렇게 나왔다. */
  h3,h4,.section-title,.section-rule,.sec-num{break-after:avoid}
  /* 그리드는 쪽을 넘기면 **빈 칸 자리를 남긴다** — 크로미움이 다음 쪽으로 간
     칸의 자리를 앞 쪽에 그대로 잡아 둔다. 표와 달리 쪼개면 더 나빠진다.
     대신 인쇄에서 열을 늘려 낮게 만들어 통째로 들어가게 한다. */
  .stat-grid,.views{break-inside:avoid!important}
  .stat-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
  /* 글이 긴 카드(하우스 시각·지역별 요약)는 인쇄에서 열로 세우면 칸이 좁아
     세로로 길어지고, 한 줄이 통째로 다음 쪽에 밀린다. 종이에서는 한 칸씩
     가로로 눕히는 편이 짧고 잘 흐른다. */
  .views{display:block!important}
  .views > *{margin-bottom:9px;break-inside:avoid}
  .views > *:last-child{margin-bottom:0}
  /* 숫자 카드는 짧으므로 격자를 유지한다. 한 줄에 들어가면 쪽을 넘겨도 안전하다. */
  .stat-grid.flow{break-inside:auto!important}
  /* 꼬리말 세 줄만 마지막 쪽에 남는 것을 막는다 */
  footer.foot{break-before:avoid;break-inside:avoid}
  /* 여백을 조금씩 줄인다 — 쪽 머리에 남는 여백은 그대로 빈칸이고, 첫 쪽에서는
     52px 이 모자라 첫 절의 지표 카드가 통째로 2쪽으로 밀려나 있었다. */
  .section{margin-top:16px}
  .section-title{margin-bottom:10px}
  .hero{margin-top:6px;padding-bottom:8px}
  .hero h1{margin-bottom:10px}
}
"""


def body_rows(inner):
    m = TBODY.search(inner)
    return len(TR.findall(m.group(1))) if m else max(0, len(TR.findall(inner)) - 1)


def add_class(attrs, name):
    if CLASS.search(attrs):
        return CLASS.sub(lambda m: 'class="%s %s"' % (m.group(1), name), attrs, count=1)
    return attrs + ' class="%s"' % name


def slice_div(html, start_end):
    """여는 `<div>` 뒤부터 짝이 되는 `</div>` 위치를 깊이로 찾는다."""
    depth = 1
    for t in DIV_ANY.finditer(html, start_end):
        depth += 1 if t.group(0).lower().startswith("<div") else -1
        if depth == 0:
            return t.start()
    return len(html)


PRINT_COLS = 4          # 인쇄에서 두 그리드 모두 최대 네 열이다


def mark_grids(html):
    out, pos = [], 0
    for m in GRID_OPEN.finditer(html):
        if m.start() < pos:
            continue
        j = slice_div(html, m.end())
        inner = html[m.end():j]
        n = len(re.findall(r'(?is)<div\b[^>]*\bclass="[^"]*\b(?:stat|view)\b', inner))
        out.append(html[pos:m.start()])
        if 0 < n <= PRINT_COLS:
            out.append(CLASS.sub(lambda c: 'class="%s flow"' % c.group(1),
                                 m.group(0), count=1))
        else:
            out.append(m.group(0))
        out.append(inner)
        pos = j
    out.append(html[pos:])
    return "".join(out)


def transform(html):
    kept_t = [0]
    long_t = [0]

    def do_table(m):
        attrs, inner = m.group(1), m.group(2)
        cm = CLASS.search(attrs)
        if not cm or "data" not in cm.group(1).split():
            return m.group(0)
        n = body_rows(inner)
        text = re.sub(r"\s+", " ", re.sub(r"<[^>]*>", " ", inner)).strip()
        if est_px(n, len(text)) <= KEEP_PX:
            kept_t[0] += 1
            return "<table" + add_class(attrs, "keep") + ">" + inner + "</table>"
        long_t[0] += 1
        return m.group(0)

    html = TABLE.sub(do_table, html)

    # 그리드 — 칸이 한 줄에 들어가면 쪽을 넘겨도 빈 자리가 안 생긴다.
    # 인쇄에서 stat-grid 는 4열, views 는 최소 145px 이라 폭 700px 에서 4열이다.
    html = mark_grids(html)

    # 카드는 안에 또 `<div>` 가 들어 있어 비탐욕 `</div>` 로는 잘린다.
    # 여는 태그부터 깊이를 세어 짝을 찾는다.
    kept_c = long_c = 0
    out, pos = [], 0
    for m in CARD_OPEN.finditer(html):
        if m.start() < pos:
            continue
        depth, j = 1, m.end()
        for t in DIV_ANY.finditer(html, m.end()):
            depth += 1 if t.group(0).lower().startswith("<div") else -1
            if depth == 0:
                j = t.start()
                break
        text = re.sub(r"\s+", " ", re.sub(r"<[^>]*>", " ", html[m.end():j])).strip()
        out.append(html[pos:m.start()])
        if est_px(0, len(text)) <= KEEP_PX:
            kept_c += 1
            open_tag = CLASS.sub(lambda c: 'class="%s keep"' % c.group(1),
                                 m.group(0), count=1)
            out.append(open_tag)
        else:
            long_c += 1
            out.append(m.group(0))
        out.append(html[m.end():j])
        pos = j
    out.append(html[pos:])
    html = "".join(out)

    if "table.data.keep{break-inside:avoid" not in html:
        html = html.replace("\n</style>", FIT_CSS + "\n</style>", 1)
    return html, kept_t[0], long_t[0], kept_c, long_c


def main(argv):
    if not argv:
        print(__doc__)
        return 1
    for path in argv:
        with open(path, encoding="utf-8") as f:
            src = f.read()
        if "table.data.keep{break-inside:avoid" in src:
            print("%s — 이미 손봤다. 건너뛴다" % path)
            continue
        new, kt, lt, kc, lc = transform(src)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new)
        print("%s — 표 붙듦 %d · 이어붙임 %d / 카드 붙듦 %d · 이어붙임 %d"
              % (path, kt, lt, kc, lc))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
