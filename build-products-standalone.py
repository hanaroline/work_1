#!/usr/bin/env python3
"""products.html + data/products.js -> products-standalone.html

`products.html` 은 data/*.js 를 외부에서 로드하므로 로컬 서버가 필요하다.
이 스크립트는 스크립트 태그를 인라인해 파일 프로토콜(더블클릭)로도 열리는
단일 파일 산출물을 만든다. 소스를 수정한 뒤 다시 실행하면 된다.

    python3 build-products-standalone.py
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "products.html"
OUT = ROOT / "products-standalone.html"
TAG = '<script src="data/products.js"></script>'

html = SRC.read_text(encoding="utf-8")
if TAG not in html:
    sys.exit("script tag not found in products.html: " + TAG)

js = (ROOT / "data" / "products.js").read_text(encoding="utf-8")
# </script> 가 데이터 안에 있으면 인라인 스크립트가 조기 종료된다 — 방어적으로 검사
if "</script" in js.lower():
    sys.exit("data/products.js contains a closing script tag; cannot inline safely")

banner = "<!-- inlined from data/products.js by build-products-standalone.py -->"
OUT.write_text(html.replace(TAG, banner + "\n<script>\n" + js + "\n</script>"), encoding="utf-8")
print("wrote %s (%.0f KB)" % (OUT.name, OUT.stat().st_size / 1024))
