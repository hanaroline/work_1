# -*- coding: utf-8 -*-
"""보관된 브리핑을 그냥 열리는 HTML 문서로 만든다.

`docs/briefings/*.html` 는 아티팩트 **본문**이라 `<!doctype>` 도 `<head>` 도
없다. 발행할 때는 그게 맞지만 파일로 건네 받아 두 번 클릭해 여는 용도로는
껍데기가 필요하다. 이 스크립트가 그 껍데기를 씌운다.

    python3 scripts/make_standalone.py docs/briefings/2026-08-10-close.html
    python3 scripts/make_standalone.py 2026-08-10-close        # 이렇게도 된다

만들어진 파일은 혼자 완결돼 있다 — 스타일·스크립트가 전부 안에 들어 있어
인터넷 없이 열린다. 원본은 건드리지 않는다.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVE = os.path.join(ROOT, "docs", "briefings")

HEAD = '''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>%s</title>
<style>*,*::before,*::after{box-sizing:border-box}html{-webkit-text-size-adjust:100%%}body{margin:0;padding:0}img{max-width:100%%}</style>
</head>
<body>
'''

# 파일 이름은 사람이 받아 보는 것이라 한글로 짓는다.
LABEL = {"close": "장마감브리핑", "morning": "모닝브리핑", "global": "해외증시브리핑"}


def resolve(arg):
    for cand in (arg, os.path.join(ARCHIVE, arg), os.path.join(ARCHIVE, arg + ".html")):
        if os.path.isfile(cand):
            return cand
    sys.exit("찾지 못했다: %s\n%s 아래를 보십시오." % (arg, ARCHIVE))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = resolve(sys.argv[1])
    body = open(src, encoding="utf-8").read()

    # 본문 첫머리의 <title> 을 <head> 로 옮긴다. 두면 글자가 그대로 찍힌다.
    m = re.search(r"<title>(.*?)</title>\s*", body, re.S)
    if not m:
        sys.exit("%s 에 <title> 이 없다." % src)
    title = m.group(1)
    body = (body[:m.start()] + body[m.end():]).lstrip()

    base = os.path.basename(src)[:-len(".html")]          # 2026-08-10-close
    date, kind = base[:10].replace("-", ""), base[11:]
    # 베타 시안은 `<날짜>-<판>-beta.html` 이다. 꼬리의 `-beta` 를 떼어 판을
    # 알아보고, 받는 사람이 파일 이름만 보고도 알도록 (베타)를 붙인다 —
    # 이름이 `global-beta` 로 나가면 정식판과 섞인다.
    beta = kind.endswith("-beta")
    if beta:
        kind = kind[:-len("-beta")]
    name = "미래에셋_마포WM_%s%s_%s.html" % (
        LABEL.get(kind, kind), "(베타)" if beta else "", date)

    outdir = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(src)
    os.makedirs(outdir, exist_ok=True)
    out = os.path.join(outdir, name)

    with open(out, "w", encoding="utf-8") as f:
        f.write(HEAD % title + body + "\n</body>\n</html>\n")
    print("만듦: %s (%d자)" % (out, len(body)))
    print("제목: %s" % title)


if __name__ == "__main__":
    main()
