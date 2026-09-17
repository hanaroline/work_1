#!/usr/bin/env python3
"""매매 신호 대시보드 + 셈해 둔 자료 → 파일 하나로 (인터넷 불필요).

왜 이런 파일이 필요한가
  인터넷이 막힌 업무용 PC 에서는 화면이 어떤 경로로도 자료를 못 받는다.
  파일 옆에 json 을 같이 두는 것도 안 된다 — 브라우저는 file:// 로 열린 페이지가
  옆 파일을 fetch 하는 것을 CORS 로 막는다(origin 'null'). 그래서 자료를 HTML
  안에 넣어 두는 수밖에 없다. kr-top100-offline.html 과 같은 방식이다.

하는 일
  · data/signals/latest.json   → <script id="signals-embedded">
  · data/signals/backtest.json → <script id="backtest-embedded">
  · docs/signal/signal_engine.js → <script> 안으로 펼쳐 넣기

  화면(docs/signal/index.html)은 그 블록이 있으면 먼저 읽는다. **그리는 코드는
  인터넷판과 똑같은 것을 쓴다** — 내장판을 위해 화면을 따로 베껴 두면 두 벌이
  되어 언젠가 조용히 어긋난다. 갈림은 index.html 의 loadJson() 하나뿐이다.

무엇이 되고 무엇이 안 되는가
  된다   : 지수·KR100·US100 201종목을 고르고 네 시계 신호·축·매물대·시나리오·
           차트까지 전부 본다. 인터넷이 0바이트도 필요 없다.
  안 된다: 임의 종목 조회. 그건 일봉을 새로 받아야 하는 일이라 밖으로 나갈 수
           있어야 한다. 화면이 그 사실을 그대로 적는다(지어내지 않는다).

쓰는 법
  python3 scripts/make_signal_offline.py
  python3 scripts/make_signal_offline.py --out /tmp/a.html
  python3 scripts/make_signal_offline.py --no-charts   # 차트 시계열을 빼 가볍게

주의
  내장된 값은 만든 시점에 고정된다. 머리말이 "산출 … · 내장 스냅샷" 으로 그 시점을
  밝히므로 오래된 파일을 실시간 시세로 착각할 일은 없다. 새 값이 필요하면 다시
  만들어 옮겨야 한다.
"""

import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'docs/signal/index.html')
ENGINE = os.path.join(ROOT, 'docs/signal/signal_engine.js')
LATEST = os.path.join(ROOT, 'data/signals/latest.json')
BACKTEST = os.path.join(ROOT, 'data/signals/backtest.json')
DEFAULT_OUT = os.path.join(ROOT, 'signal-offline.html')

ENGINE_TAG = '<script src="signal_engine.js"></script>'
ANCHOR = '<body>'


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def block(tag_id, obj):
    """JSON 을 <script type="application/json"> 으로 싼다.

    '</' 를 쪼개는 것이 요점이다. 자료 안에 </script> 와 같은 글자가 있으면
    브라우저가 거기서 블록이 끝난 줄 알고 나머지를 HTML 로 읽는다. JSON 문자열
    안에서 '<\\/' 는 '</' 와 같은 뜻이므로 값은 달라지지 않는다.
    """
    s = json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return '<script id="%s" type="application/json">%s</script>' % (tag_id, s)


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=DEFAULT_OUT)
    ap.add_argument('--no-charts', action='store_true',
                    help='차트 시계열을 넣지 않는다(파일이 훨씬 작아진다)')
    a = ap.parse_args(argv)

    for p in (PAGE, ENGINE, LATEST):
        if not os.path.exists(p):
            sys.stderr.write('없음: %s\n' % p)
            return 1

    html = read(PAGE)
    if ENGINE_TAG not in html:
        sys.stderr.write('화면에서 엔진 script 태그를 찾지 못했다 — 화면이 바뀌었나?\n')
        return 1

    latest = json.load(open(LATEST, encoding='utf-8'))
    backtest = (json.load(open(BACKTEST, encoding='utf-8'))
                if os.path.exists(BACKTEST) else None)

    if a.no_charts:
        for it in latest.get('items', []):
            it.pop('chart', None)

    # 성적표가 지금 엔진으로 잰 것인지 — 아니면 화면이 붉은 띠를 띄운다.
    eh, bh = latest.get('engine_hash'), (backtest or {}).get('engine_hash')
    if bh != eh:
        sys.stderr.write('경고: 성적표가 다른 엔진으로 잰 것이다 (%s ≠ %s)\n' % (bh, eh))

    parts = [block('signals-embedded', latest)]
    if backtest is not None:
        parts.append(block('backtest-embedded', backtest))

    out = html.replace(ENGINE_TAG, '<script>\n' + read(ENGINE) + '\n</script>', 1)
    out = out.replace(ANCHOR, ANCHOR + '\n' + '\n'.join(parts), 1)

    with open(a.out, 'w', encoding='utf-8') as f:
        f.write(out)

    n = len(latest.get('items', []))
    mb = os.path.getsize(a.out) / 1024.0 / 1024.0
    print('썼다: %s (%.1f MB, %d 종목, 산출 %s)'
          % (a.out, mb, n, latest.get('generated_at_kst')))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
