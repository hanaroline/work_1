#!/usr/bin/env python3
"""자산배분 ETF 화면 + 셈해 둔 자료 → 파일 하나로 (인터넷 불필요).

왜 이런 파일이 필요한가
  인터넷이 막힌 업무용 PC 에서는 화면이 어떤 경로로도 자료를 못 받는다. 파일 옆에
  json 을 같이 두는 것도 안 된다 — 브라우저는 file:// 로 열린 페이지가 옆 파일을
  fetch 하는 것을 CORS 로 막는다(origin 'null'). 그래서 자료를 HTML 안에 넣는다.
  signal-offline.html 과 같은 방식이다.

하는 일
  · data/etf/signals.json → <script id="etf-embedded">
  · data/etf/overlap.json → <script id="overlap-embedded">

  화면(docs/etf/index.html)은 그 블록이 있으면 먼저 읽는다. **그리는 코드는
  인터넷판과 똑같은 것을 쓴다** — 갈림은 index.html 의 loadJson() 하나뿐이다.

  차트 계열은 기본으로 뺀다(--charts 로 넣을 수 있다). 이 화면은 76 종목을 견주는
  표가 본체이고 종목별 차트를 그리지 않는다 — 안 쓰는 것을 실으면 파일만 무거워진다.

쓰는 법
  python3 scripts/make_etf_offline.py
  python3 scripts/make_etf_offline.py --out /tmp/a.html --charts
"""

import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'docs/etf/index.html')
SIGNALS = os.path.join(ROOT, 'data/etf/signals.json')
OVERLAP = os.path.join(ROOT, 'data/etf/overlap.json')
DEFAULT_OUT = os.path.join(ROOT, 'etf-offline.html')

ANCHOR = '<body>'


def block(tag_id, obj):
    """JSON 을 <script type="application/json"> 으로 싼다.

    '</' 를 쪼개는 것이 요점이다. 자료 안에 </script> 같은 글자가 있으면 브라우저가
    거기서 블록이 끝난 줄 알고 나머지를 HTML 로 읽는다. JSON 문자열 안에서 '<\\/' 는
    '</' 와 같은 뜻이므로 값은 달라지지 않는다.
    """
    s = json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return '<script id="%s" type="application/json">%s</script>' % (tag_id, s)


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=DEFAULT_OUT)
    ap.add_argument('--charts', action='store_true',
                    help='종목별 차트 계열도 넣는다(파일이 훨씬 커진다)')
    a = ap.parse_args(argv)

    for p in (PAGE, SIGNALS):
        if not os.path.exists(p):
            sys.stderr.write('없음: %s\n' % p)
            return 1

    sg = json.load(open(SIGNALS, encoding='utf-8'))
    ov = json.load(open(OVERLAP, encoding='utf-8')) if os.path.exists(OVERLAP) else None
    if not ov:
        sys.stderr.write('경고: overlap.json 이 없어 겹침 칸이 비어 나온다\n')

    if not a.charts:
        for it in sg.get('items', []):
            it.pop('chart', None)

    html = open(PAGE, encoding='utf-8').read()
    parts = [block('etf-embedded', sg)]
    if ov is not None:
        parts.append(block('overlap-embedded', ov))
    out = html.replace(ANCHOR, ANCHOR + '\n' + '\n'.join(parts), 1)

    with open(a.out, 'w', encoding='utf-8') as f:
        f.write(out)

    s = sg.get('summary') or {}
    mb = os.path.getsize(a.out) / 1024.0 / 1024.0
    print('썼다: %s (%.1f MB, 온전 %s · 부분 %s · 짧음 %s, 산출 %s)'
          % (a.out, mb, s.get('full'), s.get('partial'), s.get('short'),
             sg.get('generated_at_kst')))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
