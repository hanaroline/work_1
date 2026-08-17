# -*- coding: utf-8 -*-
"""좁은 화면에서 사라지던 「기간 수익률」 열을 이름 밑의 한 줄로 되살린다.

기간 열 네 개는 860px 아래에서 `display:none` 으로 접혀 있었다. 폰으로 보면
기간 추이가 통째로 없어진다 — 설명 열에서 똑같은 일이 있었고, 그래서
`inline_notes.py` 를 만들었다. 같은 원칙을 기간 열에도 적용한다:
**열은 접히지만 줄은 접히지 않는다.**

    python3 scripts/inline_notes.py docs/briefings/<날짜>-<구분>.html
    python3 scripts/fold_perf.py   docs/briefings/<날짜>-<구분>.html

반드시 `inline_notes.py` **다음에** 돌린다. 설명 줄이 먼저 이름 칸에 들어가고
기간 줄이 그 밑에 붙어야 읽는 순서가 맞는다.

열을 옮기지 않고 **베껴 둔다.** 넓은 화면에서는 열이 보이고 줄이 숨고, 좁은
화면에서는 반대가 된다. 어느 쪽이든 화면에 한 벌만 나온다. 인쇄는 종이 폭이
~700px 이라 열 쪽이 살아 있으므로 줄을 숨긴다.
"""
import re
import sys

CELL = re.compile(r"(?is)<(td|th)\b([^>]*)>(.*?)</\1\s*>")
ROW = re.compile(r"(?is)<tr\b[^>]*>.*?</tr\s*>")
TABLE = re.compile(r"(?is)<table\b[^>]*>.*?</table\s*>")
CLASS = re.compile(r'(?i)\bclass\s*=\s*"([^"]*)"')

PERF_CSS = """
/* 기간 수익률은 860px 아래에서 열이 접힌다. 접힌 자리를 이름 밑의 줄이 받는다
   — 폰에서 기간 추이가 통째로 사라지면 안 된다. 열과 줄 중 한 벌만 보인다. */
table.data .perfline{display:none}
@media (max-width:860px){
  table.data .perfline{display:block;margin-top:4px;font-size:12px;font-weight:400;
    line-height:1.5;color:var(--muted);white-space:normal;word-break:keep-all;
    overflow-wrap:anywhere;max-width:330px}
  /* 이름과 값이 줄바꿈으로 갈라지면 「1개월」과 「-5.1%」가 다른 줄에 놓인다.
     한 쌍은 붙여 두고 쌍과 쌍 사이에서만 넘긴다. */
  table.data .perfline .p{white-space:nowrap}
  table.data .perfline .k{opacity:.72;margin-right:1px}
  table.data .perfline .up{color:var(--up)}
  table.data .perfline .down{color:var(--down)}
  table.data .perfline .na{opacity:.45}
  table.data .perfline i{font-style:normal;opacity:.35;padding:0 4px}
}
@media (max-width:520px){ table.data .perfline{font-size:11px;max-width:180px} }
@media (max-width:400px){ table.data .perfline{max-width:150px} }
@media (max-width:360px){ table.data .perfline{max-width:120px} }
/* 인쇄는 종이 폭이 ~700px 이지만 기간 열을 세워 두었다. 줄은 접는다. */
@media print{ table.data .perfline{display:none!important} }
"""


def is_perf(attrs):
    cm = CLASS.search(attrs or "")
    return bool(cm) and "perf" in cm.group(1).split()


def cells(row):
    return list(CELL.finditer(row))


def fix_table(tbl):
    rows = list(ROW.finditer(tbl))
    if not rows:
        return tbl, 0
    head = rows[0].group(0)
    hc = cells(head)
    idxs = [i for i, m in enumerate(hc) if is_perf(m.group(2) or "")]
    if not idxs or 0 in idxs:
        return tbl, 0
    labels = [hc[i].group(3).strip() for i in idxs]
    ncols = len(hc)

    out, pos, n = [], 0, 0
    for j, r in enumerate(rows):
        out.append(tbl[pos:r.start()])
        pos = r.end()
        row = r.group(0)
        if j == 0:
            out.append(row)
            continue
        cs = cells(row)
        if len(cs) != ncols:              # colspan·상세행은 건드리지 않는다
            out.append(row)
            continue
        bits = []
        for lab, i in zip(labels, idxs):
            v = cs[i].group(3).strip()
            if not v:
                continue
            bits.append('<span class="p"><span class="k">' + lab + "</span> " + v + "</span>")
        if not bits:
            out.append(row)
            continue
        strip = '<span class="perfline">' + "<i>&middot;</i>".join(bits) + "</span>"
        first = cs[0]
        out.append(row[:first.end() - len("</%s>" % first.group(1))]
                   + strip + row[first.end() - len("</%s>" % first.group(1)):])
        n += 1
    out.append(tbl[pos:])
    return "".join(out), n


def transform(html):
    out, pos, tables, moved = [], 0, 0, 0
    for m in TABLE.finditer(html):
        new, n = fix_table(m.group(0))
        out.append(html[pos:m.start()])
        out.append(new)
        pos = m.end()
        tables += n > 0
        moved += n
    out.append(html[pos:])
    html = "".join(out)
    if ".perfline{display:none}" not in html:
        html = html.replace("\n</style>", PERF_CSS + "\n</style>", 1)
    return html, tables, moved


def main(argv):
    if not argv:
        print(__doc__)
        return 1
    for path in argv:
        with open(path, encoding="utf-8") as f:
            src = f.read()
        if 'class="perfline"' in src:
            print("%s — 이미 접혀 있다. 건너뛴다" % path)
            continue
        new, tables, moved = transform(src)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new)
        print("%s — 표 %d개, 행 %d개에 기간 줄을 붙였다" % (path, tables, moved))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
