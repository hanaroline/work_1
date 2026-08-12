#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
부서 자료실 — 목록 갱신 스크립트

파일 목록을 만들어 '자료실.html' 안의 ARCHIVE 블록을 통째로 다시 씁니다.
표준 라이브러리만 사용하므로 별도 설치가 필요 없습니다.

사용법:
    python3 _목록갱신.py

동작 방식은 두 가지이며, '분류.json' 이 있으면 자동으로 설정 모드가 됩니다.

  [설정 모드]  분류.json 이 있을 때
      저장소 곳곳에 흩어져 있는 파일을 제자리에 둔 채 목록에만 모읍니다.
      파일을 복사하지 않으므로 원본이 갱신되면 목록도 자동으로 최신입니다.

  [폴더 모드]  분류.json 이 없을 때
      '자료' 폴더 아래의 분류 폴더를 훑습니다.
      폴더 이름 'NN_분류명' 이 정렬 순서와 표시명을 겸합니다.
      분류 폴더에 '_설명.txt' 를 두면 첫 줄이 분류 설명이 됩니다.
"""

import fnmatch
import json
import os
import re
import sys
from datetime import datetime
from urllib.parse import quote

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT_NAME = "자료"
ROOT_DIR = os.path.join(HERE, ROOT_NAME)
HTML_PATH = os.path.join(HERE, "자료실.html")
CONFIG_PATH = os.path.join(HERE, "분류.json")

BEGIN = "/* ARCHIVE:BEGIN"
END = "/* ARCHIVE:END */"

DESC_FILE = "_설명.txt"

# 목록에서 제외할 파일
SKIP_EXACT = {".ds_store", "thumbs.db", "desktop.ini", DESC_FILE.lower()}
SKIP_PREFIX = ("~$", ".")          # Office 임시 잠금 파일, 숨김 파일
SKIP_SUFFIX = (".tmp", ".lnk", ".pyc")

CATEGORY_RE = re.compile(r"^(\d+)[_\-. ]\s*(.+)$")


# ---------------------------------------------------------------- 공통

def is_skippable(name):
    low = name.lower()
    if low in SKIP_EXACT:
        return True
    if name.startswith(SKIP_PREFIX):
        return True
    if low.endswith(SKIP_SUFFIX):
        return True
    return False


def url_path_from(full_path):
    """자료실.html 기준 상대 링크. 공백·한글이 있어도 브라우저가 열 수 있게 인코딩."""
    rel = os.path.relpath(full_path, HERE)
    return "/".join(quote(p) for p in rel.split(os.sep))


def category_id(text):
    return re.sub(r"[^0-9A-Za-z가-힣]+", "-", text).strip("-") or "cat"


def make_entry(full_path, title=None, date=None):
    st = os.stat(full_path)
    fname = os.path.basename(full_path)
    base, ext = os.path.splitext(fname)
    return {
        "name": title or (base if ext else fname),
        "ext": ext[1:].lower() if ext else "",
        "size": st.st_size,
        "mtime": date or datetime.fromtimestamp(st.st_mtime).strftime("%Y-%m-%d"),
        "path": url_path_from(full_path),
    }


# ---------------------------------------------------------------- 설정 모드

def apply_rename(base, rules):
    """[[정규식, 치환문자열], ...] 을 차례로 시도하고 처음 걸린 규칙만 적용한다."""
    for pattern, repl in rules or []:
        new, n = re.subn(pattern, repl, base)
        if n:
            return new
    return base


def date_from_name(base, pattern):
    if not pattern:
        return None
    m = re.search(pattern, base)
    return m.group(1) if m else None


def collect_source(src):
    """설정 파일의 source 한 개를 파일 목록으로 바꾼다."""
    base_dir = os.path.normpath(os.path.join(HERE, src.get("path", ".")))
    if not os.path.isdir(base_dir):
        sys.stderr.write("[경고] 경로 없음, 건너뜁니다: %s\n" % base_dir)
        return []

    out = []

    # 1) 파일을 이름으로 콕 집어 지정한 경우 (제목도 직접 붙일 수 있다)
    for item in src.get("files", []):
        if isinstance(item, str):
            item = {"name": item}
        full = os.path.join(base_dir, item["name"])
        if not os.path.isfile(full):
            sys.stderr.write("[경고] 파일 없음, 건너뜁니다: %s\n" % full)
            continue
        out.append(make_entry(full, title=item.get("title")))

    # 2) 패턴으로 훑는 경우
    include = src.get("include")
    if include:
        exclude = src.get("exclude", [])
        rename = src.get("rename", [])
        datepat = src.get("date_from_name")
        recursive = bool(src.get("recursive"))

        walker = os.walk(base_dir) if recursive else [
            (base_dir, [], sorted(os.listdir(base_dir)))
        ]
        for dirpath, dirnames, filenames in walker:
            if recursive:
                dirnames[:] = sorted(d for d in dirnames if not is_skippable(d))
                filenames = sorted(filenames)
            for fname in filenames:
                full = os.path.join(dirpath, fname)
                if not os.path.isfile(full) or is_skippable(fname):
                    continue
                if not any(fnmatch.fnmatch(fname, p) for p in include):
                    continue
                if any(fnmatch.fnmatch(fname, p) for p in exclude):
                    continue
                base, ext = os.path.splitext(fname)
                out.append(make_entry(
                    full,
                    title=apply_rename(base, rename) if rename else None,
                    date=date_from_name(base, datepat),
                ))

    return out


def build_from_config(cfg):
    categories = []
    for cat in cfg.get("categories", []):
        files = []
        for src in cat.get("sources", []):
            files.extend(collect_source(src))
        categories.append({
            "id": category_id(cat["name"]),
            "name": cat["name"],
            "desc": cat.get("desc", ""),
            "files": files,
        })
    return categories


# ---------------------------------------------------------------- 폴더 모드

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


def build_from_folders():
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
        files = []
        for dirpath, dirnames, filenames in os.walk(cat_dir):
            dirnames[:] = sorted(d for d in dirnames if not is_skippable(d))
            for fname in sorted(filenames):
                if is_skippable(fname):
                    continue
                full = os.path.join(dirpath, fname)
                if os.path.isfile(full):
                    files.append(make_entry(full))
        categories.append({
            "id": category_id(dirname),
            "name": label,
            "desc": read_desc(cat_dir),
            "files": files,
        })
    return categories


# ---------------------------------------------------------------- 출력

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

    with open(HTML_PATH, "w", encoding="utf-8") as fh:
        fh.write(html[:start] + block + html[end:])


def main():
    if os.path.isfile(CONFIG_PATH):
        with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
            cfg = json.load(fh)
        categories = build_from_config(cfg)
        mode = "설정 모드 (분류.json)"
    else:
        categories = build_from_folders()
        mode = "폴더 모드 (자료/)"

    archive = {
        "generated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "root": ROOT_NAME,
        "categories": categories,
    }
    write_html(archive)

    total = sum(len(c["files"]) for c in categories)
    print("목록을 갱신했습니다. — %s (%s)" % (mode, archive["generated"]))
    print("  분류 %d개 / 자료 %d건" % (len(categories), total))
    for c in categories:
        print("    - %s: %d건" % (c["name"], len(c["files"])))
    print("\n'자료실.html' 을 브라우저로 여세요.")


if __name__ == "__main__":
    main()
