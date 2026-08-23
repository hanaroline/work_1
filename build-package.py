#!/usr/bin/env python3
"""배포용 zip 을 만든다.

리눅스 zip(1) 은 파일명을 UTF-8 바이트로 저장하면서도 UTF-8 플래그(0x800)를
세우지 않는다. 그러면 윈도우 탐색기가 이름을 CP949 로 해석해 한글 이름 파일이
깨지거나 아예 풀리지 않는다('조회화면 실행.bat' 이 사라지던 원인).
파이썬 zipfile 은 비ASCII 이름에 이 플래그를 자동으로 세우므로 여기서 만든다.
"""
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "dist" / "mirae-product-finder.zip"
TOP = "mirae-product-finder"

FILES = [
    "START.bat",
    "조회화면 실행.bat",
    "run-products.bat",
    "run-products.sh",
    "serve-products.py",
    "products.html",
    "products-standalone.html",
    "build-products-standalone.py",
    "data/products.js",
    "data/sources.js",
    "README.md",
    "시작하기.txt",
]


def main():
    missing = [f for f in FILES if not (ROOT / f).exists()]
    if missing:
        raise SystemExit("빠진 파일: " + ", ".join(missing))

    OUT.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        for f in FILES:
            z.write(ROOT / f, TOP + "/" + f)

    with zipfile.ZipFile(OUT) as z:
        for i in z.infolist():
            ascii_name = all(ord(c) < 128 for c in i.filename)
            if not ascii_name and not (i.flag_bits & 0x800):
                raise SystemExit("UTF-8 플래그 누락: " + i.filename)
        print("wrote %s (%d files, %.0f KB)"
              % (OUT.name, len(z.infolist()), OUT.stat().st_size / 1024))
        print("한글 이름 파일 UTF-8 플래그 확인 완료")


if __name__ == "__main__":
    main()
