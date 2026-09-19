#!/usr/bin/env python3
"""매매 타이밍 화면 + 셈해 둔 자료 → 파일 하나로 (인터넷 불필요).

왜 이런 파일이 필요한가
  인터넷이 막힌 업무용 PC 에서는 화면이 어떤 경로로도 자료를 못 받는다. 파일 옆에
  json 을 같이 두는 것도 안 된다 — 브라우저는 file:// 로 열린 쪽이 옆 파일을
  fetch 하는 것을 CORS 로 막는다(origin 'null'). 그래서 자료를 HTML 안에 넣어 두는
  수밖에 없다. signal-offline.html · volatility-offline.html 과 같은 방식이다.

하는 일
  · data/kis_timing/latest.json   → <script id="kis-timing-embedded">
  · data/kis_timing/backtest.json → <script id="kis-backtest-embedded">

  화면(docs/kis-timing/index.html)은 그 블록이 있으면 먼저 읽는다. **그리는 코드는
  인터넷판과 똑같은 것을 쓴다** — 내장판을 위해 화면을 따로 베껴 두면 두 벌이 되어
  언젠가 조용히 어긋난다. 갈림은 index.html 의 loadJson() 하나뿐이다.

무엇이 되고 무엇이 안 되는가
  된다   : 네 시장의 오늘 매수·청산·관찰, 전략 10종 성적 히트맵과 그 풍선말,
           합의 K 표, 돌파 실패, 전략 명세, 한계까지 **전부**. 0바이트도 밖으로
           나가지 않는다. 이 화면은 원래 바깥을 부르는 자리가 없다.
  안 된다: 새 자료. 내장된 값은 만든 시점에 고정된다.

쓰는 법
  python3 scripts/make_kis_timing_offline.py
  python3 scripts/make_kis_timing_offline.py --out /tmp/a.html
  python3 scripts/make_kis_timing_offline.py --slim   # 화면이 안 쓰는 칸을 뺀다

주의
  머리말이 「산출 … · 내장 스냅샷」으로 만든 시점을 밝히므로 오래된 파일을 오늘
  시세로 착각할 일은 없다. 새 값이 필요하면 다시 만들어 옮겨야 한다.
"""

import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'docs/kis-timing/index.html')
LATEST = os.path.join(ROOT, 'data/kis_timing/latest.json')
BACKTEST = os.path.join(ROOT, 'data/kis_timing/backtest.json')
DEFAULT_OUT = os.path.join(ROOT, 'kis-timing-offline.html')

ANCHOR = '<body>'


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def block(tag_id, obj):
    """JSON 을 <script type="application/json"> 으로 싼다.

    `'</'` 를 쪼개는 것이 요점이다. 자료 안에 `</script>` 와 같은 글자가 있으면
    브라우저가 거기서 블록이 끝난 줄 알고 나머지를 HTML 로 읽는다. JSON 문자열
    안에서 `<\\/` 는 `</` 와 같은 뜻이므로 값은 달라지지 않는다.
    """
    s = json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return '<script id="%s" type="application/json">%s</script>' % (tag_id, s)


def slim(latest, backtest):
    """화면이 **읽지 않는** 칸을 뺀다. 빼는 자리를 여기 한 곳에 모아 둔다.

    화면이 성적표에서 쓰는 것은 `consensus` 뿐이고, 종목별 성적(`per_symbol`)은
    한 번도 그리지 않는다. 그런데 그게 성적표 부피의 대부분이다.

    **기본값으로 두지 않는다.** 뺀 판과 안 뺀 판이 같은 이름으로 돌아다니면
    나중에 「이 파일에 per_symbol 이 있었나」를 아무도 모르게 된다. 뺄 때는
    부러 --slim 을 적게 한다.
    """
    for g in backtest.get('grades', []):
        g.pop('per_symbol', None)
    for c in backtest.get('consensus', []):
        c.pop('per_symbol', None)
    # 종목 이름표는 매수·청산·관찰 항목이 제 이름을 들고 있어 겹친다.
    for m in latest.get('markets', {}).values():
        m.pop('names', None)
    return latest, backtest


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=DEFAULT_OUT)
    ap.add_argument('--slim', action='store_true',
                    help='화면이 안 쓰는 칸을 뺀다(파일이 작아진다)')
    a = ap.parse_args(argv)

    for p in (PAGE, LATEST, BACKTEST):
        if not os.path.exists(p):
            sys.stderr.write('없음: %s\n' % os.path.relpath(p, ROOT))
            return 1

    html = read(PAGE)
    if ANCHOR not in html:
        sys.stderr.write('화면에서 %s 를 찾지 못했다 — 화면이 바뀌었나?\n' % ANCHOR)
        return 1

    latest = json.load(open(LATEST, encoding='utf-8'))
    backtest = json.load(open(BACKTEST, encoding='utf-8'))

    # **성적표와 세팅이 한 벌인지 본다.** 세팅은 성적표를 보고 합의 멤버를 고르므로,
    # 둘이 어긋난 판을 내보내면 화면의 멤버와 성적이 서로 다른 것을 가리키게 된다.
    for mk, m in latest.get('markets', {}).items():
        want = (backtest.get('picked_live') or {}).get(mk) or []
        if m.get('members') != want:
            sys.stderr.write('경고: %s 의 멤버가 성적표와 다르다 (%s ≠ %s) — '
                             'build_kis_timing.py 를 다시 돌리십시오\n'
                             % (mk, m.get('members'), want))

    if a.slim:
        latest, backtest = slim(latest, backtest)

    parts = [block('kis-timing-embedded', latest),
             block('kis-backtest-embedded', backtest)]
    out = html.replace(ANCHOR, ANCHOR + '\n' + '\n'.join(parts), 1)

    with open(a.out, 'w', encoding='utf-8') as f:
        f.write(out)

    kb = os.path.getsize(a.out) / 1024.0
    n = sum(m['count'] for m in latest.get('markets', {}).values())
    print('썼다: %s (%.0f KB, %d 종목%s, 산출 %s)'
          % (os.path.relpath(a.out, ROOT), kb, n, ' · slim' if a.slim else '',
             latest.get('generated_at_kst')))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
