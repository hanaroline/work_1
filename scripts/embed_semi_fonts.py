#!/usr/bin/env python3
"""반도체 소부장 맵(semi-supply-chain.html · semi-us/jp/cn.html)에 웹 글꼴을 파일 안으로 넣는다.

왜
  화면을 받아 가 오프라인에서 열면 Google 글꼴(Noto Sans KR·Inter)을 못 받아
  시스템 글꼴로 바뀐다. 글꼴 전체를 넣으면 수 MB 가 되므로, Google Fonts 의
  `text=` 부분 글꼴 기능으로 **이 화면이 쓰는 글자만** 담은 woff2 를 받아
  base64 @font-face 로 /*FONTS-BEGIN*/ … /*FONTS-END*/ 사이에 넣는다.

담는 글자
  HTML 전체 + 지표 수집기 소스의 글자 + 출력 가능한 ASCII.
  해외 맵은 수집기(fetch_semi_global.py)와 데이터 원본(tools/semi-global/common.js · <cc>.js)도 본다.
  일본 맵은 Noto Sans JP, 중국 맵은 Noto Sans SC 400 을 더 담는다(현지 표기용).
  수집기가 HTML 에 끼워 넣는 값은 숫자·날짜와 수집기 안의 문구뿐이라 이것으로 덮인다.
  **화면 문구를 고쳐 새 글자가 생기면 이 스크립트를 다시 돌린다**(빠진 글자는
  시스템 글꼴로 보일 뿐 깨지지는 않는다).

쓰는 법
  python3 scripts/embed_semi_fonts.py            # 받아서 넣기
  python3 scripts/embed_semi_fonts.py --check    # 빠진 글자만 세기(네트워크 불필요)
  python3 scripts/embed_semi_fonts.py --html semi-jp.html [--check]   # 해외 맵

표준 라이브러리만 쓴다. Google Fonts 에 닿는 곳(이 세션 샌드박스 포함)에서 돌린다.
"""
import base64
import os
import re
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_FAMILIES = [('Noto Sans KR', (400, 500, 700)), ('Inter', (400, 500, 600, 700))]
LOCAL_FAMILY = {'jp': ('Noto Sans JP', (400,)), 'cn': ('Noto Sans SC', (400,))}


def target(argv):
    """(HTML 경로, 함께 볼 소스들, 글꼴 목록)"""
    name = argv[argv.index('--html') + 1] if '--html' in argv else 'semi-supply-chain.html'
    html = os.path.join(ROOT, os.path.basename(name))
    m = re.fullmatch(r'semi-(us|jp|cn)\.html', os.path.basename(name))
    if not m:
        return html, [os.path.join(ROOT, 'scripts', 'fetch_semi_metrics.py')], BASE_FAMILIES
    cc = m.group(1)
    extra = [os.path.join(ROOT, 'scripts', 'fetch_semi_global.py'),
             os.path.join(ROOT, 'tools', 'semi-global', 'common.js'),
             os.path.join(ROOT, 'tools', 'semi-global', cc + '.js')]
    fams = BASE_FAMILIES + ([LOCAL_FAMILY[cc]] if cc in LOCAL_FAMILY else [])
    return html, extra, fams
# woff2 를 받으려면 최신 브라우저 UA 가 필요하다(낡은 UA 엔 ttf 가 온다)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
BLOCK_RE = re.compile(r'/\*FONTS-BEGIN\*/.*?/\*FONTS-END\*/', re.S)
LINK_RE = re.compile(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\n'
                     r'<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>\n'
                     r'<link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet">\n')
CHARS_RE = re.compile(r'/\*FONTS-CHARS:([0-9a-f,]*)\*/')


def wanted_chars(html_text, extra):
    body = BLOCK_RE.sub('', html_text)
    for p in extra:
        with open(p, encoding='utf-8') as f:
            body += f.read()
    cs = {c for c in body if ord(c) > 0x7e and not c.isspace()}
    cs |= {chr(i) for i in range(0x20, 0x7f)}
    return ''.join(sorted(cs))


def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode('utf-8')


def face(family, weight, text):
    q = urllib.parse.urlencode({'family': '%s:wght@%d' % (family, weight), 'text': text, 'display': 'swap'})
    css = get('https://fonts.googleapis.com/css2?' + q)
    urls = re.findall(r'url\((https://[^)]+)\)\s*format\([\'"]woff2[\'"]\)', css)
    if len(urls) != 1:
        raise SystemExit('%s %d: woff2 주소가 %d개 — 응답 앞부분: %s' % (family, weight, len(urls), css[:200]))
    b64 = base64.b64encode(get(urls[0], binary=True)).decode()
    return ("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;"
            "src:url(data:font/woff2;base64,%s) format('woff2')}" % (family, weight, b64)), len(b64)


def main(argv):
    HTML, extra, families = target(argv)
    with open(HTML, encoding='utf-8') as f:
        html_text = f.read()
    text = wanted_chars(html_text, extra)
    m = CHARS_RE.search(html_text)
    have = {chr(int(x, 16)) for x in m.group(1).split(',') if x} if m else set()
    missing = [c for c in text if c not in have]
    if '--check' in argv:
        print('필요 %d자 · 담긴 %d자 · 빠짐 %d자 %s' % (len(text), len(have), len(missing), ''.join(missing[:40])))
        return 1 if missing else 0

    faces, total = [], 0
    for fam, weights in families:
        for w in weights:
            css, n = face(fam, w, text)
            faces.append(css)
            total += n
            print('%s %d: %.0fKB' % (fam, w, n / 1024), flush=True)
    chars = ','.join('%x' % ord(c) for c in text)
    block = ('/*FONTS-BEGIN*/\n/* scripts/embed_semi_fonts.py 가 넣는다 — 손으로 고치지 말 것 */\n'
             '/*FONTS-CHARS:%s*/\n%s\n/*FONTS-END*/' % (chars, '\n'.join(faces)))
    if BLOCK_RE.search(html_text):
        html_text = BLOCK_RE.sub(lambda _: block, html_text, count=1)
    else:
        if not LINK_RE.search(html_text):
            raise SystemExit('Google 글꼴 <link> 줄도, /*FONTS-BEGIN*/ 표지도 없습니다')
        html_text = LINK_RE.sub(lambda _: '<style>\n%s\n</style>\n' % block, html_text, count=1)
    with open(HTML, 'w', encoding='utf-8') as f:
        f.write(html_text)
    print('넣음: %d자 · 글꼴 %d벌 · %.0fKB' % (len(text), len(faces), total / 1024))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
