# -*- coding: utf-8 -*-
"""표의 「설명」 열을 이름 칸 **안으로** 접어 넣는다.

설명을 별도의 열로 두면 좁은 화면과 인쇄에서 통째로 사라진다. 실제로 그랬다 —
기간 수익률 네 열을 세우면서 설명 열을 1620px 아래에서 접었더니, 노트북과 PDF
양쪽에서 「이 지수가 무엇인지」가 지워졌다. 열은 접히지만 줄은 접히지 않는다.
그래서 설명을 이름 밑에 붙는 작은 줄로 바꾼다.

    python3 scripts/inline_notes.py docs/briefings/2026-08-15-global.html

표 하나하나를 고치지 않고 만들어진 HTML 을 한 번에 훑는다. 머리행에서
class 에 `note` 가 든 칸의 자리를 찾아, 모든 행에서 그 자리의 칸을 빼
첫 칸 안에 `<span class="sub">` 로 옮긴다. 칸 수가 머리행과 다른 행
(colspan·상세행)은 건드리지 않는다.
"""
import re
import sys

CELL = re.compile(r"(?is)<(td|th)\b([^>]*)>(.*?)</\1\s*>")
ROW = re.compile(r"(?is)<tr\b[^>]*>.*?</tr\s*>")
TABLE = re.compile(r"(?is)<table\b[^>]*>.*?</table\s*>")
CLASS = re.compile(r'(?i)\bclass\s*=\s*"([^"]*)"')

SUB_CSS = """
/* 설명은 「접히는 열」이 아니라 이름 아래 붙는 줄이다. 열로 두면 좁은 화면과
   인쇄에서 통째로 사라진다 — 8월 15일 판에서 실제로 그렇게 사라졌다. */
table.data .sub{display:block;margin-top:3px;font-size:13px;font-weight:400;
  line-height:1.45;color:var(--muted);white-space:normal;word-break:keep-all;
  overflow-wrap:anywhere;max-width:330px}
@media (min-width:521px){ table.data tbody th.hasnote{min-width:150px} }
@media (max-width:520px){ table.data .sub{font-size:12px;max-width:180px} }
@media print{ table.data .sub{display:block!important;font-size:7.5pt;max-width:none} }
"""


def cells(row):
    return list(CELL.finditer(row))


def note_columns(head_row):
    out = []
    for i, m in enumerate(cells(head_row)):
        cm = CLASS.search(m.group(2) or "")
        if cm and "note" in cm.group(1).split():
            out.append(i)
    return out


def strip_opt(attrs):
    """설명을 옮긴 뒤 이름 칸에는 `opt`(좁으면 접기)가 남으면 안 된다."""
    def sub(m):
        keep = [c for c in m.group(1).split() if c != "opt"]
        return 'class="' + " ".join(keep + ["hasnote"]) + '"'
    if CLASS.search(attrs):
        return CLASS.sub(sub, attrs, count=1)
    return attrs + ' class="hasnote"'


def fix_row(row, idxs, ncols):
    cs = cells(row)
    if len(cs) != ncols or not idxs or 0 in idxs:
        return row                      # 칸 수가 다르거나 이름 칸 자체가 설명이면 둔다
    notes = [cs[i].group(3).strip() for i in idxs]
    notes = [n for n in notes if n and n not in ("&mdash;", "—", "&nbsp;")]
    out, first = [], cs[0]
    head = row[:first.start()]
    body = ("<" + first.group(1) + strip_opt(first.group(2) or "") + ">"
            + first.group(3)
            + "".join('<span class="sub">' + n + "</span>" for n in notes)
            + "</" + first.group(1) + ">")
    out.append(head + body)
    for i, m in enumerate(cs[1:], 1):
        if i in idxs:
            continue
        out.append(row[cs[i - 1].end():m.start()] + m.group(0))
    out.append(row[cs[-1].end():])
    return "".join(out)


def fix_table(tbl):
    rows = list(ROW.finditer(tbl))
    if not rows:
        return tbl, 0
    head = rows[0].group(0)
    idxs = note_columns(head)
    if not idxs or 0 in idxs:
        return tbl, 0
    ncols = len(cells(head))
    # 머리행에서 설명 칸을 뺀다
    hc = cells(head)
    new_head = head[:hc[0].start()] + "".join(
        (head[hc[i - 1].end():m.start()] if i else "") + m.group(0)
        for i, m in enumerate(hc) if i not in idxs) + head[hc[-1].end():]

    out, pos, moved = [], 0, 0
    for j, r in enumerate(rows):
        out.append(tbl[pos:r.start()])
        if j == 0:
            out.append(new_head)
        else:
            fixed = fix_row(r.group(0), idxs, ncols)
            moved += fixed != r.group(0)
            out.append(fixed)
        pos = r.end()
    out.append(tbl[pos:])
    return "".join(out), moved


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

    # 이제 설명 열이 없으니 열을 접던 규칙은 뜻이 없다. 지우고 줄 서식을 넣는다.
    html = re.sub(r"(?m)^\s*@media \(max-width:1620px\)\{ table\.data \.note\{display:none\} \}\n",
                  "", html)
    html = re.sub(r"(?m)^\s*table\.data \.note\{display:none!important\}\n", "", html)
    if ".sub{display:block" not in html:
        html = html.replace("\n</style>", SUB_CSS + "\n</style>", 1)
    return html, tables, moved


def main(argv):
    if not argv:
        print(__doc__)
        return 1
    for path in argv:
        with open(path, encoding="utf-8") as f:
            src = f.read()
        new, tables, moved = transform(src)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new)
        print("%s — 표 %d개, 행 %d개에서 설명을 이름 밑으로 옮겼다"
              % (path, tables, moved))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
