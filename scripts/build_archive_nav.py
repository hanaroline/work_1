# -*- coding: utf-8 -*-
"""사이드바 「브리핑 목록」을 index.json 에서 다시 만든다.

여태 이 목록은 판마다 손으로 적었다. 그래서 두 가지가 같이 썩었다.

1. **일부 날짜만 나왔다.** 어느 판이든 4~5줄에서 잘려 있었다. 8/19 판은
   14건 중 4건만 보였다.
2. **링크가 엉뚱한 날을 가리켰다.** 8/19 판의 「08-14」는 8/19 아티팩트
   주소를 달고 있었다 — 전날 판에서 목록을 그대로 베끼면서 그 사이에
   같은 주소를 새 판이 덮어썼기 때문이다.

이제 목록은 index.json 하나에서 나온다. **모든 판을 싣는다** — 자기 날짜
뒤에 나온 판까지 넣는다.

    한때는 자기 날짜까지만 실었다(「지난」 브리핑이니까). 그러면 목록이
    쓸모 있는 곳이 맨 앞 판 하나뿐이다. 8/19 판을 열면 8/19 까지밖에 안
    보였고, 거기서 오늘 판으로 갈 길이 없었다. 어느 판을 열어도 오늘로
    올 수 있어야 목록이다. 그래서 이름도 「지난 브리핑」이 아니라
    「브리핑 목록」이다.

자기 자신은 aria-current 로 표시하고, url 이 없는 항목은 링크 없이
「보관본 없음」으로 남긴다.

    python3 scripts/build_archive_nav.py           # 전체 다시 만들기
    python3 scripts/build_archive_nav.py --check   # 고칠 곳만 알려 주고 안 고침
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, "docs", "briefings")
INDEX = os.path.join(DIR, "index.json")

BLOCK = re.compile(r'<ul class="sidenav-dates">.*?</ul>', re.S)

# 사이드바 머리글도 같이 고친다 — 목록이 더는 「지난」 것만이 아니다.
LABEL = re.compile(r'<p class="sidenav-label">'
                   r'<span data-lang-ko>지난 브리핑</span>'
                   r'<span data-lang-en>Archive</span></p>')
LABEL_NEW = ('<p class="sidenav-label"><span data-lang-ko>브리핑 목록</span>'
             '<span data-lang-en>All editions</span></p>')

# 인쇄본에도 같은 목록을 싣는다. 사이드바는 @media print 에서 숨으므로
# PDF 에는 지난 판으로 가는 길이 하나도 남지 않았다. 아래 블록은 화면에서는
# 숨고 인쇄에서만 나오며, 주소는 PDF 안에서 눌리는 링크로 남는다.
PRINT = re.compile(r'<!-- archive-print:start -->.*?<!-- archive-print:end -->', re.S)

PRINT_CSS = """<style>
.archive-print{display:none}
@media print{
  .archive-print{display:block;margin-top:22px;padding-top:12px;
    border-top:1px solid #CDCECB;break-inside:auto}
  .archive-print .h{font-size:10.5pt;font-weight:700;color:#043B72;margin:0 0 3px}
  .archive-print .s{font-size:9pt;color:#555;margin:0 0 9px}
  .archive-print ul{list-style:none;margin:0;padding:0;columns:2;column-gap:24px}
  .archive-print li{font-size:9.5pt;line-height:1.55;break-inside:avoid;
    color:#1A1A1A;padding:0}
  .archive-print .d{font-family:var(--font-num);font-size:9pt;color:#555;
    margin-right:7px;letter-spacing:.2px}
  .archive-print a{color:#043B72;text-decoration:none}
  .archive-print .me{color:#777}
}
</style>
"""

# 같은 날 두 판이 있을 때의 순서. 모닝·해외 판이 먼저, 장마감이 뒤.
SESSION_ORDER = {"morning": 0, "global": 0, "global-morning": 0, "close": 1}


def key(b):
    return (b["date"], SESSION_ORDER.get(b["session"], 0))


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def row(b, current):
    d = esc(b["date"][5:].replace("-", "-"))          # 2026-08-14 → 08-14
    ko, en = esc(b["label_ko"]), esc(b["label_en"])
    if current:
        return ('    <li><a href="#" aria-current="page"><span class="d">%s</span>'
                '<span data-lang-ko>%s</span><span data-lang-en>%s</span></a></li>' % (d, ko, en))
    if b.get("url"):
        return ('    <li><a href="%s" target="_blank" rel="noopener"><span class="d">%s</span>'
                '<span data-lang-ko>%s</span><span data-lang-en>%s</span></a></li>'
                % (esc(b["url"]), d, ko, en))
    return ('    <li class="na"><span class="d">%s</span>'
            '<span data-lang-ko>%s &mdash; 보관본 없음</span>'
            '<span data-lang-en>%s &mdash; no hosted copy</span></li>' % (d, ko, en))


def print_row(b, current):
    d = esc(b["date"][5:])
    ko, en = esc(b["label_ko"]), esc(b["label_en"])
    if current:
        return ('    <li><span class="d">%s</span><span data-lang-ko>%s</span>'
                '<span data-lang-en>%s</span> <span class="me">'
                '<span data-lang-ko>&mdash; 이 판</span>'
                '<span data-lang-en>&mdash; this edition</span></span></li>' % (d, ko, en))
    if b.get("url"):
        return ('    <li><span class="d">%s</span><a href="%s">'
                '<span data-lang-ko>%s</span><span data-lang-en>%s</span></a></li>'
                % (d, esc(b["url"]), ko, en))
    return ('    <li><span class="d">%s</span><span class="me">'
            '<span data-lang-ko>%s &mdash; 보관본 없음</span>'
            '<span data-lang-en>%s &mdash; no hosted copy</span></span></li>' % (d, ko, en))


def print_block(visible, me):
    rows = "\n".join(print_row(b, b is me) for b in visible)
    return ('<!-- archive-print:start -->\n'
            '%s'
            '<div class="archive-print">\n'
            '  <p class="h"><span data-lang-ko>브리핑 목록</span>'
            '<span data-lang-en>All editions</span></p>\n'
            '  <p class="s"><span data-lang-ko>날짜를 누르면 그 판이 열립니다. '
            '화면 왼쪽 목차 아래에도 같은 목록이 있습니다.</span>'
            '<span data-lang-en>Each date links to that edition; the same list sits '
            'below the contents in the left-hand column on screen.</span></p>\n'
            '  <ul>\n%s\n  </ul>\n'
            '</div>\n'
            '<!-- archive-print:end -->' % (PRINT_CSS, rows))


def beta(path, briefings):
    """베타 판에 목록을 넣는다 — `index.json` 에 올리지 않은 채로.

    베타는 정식 목록을 더럽히지 않으려고 index.json 에 넣지 않는다. 그런데
    그러면 사이드바와 인쇄용 목록이 통째로 비어 재검증이 FAIL 을 낸다.
    시안이라고 목록 없이 내면 정식판과 견줄 수가 없다 — 그래서 목록만
    만들어 넣는다. 자기 자신은 목록에 없다(아직 발행된 판이 아니다).
    """
    m = re.search(r"(\d{4}-\d{2}-\d{2})", os.path.basename(path))
    if not m:
        print("  !! 파일 이름에서 날짜를 못 읽었다: %s" % path)
        return 1
    mine = m.group(1)
    ordered = sorted(briefings, key=key, reverse=True)
    visible = list(ordered)
    src = open(path, encoding="utf-8").read()
    if len(BLOCK.findall(src)) != 1:
        print("  !! sidenav-dates 블록이 %d 개" % len(BLOCK.findall(src)))
        return 1
    # 같은 날 판이 이미 목록에 있으면 **그것**을 「이 판」으로 표시한다. 예전에는
    # 무조건 「베타 시안」 줄을 하나 새로 얹어서, 새 형식으로 다시 지은 8/27 판이
    # 목록에 08-27 을 두 줄 — 「베타 시안」과 「모닝」 — 로 실었다.
    same = [b for b in visible if b.get("date") == mine]
    if same:
        me = same[0]
    else:
        me = {"date": mine, "label_ko": "미발행 시안", "label_en": "Unpublished draft",
              "file": os.path.basename(path)}
        visible = [me] + visible
    rows = [row(b, b is me) for b in visible]
    out = BLOCK.sub(lambda _: '<ul class="sidenav-dates">\n%s\n  </ul>' % "\n".join(rows),
                    src, count=1)
    out = LABEL.sub(LABEL_NEW, out, count=1)
    pb = print_block(visible, me)
    if PRINT.search(out):
        out = PRINT.sub(lambda _: pb, out, count=1)
    elif out.count("</main>") == 1:
        out = out.replace("</main>", pb + "\n\n</main>", 1)
    else:
        print("  !! </main> 이 %d 개" % out.count("</main>"))
        return 1
    open(path, "w", encoding="utf-8").write(out)
    print("  %s  → 베타 목록 %d 항목 (index.json 은 건드리지 않았다)"
          % (os.path.basename(path), len(visible)))
    return 0


def main():
    check = "--check" in sys.argv
    briefings = json.load(open(INDEX, encoding="utf-8"))["briefings"]

    # `--beta <경로>` — index.json 에 올리지 않은 시안에 목록만 넣는다
    if "--beta" in sys.argv:
        i = sys.argv.index("--beta")
        if i + 1 >= len(sys.argv):
            print("  !! --beta 뒤에 파일 경로가 필요하다")
            return 1
        return beta(sys.argv[i + 1], briefings)

    ordered = sorted(briefings, key=key, reverse=True)   # 최신이 위

    changed, skipped, bad = [], [], 0
    for me in ordered:
        fn = me.get("file")
        if not fn:
            continue
        path = os.path.join(DIR, fn)
        if not os.path.exists(path):
            print("  !! 파일 없음: %s" % fn)
            bad += 1
            continue

        # **자르지 않는다.** 어느 판을 열어도 최신 판으로 갈 수 있어야 한다.
        visible = ordered

        rows = [row(b, b is me) for b in visible]
        new = '<ul class="sidenav-dates">\n%s\n  </ul>' % "\n".join(rows)

        src = open(path, encoding="utf-8").read()
        n = len(BLOCK.findall(src))
        if n != 1:
            print("  !! %s: sidenav-dates 블록이 %d 개" % (fn, n))
            bad += 1
            continue
        out = BLOCK.sub(lambda _: new, src, count=1)
        out = LABEL.sub(LABEL_NEW, out, count=1)

        # 인쇄용 블록 — 있으면 갈아 끼우고, 없으면 </main> 바로 앞에 넣는다.
        pb = print_block(visible, me)
        if PRINT.search(out):
            out = PRINT.sub(lambda _: pb, out, count=1)
        elif out.count("</main>") == 1:
            out = out.replace("</main>", pb + "\n\n</main>", 1)
        else:
            print("  !! %s: </main> 이 %d 개 — 인쇄용 목록을 못 넣었다"
                  % (fn, out.count("</main>")))
            bad += 1

        if out == src:
            continue
        changed.append((fn, len(visible)))
        if not check:
            open(path, "w", encoding="utf-8").write(out)

    for fn, n in changed:
        print("  %s  %s%d 항목" % (fn, "고칠 것 → " if check else "→ ", n))
    for fn in skipped:
        print("  %s  건너뜀 (그 앞의 판이 없다)" % fn)
    print("%s %d 개 파일" % ("고칠 곳:" if check else "고침:", len(changed)))

    # `--check --strict` 는 **고칠 곳이 남아 있는 것도** 실패로 본다.
    # 종전에는 「고칠 곳: 3 개 파일」을 찍고도 끝 상태가 0 이어서, 목록이
    # 어긋난 채로 발행되는 것을 아무것도 막지 못했다.
    if check and "--strict" in sys.argv and changed:
        print("!! 막습니다 — 목록을 다시 만들어야 합니다"
              " (python3 scripts/build_archive_nav.py)")
        return 1
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
