#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
부서 자료실 — 목록 갱신 스크립트

'자료' 폴더 아래의 분류 폴더를 훑어서 파일 목록을 만들고,
'자료실.html' 안의 ARCHIVE 블록을 통째로 다시 씁니다.
표준 라이브러리만 사용하므로 별도 설치가 필요 없습니다.

사용법:
    python3 _목록갱신.py

분류 폴더 이름 규칙:
    NN_분류명   (예: 01_리서치)  → 앞의 숫자는 정렬 순서, 화면에는 '리서치'만 표시
    분류명       (숫자 없이도 동작. 이 경우 이름순으로 정렬)

분류 설명(선택):
    각 분류 폴더 안에 '_설명.txt' 파일을 두면 첫 줄이 분류 설명으로 표시됩니다.
"""

import json
import os
import sys
import re
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT_NAME = "자료"
ROOT_DIR = os.path.join(HERE, ROOT_NAME)
HTML_PATH = os.path.join(HERE, "자료실.html")

BEGIN = "/* ARCHIVE:BEGIN"
END = "/* ARCHIVE:END */"

DESC_FILE = "_설명.txt"

# 목록에서 제외할 파일
SKIP_EXACT = {".ds_store", "thumbs.db", "desktop.ini", DESC_FILE.lower()}
SKIP_PREFIX = ("~$", ".")          # Office 임시 잠금 파일, 숨김 파일
SKIP_SUFFIX = (".tmp", ".lnk")

CATEGORY_RE = re.compile(r"^(\d+)[_\-. ]\s*(.+)$")


def is_skippable(name):
    low = name.lower()
    if low in SKIP_EXACT:
        return True
    if name.startswith(SKIP_PREFIX):
        return True
    if low.endswith(SKIP_SUFFIX):
        return True
    return False


def split_category(dirname):
    """'01_리서치' -> ('01', '리서치'). 숫자 접두어가 없으면 ('', 원래이름)."""
    m = CATEGORY_RE.match(dirname)
    if m:
        return m.group(1), m.group(2).strip()
    return "", dirname


def read_desc(cat_dir):
    path = os.path.join(cat_dir, DESC_FILE)
    if not os.path.isfile(path):
        return ""
    try:
        with open(path, "r", encoding="utf-8-sig") as fh:
            return fh.readline().strip()
    except OSError:
        return ""


def url_path(*parts):
    """파일 링크용 상대 경로. 공백/한글이 있어도 브라우저가 열 수 있게 인코딩."""
    from urllib.parse import quote
    return "/".join(quote(p) for p in parts)


def collect_files(cat_dir, rel_prefix):
    """분류 폴더를 재귀적으로 훑어 파일 목록을 만든다."""
    out = []
    for dirpath, dirnames, filenames in os.walk(cat_dir):
        dirnames[:] = sorted(d for d in dirnames if not is_skippable(d))
        rel_dir = os.path.relpath(dirpath, cat_dir)
        sub = [] if rel_dir == "." else rel_dir.split(os.sep)

        for fname in sorted(filenames):
            if is_skippable(fname):
                continue
            full = os.path.join(dirpath, fname)
            try:
                st = os.stat(full)
            except OSError:
                continue

            base, ext = os.path.splitext(fname)
            out.append({
                "name": base if ext else fname,
                "ext": ext[1:].lower() if ext else "",
                "size": st.st_size,
                "mtime": datetime.fromtimestamp(st.st_mtime).strftime("%Y-%m-%d"),
                "path": url_path(*(rel_prefix + sub + [fname])),
            })
    return out


def build_archive():
    if not os.path.isdir(ROOT_DIR):
        sys.stderr.write("[오류] '%s' 폴더를 찾을 수 없습니다: %s\n" % (ROOT_NAME, ROOT_DIR))
        sys.exit(1)

    entries = []
    for dirname in os.listdir(ROOT_DIR):
        cat_dir = os.path.join(ROOT_DIR, dirname)
        if not os.path.isdir(cat_dir) or is_skippable(dirname):
            continue
        order, label = split_category(dirname)
        entries.append((order, label, dirname, cat_dir))

    # 숫자 접두어가 있으면 그 순서로, 없으면 이름순으로 뒤에 붙인다.
    entries.sort(key=lambda e: (e[0] == "", e[0], e[1]))

    categories = []
    for order, label, dirname, cat_dir in entries:
        files = collect_files(cat_dir, [ROOT_NAME, dirname])
        categories.append({
            "id": re.sub(r"[^0-9A-Za-z가-힣]+", "-", dirname).strip("-") or "cat",
            "name": label,
            "desc": read_desc(cat_dir),
            "files": files,
        })

    return {
        "generated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "root": ROOT_NAME,
        "categories": categories,
    }


def write_html(archive):
    with open(HTML_PATH, "r", encoding="utf-8") as fh:
        html = fh.read()

    start = html.find(BEGIN)
    end = html.find(END)
    if start == -1 or end == -1 or end < start:
        sys.stderr.write("[오류] 자료실.html 에서 ARCHIVE 표시 구간을 찾지 못했습니다.\n")
        sys.exit(1)

    payload = json.dumps(archive, ensure_ascii=False, indent=2)
    block = (
        "/* ARCHIVE:BEGIN — 이 블록은 목록 갱신 스크립트가 통째로 다시 씁니다. "
        "직접 수정하지 마세요. */\nwindow.ARCHIVE = " + payload + ";\n"
    )
    new_html = html[:start] + block + html[end:]

    with open(HTML_PATH, "w", encoding="utf-8") as fh:
        fh.write(new_html)


def main():
    archive = build_archive()
    write_html(archive)

    total = sum(len(c["files"]) for c in archive["categories"])
    print("목록을 갱신했습니다. (%s)" % archive["generated"])
    print("  분류 %d개 / 자료 %d건" % (len(archive["categories"]), total))
    for c in archive["categories"]:
        print("    - %s: %d건" % (c["name"], len(c["files"])))
    print("\n'자료실.html' 을 브라우저로 여세요.")


if __name__ == "__main__":
    main()
