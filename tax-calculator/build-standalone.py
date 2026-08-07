#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""index.html + tax-engine.js + app.js → standalone.html (단일 파일 배포판) 생성.

사용법 : tax-calculator 디렉터리에서 `python3 build-standalone.py`
"""
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TAGS = '<script src="tax-engine.js"></script>\n<script src="app.js"></script>'


def read(name):
    with io.open(os.path.join(HERE, name), encoding='utf-8') as fp:
        return fp.read()


def main():
    html = read('index.html')
    if TAGS not in html:
        sys.exit('index.html의 <script> 태그를 찾을 수 없습니다. TAGS 상수를 확인하세요.')

    bundle = (
        '<script>\n'
        '/* ===== tax-engine.js (inlined) ===== */\n' + read('tax-engine.js') +
        '\n/* ===== app.js (inlined) ===== */\n' + read('app.js') +
        '\n</script>'
    )

    out = html.replace(TAGS, bundle)
    out = out.replace(
        '<title>',
        '<!-- 단일 파일 배포판: tax-engine.js + app.js 인라인 포함 -->\n'
        '<!-- 이 파일은 build-standalone.py 로 생성됩니다. 직접 수정하지 마세요. -->\n<title>',
        1,
    )

    dest = os.path.join(HERE, 'standalone.html')
    with io.open(dest, 'w', encoding='utf-8') as fp:
        fp.write(out)

    print('standalone.html 생성 완료 — %d bytes' % len(out.encode('utf-8')))


if __name__ == '__main__':
    main()
